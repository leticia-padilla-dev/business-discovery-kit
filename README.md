# Business Discovery Kit

Formulario web de descubrimiento empresarial construido con TanStack Start, React y Cloudflare Workers. Permite recopilar información estructurada sobre un negocio a través de un formulario multi-sección con validación en tiempo real.

## Stack

- **Framework:** TanStack Start + React 19
- **Routing:** TanStack Router (file-based)
- **UI:** shadcn/ui + Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **Deploy:** Cloudflare Workers (SSR)
- **Package manager:** Bun

## Requisitos

- [Bun](https://bun.sh) >= 1.0
- Node.js >= 18 (para compatibilidad de tipos)
- Cuenta en [Cloudflare](https://cloudflare.com) para despliegue

## Instalación

```bash
bun install
```

## Desarrollo

```bash
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build

```bash
bun run build
```

## Deploy a Cloudflare Workers

```bash
bunx wrangler deploy
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `bun dev` | Servidor de desarrollo |
| `bun run build` | Build de producción |
| `bun run preview` | Vista previa del build |
| `bun run lint` | Linting con ESLint |
| `bun run format` | Formateo con Prettier |

## Estructura del proyecto

```
src/
├── components/
│   ├── form/        # Lógica y campos del formulario
│   └── ui/          # Componentes shadcn/ui
├── lib/
│   ├── formConfig.ts   # Esquema y secciones del formulario
│   └── formExport.ts   # Exportación CSV y envío por email
├── routes/          # Rutas de TanStack Router
└── styles.css       # Estilos globales + Tailwind
```
