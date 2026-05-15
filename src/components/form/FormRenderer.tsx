import { useMemo, useState } from "react";
import { formSections, WHATSAPP_NUMBER, type Question } from "@/lib/formConfig";
import {
  buildPayload,
  buildSummaryText,
  downloadCsv,
  sendFormByEmail,
  type Answers,
  type AnswerValue,
  type FormPayload,
} from "@/lib/formExport";
import { QuestionField, SectionCard } from "./FormFields";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+\d][\d\s().-]{6,}$/;
const urlRe = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;

function validateQuestion(q: Question, v: AnswerValue): string | undefined {
  const empty = v == null || v === "" || (Array.isArray(v) && v.length === 0);
  if (q.required && empty) return "Este campo es obligatorio";
  if (empty) return undefined;
  if (q.type === "email" && typeof v === "string" && !emailRe.test(v.trim()))
    return "Introduce un email válido";
  if (q.type === "phone" && typeof v === "string" && !phoneRe.test(v.trim()))
    return "Introduce un teléfono válido";
  if (q.type === "url" && typeof v === "string" && !urlRe.test(v.trim()))
    return "Introduce una URL válida";
  if (q.conditionalOtherLabel) {
    const hasBarOtra = Array.isArray(v) ? v.includes("Otra") : v === "Otra";
    if (hasBarOtra) return "Especifica qué otra opción antes de continuar";
  }
  return undefined;
}

type Status = "editing" | "submitting" | "success" | "error";

export default function FormRenderer() {
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [status, setStatus] = useState<Status>("editing");
  const [lastPayload, setLastPayload] = useState<FormPayload | null>(null);
  const [summary, setSummary] = useState<string>("");

  const totalQuestions = useMemo(
    () => formSections.reduce((acc, s) => acc + s.questions.length, 0),
    [],
  );
  const filledCount = useMemo(() => {
    let n = 0;
    for (const s of formSections) {
      const sa = answers[s.id] ?? {};
      for (const q of s.questions) {
        const v = sa[q.id];
        if (v != null && v !== "" && !(Array.isArray(v) && v.length === 0)) n++;
      }
    }
    return n;
  }, [answers]);
  const progress = Math.round((filledCount / totalQuestions) * 100);

  const setAnswer = (sectionId: string, qId: string, v: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [sectionId]: { ...(prev[sectionId] ?? {}), [qId]: v } }));
    setErrors((prev) => {
      if (!prev[sectionId]?.[qId]) return prev;
      const next = { ...prev, [sectionId]: { ...prev[sectionId] } };
      delete next[sectionId][qId];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, Record<string, string>> = {};
    let firstErrorId: string | null = null;
    for (const section of formSections) {
      const sa = answers[section.id] ?? {};
      for (const q of section.questions) {
        const err = validateQuestion(q, sa[q.id]);
        if (err) {
          newErrors[section.id] = { ...(newErrors[section.id] ?? {}), [q.id]: err };
          if (!firstErrorId) firstErrorId = `section-${section.id}`;
        }
      }
    }
    setErrors(newErrors);
    if (firstErrorId) {
      document.getElementById(firstErrorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setStatus("submitting");
    const payload = buildPayload(answers);
    setLastPayload(payload);
    setSummary(buildSummaryText(payload));
    try {
      const ok = await sendFormByEmail(payload);
      setStatus(ok ? "success" : "error");
      if (ok) {
        setTimeout(() => {
          document.getElementById("success")?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" && lastPayload) {
    return <SuccessScreen payload={lastPayload} />;
  }

  return (
    <div id="formulario" className="mx-auto w-full max-w-3xl px-4 pb-24 pt-12 sm:pt-20">
      <div className="sticky top-0 z-10 -mx-4 mb-8 bg-background/85 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progreso</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10" noValidate>
        {formSections.map((section, i) => (
          <SectionCard key={section.id} section={section} index={i} total={formSections.length}>
            {section.questions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[section.id]?.[q.id]}
                onChange={(v) => setAnswer(section.id, q.id, v)}
                error={errors[section.id]?.[q.id]}
                noteValue={
                  q.noteLabel !== undefined
                    ? ((answers[section.id]?.[q.id + "_note"] as string) ?? "")
                    : undefined
                }
                onNoteChange={
                  q.noteLabel !== undefined
                    ? (v) => setAnswer(section.id, q.id + "_note", v)
                    : undefined
                }
              />
            ))}
          </SectionCard>
        ))}

        {status === "error" && lastPayload && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
            <p className="text-sm font-medium text-foreground">
              No hemos podido enviar el formulario.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tus respuestas no se han perdido. Puedes descargarlas o copiar el resumen e intentar
              de nuevo.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => downloadCsv(lastPayload)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm hover:border-primary/40"
              >
                Descargar respuestas (CSV)
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(summary)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm hover:border-primary/40"
              >
                Copiar resumen
              </button>
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
              >
                Reintentar envío
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Al enviar, aceptas que reciba esta información para preparar una propuesta
            personalizada.
          </p>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "submitting" ? "Enviando..." : "Enviar respuestas"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SuccessScreen({ payload }: { payload: FormPayload }) {
  const wa = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola, acabo de enviar el formulario (${payload.businessName || payload.contactName}).`,
  )}`;
  return (
    <div id="success" className="mx-auto w-full max-w-2xl px-4 py-24 text-center">
      <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="text-3xl sm:text-4xl text-foreground">Gracias.</h1>
      <p className="mx-auto mt-4 max-w-prose text-base text-muted-foreground">
        He recibido la información correctamente y podré revisar tu caso para proponerte una
        solución adecuada.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90"
        >
          Contactar por WhatsApp
        </a>
        <button
          onClick={() => downloadCsv(payload)}
          className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-base hover:border-primary/40"
        >
          Descargar mis respuestas (CSV)
        </button>
      </div>
    </div>
  );
}
