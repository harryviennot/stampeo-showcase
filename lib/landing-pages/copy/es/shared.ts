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
    contact: {
      before: "¿Otra pregunta?",
      link: "Contáctanos",
      after: "Te respondemos en menos de 24 h.",
    },
  },
};
