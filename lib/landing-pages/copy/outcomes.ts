import { LEVEL_UP_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "./shared";
import type {
  Banner,
  Fact,
  FinalCtaCopy,
  HeroCopy,
  PageMeta,
  SectionCopy,
  SourcedFigure,
} from "./types";

const HEAD_START_SOURCE = "Nunes & Drèze, Journal of Consumer Research, 2006 (car wash loyalty cards, 9 months)";

/** The outcome page: the argument is "first-time customers become regulars", one mechanism per section. */
export const OUTCOMES = {
  meta: {
    title: "Turn first-time customers into regulars | Stampeo",
    description:
      "A digital punch card in your customers' Apple Wallet or Google Wallet that keeps them coming back. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    // U+2011 keeps "first‑time" on one line, as on /us.
    h1: "Turn first‑time customers into regulars.",
    accent: "regulars.",
    sub: "A digital punch card in their Apple or Google Wallet that keeps them coming back.",
  } satisfies HeroCopy,
  problem: {
    title: "Regulars are where the money is.",
    figure: {
      value: "6×",
      text: "Regular customers generate 6X more annual revenue than one-time visitors.",
      source:
        "Square, 2026 Local Economy Report (US transactions, 2019 to 2025). A regular visits a business at least 4 times a year.",
    } satisfies SourcedFigure,
  },
  always: {
    title: "Always on them, updated every visit.",
    lead: "In Apple Wallet or Google Wallet, so it's never lost. Each stamp pings their phone.",
    banner: STAMP_BANNER,
  } satisfies SectionCopy & { banner: Banner },
  headStart: {
    title: "A head start gets them to finish.",
    lead: "Give new customers their first stamps on the house. It's on every plan.",
    toggle: { empty: "Card starts empty", headStart: "2 stamps on the house" },
    barLabel: "finished the card",
    empty: {
      value: "19%",
      text: "finished a card that started empty",
      source: HEAD_START_SOURCE,
    } satisfies SourcedFigure,
    withHeadStart: {
      value: "34%",
      text: "finished a card that came with 2 free stamps",
      source: HEAD_START_SOURCE,
    } satisfies SourcedFigure,
  },
  slowDays: {
    title: "Fill your quiet hours.",
    lead: "See when it's slow, then send every card a reason to come in.",
    /** Printed with the `SHARED.broadcastPlans` label on the same line: the busiest-times chart and broadcasts are both Growth and Pro. */
    noFees: "Broadcasts to every card, with no texting fees.",
    banner: {
      sender: SAMPLE_BUSINESS,
      body: "Quiet afternoon? Your second coffee is half price until 5pm.",
    } satisfies Banner,
    /** The capture's alt text. */
    alt: "Aurevo's busiest times on a phone, with its quietest open hour.",
  },
  levels: {
    title: "Give your regulars a level to reach.",
    lead: "Bronze, Silver, Gold: customers move up as they keep coming back.",
    facts: [
      { text: "Up to 5 levels, each with its own card look" },
      { text: "Perks for each level, shown to staff at the register" },
      { text: "Customers move up on what they earn, and never slip back on their own" },
    ] satisfies Fact[],
    banner: LEVEL_UP_BANNER,
  },
  regulars: {
    title: "Watch first-timers turn into regulars.",
    lead: "Your return rate, who your regulars are, and who's slipping away.",
    segments: ["New", "Regular", "VIP", "At risk", "Ghost"],
    example: {
      label: "Example",
      text: "20 customers who come back one extra time a month, at $8 a visit, bring in $160 more every month.",
    },
    /** The dashboard capture's alt text. */
    alt: "Aurevo's Analytics page on a phone: visits, new customers and return rate.",
  },
  finalCta: {
    title: "Make your next customer a regular.",
    accent: "a regular.",
  } satisfies FinalCtaCopy,
} as const;
