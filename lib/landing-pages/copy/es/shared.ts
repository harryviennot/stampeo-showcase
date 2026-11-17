import type { LandingCopy } from "../bundle";

type Shared = LandingCopy["shared"];

/** The words every Spanish page shares; the banners are the Spanish defaults of the backend's notification_defaults.py. */
export const SAMPLE_BUSINESS: Shared["SAMPLE_BUSINESS"] = "Aurevo";

export const STAMP_BANNER: Shared["STAMP_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "¡Sello conseguido! Tienes 5 de 8 sellos.",
};

export const REWARD_BANNER: Shared["REWARD_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "¡Has desbloqueado tu recompensa! Ven a recogerla.",
};

export const LEVELS_BUSINESS: Shared["LEVELS_BUSINESS"] = "Wrenfold";

export const LEVEL_UP_BANNER: Shared["LEVEL_UP_BANNER"] = {
  sender: LEVELS_BUSINESS,
  body: "¡Has alcanzado el nivel Plata! Tu tarjeta tiene un nuevo estilo.",
};

export const SHARED: Shared["SHARED"] = {
  cta: "Empezar mi prueba gratis",
  now: "ahora",
  googleCardTitle: "Tarjeta de fidelidad",
  levelNames: { bronze: "Bronce", silver: "Plata", gold: "Oro", platinum: "Platino", noir: "Negro" },
  reassurance: "{trialDays} días gratis · Sin compromiso",
  proof: (businesses: string, countries: string) => `Lo usan ${businesses} comercios en ${countries} países`,
  demoLink: "Pruébalo en tu teléfono",
  demo: {
    title: "Pruébalo en tu propio teléfono.",
    lead: "Añade una tarjeta de ejemplo, ponle un sello y mira lo que ven tus clientes.",
  },
  sampleData: "Datos de ejemplo",
  dashboardUrl: "app.stampeo.app",
  levelCardsAlt: "La tarjeta de fidelidad de una tintorería en tres niveles: Bronce, Plata y Oro.",
  sectorsEyebrow: "Para todo tipo de comercio",
  faq: {
    title: "Las preguntas que nos hacen",
    items: [
      {
        question: "¿Mis clientes tienen que descargar una aplicación?",
        answer:
          "No. Apple Wallet y Google Wallet ya están en su teléfono. Escanean tu código QR y la tarjeta queda guardada en segundos.",
      },
      {
        question: "¿Necesito equipos nuevos o cambiar de caja?",
        answer:
          "No. Sellas las tarjetas con nuestra app gratuita o desde el navegador de cualquier teléfono. En tu caja no cambia nada y no hay nada que conectar.",
      },
      {
        question: "¿Cómo se unen mis clientes?",
        answer:
          "Escanean el código QR de tu mostrador, o abren el enlace que compartes en internet, y añaden la tarjeta a Apple Wallet o Google Wallet. Tu panel te prepara un folleto de mostrador listo para imprimir.",
      },
      {
        question: "¿Qué pasa cuando termina la prueba gratuita?",
        answer:
          "Eliges si sigues o no. Te pedimos una tarjeta bancaria para iniciar la prueba, pero no hay ningún cargo antes de que terminen los {trialDays} días. Puedes cancelar cuando quieras antes de esa fecha.",
      },
      {
        question: "¿Hay permanencia?",
        answer: "No. Los planes mensuales no tienen permanencia ni gastos de alta. Cancela cuando quieras desde tu panel.",
      },
    ],
    contact: {
      before: "¿Otra pregunta?",
      link: "Contáctanos",
      after: "Te respondemos en menos de 24 h.",
    },
  },
};
