import type { Banner, SectionCopy } from "./types";

/** The sample café every visual on these pages belongs to (`STAMP_SAMPLES` "aurevo"). */
export const SAMPLE_BUSINESS = "Aurevo";

// The stamp, reward and level-up banners below are the English defaults of `stamp_added`, `reward_earned` and
// `tier_upgrade` in backend/app/services/programs/notification_defaults.py, with the sample's numbers and level
// filled in. The wording has to follow that file.

/** Stampeo's default stamp notification, as Aurevo's 5th of 8 stamps. */
export const STAMP_BANNER: Banner = {
  sender: SAMPLE_BUSINESS,
  body: "Stamp collected! You have 5 of 8 stamps.",
};

/** Stampeo's default reward notification. */
export const REWARD_BANNER: Banner = {
  sender: SAMPLE_BUSINESS,
  body: "You unlocked your reward! Come claim it.",
};

/** The fictional dry cleaner the level cards belong to (`WRENFOLD` in components/landing-pages/shared/samples.ts): preset icons, so its look changes per level. */
export const LEVELS_BUSINESS = "Wrenfold";

/** Stampeo's default level-up notification, with no level gift. */
export const LEVEL_UP_BANNER: Banner = {
  sender: LEVELS_BUSINESS,
  body: "You've reached Silver! Your card has a new look.",
};

/** The words every page shares, so the pages differ only by their argument. */
export const SHARED = {
  cta: "Start my free trial",
  /** The time on a lock-screen notification that has just arrived. */
  now: "now",
  /** What a pass is called under the shop's name in Google Wallet. */
  googleCardTitle: "Loyalty Card",
  /** The five looks a level can take, as the dashboard names them and a card prints them over its count. */
  levelNames: { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Platinum", noir: "Noir" },
  reassurance: "{trialDays} days free · Cancel anytime",
  demoLink: "Try it on your phone",
  demo: {
    title: "Try it on your own phone.",
    lead: "Add a sample card to your wallet, stamp it, and see what your customers see.",
  } satisfies SectionCopy,
  sampleData: "Sample data",
  /** The browser bar over the desktop dashboard capture. */
  dashboardUrl: "app.stampeo.app",
  /** Alt text of the level cards: three cards of one shop, one per level. */
  levelCardsAlt: "A dry cleaner's loyalty card at three levels: Bronze, Silver and Gold.",
  /** The heading over the sector carousel when a page gives it a small label (Platform). */
  sectorsEyebrow: "For every kind of shop",
  faq: {
    contact: {
      before: "Another question?",
      link: "Contact us",
      after: "We reply within 24 hours.",
    },
  },
} as const;
