import type { FinalCtaCopy, HeroCopy, PageMeta, SectionCopy, Step } from "./types";

/** The how-to page: the argument is "it's easy, here is exactly how it works". */
export const HOW_IT_WORKS = {
  meta: {
    title: "How Stampeo works: digital punch cards for Apple Wallet",
    description:
      "Launch a digital punch card today. Customers add it to Apple Wallet or Google Wallet, and you stamp it from your phone. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    h1: "Launch a digital punch card today.",
    accent: "today.",
    sub: "Customers add it to Apple Wallet or Google Wallet. You stamp it from your phone.",
  } satisfies HeroCopy,
  steps: {
    title: "Three steps, and you're live.",
    lead: "No app for your customers, no new hardware, no change at your register.",
    items: [
      { title: "Make your card", body: "Add your logo, pick your colors and choose the reward." },
      {
        title: "Customers add it to their wallet",
        body: "They scan the QR code at your counter. No app, no account.",
      },
      {
        title: "Stamp it on every visit",
        body: "Scan their card with your phone. The stamp lands on their lock screen.",
      },
    ] satisfies Step[],
    allYouNeed: "All you need: your logo and a phone to scan with.",
  } satisfies SectionCopy & { items: Step[]; allYouNeed: string },
  finalCta: {
    title: "Your card can be live today.",
    accent: "today.",
  } satisfies FinalCtaCopy,
} as const;
