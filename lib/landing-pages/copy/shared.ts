import type { Banner, FaqItem, SectionCopy } from "./types";

/** The sample café every visual on these pages belongs to (`STAMP_SAMPLES` "aurevo"). */
export const SAMPLE_BUSINESS = "Aurevo";

/** Stampeo's default stamp notification (every plan), as Aurevo's 5th of 8 stamps. */
export const STAMP_BANNER: Banner = {
  sender: SAMPLE_BUSINESS,
  body: "Stamp collected! You have 5 of 8 stamps.",
};

/** Stampeo's default reward notification (every plan). */
export const REWARD_BANNER: Banner = {
  sender: SAMPLE_BUSINESS,
  body: "You unlocked your reward! Come claim it.",
};

/** The barbershop sample the level cards belong to (`STAMP_SAMPLES` "barber"): preset icons, so its look changes per level. */
export const LEVELS_BUSINESS = "Les Garçons Barbiers";

/** Stampeo's default level-up notification (every plan), with no level gift. */
export const LEVEL_UP_BANNER: Banner = {
  sender: LEVELS_BUSINESS,
  body: "You've reached Silver! Your card has a new look.",
};

/** The words every page shares, so the pages differ only by their argument. */
export const SHARED = {
  cta: "Start my free trial",
  reassurance: "{trialDays} days free · Cancel anytime",
  /** The hero proof line, filled from the `variant.metrics` figures. */
  proof: (businesses: string, countries: string) =>
    `Used by ${businesses} businesses in ${countries} countries`,
  demoLink: "Try it on your phone",
  demo: {
    title: "Try it on your own phone.",
    lead: "Add a sample card to your wallet, stamp it, and see what your customers see.",
  } satisfies SectionCopy,
  sampleData: "Sample data",
  /** The plans a broadcast comes with; printed wherever a broadcast is mentioned. */
  broadcastPlans: "Growth and Pro",
  /** The browser bar over the desktop dashboard capture. */
  dashboardUrl: "app.stampeo.app",
  /** Alt text of the level cards: three cards of one shop, one per level. */
  levelCardsAlt: "A barbershop's loyalty card at three levels: Bronze, Silver and Gold.",
  /** The heading over the sector carousel when a page gives it a small label (Platform). */
  sectorsEyebrow: "For every kind of shop",
  faq: {
    title: "Questions owners ask",
    items: [
      {
        question: "Do my customers have to download an app?",
        answer:
          "No. Apple Wallet and Google Wallet are already on their phone. They scan your QR code and the card is in their wallet in seconds.",
      },
      {
        question: "Do I need new hardware or a new POS?",
        answer:
          "No. You stamp cards with our free app or from any phone's browser. Nothing changes at your register, and there's nothing to connect.",
      },
      {
        question: "How do customers join?",
        answer:
          "They scan the QR code at your counter, or tap the link you share online, and add the card to Apple Wallet or Google Wallet. Your dashboard prints a ready-made counter flyer.",
      },
      {
        question: "What happens when the free trial ends?",
        answer:
          "You choose whether to continue. We ask for your card to start the trial, and nothing is charged before the {trialDays} days are up. Cancel anytime before then.",
      },
      {
        question: "Is there a contract?",
        answer:
          "No. Monthly plans have no contract and no setup fee. Cancel anytime from your dashboard.",
      },
    ] satisfies FaqItem[],
    contact: {
      before: "Another question?",
      link: "Contact us",
      after: "We reply within 24 hours.",
    },
  },
} as const;
