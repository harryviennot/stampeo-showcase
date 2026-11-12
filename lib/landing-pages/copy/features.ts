import { REWARD_BANNER, SAMPLE_BUSINESS } from "./shared";
import type { Banner, FinalCtaCopy, HeroCopy, PageMeta, SectionCopy } from "./types";

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
  messages: {
    title: "Reach them on their lock screen.",
    lead: "Every stamp and every reward sends a notification. No email list, no app.",
    /** Printed with the `SHARED.broadcastPlans` label on the same line. */
    broadcast: "Send a broadcast to every card, with no texting fees.",
    banners: [
      REWARD_BANNER,
      { sender: SAMPLE_BUSINESS, body: "Fresh cinnamon rolls just came out of the oven." },
    ] satisfies Banner[],
  } satisfies SectionCopy & { broadcast: string; banners: Banner[] },
  design: {
    title: "Looks like your shop, not like us.",
    lead: "Your logo, your colors, your stamps. Change them anytime and every card updates.",
  } satisfies SectionCopy,
  analytics: {
    title: "See who keeps coming back.",
    lead: "Visits, new customers and your return rate, updated with every scan.",
  } satisfies SectionCopy,
  finalCta: {
    title: "Make your card today.",
    accent: "today.",
  } satisfies FinalCtaCopy,
} as const;
