import { formSections, type Question } from "./formConfig";

export type AnswerValue = string | string[] | number | undefined;
export type Answers = Record<string, Record<string, AnswerValue>>;

export interface FormPayload {
  businessName: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  answers: Answers;
  submittedAt: string;
}

export function buildPayload(answers: Answers): FormPayload {
  const g = answers.general ?? {};
  const get = (k: string) => (typeof g[k] === "string" ? (g[k] as string) : "");
  return {
    businessName: get("businessName"),
    contactName: get("contactName"),
    phone: get("phone"),
    whatsapp: get("whatsapp"),
    email: get("email"),
    city: get("city"),
    answers,
    submittedAt: new Date().toISOString(),
  };
}

function csvEscape(v: string): string {
  if (/[",\n;]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function answerToString(v: AnswerValue): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(" | ");
  return String(v);
}

export function buildCsv(payload: FormPayload): string {
  const headers = [
    "seccion",
    "pregunta",
    "respuesta",
    "tipo",
    "fecha",
    "negocio",
    "responsable",
    "email",
    "telefono",
  ];
  const rows: string[][] = [headers];
  for (const section of formSections) {
    const sAnswers = payload.answers[section.id] ?? {};
    for (const q of section.questions) {
      rows.push([
        section.title,
        q.label,
        answerToString(sAnswers[q.id]),
        q.type,
        payload.submittedAt,
        payload.businessName,
        payload.contactName,
        payload.email,
        payload.phone,
      ]);
    }
  }
  return rows.map((r) => r.map((c) => csvEscape(c ?? "")).join(",")).join("\n");
}

export function downloadCsv(payload: FormPayload) {
  const csv = buildCsv(payload);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const name = (payload.businessName || "respuestas").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  a.href = url;
  a.download = `formulario_${name}_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildSummaryText(payload: FormPayload): string {
  const lines: string[] = [];
  lines.push(`Formulario recibido — ${new Date(payload.submittedAt).toLocaleString("es-ES")}`);
  lines.push("");
  lines.push(`Negocio: ${payload.businessName}`);
  lines.push(`Responsable: ${payload.contactName}`);
  lines.push(`Email: ${payload.email}`);
  lines.push(`Teléfono: ${payload.phone}`);
  if (payload.whatsapp) lines.push(`WhatsApp: ${payload.whatsapp}`);
  if (payload.city) lines.push(`Ciudad: ${payload.city}`);
  lines.push("");
  for (const section of formSections) {
    const sAnswers = payload.answers[section.id] ?? {};
    const has = section.questions.some((q: Question) => {
      const v = sAnswers[q.id];
      return v != null && (Array.isArray(v) ? v.length > 0 : String(v).length > 0);
    });
    if (!has) continue;
    lines.push(`— ${section.title} —`);
    for (const q of section.questions) {
      const v = sAnswers[q.id];
      if (v == null || (Array.isArray(v) && v.length === 0) || v === "") continue;
      lines.push(`• ${q.label}\n  ${answerToString(v)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export async function sendFormByEmail(payload: FormPayload): Promise<boolean> {
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}
