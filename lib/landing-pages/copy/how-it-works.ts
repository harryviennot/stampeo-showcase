import type { FinalCtaCopy, HeroCopy, PageMeta, SectionCopy, Step, Tile } from "./types";

/** The how-to page: the argument is "it's easy, and here is exactly how", in the owner's own order. */
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
      { title: "Make your card", body: "Your logo, your colors, your reward." },
      { title: "Customers add it to their wallet", body: "One scan of the QR code at your counter." },
      { title: "Stamp it on every visit", body: "From any phone. They see it right away." },
    ] satisfies Step[],
  } satisfies SectionCopy & { items: Step[] },
  create: {
    label: "Step 1",
    title: "Make your card. Try it right here.",
    lead: "Pick stamps or points, your colors and your icon. The card updates as you go.",
    designHelp:
      "Rather not design it yourself? Send us your logo and we'll make your first card for free, on every plan.",
    ctaLead: "Like it? Build yours for real.",
  },
  share: {
    label: "Step 2",
    title: "They scan, and it's in their wallet.",
    lead: "Your dashboard prints a counter flyer with your QR code. No app, no account.",
    channels: [
      { title: "On your counter", body: "The printable flyer, ready from your dashboard." },
      { title: "Online", body: "Your link on Instagram, Facebook or your website." },
      { title: "In your team's hands", body: "The Scanner app shows your QR code too." },
    ] satisfies Tile[],
  },
  stamp: {
    label: "Step 3",
    title: "Scan their card. That's the stamp.",
    lead: "Use the free Scanner app or any phone's browser. Their card updates in seconds.",
    youCaption: "You scan",
    theyCaption: "They see it",
  },
  seeItWork: {
    title: "Then watch it work, live.",
    lead: "Every stamp, reward and new card shows up on your dashboard as it happens.",
  } satisfies SectionCopy,
  firstDay: {
    title: "From sign-up to first stamp, same day.",
    lead: "You add a test card to your own phone before you choose a plan.",
    items: [
      "Tell us about your shop",
      "Build your card",
      "Add a test card to your phone and stamp it",
      "Choose a plan, and your {trialDays}\u2011day free trial starts",
      "Put the flyer on your counter",
    ],
    closing: "Your card can be live the same day.",
  },
  finalCta: {
    title: "Your card can be live today.",
    accent: "today.",
  } satisfies FinalCtaCopy,
} as const;
