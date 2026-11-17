import type { Metadata } from "next";
import type { Market } from "@/lib/markets";
import { NOINDEX } from "@/lib/seo/page-robots";
import { FEATURES } from "./copy/features";
import { HOW_IT_WORKS } from "./copy/how-it-works";
import { OUTCOMES } from "./copy/outcomes";
import { landingCopy, type LandingCopy } from "./copy/bundle";
import type { FinalCtaCopy, HeroCopy, PageMeta } from "./copy/types";

/**
 * The ten landing pages, in one place: each page's variant (what `LandingTracker`
 * reports) and its sections in render order. The sections are the ids the pages tag
 * with `data-landing-section`, and `registry.test.ts` pins that each page renders
 * exactly these, in this order. What a page says (head, hero, closing headline) is
 * `pageWords`.
 *
 * Four are the pages ads point at; seven are previews of the feature pages and
 * the loyalty programs page in Platform's style (`platform/<page>`), noindex and
 * linked only from each other and from the menus of Platform and its previews.
 * Platform and its previews are served in every language at `/landing-pages/...`
 * and in US English at `/us/landing-pages/...`; the other three are US English only.
 */

export const LANDING_SLUGS = ["how-it-works", "features", "outcomes", "platform"] as const;

/** The six previews of `/en/features/*` (geolocation's says it is coming soon) and the one of `/en/loyalty-programs`, in Platform's style. */
export const PREVIEW_SLUGS = [
  "platform/card-design",
  "platform/mobile-scanner",
  "platform/push-notifications",
  "platform/analytics",
  "platform/promotional-campaigns",
  "platform/geolocation",
  "platform/loyalty-programs",
] as const;

export const ALL_LANDING_SLUGS = [...LANDING_SLUGS, ...PREVIEW_SLUGS] as const;

export type PreviewSlug = (typeof PREVIEW_SLUGS)[number];

export type LandingSlug = (typeof ALL_LANDING_SLUGS)[number];

export type LandingSectionId =
  | "hero"
  | "marquee"
  | "deliver"
  | "numbers"
  | "how"
  | "steps"
  | "step_create"
  | "step_share"
  | "step_stamp"
  | "demo"
  | "see_it_work"
  | "first_day"
  | "spotlight_design"
  | "program_types"
  | "spotlight_messages"
  | "spotlight_scanner"
  | "spotlight_analytics"
  | "more_features"
  | "problem"
  | "outcome_always"
  | "outcome_head_start"
  | "outcome_slow_days"
  | "outcome_levels"
  | "outcome_regulars"
  | "platform"
  | "share"
  | "sectors"
  | "pricing"
  | "faq"
  | "final_cta"
  | "blog"
  | "icons"
  | "anatomy"
  | "wallets"
  | "counter"
  | "ways"
  | "ideas"
  | "delivery"
  | "related"
  | "blind_spots"
  | "day"
  | "editor"
  | "privacy"
  | "texting"
  | "charts"
  | "customers"
  | "dashboard"
  | "types"
  | "programs"
  | "levels"
  | "move_up"
  | "moments"
  | "settings"
  | "picker"
  | "by_business";

export interface LandingPage {
  slug: LandingSlug;
  /** The landing variant: reaches PostHog, GA4 CTA events and `businesses.landing_variant`. */
  variant: string;
  sections: readonly LandingSectionId[];
  /** The three sibling previews a preview closes with. */
  related?: readonly PreviewSlug[];
}

export const LANDING_PAGES: Record<LandingSlug, LandingPage> = {
  "how-it-works": {
    slug: "how-it-works",
    variant: "lp_howto",
    sections: [
      "hero",
      "steps",
      "step_create",
      "step_share",
      "step_stamp",
      "demo",
      "see_it_work",
      "sectors",
      "first_day",
      "pricing",
      "faq",
      "final_cta",
    ],
  },
  features: {
    slug: "features",
    variant: "lp_features",
    sections: [
      "hero",
      "demo",
      "spotlight_design",
      "program_types",
      "spotlight_messages",
      "spotlight_scanner",
      "spotlight_analytics",
      "more_features",
      "sectors",
      "pricing",
      "faq",
      "final_cta",
    ],
  },
  outcomes: {
    slug: "outcomes",
    variant: "lp_outcomes",
    sections: [
      "hero",
      "problem",
      "outcome_always",
      "outcome_head_start",
      "outcome_slow_days",
      "outcome_levels",
      "outcome_regulars",
      "sectors",
      "pricing",
      "faq",
      "final_cta",
    ],
  },
  platform: {
    slug: "platform",
    variant: "lp_platform",
    sections: [
      "hero",
      "marquee",
      "deliver",
      "numbers",
      "how",
      "demo",
      "program_types",
      "platform",
      "share",
      "pricing",
      "final_cta",
      "sectors",
      "blog",
    ],
  },
  "platform/card-design": {
    slug: "platform/card-design",
    variant: "lp_platform_card_design",
    sections: ["hero", "anatomy", "types", "icons", "wallets", "faq", "final_cta", "related"],
    related: ["platform/mobile-scanner", "platform/push-notifications", "platform/analytics"],
  },
  "platform/mobile-scanner": {
    slug: "platform/mobile-scanner",
    variant: "lp_platform_mobile_scanner",
    sections: ["hero", "counter", "ways", "final_cta", "related"],
    related: ["platform/card-design", "platform/push-notifications", "platform/analytics"],
  },
  "platform/push-notifications": {
    slug: "platform/push-notifications",
    variant: "lp_platform_push_notifications",
    sections: ["hero", "day", "wallets", "editor", "demo", "final_cta", "related"],
    related: ["platform/promotional-campaigns", "platform/mobile-scanner", "platform/analytics"],
  },
  "platform/analytics": {
    slug: "platform/analytics",
    variant: "lp_platform_analytics",
    sections: ["hero", "blind_spots", "charts", "customers", "dashboard", "final_cta", "related"],
    related: ["platform/promotional-campaigns", "platform/push-notifications", "platform/card-design"],
  },
  "platform/promotional-campaigns": {
    slug: "platform/promotional-campaigns",
    variant: "lp_platform_promotional_campaigns",
    sections: ["hero", "how", "texting", "ideas", "delivery", "faq", "final_cta", "related"],
    related: ["platform/push-notifications", "platform/analytics", "platform/card-design"],
  },
  "platform/geolocation": {
    slug: "platform/geolocation",
    variant: "lp_platform_geolocation",
    sections: ["hero", "how", "privacy", "faq", "final_cta", "related"],
    related: ["platform/push-notifications", "platform/promotional-campaigns", "platform/analytics"],
  },
  "platform/loyalty-programs": {
    slug: "platform/loyalty-programs",
    variant: "lp_platform_loyalty_programs",
    sections: [
      "hero",
      "programs",
      "levels",
      "move_up",
      "moments",
      "settings",
      "picker",
      "by_business",
      "faq",
      "final_cta",
      "related",
    ],
    related: ["platform/card-design", "platform/push-notifications", "platform/mobile-scanner"],
  },
};

