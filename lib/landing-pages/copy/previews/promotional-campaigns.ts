import { PLAN_FACTS } from "../../../plans/plan-facts";
import { SAMPLE_BUSINESS } from "../shared";
import type { Banner, BandCopy, FaqItem, Fact, PageMeta, PlanChip, PreviewHeroCopy, RowCopy, Tile } from "../types";

/** Where the two measured figures come from: the businesses on Stampeo. */
const FIGURES_SOURCE = "Stampeo data, 86 businesses, February to October 2026";

/** Growth's monthly allowance, from the plan facts: the copy never types it. */
const growthMonthly = PLAN_FACTS.growth.broadcastsPerMonth;

/** The broadcast the hero's lock screen and the first idea show: the approved Outcomes copy. */
const HAPPY_HOUR: Banner = {
  sender: SAMPLE_BUSINESS,
  body: "Quiet afternoon? Your second coffee is half price until 5pm.",
};

/** A broadcast sent on a lock screen: its row, its sample message and who gets it. */
interface IdeaCopy extends RowCopy {
  banner: Banner;
}

/**
 * The broadcasts preview. `plan` at the top is the plan availability of the whole page, which every
 * mention under it inherits; a row or cell that only Pro has says so with its own chip.
 */
export const PROMOTIONAL_CAMPAIGNS_PREVIEW = {
  plan: "Growth and Pro" satisfies PlanChip,
  meta: {
    title: "Wallet broadcasts for loyalty cards | Stampeo",
    description:
      "Send one message to every loyalty card in Apple Wallet and Google Wallet, with no texting fees. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    eyebrow: "Broadcasts",
    h1: "Bring customers back with one message.",
    accent: "one message.",
    sub: "A message to every card in Apple Wallet and Google Wallet. No texting fees.",
  } satisfies PreviewHeroCopy,
  /** The lock screen in the hero, over the stamp banner. */
  heroBanner: HAPPY_HOUR,
  numbers: {
    eyebrow: "Your audience",
    title: "Your customers keep the card.",
    lead: "A broadcast reaches every card still in a wallet. Here's what we see.",
    figures: [
      {
        value: "88%",
        text: "of customers who join save the card to their wallet",
        source: FIGURES_SOURCE,
      },
      {
        value: "95%",
        text: "of those cards are still there three months later",
        source: FIGURES_SOURCE,
      },
    ],
    /** Printed once under the row of figures. */
    sourceLine: FIGURES_SOURCE,
  },
  how: {
    eyebrow: "How it works",
    title: "Write it, pick who gets it, send.",
    lead: "Write it in your dashboard. It lands on their lock screen in seconds.",
    cells: [
      { title: "Write", body: "A short message: a deal, something new, a reason to drop by today." },
      { title: "Pick who", body: "Everyone, or by when they joined. Pro adds stamps, rewards and inactivity." },
      { title: "Send", body: "Right away, or on Pro, at any date and time you choose." },
    ] satisfies Tile[],
  },
  ideas: {
    eyebrow: "Ideas to send",
    title: "Give them a reason to come in today.",
    lead: "A few messages that work for a café. Write your own the same way.",
    rows: [
      {
        key: "happy-hour",
        eyebrow: "Fill a quiet hour",
        title: "Happy hour",
        body: "Sent to everyone.",
        banner: HAPPY_HOUR,
      },
      {
        key: "we-miss-you",
        eyebrow: "Bring back a regular",
        title: "We miss you",
        body: "Sent only to customers who haven't been in for a month.",
        plan: "Pro",
        banner: { sender: SAMPLE_BUSINESS, body: "We haven't seen you in a while. A free cookie is waiting for you." },
      },
      {
        key: "close",
        eyebrow: "Almost there",
        title: "Close to a reward",
        body: "A nudge to customers a stamp or two from their reward.",
        plan: "Pro",
        banner: { sender: SAMPLE_BUSINESS, body: "One more stamp and your next coffee is on us." },
      },
      {
        key: "new",
        eyebrow: "Something new",
        title: "New on the menu",
        body: "Sent to every card.",
        banner: { sender: SAMPLE_BUSINESS, body: "Pumpkin bread is back today." },
      },
    ] satisfies IdeaCopy[],
  },
  delivery: {
    eyebrow: "After you send",
    title: "See where every message landed.",
    lead: "Each broadcast shows how many reached Apple Wallet and Google Wallet.",
    tab: {
      title: "Delivery you can verify",
      facts: [
        { text: "Split by Apple and Google" },
        { text: "Cards removed from a wallet are counted, not hidden" },
        { text: "Send it again anytime" },
      ] satisfies Fact[],
    },
    /** One sample broadcast to 716 cards. */
    metrics: [
      { label: "Apple delivered", value: "412" },
      { label: "Google delivered", value: "268" },
      { label: "Google throttled", value: "14" },
      { label: "Wallet uninstalled", value: "22" },
    ],
  },
  plans: {
    eyebrow: "Plans",
    title: "What each plan can send.",
    lead: "Broadcasts come with Growth and Pro, with no texting fees on either.",
    cells: [
      { title: "Growth", body: `${growthMonthly} broadcasts a month, sent right away, to everyone or by when they joined.` },
      { title: "Pro", body: "Unlimited, scheduled for any date and time, with full targeting." },
    ] satisfies Tile[],
    link: "Compare plans",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions we hear a lot",
    items: [
      {
        question: "How much do broadcasts cost?",
        answer: `Nothing extra. Broadcasts come with the Growth plan, ${growthMonthly} broadcasts a month, and the Pro plan, unlimited. There is no per-message fee, unlike texting, where every message is billed.`,
      },
      {
        question: "Do customers need to install an app?",
        answer:
          "No. Customers add a standard Apple Wallet or Google Wallet pass, which is the loyalty card itself. Wallet notifications are built into both, so there is no store download and no account.",
      },
      {
        question: "Can I schedule broadcasts in advance?",
        answer:
          'Yes, on the Pro plan. Pick a local date and time, and the send goes out at the right moment in your business hours. The Growth plan sends right away when you hit "Send", which fits most flash promotions.',
      },
      {
        question: "Can I target specific customers?",
        answer:
          "Yes. On Growth you can filter by when customers joined. On Pro you can also target by stamp count, last redemption and how long it has been since their last visit, so each broadcast reaches only the customers it is meant for.",
      },
      {
        question: "Does it work with both Apple Wallet and Google Wallet?",
        answer:
          "Yes. Every broadcast goes out to Apple Wallet and Google Wallet in parallel. Your customers see the notification whether they use an iPhone or an Android phone.",
      },
    ] satisfies FaqItem[],
  },
  band: {
    title: "Fill your next slow day.",
    accent: "slow day.",
    sub: "Start your free trial, then send your first broadcast this week.",
  } satisfies BandCopy,
} as const;
