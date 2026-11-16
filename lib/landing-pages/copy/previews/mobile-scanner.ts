import type { BandCopy, Fact, PageMeta, PreviewHeroCopy, Tile } from "../types";

/** The scanner preview: staff stamp a card in one scan, from a phone you already own. */
export const MOBILE_SCANNER_PREVIEW = {
  meta: {
    title: "Scan loyalty cards from any phone | Stampeo",
    description:
      "Stamp a digital loyalty card with the free Scanner app for iPhone and Android, or any phone's browser. No new hardware. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    eyebrow: "Scanner app",
    h1: "One scan, one stamp, from any phone.",
    accent: "from any phone.",
    sub: "A free app for iPhone and Android, or any phone's browser. No new hardware.",
  } satisfies PreviewHeroCopy,
  counter: {
    eyebrow: "At the counter",
    title: "One screen for every kind of visit.",
    lead: "Several stamps, a spend amount or a reward: the same scan handles it.",
    options: [
      { key: "stamps", title: "Stamps", line: "Add one, or several at once" },
      { key: "points", title: "Points", line: "Type what they spent" },
      { key: "rewards", title: "Reward", line: "Now or on their next visit" },
      { key: "levels", title: "Level", line: "Their perks, on screen" },
    ] satisfies Array<{ key: "stamps" | "points" | "rewards" | "levels"; title: string; line: string }>,
    fact: "Tap once. Their card updates in seconds and lands on their lock screen.",
  },
  ways: {
    eyebrow: "Two ways to scan",
    title: "An app, or just a browser.",
    lead: "Both are free on every plan. Use whatever phone or tablet is at the counter.",
    cells: [
      { title: "Scanner app", body: "On the App Store and Google Play. Sign in with Google or Apple in one tap." },
      { title: "Web scanner", body: "Open scan.stampeo.app in any phone or tablet browser. Nothing to install." },
    ] satisfies Tile[],
  },
  /** From the owner's Team page to the staff phone: three frames joined by a rail, then what the team can do. */
  team: {
    eyebrow: "Your team",
    title: "From a code to the counter.",
    lead: "Staff join with a 6-character code and only ever see the scanner.",
    frames: ["Copy your code", "They type it in", "Ready to scan"],
    facts: [
      { text: "Let a scan past a daily limit, under your name", plan: "Growth and Pro" },
      { text: "Unlimited team members", plan: "Growth and Pro" },
      { text: "Every scan carries the name of who made it" },
    ] satisfies Fact[],
  },
  demo: {
    eyebrow: "Live demo",
  },
  band: {
    title: "Stamp your first card today.",
    accent: "today.",
    sub: "Set up your card, then scan your first customer from any phone.",
  } satisfies BandCopy,
} as const;
