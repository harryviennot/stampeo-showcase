import type { BandCopy, HeroCopy, PageMeta, Tile } from "../types";

/** A way to scan: its tile, and the devices it runs on. */
type Way = Tile & { devices: string[] };

/** The scanner preview: staff scan a card with the free app or with the web scanner in a browser. */
export const MOBILE_SCANNER_PREVIEW = {
  meta: {
    title: "Loyalty card scanner app for iPhone and Android | Stampeo",
    description:
      "Scan loyalty cards with the free Stampeo Scanner app for iPhone and Android, or the web scanner in any browser. No new hardware. Free trial.",
  } satisfies PageMeta,
  hero: {
    h1: "A loyalty card scanner app for your staff.",
    accent: "scanner app",
    sub: "The free app for iPhone and Android, or the web scanner in any browser. No new hardware.",
    /** The second action, to the counter section. */
    secondary: "See it at the counter",
    /** What the hero's picture shows, for a screen reader. */
    alt: "The Stampeo Scanner app on a phone, and the web scanner open in a laptop browser, both showing a customer's card.",
  } satisfies HeroCopy & { secondary: string; alt: string },
  counter: {
    eyebrow: "At the counter",
    title: "Add stamps, points or rewards in one scan.",
    lead: "Scan the customer's card, then tap once. Their card updates in seconds.",
    options: [
      { key: "stamps", title: "Stamps", line: "Add one, or several at once" },
      { key: "points", title: "Points", line: "Type what they spent" },
      { key: "rewards", title: "Rewards", line: "Redeem now, or save for their next visit" },
      { key: "levels", title: "Levels", line: "See their level and its perks" },
    ] satisfies Array<{ key: "stamps" | "points" | "rewards" | "levels"; title: string; line: string }>,
    fact: "They get a notification on their lock screen right after.",
  },
  ways: {
    eyebrow: "App or browser",
    title: "The scanner app, or just a web browser.",
    lead: "The app gives the smoothest scans. No download? The web scanner works anytime.",
    cells: [
      {
        title: "Stampeo Scanner app",
        body: "Free on the App Store and Google Play. Sign in with Google or Apple in one tap.",
        devices: ["iPhone", "Android"],
      },
      {
        title: "Web scanner",
        body: "Open scan.stampeo.app in any browser. Nothing to install.",
        devices: ["Phone", "Tablet", "Laptop"],
      },
    ] satisfies Way[],
    fact: "Both do the same job: scan the card, add stamps or points, redeem rewards.",
  },
  band: {
    title: "Stamp your first card today.",
    accent: "today.",
    sub: "Set up your card, then scan your first customer from any phone.",
  } satisfies BandCopy,
} as const;
