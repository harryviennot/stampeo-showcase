import type { Metadata } from "next";
import { marketRobots, MARKETS } from "@/lib/markets";
import { SITEMAP_BASE_URL } from "@/lib/seo/sitemap";
import { comparisonPath } from "../content";
import type { ComparisonPage } from "../types";

/** The page's own address, absolute. */
export function comparisonUrl(page: Pick<ComparisonPage, "market" | "slug">): string {
  return `${SITEMAP_BASE_URL}${comparisonPath(page)}`;
}

/** Drafts stay out of search; a published US page follows the US market's flag, like /us/pricing. */
function robotsOf(page: ComparisonPage): NonNullable<Metadata["robots"]> {
  if (page.draft) return { index: false, follow: false };
  return page.market === "us" ? marketRobots("us") : { index: true, follow: true };
}

/** What `pageOpenGraph` needs to describe a comparison page. */
export function comparisonOpenGraphPage(page: ComparisonPage) {
  return {
    title: page.title,
    description: page.description,
    url: comparisonUrl(page),
    locale: page.locale,
    ogLocale: page.market === "us" ? MARKETS.us.ogLocale : undefined,
  };
}

/**
 * The head of a comparison page: its title as written (the brand is already in
 * it), a canonical that is itself, and no language alternates since the page
 * exists in one market only.
 */
export function comparisonMetadata(page: ComparisonPage, openGraph: Metadata["openGraph"]): Metadata {
  return {
    title: { absolute: page.title },
    description: page.description,
    robots: robotsOf(page),
    alternates: { canonical: comparisonUrl(page) },
    openGraph,
  };
}
