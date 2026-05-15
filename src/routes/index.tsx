import { createFileRoute } from "@tanstack/react-router";
import FormRenderer from "@/components/form/FormRenderer";
import logoMark from "@/assets/logo-mark.png";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <FormRenderer />
      <footer className="border-t border-border/40 py-10 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <img src={logoMark} alt="Claridad Digital" className="h-3.5 w-3.5 opacity-60" />
          Claridad Digital · Tus respuestas se usan únicamente para preparar tu propuesta.
        </span>
      </footer>
    </main>
  );
}

function Hero() {
  return (
    <header className="relative overflow-hidden bg-mesh">
      {/* Brand glow blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[hsl(255_76%_72%/0.12)] blur-3xl" />
        <div className="absolute top-20 -right-20 h-[320px] w-[320px] rounded-full bg-[hsl(265_68%_65%/0.08)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-10 pt-16 sm:pt-24">
        {/* Logo + brand */}
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
            <img src={logoMark} alt="" aria-hidden className="h-5 w-5 object-contain" />
          </div>
          <span className="text-sm font-medium tracking-wide text-muted-foreground">
            Claridad Digital
          </span>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Formulario de descubrimiento
        </div>

        <h1 className="mt-6 text-4xl leading-[1.1] text-foreground sm:text-6xl">
          Cuéntame cómo <span className="text-gradient-brand">funciona tu negocio</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Este formulario me ayuda a entender cómo trabajas actualmente y qué herramientas podrían
          ayudarte a organizar mejor clientes, pedidos, catálogos, citas y seguimiento.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href="#formulario"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-85"
          >
            Empezar formulario →
          </a>
          <span className="text-sm text-muted-foreground">Tarda unos 6–10 minutos.</span>
        </div>
      </div>
    </header>
  );
}
