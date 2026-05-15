import { useId, useState } from "react";
import type { Question, FormSection } from "@/lib/formConfig";
import type { AnswerValue } from "@/lib/formExport";

interface FieldProps {
  question: Question;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  error?: string;
}

const baseInput =
  "w-full rounded-xl border border-border bg-input px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/15";

const labelCls = "block text-sm font-medium text-foreground";
const helpCls = "text-xs text-muted-foreground";
const errorCls = "text-xs text-destructive";

function FieldShell({
  question,
  error,
  children,
}: {
  question: Question;
  error?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelCls}>
        {question.label}
        {question.required && <span className="ml-1 text-primary">*</span>}
      </label>
      {question.helpText && <p className={helpCls}>{question.helpText}</p>}
      <div>{children}</div>
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

function TextLikeField({ question, value, onChange, error, type }: FieldProps & { type: string }) {
  return (
    <FieldShell question={question} error={error}>
      <input
        type={type}
        className={baseInput}
        placeholder={question.placeholder}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        inputMode={
          type === "tel"
            ? "tel"
            : type === "email"
              ? "email"
              : type === "url"
                ? "url"
                : type === "number"
                  ? "decimal"
                  : undefined
        }
      />
    </FieldShell>
  );
}

function TextareaField({ question, value, onChange, error }: FieldProps) {
  return (
    <FieldShell question={question} error={error}>
      <textarea
        rows={5}
        className={baseInput + " resize-y leading-relaxed"}
        placeholder={question.placeholder}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

function SingleChoiceField({ question, value, onChange, error }: FieldProps) {
  const opts = question.options ?? [];
  const [other, setOther] = useState(
    typeof value === "string" && !opts.includes(value) ? value : "",
  );
  return (
    <FieldShell question={question} error={error}>
      <div className="grid gap-2 sm:grid-cols-2">
        {opts.map((opt) => {
          const active = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(opt)}
              className={
                "rounded-xl border px-4 py-3 text-left text-sm transition " +
                (active
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-input hover:border-primary/50 hover:bg-input/80")
              }
            >
              {opt}
            </button>
          );
        })}
        {question.allowOther && (
          <input
            className={baseInput + " sm:col-span-2"}
            placeholder="Otra respuesta..."
            value={other}
            onChange={(e) => {
              setOther(e.target.value);
              onChange(e.target.value);
            }}
          />
        )}
      </div>
    </FieldShell>
  );
}

function MultipleChoiceField({ question, value, onChange, error }: FieldProps) {
  const arr = Array.isArray(value) ? value : [];
  const opts = question.options ?? [];
  const toggle = (opt: string) => {
    if (arr.includes(opt)) onChange(arr.filter((v) => v !== opt));
    else onChange([...arr, opt]);
  };
  const otherSelected = arr.find((v) => !opts.includes(v));
  const [other, setOther] = useState(otherSelected ?? "");
  return (
    <FieldShell question={question} error={error}>
      <div className="grid gap-2 sm:grid-cols-2">
        {opts.map((opt) => {
          const active = arr.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition " +
                (active
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-input hover:border-primary/50 hover:bg-input/80")
              }
            >
              <span
                className={
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border " +
                  (active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-input")
                }
                aria-hidden
              >
                {active && (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
        {question.allowOther && (
          <input
            className={baseInput + " sm:col-span-2"}
            placeholder="Otra respuesta..."
            value={other}
            onChange={(e) => {
              const next = e.target.value;
              setOther(next);
              const filtered = arr.filter((v) => opts.includes(v));
              onChange(next ? [...filtered, next] : filtered);
            }}
          />
        )}
      </div>
    </FieldShell>
  );
}

function RatingField({ question, value, onChange, error }: FieldProps) {
  const min = question.min ?? 1;
  const max = question.max ?? 5;
  const cur = typeof value === "number" ? value : undefined;
  return (
    <FieldShell question={question} error={error}>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => {
          const active = cur === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={
                "h-12 w-12 rounded-xl border text-base font-medium transition " +
                (active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-primary/40")
              }
            >
              {n}
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

export function QuestionField(props: FieldProps) {
  const { question } = props;
  switch (question.type) {
    case "text":
      return <TextLikeField {...props} type="text" />;
    case "email":
      return <TextLikeField {...props} type="email" />;
    case "phone":
      return <TextLikeField {...props} type="tel" />;
    case "url":
      return <TextLikeField {...props} type="url" />;
    case "number":
      return <TextLikeField {...props} type="number" />;
    case "date":
      return <TextLikeField {...props} type="date" />;
    case "textarea":
      return <TextareaField {...props} />;
    case "single-choice":
      return <SingleChoiceField {...props} />;
    case "multiple-choice":
    case "checkbox":
      return <MultipleChoiceField {...props} />;
    case "rating":
      return <RatingField {...props} />;
    default:
      return null;
  }
}

export function SectionCard({
  section,
  index,
  total,
  children,
}: {
  section: FormSection;
  index: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`section-${section.id}`}
      className={
        "rounded-3xl border bg-card p-6 sm:p-10 transition " +
        (section.emphasis ? "border-primary/30 bg-accent/30" : "border-border")
      }
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sección {index + 1} de {total}
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl text-foreground">{section.title}</h2>
          {section.description && (
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      </div>
      <div className="space-y-7">{children}</div>
    </section>
  );
}
