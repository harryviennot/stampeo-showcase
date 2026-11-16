import { SAMPLE_BUSINESS } from "../shared";
import type { Banner, BandCopy, EyebrowSection, FaqItem, Fact, HeroCopy, PageMeta, Tile } from "../types";

/** The notification the hero's phone shows: the one line an owner will write for a shop, under a title of its own. */
interface NearbyBanner extends Banner {
  title: string;
}

interface StatusColumn {
  title: string;
  facts: Fact[];
}

/**
 * The geolocation preview. Geolocation is not live: every claim about it is in the future tense or sits under a
 * "coming soon" label, with no date. What is live today is said as live, apart from it.
 */
export const GEOLOCATION_PREVIEW = {
  meta: {
    title: "Geolocation for loyalty cards, coming soon | Stampeo",
    description:
      "Coming soon: your loyalty card will show on a customer's lock screen near your shop. Start your card today.",
  } satisfies PageMeta,
  hero: {
    h1: "Soon, your card will appear when they walk by.",
    accent: "when they walk by.",
    sub: "Coming soon. Make your card now and it's ready the day it launches.",
  } satisfies HeroCopy,
  heroNote: "coming soon",
  /** The hero phone's lock screen: Aurevo's own words, never Stampeo's. */
  banner: {
    sender: SAMPLE_BUSINESS,
    title: "Aurevo is around the corner",
    body: "Your 6th coffee is waiting. 2 stamps to a free one.",
  } satisfies NearbyBanner,
  status: {
    eyebrow: "Where it stands",
    title: "Live today, and what's next.",
    lead: "What your card does today, and what geolocation will add.",
    today: {
      title: "Today",
      facts: [
        { text: "Your card in Apple Wallet and Google Wallet" },
        { text: "A notification on every stamp and reward" },
        { text: "Broadcasts to every card" },
      ],
    } satisfies StatusColumn,
    soon: {
      title: "Coming soon",
      facts: [
        { text: "Your card on their lock screen near your shop" },
        { text: "Built from your shop's address" },
        { text: "Nothing for your customers to set up" },
      ],
    } satisfies StatusColumn,
  },
  how: {
    eyebrow: "How it will work",
    title: "Your address will do the work.",
    lead: "You'll add your shop once. Their phone will do the rest.",
    cells: [
      { title: "Add your shop", body: "Your address, from your dashboard." },
      { title: "On their card", body: "Your address will travel inside their card." },
      { title: "They walk by", body: "Their phone will show your card, on its own." },
    ] satisfies Tile[],
  } satisfies EyebrowSection & { cells: Tile[] },
  privacy: {
    eyebrow: "Privacy",
    title: "Their location will stay on their phone.",
    lead: "The card will carry your shop's address, never their whereabouts.",
    facts: [
      { text: "Their phone will check the distance itself" },
      { text: "We will never receive their location" },
      { text: "They will be able to switch it off in their phone's settings" },
    ] satisfies Fact[],
    /** What the drawing shows, for a screen reader. */
    alt: "A phone inside a dashed ring around a shop. A line to the cloud is cut: no location will leave the phone.",
  },
  faq: {
    title: "Questions about geolocation",
    items: [
      {
        question: "When does it launch?",
        answer: "We don't have a date yet. When it's ready, we'll announce it on our What's new page.",
      },
      {
        question: "What can I do today?",
        answer: "Make your card now, with stamps or points. Geolocation will be ready for it when it launches.",
      },
      {
        question: "Will my customers need a new card?",
        answer: "No. The card already in their wallet will pick it up with its next update.",
      },
    ] satisfies FaqItem[],
  },
  band: {
    title: "Get your card ready today.",
    accent: "ready today.",
    sub: "Start with stamps or points now. Geolocation will join your card when it launches.",
  } satisfies BandCopy,
  /** The links under the page lead to the ways to bring customers back that are live today. */
  related: {
    title: "Bring them back today.",
  },
} as const;
