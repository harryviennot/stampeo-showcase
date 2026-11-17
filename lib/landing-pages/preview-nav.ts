import { getLocalizedSlug, type FeatureSlug } from "@/lib/feature-slugs";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import type { Market } from "@/lib/markets";
import type { PreviewSlug } from "./pages";

/** The page of each feature: the registry slug of its Platform-style page. */
export const FEATURE_PREVIEWS: Record<FeatureSlug, PreviewSlug> = {
  "notifications-push": "platform/push-notifications",
  "campagnes-promotionnelles": "platform/promotional-campaigns",
  "scanner-mobile": "platform/mobile-scanner",
  analytiques: "platform/analytics",
  "design-de-carte": "platform/card-design",
  geolocalisation: "platform/geolocation",
};

/** Geolocation is the one feature that is not live yet: every menu prints "Soon" beside it. */
export const isComingSoon = (slug: FeatureSlug): boolean => slug === "geolocalisation";

/**
 * A feature page's link, as every page leaves it: the localised path, for next-intl to prefix with the locale.
 * The feature pages exist for the international site only, so the link is `int` even from a pilot's page.
 */
export function featureLink(slug: FeatureSlug, locale: string): { href: string; market: Market } {
  return { href: `/features/${getLocalizedSlug(slug, locale)}`, market: "int" };
}

/** The loyalty programs page's link: its own slug in the visitor's language. */
export function loyaltyLink(locale: string): { href: string; market: Market } {
  return { href: LOYALTY_SLUGS[locale as keyof typeof LOYALTY_SLUGS] ?? LOYALTY_SLUGS.fr, market: "int" };
}

/** The link to a page of the registry that has its own URL: one of the six features, or the loyalty programs page. */
export function previewLink(preview: PreviewSlug, locale: string): { href: string; market: Market } {
  if (preview === "platform/loyalty-programs") return loyaltyLink(locale);

  const feature = (Object.keys(FEATURE_PREVIEWS) as FeatureSlug[]).find((slug) => FEATURE_PREVIEWS[slug] === preview);
  if (!feature) throw new Error(`No page at ${preview}`);
  return featureLink(feature, locale);
}
