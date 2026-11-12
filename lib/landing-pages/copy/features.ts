import { REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "./shared";
import type { Fact, FinalCtaCopy, HeroCopy, Moment, PageMeta, SectionCopy, Tile } from "./types";

/** The features page: the argument is "your card in their wallet, with everything around it". */
export const FEATURES = {
  meta: {
    title: "Digital punch cards for Apple & Google Wallet | Stampeo",
    description:
      "Your punch card in Apple Wallet and Google Wallet: your logo, lock-screen notifications and the numbers behind them. Nothing for your customers to download.",
  } satisfies PageMeta,
  hero: {
    h1: "Your punch card, in Apple & Google Wallet.",
    accent: "Apple & Google Wallet.",
    sub: "Branded with your logo, updated on every visit. No app for your customers to download.",
  } satisfies HeroCopy,
  design: {
    title: "Looks like your shop, not like us.",
    lead: "Your logo, your colors, your stamps. Change them anytime and every card updates.",
    facts: [
      { text: "Your logo and colors, with palettes made from your logo" },
      { text: "Your own stamp icons, with the background removed for you" },
      { text: "Change it anytime and every card updates" },
    ] satisfies Fact[],
  },
  programTypes: {
    title: "Stamps, points or levels.",
    lead: "Reward visits, reward spending, or let regulars climb. All three on every plan.",
  } satisfies SectionCopy,
  messages: {
    title: "Reach them on their lock screen.",
    lead: "Every stamp and every reward sends a notification. No app, no email list.",
    moments: [
      {
        title: "Stamp collected",
        description: "Sent on every scan, in your customer's language.",
        banner: STAMP_BANNER,
        plan: "Every plan",
      },
      {
        title: "Reward unlocked",
        description: "Sent the moment their card is full.",
        banner: REWARD_BANNER,
        plan: "Every plan",
      },
      {
        title: "Broadcast",
        description: "Your own message, sent to every card.",
        banner: { sender: SAMPLE_BUSINESS, body: "Fresh cinnamon rolls just came out of the oven." },
        plan: "Growth and Pro",
      },
    ] satisfies Moment[],
    /** Printed with the `SHARED.broadcastPlans` label on the same line. */
    broadcast: "Send a broadcast to every card, with no texting fees.",
  },
  scanner: {
    title: "Stamp from any phone at the counter.",
    lead: "The free Scanner app for iPhone and Android, or any phone's browser.",
    facts: [
      { text: "Staff join with a team code and see only the scanner" },
      { text: "Each customer's progress and rewards show before you confirm" },
      { text: "Level perks show up at the register" },
    ] satisfies Fact[],
  },
  analytics: {
    title: "See who keeps coming back.",
    lead: "Visits, new customers and your return rate, updated with every scan.",
    /** The capture's alt text. */
    alt: "The Stampeo Analytics page on a phone: visits, new customers and return rate.",
    planLine: "More charts come with Growth and Pro.",
  },
  more: {
    title: "And everything around it.",
    lead: "The details that make a loyalty program easy to run.",
    tiles: [
      { title: "Welcome gift", body: "Free stamps or a treat the moment they join.", plan: "Every plan" },
      { title: "Gifts by hand", body: "Give one customer a reward, with a private note.", plan: "Every plan" },
      { title: "Counter flyer", body: "A printable flyer with your QR code, ready to go.", plan: "Every plan" },
      {
        title: "Their language",
        body: "Cards in English, Spanish, French or Polish, set by their phone.",
        plan: "Every plan",
      },
      { title: "Limits and expiry", body: "Cap stamps per day and put a date on rewards.", plan: "Growth and Pro" },
      { title: "Several locations", body: "Stats, links and staff for each location.", plan: "Pro" },
    ] satisfies Tile[],
  },
  finalCta: {
    title: "Make your card today.",
    accent: "today.",
  } satisfies FinalCtaCopy,
} as const;
