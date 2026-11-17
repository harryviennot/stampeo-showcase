import { getLocalizedSlug, type FeatureSlug } from "@/lib/feature-slugs";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { marketPath, type Market } from "@/lib/markets";
import type { LandingSlug, PreviewSlug } from "./pages";

/** Where the header and footer feature links lead: today's feature pages, or their Platform-style previews. */
export type FeatureLinks = "live" | "previews";

/** Each feature page that has a Platform-style preview, by its canonical slug. */
export const FEATURE_PREVIEWS: Partial<Record<FeatureSlug, PreviewSlug>> = {
  "notifications-push": "platform/push-notifications",
  "campagnes-promotionnelles": "platform/promotional-campaigns",
  "scanner-mobile": "platform/mobile-scanner",
  analytiques: "platform/analytics",
  "design-de-carte": "platform/card-design",
  geolocalisation: "platform/geolocation",
};

/** Platform and its previews lead to the previews; every other page to today's feature pages. */
export function featureLinksFor(slug: LandingSlug): FeatureLinks {
  return slug === "platform" || slug.startsWith("platform/") ? "previews" : "live";
}

/** Geolocation is the one feature that is not live yet. */
export const isComingSoon = (slug: FeatureSlug): boolean => slug === "geolocalisation";

/** The menus that lead to the previews (Platform's) label the feature that is not live yet "Soon"; today's menus do not. */
export const showsSoon = (slug: FeatureSlug, links: FeatureLinks): boolean => links === "previews" && isComingSoon(slug);

/**
 * The link to a preview, as a page of `market` leaves it: `/us/landing-pages/<preview>` is final on the US site,
 * and `/landing-pages/<preview>` on the international one is left for next-intl to prefix with the locale
 * (the preview slugs stay English in every language).
 */
export function previewLink(preview: PreviewSlug | "platform", market: Market): { href: string; market: Market } {
  return { href: marketPath(market, `/landing-pages/${preview}`), market };
}

/**
 * A feature link: from a page of `market`, a preview stays inside that market; today's page is localised and left
 * for next-intl to prefix. A feature with no preview opens today's page.
 */
export function featureLink(
  slug: FeatureSlug,
  locale: string,
  links: FeatureLinks,
  market: Market,
): { href: string; market: Market } {
  const preview = links === "previews" ? FEATURE_PREVIEWS[slug] : undefined;
  if (preview) return previewLink(preview, market);
  return { href: `/features/${getLocalizedSlug(slug, locale)}`, market: "int" };
}

/** The loyalty programs link: its Platform-style preview from Platform and its previews, today's localised page elsewhere. */
export function loyaltyLink(locale: string, links: FeatureLinks, market: Market): { href: string; market: Market } {
  if (links === "previews") return previewLink("platform/loyalty-programs", market);
  return { href: LOYALTY_SLUGS[locale as keyof typeof LOYALTY_SLUGS] ?? LOYALTY_SLUGS.fr, market: "int" };
}
