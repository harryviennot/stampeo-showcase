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
  } satisfies HeroCopy & { secondary: string },
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
    /**
     * What each pane says, in the order of `options`: the phone's screen and the customer's wallet card for a
     * screen reader, and the line under the card that says what the scan did to it.
     */
    panes: [
      {
        screenAlt: "The Scanner app adding three stamps to Sophie's card in one scan: a stepper set to 3 and the Add 3 stamps button.",
        cardAlt: "Sophie's wallet card from Aurevo, full at 8 of 8 stamps.",
        result: "5 → 8 stamps",
      },
      {
        screenAlt: "The Scanner app taking a spend amount of 12.50 with the keypad, and the points it earns, about 12, before anyone confirms.",
        cardAlt: "Sophie's wallet card from Marginalia, a bookstore, now at 252 points.",
        result: "240 → 252 pts",
      },
      {
        screenAlt: "The Scanner app's list of rewards to redeem: three rewards, each with a Redeem button.",
        cardAlt: "Sophie's wallet card from Aurevo, back to 2 of 8 stamps once her reward is claimed.",
        result: "Free coffee redeemed",
      },
      {
        screenAlt: "The Scanner app showing a Silver customer's perks to apply at the till before charging.",
        cardAlt: "Sophie's wallet card from Wrenfold, a dry cleaner, showing its Silver level.",
        result: "Level: Silver",
      },
    ],
  },
  /**
   * The Scanner app's own words on the four screens drawn on the phone (scanner-app `locales/<language>/stamp.json`
   * and `points.json`). `levels.perkOne` fills `{level}` and `{perk}`, `levels.perkMany` fills `{level}`.
   */
  screens: {
    customer: "Sophie",
    stamps: { detail: "5 / 8", added: "+3 stamps", completes: "This completes the card", button: "Add 3 stamps" },
    points: { detail: "240 pts", amount: "12.50", earns: "≈ +12 pts", button: "Add Points" },
    rewards: {
      detail: "8 / 8",
      title: "Rewards to redeem",
      redeem: "Redeem",
      gift: "Gift",
      expiresToday: "Expires today",
      expiresLater: "Expires in 5 days",
      /** The three rewards the customer holds: the first one expires today, the second is a gift, the third expires in 5 days. */
      held: ["Free coffee", "Free pastry", "Free coffee"],
    },
    levels: {
      detail: "4 / 6",
      perks: ["Free hanger return", "Priority pickup"],
      perkOne: "{level} perk: {perk}",
      perkMany: "{level} perks:",
      applyOne: "Apply it at the till before charging.",
      applyMany: "Apply them at the till before charging.",
      button: "Add Stamp",
    },
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