/** Does the page have a live demo to link to from its hero? */
export function hasDemoSection(slug: LandingSlug): boolean {
  return LANDING_PAGES[slug].sections.includes("demo");
}

/** What a page says in its head, its hero and its closing ask. Platform's hero is a headline alone, so its `sub` is optional. */
export interface PageWords {
  meta: PageMeta;
  hero: Omit<HeroCopy, "sub"> & { sub?: string };
  finalCta: FinalCtaCopy & { sub?: string };
}

/** The pages written in US English only: their words are the English modules'. */
const US_ONLY_WORDS: Partial<Record<LandingSlug, PageWords>> = {
  "how-it-works": { meta: HOW_IT_WORKS.meta, hero: HOW_IT_WORKS.hero, finalCta: HOW_IT_WORKS.finalCta },
  features: { meta: FEATURES.meta, hero: FEATURES.hero, finalCta: FEATURES.finalCta },
  outcomes: { meta: OUTCOMES.meta, hero: OUTCOMES.hero, finalCta: OUTCOMES.finalCta },
};

/** What Platform and each preview say, read from a language's copy bundle. */
const BUNDLE_WORDS: Record<Exclude<LandingSlug, "how-it-works" | "features" | "outcomes">, (copy: LandingCopy) => PageWords> = {
  platform: ({ platform }) => ({
    meta: platform.PLATFORM.meta,
    hero: platform.PLATFORM.hero,
    finalCta: platform.PLATFORM.band,
  }),
  "platform/card-design": ({ previews }) => pageOf(previews.cardDesign.CARD_DESIGN_PREVIEW),
  "platform/mobile-scanner": ({ previews }) => pageOf(previews.mobileScanner.MOBILE_SCANNER_PREVIEW),
  "platform/push-notifications": ({ previews }) => pageOf(previews.pushNotifications.PUSH_NOTIFICATIONS_PREVIEW),
  "platform/analytics": ({ previews }) => pageOf(previews.analytics.ANALYTICS_PREVIEW),
  "platform/promotional-campaigns": ({ previews }) => pageOf(previews.promotionalCampaigns.PROMOTIONAL_CAMPAIGNS_PREVIEW),
  "platform/geolocation": ({ previews }) => pageOf(previews.geolocation.GEOLOCATION_PREVIEW),
  "platform/loyalty-programs": ({ previews }) => pageOf(previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW),
};

/** A preview's copy as the words of its page: its head, its hero and its closing band. */
const pageOf = (preview: Pick<PageWords, "meta" | "hero"> & { band: PageWords["finalCta"] }): PageWords => ({
  meta: preview.meta,
  hero: preview.hero,
  finalCta: preview.band,
});

/**
 * What a page says, in a language and a market: the one place a page's words are resolved. The three US-only pages
 * read their English modules whatever the locale; Platform and its previews read the copy bundle.
 */
export function pageWords(slug: LandingSlug, locale: string, market: Market): PageWords {
  const usOnly = US_ONLY_WORDS[slug];
  if (usOnly) return usOnly;
  return BUNDLE_WORDS[slug as keyof typeof BUNDLE_WORDS](landingCopy(locale, market));
}

/**
 * The head of a landing page: its title as written (the brand is already in
 * it) and `noindex, nofollow`. The pages are ad destinations, reachable by URL
 * only.
 */
export function landingPageMetadata(slug: LandingSlug, locale: string, market: Market): Metadata {
  const { meta } = pageWords(slug, locale, market);
  return { title: { absolute: meta.title }, description: meta.description, robots: NOINDEX };
}
