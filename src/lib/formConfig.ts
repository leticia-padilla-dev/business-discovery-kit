export type QuestionType =
  | "text"
  | "textarea"
  | "single-choice"
  | "multiple-choice"
  | "checkbox"
  | "rating"
  | "email"
  | "phone"
  | "date"
  | "url"
  | "number";

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  examples?: string[];
  options?: string[];
  allowOther?: boolean;
  min?: number;
  max?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  emphasis?: boolean;
  questions: Question[];
}

export const formSections: FormSection[] = [
  {
    id: "general",
    title: "Información general",
    description: "Datos básicos para poder contactarte.",
    questions: [
      {
        id: "businessName",
        label: "Nombre del negocio",
        type: "text",
        required: true,
        placeholder: "Mi negocio",
      },
      {
        id: "contactName",
        label: "Persona responsable",
        type: "text",
        required: true,
        placeholder: "Tu nombre",
      },
      {
        id: "phone",
        label: "Teléfono",
        type: "phone",
        required: true,
        placeholder: "+34 600 000 000",
      },
      {
        id: "whatsapp",
        label: "WhatsApp",
        type: "phone",
        placeholder: "+34 600 000 000",
        helpText: "Si es distinto al teléfono.",
      },
      {
        id: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "tucorreo@email.com",
      },
      {
        id: "city",
        label: "Ciudad o zona donde trabajas",
        type: "text",
        placeholder: "Madrid, zona norte...",
      },
      {
        id: "social",
        label: "Redes sociales o web actual",
        type: "url",
        placeholder: "https://instagram.com/...",
        helpText: "Pega un enlace si tienes.",
      },
    ],
  },
  {
    id: "products",
    title: "Qué vendes",
    questions: [
      { id: "products_brands", label: "¿Qué productos o marcas vendes?", type: "textarea" },
      {
        id: "stock_type",
        label: "¿Trabajas con stock propio, catálogo o ambos?",
        type: "single-choice",
        options: ["Stock propio", "Catálogo", "Ambos"],
      },
      {
        id: "product_count",
        label: "¿Cuántos productos gestionas aproximadamente?",
        type: "number",
        min: 0,
      },
      {
        id: "price_changes",
        label: "¿Los precios cambian frecuentemente?",
        type: "single-choice",
        options: ["Sí, a menudo", "A veces", "Casi nunca"],
      },
      {
        id: "digital_catalogs",
        label: "¿Tienes catálogos digitales actualmente?",
        type: "single-choice",
        options: ["Sí", "No", "Algunos"],
      },
      {
        id: "share_catalogs",
        label: "¿Cómo compartes hoy los catálogos?",
        type: "textarea",
        examples: [
          "WhatsApp",
          "PDFs por correo",
          "Instagram o Facebook",
          "Fotos",
          "Catálogo físico impreso",
          "enlaces de compra",
        ],
      },
      {
        id: "brands_managed",
        label: "¿Qué marcas gestionas actualmente?",
        type: "multiple-choice",
        options: ["Mary Kay", "Beyond Beauty", "In Cruises", "Otra"],
        allowOther: true,
      },
    ],
  },
  {
    id: "catalogs",
    title: "Catálogos",
    questions: [
      {
        id: "catalog_format",
        label: "¿Tienes catálogos en PDF, imágenes, enlaces o papel?",
        type: "multiple-choice",
        options: ["PDF", "Imágenes", "Enlaces", "Papel", "No tengo"],
      },
      {
        id: "catalog_frequency",
        label: "¿Cada cuánto cambian los catálogos?",
        type: "multiple-choice",
        helpText: "Puedes marcar varios si gestionas más de una marca.",
        options: ["Semanal", "Quincenal", "Mensual", "Depende de la marca", "Campañas especiales"],
        allowOther: true,
      },
      {
        id: "catalog_segmented",
        label: "¿Necesitas enviar catálogos diferentes según el tipo de cliente?",
        type: "single-choice",
        options: ["Sí", "No", "A veces"],
      },
      {
        id: "catalog_link",
        label: "¿Te gustaría tener un enlace único con todos los catálogos organizados?",
        type: "single-choice",
        options: ["Sí", "No", "No estoy segura"],
      },
      {
        id: "catalog_match",
        label: "¿Te gustaría saber qué catálogo enviar a cada cliente?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
    ],
  },
  {
    id: "clients",
    title: "Gestión de clientes",
    questions: [
      {
        id: "clients_storage",
        label: "¿Dónde guardas actualmente la información de tus clientes?",
        type: "single-choice",
        options: ["WhatsApp", "Excel", "Agenda", "Notion", "No lo tengo organizado"],
        allowOther: true,
      },
      {
        id: "active_clients",
        label: "¿Cuántos clientes activos tienes aproximadamente?",
        type: "number",
        min: 0,
      },
      {
        id: "old_clients_followup",
        label: "¿Haces seguimiento a clientes antiguos?",
        type: "single-choice",
        options: ["Sí", "A veces", "No"],
      },
      {
        id: "client_info",
        label: "¿Qué información te gustaría guardar de cada cliente?",
        type: "multiple-choice",
        options: [
          "Dirección",
          "Cumpleaños",
          "Historial de compras",
          "Productos favoritos",
          "Notas personales",
          "Preferencias",
          "Alergias o necesidades especiales",
          "Última compra",
          "Próxima cita",
          "Estado del cliente",
        ],
      },
      {
        id: "client_notes",
        label: "Cuéntame cualquier detalle importante sobre tus clientes",
        type: "textarea",
        examples: [
          "Compran siempre lo mismo",
          "Hacen pedidos grandes",
          "Responden lento por WhatsApp",
          "Prefieren que les llamen",
          "Necesitan recordatorios frecuentes",
          "Son clientas recurrentes de años",
        ],
      },
    ],
  },
  {
    id: "orders",
    title: "Pedidos y ventas",
    questions: [
      {
        id: "order_channel",
        label: "¿Cómo recibes normalmente los pedidos?",
        type: "multiple-choice",
        options: [
          "WhatsApp",
          "Llamadas",
          "Instagram",
          "Facebook",
          "En persona",
          "Email",
          "Formulario",
        ],
      },
      {
        id: "order_organization",
        label: "¿Cómo organizas actualmente los pedidos?",
        type: "textarea",
        examples: [
          "WhatsApp manual",
          "Libreta o agenda",
          "Excel",
          "Notas del móvil",
          "Mensajes fijados",
          "Google Forms",
        ],
      },
      {
        id: "order_problems",
        label: "¿Qué problemas tienes hoy con los pedidos?",
        type: "textarea",
        examples: [
          "Pedidos duplicados",
          "Olvidos y errores",
          "Mensajes perdidos entre chats",
          "Errores de stock",
          "Difícil hacer seguimiento",
          "Clientes que no confirman",
        ],
      },
      {
        id: "pending_payments",
        label: "¿Necesitas controlar pagos pendientes?",
        type: "single-choice",
        options: ["Sí", "No", "A veces"],
      },
      {
        id: "manages_deliveries",
        label: "¿Gestionas entregas?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "order_states",
        label: "¿Te gustaría tener estados de pedido?",
        type: "multiple-choice",
        options: [
          "Nuevo",
          "Pendiente de confirmar",
          "Pedido al proveedor",
          "Recibido",
          "Preparado",
          "Entregado",
          "Pagado",
          "Pendiente de pago",
        ],
      },
    ],
  },
  {
    id: "deliveries",
    title: "Direcciones, compras y entregas",
    questions: [
      {
        id: "stores_addresses",
        label: "¿Guardas direcciones de clientes?",
        type: "single-choice",
        options: ["Sí", "No", "A veces"],
      },
      {
        id: "purchase_links",
        label: "¿Necesitas enviar direcciones de compra o enlaces de compra a los clientes?",
        type: "single-choice",
        options: ["Sí", "No", "A veces"],
      },
      {
        id: "shared_links_type",
        label: "¿Qué tipo de direcciones o enlaces compartes?",
        type: "textarea",
        examples: [
          "Links de compra (Mary Kay, Beyond Beauty…)",
          "Google Maps con tu ubicación",
          "Catálogos en PDF o Drive",
          "Formularios de pedido",
          "WhatsApp directo",
          "Perfil de Instagram",
        ],
      },
      {
        id: "in_person_delivery",
        label: "¿Haces entregas en persona?",
        type: "single-choice",
        options: ["Sí", "No", "A veces"],
      },
      {
        id: "routes_zones",
        label: "¿Organizas rutas o zonas?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "google_maps",
        label: "¿Necesitas acceso rápido a Google Maps?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "delivery_notes",
        label: "¿Necesitas notas de entrega?",
        type: "multiple-choice",
        options: [
          "Horario preferido",
          "Timbre",
          "Punto de entrega",
          "Entregar en trabajo",
          "Solo tardes",
          "Llamar antes",
        ],
        allowOther: true,
      },
    ],
  },
  {
    id: "appointments",
    title: "Citas y agenda",
    questions: [
      {
        id: "has_appointments",
        label: "¿Realizas citas o reuniones con clientes?",
        type: "single-choice",
        options: ["Sí", "No", "A veces"],
      },
      {
        id: "appointment_types",
        label: "¿Qué tipo de citas haces?",
        type: "multiple-choice",
        options: [
          "Asesoría de belleza",
          "Entrega de producto",
          "Demostración",
          "Reunión comercial",
          "Seguimiento",
          "Llamada",
          "Videollamada",
        ],
        allowOther: true,
      },
      {
        id: "appointment_org",
        label: "¿Cómo organizas actualmente las citas?",
        type: "textarea",
        examples: [
          "WhatsApp",
          "Google Calendar",
          "Libreta o agenda física",
          "Notas del móvil",
          "Llamadas directas",
          "Mensajes privados de Instagram",
        ],
      },
      {
        id: "uses_gcal",
        label: "¿Usas Google Calendar?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "auto_reminders",
        label: "¿Te gustaría recibir recordatorios automáticos?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "client_self_booking",
        label: "¿Te gustaría que los clientes pudieran reservar citas?",
        type: "single-choice",
        options: ["Sí", "No", "No estoy segura"],
      },
      {
        id: "client_pre_notify",
        label: "¿Necesitas avisar al cliente antes de la cita?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
    ],
  },
  {
    id: "whatsappCommunication",
    title: "WhatsApp y comunicación",
    questions: [
      {
        id: "uses_wa_business",
        label: "¿Usas WhatsApp Business?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "frequent_messages",
        label: "¿Qué mensajes repites más frecuentemente?",
        type: "multiple-choice",
        options: [
          "Enviar catálogo",
          "Confirmar pedido",
          "Avisar de pedido recibido",
          "Recordar pago",
          "Recordar cita",
          "Enviar promoción",
          "Hacer seguimiento",
          "Agradecer compra",
        ],
        allowOther: true,
      },
      {
        id: "sends_promos",
        label: "¿Envías promociones o novedades?",
        type: "single-choice",
        options: ["Sí", "A veces", "No"],
      },
      {
        id: "wants_quick_msgs",
        label: "¿Te gustaría tener mensajes rápidos preparados?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "wants_auto_reminders",
        label: "¿Te gustaría automatizar recordatorios?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "wants_client_tags",
        label: "¿Te gustaría clasificar clientes por interés?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "wants_templates",
        label: "¿Te gustaría tener plantillas de mensaje?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
    ],
  },
  {
    id: "followUp",
    title: "Seguimiento comercial",
    questions: [
      {
        id: "contacts_old_clients",
        label: "¿Sueles contactar de nuevo con clientes antiguos?",
        type: "single-choice",
        options: ["Sí", "A veces", "No"],
      },
      {
        id: "followup_freq",
        label: "¿Cada cuánto haces seguimiento?",
        type: "single-choice",
        options: ["Cada semana", "Cada mes", "Cada trimestre", "Cuando me acuerdo", "Casi nunca"],
      },
      {
        id: "wants_followup_reminders",
        label: "¿Te gustaría recibir recordatorios para volver a escribirles?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
      {
        id: "client_segments_interest",
        label: "¿Qué clientes te interesa detectar?",
        type: "multiple-choice",
        options: [
          "Clientes que hace tiempo no compran",
          "Clientes con pagos pendientes",
          "Clientes interesados en una marca concreta",
          "Clientes con cita próxima",
          "Clientes que compran cada mes",
          "Clientes nuevos sin seguimiento",
        ],
        allowOther: true,
      },
    ],
  },
  {
    id: "currentProblems",
    title: "Problemas actuales",
    description: "Cuéntamelo con detalle: aquí está la clave para preparar una buena propuesta.",
    emphasis: true,
    questions: [
      {
        id: "time_loss",
        label: "¿Qué parte de tu trabajo te hace perder más tiempo?",
        type: "textarea",
      },
      { id: "repeated_tasks", label: "¿Qué tareas repites constantemente?", type: "textarea" },
      { id: "stress_source", label: "¿Qué te genera más estrés?", type: "textarea" },
      { id: "lost_info", label: "¿Qué información se te suele perder?", type: "textarea" },
      { id: "first_improvement", label: "¿Qué te gustaría mejorar primero?", type: "textarea" },
      {
        id: "stop_manual",
        label: "¿Qué te gustaría dejar de hacer manualmente?",
        type: "textarea",
      },
    ],
  },
  {
    id: "priorities",
    title: "Prioridades",
    questions: [
      {
        id: "main_priorities",
        label: "¿Qué es lo MÁS importante para ti ahora mismo?",
        type: "multiple-choice",
        helpText: "Puedes marcar varias.",
        options: [
          "Organizar clientes",
          "Controlar pedidos",
          "Compartir catálogos",
          "Gestionar citas",
          "Enviar enlaces o direcciones de compra",
          "Automatizar mensajes",
          "Controlar pagos",
          "Organizar entregas",
          "Hacer seguimiento a clientes",
          "Tener recordatorios",
          "Tener una base de datos clara",
          "Preparar una web o catálogo digital",
        ],
        allowOther: true,
      },
    ],
  },
  {
    id: "digitalLevel",
    title: "Nivel digital actual",
    questions: [
      {
        id: "tools_used",
        label: "¿Qué herramientas utilizas actualmente?",
        type: "multiple-choice",
        options: [
          "WhatsApp",
          "WhatsApp Business",
          "Excel",
          "Google Sheets",
          "Notion",
          "Airtable",
          "Google Calendar",
          "Drive",
          "Canva",
          "Ninguna herramienta concreta",
        ],
      },
      {
        id: "digital_comfort",
        label: "¿Te sientes cómoda usando herramientas digitales?",
        type: "rating",
        helpText: "1 = nada cómoda · 5 = muy cómoda",
        min: 1,
        max: 5,
      },
      {
        id: "prefers_simple",
        label: "¿Prefieres herramientas simples aunque tengan menos funciones?",
        type: "single-choice",
        options: ["Sí", "No", "Depende"],
      },
      {
        id: "device",
        label: "¿Usas más móvil, ordenador o ambos?",
        type: "single-choice",
        options: ["Móvil", "Ordenador", "Ambos"],
      },
      {
        id: "wants_guide",
        label: "¿Te gustaría recibir una mini guía de uso si se crea una solución?",
        type: "single-choice",
        options: ["Sí", "No"],
      },
    ],
  },
];

// WhatsApp final
export const WHATSAPP_NUMBER = "+34600000000"; // editable
