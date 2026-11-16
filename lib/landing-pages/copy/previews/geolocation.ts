import { SAMPLE_BUSINESS } from "../shared";
import type { Banner, BandCopy, EyebrowSection, FaqItem, Fact, HeroCopy, PageMeta, Tile } from "../types";

/** The notification the hero's phone shows: the one line an owner will write for a shop, under a title of its own. */
interface NearbyBanner extends Banner {
  title: string;
}

/**
 * The geolocation preview. Geolocation is not live: every claim about it is in the future tense or sits under a
 * "coming soon" label, with no date, no plan and no wallet named.
 */
export const GEOLOCATION_PREVIEW = {
  meta: {
    title: "Geolocation notifications, coming soon | Stampeo",
    description:
      "Coming soon: location-based notifications that will put your loyalty card on a customer's lock screen when they walk near your shop.",
  } satisfies PageMeta,
  hero: {
    h1: "Geolocation notifications, coming soon.",
    accent: "coming soon.",
    sub: "When a customer walks near your shop, your loyalty card will appear on their lock screen.",
    /** The second action, to the steps. */
    secondary: "See how it will work",
    /** What the hero's picture shows, for a screen reader. */
    alt: "A lock screen with Aurevo's loyalty card and the line: Aurevo is around the corner. Your 6th coffee is waiting. 2 stamps to a free one.",
  } satisfies HeroCopy & { secondary: string; alt: string },
  /** The small label under the hero's phone on a phone. */
  heroChip: "Coming soon",
  /** The handwritten note beside the hero's phone from `lg`. */
  heroNote: "coming soon",
  /** The hero phone's lock screen: Aurevo's own words, never Stampeo's. */
  banner: {
    sender: SAMPLE_BUSINESS,
    title: "Aurevo is around the corner",
    body: "Your 6th coffee is waiting. 2 stamps to a free one.",
  } satisfies NearbyBanner,
  how: {
    eyebrow: "How it will work",
    title: "How geolocation notifications will work.",
    lead: "You'll add your address once. Their phone will do the rest, with no app.",
    cells: [
      { title: "Add your shop's address", body: "You'll type it once in your dashboard." },
      { title: "A customer walks nearby", body: "Their phone will notice they're close to your shop." },
      { title: "Their card appears on their lock screen", body: "One tap will open it, ready to scan at the counter." },
    ] satisfies Tile[],
  } satisfies EyebrowSection & { cells: Tile[] },
  privacy: {
    eyebrow: "Privacy",
    title: "Their location will stay on their phone.",
    lead: "The card will carry your shop's address. We will never see where they are.",
    facts: [
      { text: "Their phone will check the distance itself" },
      { text: "We will never receive their location" },
      { text: "They will be able to turn it off in their phone's settings" },
    ] satisfies Fact[],
    /** What the drawing shows, for a screen reader. */
    alt: "A phone inside a dashed ring around a shop. A line to the cloud is cut: no location will leave the phone.",
  },
  faq: {
    title: "Questions about geolocation",
    items: [
      {
        question: "When will it launch?",
        answer: "We don't have a date yet. When it's ready, we'll announce it on our What's new page.",
      },
      {
        question: "Will my customers need a new card?",
        answer: "No. The card already in their wallet will pick it up with its next update.",
      },
      {
        question: "Will my customers have to set anything up?",
        answer: "No. There will be no app to install. Their phone will handle it, and they will be able to turn it off in their settings.",
      },
      {
        question: "Can I start before it launches?",
        answer: "Yes. Your card, stamps, rewards and notifications work today, and geolocation will join them when it's ready.",
      },
    ] satisfies FaqItem[],
  },
  band: {
    title: "Get your card ready today.",
    accent: "ready today.",
    sub: "Start with stamps or points now. Your card will be ready when geolocation launches.",
  } satisfies BandCopy,
  /** The links under the page lead to the ways to bring customers back that are live today. */
  related: {
    title: "Ways to bring customers back today.",
  },
} as const;
