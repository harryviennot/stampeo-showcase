import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo/page-robots";
import { FEATURES } from "./copy/features";
import { HOW_IT_WORKS } from "./copy/how-it-works";
import { OUTCOMES } from "./copy/outcomes";
import { PLATFORM } from "./copy/platform";
import { ANALYTICS_PREVIEW } from "./copy/previews/analytics";
import { CARD_DESIGN_PREVIEW } from "./copy/previews/card-design";
import { GEOLOCATION_PREVIEW } from "./copy/previews/geolocation";
import { MOBILE_SCANNER_PREVIEW } from "./copy/previews/mobile-scanner";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "./copy/previews/promotional-campaigns";
import { PUSH_NOTIFICATIONS_PREVIEW } from "./copy/previews/push-notifications";
import type { FinalCtaCopy, HeroCopy, PageMeta } from "./copy/types";

/**
 * The ten `/us/landing-pages/*` pages, in one place: each page's variant
 * (what `LandingTracker` reports), its sections in render order, and the copy
 * every page has (head, hero, closing headline). The sections are the ids the
 * pages tag with `data-landing-section`, and `registry.test.ts` pins that each
 * page renders exactly these, in this order.
 *
 * Four are the pages ads point at; six are previews of the feature pages in
 * Platform's style (`platform/<feature>`), English, noindex and linked only
 * from each other and from the menus of Platform and its previews.
 */

export const LANDING_SLUGS = ["how-it-works", "features", "outcomes", "platform"] as const;

/** The six previews of `/en/features/*`, in Platform's style (geolocation's says it is coming soon). */
export const PREVIEW_SLUGS = [
  "platform/card-design",
  "platform/mobile-scanner",
  "platform/push-notifications",
  "platform/analytics",
  "platform/promotional-campaigns",
  "platform/geolocation",
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
  | "playground"
  | "anatomy"
  | "stamps"
  | "wallets"
  | "counter"
  | "ways"
  | "team"
  | "glance"
  | "activity"
  | "ideas"
  | "delivery"
  | "related"
  | "palettes"
  | "blind_spots"
  | "recap"
  | "composer"
  | "day"
  | "editor"
  | "status"
  | "privacy"
  | "texting"
  | "charts"
  | "customers"
  | "dashboard"
  | "types";

export interface LandingPage {
  slug: LandingSlug;
  /** The landing variant: reaches PostHog, GA4 CTA events and `businesses.landing_variant`. */
  variant: string;
  sections: readonly LandingSectionId[];
  meta: PageMeta;
  /** Platform's hero is a headline alone, so its `sub` is optional. */
  hero: Omit<HeroCopy, "sub"> & { sub?: string };
  finalCta: FinalCtaCopy & { sub?: string };
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
    meta: HOW_IT_WORKS.meta,
    hero: HOW_IT_WORKS.hero,
    finalCta: HOW_IT_WORKS.finalCta,
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
    meta: FEATURES.meta,
    hero: FEATURES.hero,
    finalCta: FEATURES.finalCta,
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
    meta: OUTCOMES.meta,
    hero: OUTCOMES.hero,
    finalCta: OUTCOMES.finalCta,
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
    meta: PLATFORM.meta,
    hero: PLATFORM.hero,
    finalCta: PLATFORM.band,
  },
  "platform/card-design": {
    slug: "platform/card-design",
    variant: "lp_platform_card_design",
    sections: ["hero", "icons", "playground", "palettes", "anatomy", "stamps", "wallets", "faq", "final_cta", "related"],
    meta: CARD_DESIGN_PREVIEW.meta,
    hero: CARD_DESIGN_PREVIEW.hero,
    finalCta: CARD_DESIGN_PREVIEW.band,
    related: ["platform/mobile-scanner", "platform/push-notifications", "platform/analytics"],
  },
  "platform/mobile-scanner": {
    slug: "platform/mobile-scanner",
    variant: "lp_platform_mobile_scanner",
    sections: ["hero", "counter", "ways", "team", "demo", "final_cta", "related"],
    meta: MOBILE_SCANNER_PREVIEW.meta,
    hero: MOBILE_SCANNER_PREVIEW.hero,
    finalCta: MOBILE_SCANNER_PREVIEW.band,
    related: ["platform/card-design", "platform/push-notifications", "platform/analytics"],
  },
  "platform/push-notifications": {
    slug: "platform/push-notifications",
    variant: "lp_platform_push_notifications",
    sections: ["hero", "day", "wallets", "editor", "demo", "final_cta", "related"],
    meta: PUSH_NOTIFICATIONS_PREVIEW.meta,
    hero: PUSH_NOTIFICATIONS_PREVIEW.hero,
    finalCta: PUSH_NOTIFICATIONS_PREVIEW.band,
    related: ["platform/promotional-campaigns", "platform/mobile-scanner", "platform/analytics"],
  },
  "platform/analytics": {
    slug: "platform/analytics",
    variant: "lp_platform_analytics",
    sections: ["hero", "blind_spots", "charts", "customers", "dashboard", "final_cta", "related"],
    meta: ANALYTICS_PREVIEW.meta,
    hero: ANALYTICS_PREVIEW.hero,
    finalCta: ANALYTICS_PREVIEW.band,
    related: ["platform/promotional-campaigns", "platform/push-notifications", "platform/card-design"],
  },
  "platform/promotional-campaigns": {
    slug: "platform/promotional-campaigns",
    variant: "lp_platform_promotional_campaigns",
    sections: ["hero", "composer", "numbers", "ideas", "delivery", "faq", "final_cta", "related"],
    meta: PROMOTIONAL_CAMPAIGNS_PREVIEW.meta,
    hero: PROMOTIONAL_CAMPAIGNS_PREVIEW.hero,
    finalCta: PROMOTIONAL_CAMPAIGNS_PREVIEW.band,
    related: ["platform/push-notifications", "platform/analytics", "platform/card-design"],
  },
  "platform/geolocation": {
    slug: "platform/geolocation",
    variant: "lp_platform_geolocation",
    sections: ["hero", "status", "how", "privacy", "faq", "final_cta", "related"],
    meta: GEOLOCATION_PREVIEW.meta,
    hero: GEOLOCATION_PREVIEW.hero,
    finalCta: GEOLOCATION_PREVIEW.band,
    related: ["platform/push-notifications", "platform/promotional-campaigns", "platform/analytics"],
  },
};

/** Does the page have a live demo to link to from its hero? */
export function hasDemoSection(slug: LandingSlug): boolean {
  return LANDING_PAGES[slug].sections.includes("demo");
}

/**
 * The head of a landing page: its title as written (the brand is already in
 * it) and `noindex, nofollow`. The pages are ad destinations, reachable by URL
 * only.
 */
export function landingPageMetadata(slug: LandingSlug): Metadata {
  const { meta } = LANDING_PAGES[slug];
  return { title: { absolute: meta.title }, description: meta.description, robots: NOINDEX };
}
