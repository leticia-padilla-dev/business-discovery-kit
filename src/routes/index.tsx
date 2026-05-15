import { createFileRoute } from "@tanstack/react-router";
import FormRenderer from "@/components/form/FormRenderer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <FormRenderer />
      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        Hecho con calma · Tus respuestas se usan únicamente para preparar tu propuesta.
      </footer>
    </main>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/40 blur-3xl" />
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:pt-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Formulario de descubrimiento
        </div>
        <h1 className="mt-6 text-4xl leading-[1.1] text-foreground sm:text-6xl">
          Cuéntame cómo funciona tu negocio
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Este formulario me ayuda a entender cómo trabajas actualmente y qué herramientas
          podrían ayudarte a organizar mejor clientes, pedidos, catálogos, citas y seguimiento.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#formulario"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground transition hover:opacity-90"
          >
            Empezar formulario
          </a>
          <span className="text-sm text-muted-foreground">Tarda unos 6–10 minutos.</span>
        </div>
      </div>
    </header>
  );
}
