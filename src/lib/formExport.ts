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
      const note = sAnswers[q.id + "_note"];
      if (note != null && String(note).trim()) {
        rows.push([
          section.title,
          q.label + " — nota",
          String(note).trim(),
          "textarea",
          payload.submittedAt,
          payload.businessName,
          payload.contactName,
          payload.email,
          payload.phone,
        ]);
      }
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
      const note = sAnswers[q.id + "_note"];
      if (note != null && String(note).trim()) {
        lines.push(`  ↳ ${String(note).trim()}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

// ─── Human-readable summary ──────────────────────────────────────────────────

export interface HumanSummary {
  html: string;
  text: string;
}

function toArr(v: AnswerValue): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((s): s is string => Boolean(s));
  const s = String(v).trim();
  return s ? [s] : [];
}

function toStr(v: AnswerValue): string {
  if (!v) return "";
  if (Array.isArray(v)) return v.filter((s): s is string => Boolean(s)).join(", ");
  return String(v).trim();
}

function chips(items: string[]): string {
  if (!items.length) return "";
  return items
    .map(
      (i) =>
        `<span style="display:inline-block;background:#f3f4f6;border-radius:6px;padding:3px 10px;margin:2px 4px 2px 0;font-size:13px;color:#374151;">${i}</span>`,
    )
    .join("");
}

function summaryRow(label: string, items: string[]): string {
  if (!items.length) return "";
  return `
    <tr><td style="padding:0 0 18px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;">${label}</p>
      <div>${chips(items)}</div>
    </td></tr>`;
}

export function buildHumanSummary(payload: FormPayload): HumanSummary {
  const a = payload.answers;
  const products = a.products ?? {};
  const clients = a.clients ?? {};
  const orders = a.orders ?? {};
  const problems = a.currentProblems ?? {};
  const prio = a.priorities ?? {};
  const digital = a.digitalLevel ?? {};
  const wa = a.whatsappCommunication ?? {};
  const appts = a.appointments ?? {};

  const brands = toArr(products.brands_managed);
  const orderChannels = toArr(orders.order_channel);
  const mainPriorities = toArr(prio.main_priorities);
  const timeLoss = toArr(problems.time_loss);
  const firstImprovement = toArr(problems.first_improvement);
  const stopManual = toArr(problems.stop_manual);
  const tools = toArr(digital.tools_used);
  const activeClients = toStr(clients.active_clients);
  const digitalLevel = typeof digital.digital_comfort === "number" ? digital.digital_comfort : null;

  const wantsAuto: string[] = [];
  if (wa.wants_auto_reminders === "Sí") wantsAuto.push("Recordatorios automáticos");
  if (wa.wants_quick_msgs === "Sí") wantsAuto.push("Mensajes rápidos");
  if (wa.wants_templates === "Sí") wantsAuto.push("Plantillas de mensaje");
  if (appts.auto_reminders === "Sí") wantsAuto.push("Avisos de cita");

  const firstName = payload.contactName.split(" ")[0] || payload.contactName;
  const businessLine = [payload.businessName, payload.city].filter(Boolean).join(" · ");

  // ── HTML (client email) ──────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Resumen de tu diagnóstico digital</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);">

  <!-- Header -->
  <tr><td style="background:#0f172a;padding:28px 40px;">
    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-.3px;">Claridad Digital</span>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:40px;">
    <table width="100%" cellpadding="0" cellspacing="0">

      <!-- Greeting -->
      <tr><td style="padding:0 0 32px;">
        <h1 style="margin:0 0 14px;font-size:26px;font-weight:700;color:#0f172a;letter-spacing:-.5px;">Gracias, ${firstName}.</h1>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">
          Hemos recibido tu diagnóstico digital correctamente. Esta información nos permite entender cómo trabajas hoy, qué procesos te consumen más tiempo y qué oportunidades existen para ayudarte a simplificar y hacer crecer tu negocio.
        </p>
      </td></tr>

      <!-- Summary card -->
      <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:28px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${summaryRow("Negocio", businessLine ? [businessLine] : [])}
          ${summaryRow("Marcas que gestionas", brands)}
          ${summaryRow("Cómo recibes pedidos", orderChannels)}
          ${summaryRow("Tus prioridades", mainPriorities)}
          ${summaryRow("Dónde pierdes más tiempo", timeLoss)}
          ${summaryRow("Qué quieres mejorar primero", firstImprovement)}
          ${summaryRow("Qué te gustaría automatizar", stopManual.length ? stopManual : wantsAuto)}
          ${tools.length ? summaryRow("Herramientas que ya usas", tools) : ""}
          ${activeClients ? `<tr><td style="padding:0 0 18px;"><p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;">Clientes activos (aprox.)</p><p style="margin:0;font-size:15px;color:#374151;font-weight:600;">${activeClients}</p></td></tr>` : ""}
          ${digitalLevel !== null ? `<tr><td style="padding:0;"><p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;">Comodidad digital</p><p style="margin:0;font-size:15px;color:#374151;font-weight:600;">${digitalLevel} / 5</p></td></tr>` : ""}
        </table>
      </td></tr>

      <!-- Next steps -->
      <tr><td style="padding:28px 0 0;">
        <h2 style="margin:0 0 10px;font-size:16px;font-weight:600;color:#0f172a;">Próximos pasos</h2>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4b5563;">
          Revisaremos tu información y prepararemos posibles mejoras, automatizaciones o soluciones adaptadas a tu caso. Nos pondremos en contacto contigo pronto.
        </p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">
          Si tienes cualquier pregunta mientras tanto, escríbenos a
          <a href="mailto:info.claridaddigital@gmail.com" style="color:#7c3aed;text-decoration:none;">info.claridaddigital@gmail.com</a>
        </p>
      </td></tr>

    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:22px 40px;">
    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
      <strong style="color:#6b7280;">Claridad Digital</strong> · Valencia, España<br>
      <a href="mailto:info.claridaddigital@gmail.com" style="color:#9ca3af;text-decoration:none;">info.claridaddigital@gmail.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  // ── Plain text (internal notification) ──────────────────────────────────
  const date = new Date(payload.submittedAt).toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [];
  lines.push(`Nuevo diagnóstico recibido — ${date}`);
  lines.push("");
  lines.push(`Negocio:   ${payload.businessName}`);
  lines.push(`Ciudad:    ${payload.city || "—"}`);
  lines.push(`Contacto:  ${payload.contactName}`);
  lines.push(`Email:     ${payload.email}`);
  lines.push(`Teléfono:  ${payload.phone}`);
  if (payload.whatsapp) lines.push(`WhatsApp:  ${payload.whatsapp}`);
  lines.push("");
  if (brands.length) lines.push(`Marcas:           ${brands.join(", ")}`);
  if (activeClients) lines.push(`Clientes activos: ${activeClients}`);
  if (orderChannels.length) lines.push(`Pedidos via:      ${orderChannels.join(", ")}`);
  if (digitalLevel !== null) lines.push(`Nivel digital:    ${digitalLevel}/5`);
  if (tools.length) lines.push(`Herramientas:     ${tools.join(", ")}`);
  if (mainPriorities.length) {
    lines.push("");
    lines.push("PRIORIDADES");
    mainPriorities.forEach((p) => lines.push(`  · ${p}`));
  }
  if (timeLoss.length || firstImprovement.length) {
    lines.push("");
    lines.push("PRINCIPALES FRICCIONES");
    timeLoss.forEach((p) => lines.push(`  · ${p}`));
    if (firstImprovement.length) {
      lines.push("Quiere mejorar primero:");
      firstImprovement.forEach((p) => lines.push(`  → ${p}`));
    }
  }
  lines.push("");
  lines.push("Ver respuesta completa en Google Sheets.");

  const text = lines.join("\n");
  return { html, text };
}

export async function sendFormByEmail(payload: FormPayload): Promise<boolean> {
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}
