import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { getLocalizedSlug, resolveToCanonicalSlug } from "@/lib/feature-slugs";
import { localeAlternates, localePath } from "@/lib/hreflang";
import { LOYALTY_LANGUAGES, loyaltyPath } from "@/lib/loyalty-routes";
import { MARKETS, PILOT_HREFLANG, marketRobots, type Market } from "@/lib/markets";
import { ogLocaleFor, pageOpenGraph } from "@/lib/og/metadata";
import { landingPageMetadata } from "./pages";
import { FEATURE_PREVIEWS } from "./preview-nav";

/**
 * The head of a homepage: its title and description are Platform's in the page's language and market.
 * The homepage advertises every indexable pilot in its hreflang cluster (PILOT_HREFLANG), which must be reciprocal:
 * a pilot that declares `en-US -> /us` while the homepage does not list it back is dropped by Google.
 * A pilot's `robots` follow its market, and its Open Graph block restates the site's share image
 * (`imageQuery` is the hash of the layout's) because a page-level block replaces the layout's whole.
 */
export function homepageMetadata(locale: string, market: Market, imageQuery = ""): Metadata {
  const head = landingPageMetadata("platform", locale, market);
  const { title: { absolute: title }, description } = head;

  if (market === "int") {
    return {
      ...head,
      alternates: { canonical: localePath(locale, "/"), languages: PILOT_HREFLANG },
      openGraph: { type: "website", siteName: "Stampeo", locale: ogLocaleFor(locale), title, description },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const { path, ogLocale } = MARKETS[market];
  return {
    ...head,
    robots: marketRobots(market),
    alternates: { canonical: path, languages: PILOT_HREFLANG },
    openGraph: pageOpenGraph({ title, description, url: path, locale: "en", ogLocale }, imageQuery),
  };
}

/** The head of a feature page, in whichever language's slug it was asked for; `Not Found` for a slug that is no feature's. */
export function featurePageMetadata(slug: string, locale: string): Metadata {
  const feature = resolveToCanonicalSlug(slug);
  if (!feature) return { title: "Not Found" };

  const head = landingPageMetadata(FEATURE_PREVIEWS[feature], locale, "int");
  const url = localePath(locale, `/features/${getLocalizedSlug(feature, locale)}`);
  const slugs = Object.fromEntries(routing.locales.map((l) => [l, `/features/${getLocalizedSlug(feature, l)}`]));

  return {
    ...head,
    alternates: { canonical: url, languages: localeAlternates(`/features/${feature}`, { overrides: slugs }) },
    openGraph: { title: head.title.absolute, description: head.description, url, type: "website" },
  };
}

/** The head of the loyalty programs page in a language: `keywords` are the catalog's. */
export function loyaltyPageMetadata(locale: string, keywords: string): Metadata {
  return {
    ...landingPageMetadata("platform/loyalty-programs", locale, "int"),
    keywords,
    alternates: { canonical: loyaltyPath(locale), languages: LOYALTY_LANGUAGES },
  };
}
