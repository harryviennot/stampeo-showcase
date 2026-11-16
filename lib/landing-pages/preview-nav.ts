import { getLocalizedSlug, type FeatureSlug } from "@/lib/feature-slugs";
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

/**
 * A feature link: a preview is a final `/us` path; today's page is localised and left for next-intl to
 * prefix. A feature with no preview opens today's page.
 */
export function featureLink(
  slug: FeatureSlug,
  locale: string,
  links: FeatureLinks,
): { href: string; market: Market } {
  const preview = links === "previews" ? FEATURE_PREVIEWS[slug] : undefined;
  if (preview) return { href: marketPath("us", `/landing-pages/${preview}`), market: "us" };
  return { href: `/features/${getLocalizedSlug(slug, locale)}`, market: "int" };
}
