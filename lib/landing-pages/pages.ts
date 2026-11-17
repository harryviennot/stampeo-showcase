import type { Market } from "@/lib/markets";
import { landingCopy, type LandingCopy } from "./copy/bundle";
import type { FinalCtaCopy, HeroCopy, PageMeta } from "./copy/types";

/**
 * The live pages built in Platform's style, in one place: each page's variant (what `LandingTracker`
 * reports) and its sections in render order. The sections are the ids the pages tag
 * with `data-landing-section`, and `registry.test.ts` pins that each page renders
 * exactly these, in this order. What a page says (head, hero, closing headline) is
 * `pageWords`.
 *
 * `platform` is the homepage: `/`, `/en`, `/es`, `/pl`, `/us` and `/uk`. The seven others (`platform/<page>`) are
 * the six feature pages (geolocation's says it is coming soon) and the loyalty programs page, each at its
 * localised URL on the international site.
 */

export const LANDING_SLUGS = ["platform"] as const;

/** The six feature pages and the loyalty programs page. */
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
  | "demo"
  | "program_types"
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

/** What a page says in its head, its hero and its closing ask. Platform's hero is a headline alone, so its `sub` is optional. */
export interface PageWords {
  meta: PageMeta;
  hero: Omit<HeroCopy, "sub"> & { sub?: string };
  finalCta: FinalCtaCopy & { sub?: string };
}

/** What Platform and each preview say, read from a language's copy bundle. */
const BUNDLE_WORDS: Record<LandingSlug, (copy: LandingCopy) => PageWords> = {
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

/** What a page says, in a language and a market: the one place a page's words are resolved. */
export function pageWords(slug: LandingSlug, locale: string, market: Market): PageWords {
  return BUNDLE_WORDS[slug](landingCopy(locale, market));
}

/** The head of a page: its title as written (the brand is already in it) and its description. */
export function landingPageMetadata(slug: LandingSlug, locale: string, market: Market): { title: { absolute: string }; description: string } {
  const { meta } = pageWords(slug, locale, market);

  return { title: { absolute: meta.title }, description: meta.description };
}
