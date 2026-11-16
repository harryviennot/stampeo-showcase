import { SAMPLE_BUSINESS } from "../shared";
import type { Banner, BandCopy, FaqItem, Fact, HeroCopy, PageMeta } from "../types";

/** Where the two measured figures come from: the businesses on Stampeo. */
const FIGURES_SOURCE = "Stampeo data, 86 businesses, February to October 2026";

/** The broadcast the hero's lock screen and the first idea show: the approved Outcomes copy. */
const HAPPY_HOUR: Banner = {
  sender: SAMPLE_BUSINESS,
  body: "Quiet afternoon? Your second coffee is half price until 5pm.",
};

/** A broadcast a café could send: the chip that picks it, its sample message on the lock screen, and who gets it. */
interface IdeaCopy {
  key: string;
  chip: string;
  body: string;
  banner: Banner;
}

/** The broadcasts preview: one message written once, to every card. */
export const PROMOTIONAL_CAMPAIGNS_PREVIEW = {
  meta: {
    title: "Wallet broadcasts for loyalty cards | Stampeo",
    description:
      "Send one message to every loyalty card in Apple Wallet and Google Wallet, with no texting fees. Free trial, cancel anytime.",
  } satisfies PageMeta,
  hero: {
    h1: "Bring customers back with one message.",
    accent: "one message.",
    sub: "A message to every card in Apple Wallet and Google Wallet. No texting fees.",
  } satisfies HeroCopy,
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
  /** The dashboard's own "New broadcast" screen, in its words (web's `broadcasts.wizard` and `detail` labels). */
  composer: {
    eyebrow: "How it works",
    title: "Write it, pick who gets it, send.",
    lead: "Write it in your dashboard. It lands on their lock screen in seconds.",
    card: {
      title: "New broadcast",
      message: HAPPY_HOUR,
      audience: {
        title: "Who will receive this?",
        all: "All enrolled customers",
        filtered: "Filtered audience",
        filters: [{ label: "Joined in the last month" }],
      },
      send: "Send now",
      sendAgain: "Send again",
      delivered: "Delivered",
    },
  },
  ideas: {
    eyebrow: "Ideas to send",
    title: "Give them a reason to come in today.",
    lead: "A few messages that work for a café. Write your own the same way.",
    rows: [
      {
        key: "happy-hour",
        body: "Sent to everyone.",
        chip: "Slow afternoon",
        banner: HAPPY_HOUR,
      },
      {
        key: "we-miss-you",
        body: "A friendly nudge for customers you haven't seen in a while.",
        chip: "Gone quiet",
        banner: { sender: SAMPLE_BUSINESS, body: "We haven't seen you in a while. A free cookie is waiting for you." },
      },
      {
        key: "close",
        body: "A nudge to get customers to their next reward.",
        chip: "Almost there",
        banner: { sender: SAMPLE_BUSINESS, body: "One more stamp and your next coffee is on us." },
      },
      {
        key: "new",
        body: "Sent to every card.",
        chip: "Something new",
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
  faq: {
    title: "Questions we hear a lot",
    items: [
      {
        question: "How much do broadcasts cost?",
        answer:
          "Nothing extra per message, unlike texting, where every message is billed. Your plan sets how many broadcasts you can send each month (see pricing).",
      },
      {
        question: "Do customers need to install an app?",
        answer:
          "No. Customers add a standard Apple Wallet or Google Wallet pass, which is the loyalty card itself. Wallet notifications are built into both, so there is no store download and no account.",
      },
      {
        question: "How fast does a broadcast arrive?",
        answer:
          "Write it, tap Send, and it reaches your customers' lock screens in seconds, which suits a flash promotion.",
      },
      {
        question: "Where does the message show up?",
        answer:
          "On your customer's lock screen, as a notification from your business's card in their wallet. There is nothing to download and no number to collect.",
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
