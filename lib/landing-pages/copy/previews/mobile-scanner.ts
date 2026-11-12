import type { BandCopy, Fact, PageMeta, PreviewHeroCopy, RowCopy, TabCopy, Tile } from "../types";

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
  how: {
    eyebrow: "How it works",
    title: "Scan, check, confirm.",
    lead: "Point the camera at their card. Their progress shows before anything counts.",
    cells: [
      { title: "Scan", body: "Point the Scanner at the QR code on their card, in either wallet." },
      { title: "Check", body: "Their name, stamps and any rewards waiting show up first." },
      { title: "Confirm", body: "Tap once. Their card updates in seconds and lands on their lock screen." },
    ] satisfies Tile[],
    link: "Try the stamp step yourself",
  },
  counter: {
    eyebrow: "At the counter",
    title: "One screen for every kind of visit.",
    lead: "Several stamps, a spend amount or a reward: the same scan handles it.",
    rows: [
      {
        key: "stamps",
        eyebrow: "Several at once",
        title: "Stamps",
        body: "Add one, or use the stepper to add several in a single scan.",
      },
      {
        key: "points",
        eyebrow: "Type what they spent",
        title: "Points",
        body: "Enter the amount and see the points, bonus included, before you confirm.",
      },
      {
        key: "rewards",
        eyebrow: "Now or next time",
        title: "Rewards",
        body: "Redeem a reward on the spot, or save it for their next visit.",
      },
      {
        key: "levels",
        eyebrow: "Perks at the register",
        title: "Levels",
        body: "Their level and its perks show on screen, and it tells you when they move up.",
      },
    ] satisfies RowCopy<"stamps" | "points" | "rewards" | "levels">[],
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
  team: {
    eyebrow: "Your team",
    title: "Free for your whole team.",
    lead: "Staff join with a code and only ever see the scanner.",
    tabs: {
      staff: {
        label: "Staff",
        title: "A code, then the scanner",
        facts: [
          { text: "A 6-character code from your Team page" },
          { text: "No dashboard, customer list or settings" },
          { text: "Told up front that their scans carry their name" },
        ] satisfies Fact[],
      },
      owners: {
        label: "Owners and admins",
        title: "Scan, and step in when needed",
        facts: [
          { text: "The same scanner, on your own phone" },
          { text: "Let a scan past a daily limit, under your name", plan: "Growth and Pro" },
          { text: "Unlimited team members", plan: "Growth and Pro" },
        ] satisfies Fact[],
      },
    } satisfies Record<"staff" | "owners", TabCopy>,
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
