import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo/page-robots";
import { FEATURES } from "./copy/features";
import { HOW_IT_WORKS } from "./copy/how-it-works";
import { OUTCOMES } from "./copy/outcomes";
import type { FinalCtaCopy, HeroCopy, PageMeta } from "./copy/types";

/**
 * The three `/us/landing-pages/*` pages, in one place: each page's variant
 * (what `LandingTracker` reports), its sections in render order, and the copy
 * every page has (head, hero, closing headline). The sections are the ids the
 * pages tag with `data-landing-section`, and `pages.test.ts` pins that each
 * page renders exactly these, in this order.
 */

export const LANDING_SLUGS = ["how-it-works", "features", "outcomes"] as const;

export type LandingSlug = (typeof LANDING_SLUGS)[number];

export type LandingSectionId =
  | "hero"
  | "steps"
  | "demo"
  | "spotlight_messages"
  | "spotlight_design"
  | "spotlight_analytics"
  | "problem"
  | "outcome_return"
  | "outcome_slow_days"
  | "outcome_regulars"
  | "pricing"
  | "faq"
  | "final_cta";

export interface LandingPage {
  slug: LandingSlug;
  /** The landing variant: reaches PostHog, GA4 CTA events and `businesses.landing_variant`. */
  variant: string;
  sections: readonly LandingSectionId[];
  meta: PageMeta;
  hero: HeroCopy;
  finalCta: FinalCtaCopy;
}

export const LANDING_PAGES: Record<LandingSlug, LandingPage> = {
  "how-it-works": {
    slug: "how-it-works",
    variant: "lp_howto",
    sections: ["hero", "steps", "demo", "pricing", "faq", "final_cta"],
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
      "spotlight_messages",
      "spotlight_design",
      "spotlight_analytics",
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
      "outcome_return",
      "outcome_slow_days",
      "outcome_regulars",
      "pricing",
      "faq",
      "final_cta",
    ],
    meta: OUTCOMES.meta,
    hero: OUTCOMES.hero,
    finalCta: OUTCOMES.finalCta,
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
