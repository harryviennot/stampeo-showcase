import { SAMPLE_BUSINESS } from "./shared";
import type {
  Banner,
  FinalCtaCopy,
  HeroCopy,
  PageMeta,
  SectionCopy,
  SourcedFigure,
} from "./types";

/** The outcome page: the argument is "first-time customers become regulars". */
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
  comeBack: {
    title: "They come back sooner.",
    lead: "The card is always on them, and every stamp shows how close the reward is.",
    headStart: {
      text: "Give new customers a head start: in one study, 34% finished a card that came with 2 free stamps, against 19% without.",
      source: "Nunes & Drèze, Journal of Consumer Research, 2006 (car wash loyalty cards, 9 months)",
    } satisfies SourcedFigure,
  } satisfies SectionCopy & { headStart: SourcedFigure },
  slowDays: {
    title: "Fill your slow days.",
    lead: "Send a broadcast to every card: a quiet afternoon, a new item, a seasonal treat.",
    /** Printed with the `SHARED.broadcastPlans` label on the same line. */
    noFees: "No texting fees.",
    banner: {
      sender: SAMPLE_BUSINESS,
      body: "Quiet afternoon? Your second coffee is half price until 5pm.",
    } satisfies Banner,
  } satisfies SectionCopy & { noFees: string; banner: Banner },
  regulars: {
    title: "Know your regulars.",
    lead: "See your return rate, who comes back most, and who's slipping away.",
    example: {
      label: "Example",
      text: "20 customers who come back one extra time a month, at $8 a visit, bring in $160 more every month.",
    },
  } satisfies SectionCopy & { example: { label: string; text: string } },
  finalCta: {
    title: "Make your next customer a regular.",
    accent: "a regular.",
  } satisfies FinalCtaCopy,
} as const;
