import type { LandingCopy } from "../bundle";

// The words every French page shares. The banners are the French defaults of
// backend/app/services/programs/notification_defaults.py, with the samples' numbers and level filled in.

type Shared = LandingCopy["shared"];

export const SAMPLE_BUSINESS: Shared["SAMPLE_BUSINESS"] = "Aurevo";

export const STAMP_BANNER: Shared["STAMP_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Tampon collecté\u00a0! Vous avez 5 sur 8 tampons.",
};

export const REWARD_BANNER: Shared["REWARD_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Vous avez débloqué votre récompense\u00a0! Venez la récupérer.",
};

export const LEVELS_BUSINESS: Shared["LEVELS_BUSINESS"] = "Wrenfold";

export const LEVEL_UP_BANNER: Shared["LEVEL_UP_BANNER"] = {
  sender: LEVELS_BUSINESS,
  body: "Vous avez atteint le niveau Argent\u00a0! Votre carte a un nouveau style.",
};

export const SHARED: Shared["SHARED"] = {
  cta: "Commencer mon essai gratuit",
  now: "maintenant",
  googleCardTitle: "Carte de fidélité",
  levelNames: { bronze: "Bronze", silver: "Argent", gold: "Or", platinum: "Platine", noir: "Noir" },
  reassurance: "{trialDays} jours gratuits · Sans engagement",
  demoLink: "Essayez sur votre téléphone",
  demo: {
    title: "Essayez-la sur votre téléphone.",
    lead: "Ajoutez une carte d'exemple, tamponnez-la et voyez ce que voient vos clients.",
  },
  sampleData: "Données d'exemple",
  dashboardUrl: "app.stampeo.app",
  levelCardsAlt: "La carte de fidélité d'un pressing à trois niveaux\u00a0: Bronze, Argent et Or.",
  sectorsEyebrow: "Pour tous les commerces",
  faq: {
    contact: {
      before: "Une autre question\u00a0?",
      link: "Nous contacter",
      after: "On vous répond sous 24h.",
    },
  },
};
