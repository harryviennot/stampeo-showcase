// The words every Platform-style page shares, in Polish; the banners follow the backend's Polish notification defaults.
import type { LandingCopy } from "../bundle";

export const SAMPLE_BUSINESS: LandingCopy["shared"]["SAMPLE_BUSINESS"] = "Aurevo";

export const STAMP_BANNER: LandingCopy["shared"]["STAMP_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Pieczątka zebrana! Masz 5 z 8 pieczątek.",
};

export const REWARD_BANNER: LandingCopy["shared"]["REWARD_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Nagroda odblokowana! Zapraszamy po odbiór.",
};

export const LEVELS_BUSINESS: LandingCopy["shared"]["LEVELS_BUSINESS"] = "Wrenfold";

export const LEVEL_UP_BANNER: LandingCopy["shared"]["LEVEL_UP_BANNER"] = {
  sender: LEVELS_BUSINESS,
  body: "Poziom Srebro osiągnięty! Twoja karta ma nowy wzór.",
};

export const SHARED: LandingCopy["shared"]["SHARED"] = {
  cta: "Zacznij za darmo",
  now: "teraz",
  googleCardTitle: "Karta lojalnościowa",
  levelNames: { bronze: "Brąz", silver: "Srebro", gold: "Złoto", platinum: "Platyna", noir: "Czerń" },
  reassurance: "{trialDays} dni za darmo · Bez karty płatniczej",
  demoLink: "Wypróbuj na swoim telefonie",
  demo: {
    title: "Wypróbuj na własnym telefonie.",
    lead: "Dodaj przykładową kartę do portfela, przybij pieczątkę i zobacz to, co zobaczą twoi klienci.",
  },
  sampleData: "Przykładowe dane",
  dashboardUrl: "app.stampeo.app",
  levelCardsAlt: "Karta lojalnościowa pralni na trzech poziomach: Brąz, Srebro i Złoto.",
  sectorsEyebrow: "Dla każdej branży",
  faq: {
    contact: {
      before: "Masz inne pytanie?",
      link: "Napisz do nas",
      after: "Odpowiadamy w ciągu 24 godzin.",
    },
  },
};
