import { checkedDate } from "../checked";
import { allComparisonPages, comparisonPath, comparisonsForMarket, type LoaderOptions } from "../content";
import { COMPETITOR_FACTS, findCompetitor } from "../facts";
import type { Market } from "../types";
import { COPY } from "./copy";
import type { ComparisonView, LoadedComparison } from "./view";

/** The slugs a market prerenders. Drafts are included: they open by their URL, noindexed. */
export function comparisonSlugs(market: Market, options: LoaderOptions = {}): string[] {
  return allComparisonPages(options)
    .filter((page) => page.market === market)
    .map((page) => page.slug);
}

/**
 * The page behind a URL, or null for a 404: an unknown slug, another market's
 * page, or a language the page is not written in (a US page is English only,
 * a French one French only).
 */
export function loadComparison(
  request: { market: Market; locale: string; slug: string },
  options: LoaderOptions = {},
): LoadedComparison | null {
  const page = allComparisonPages(options).find(
    (candidate) => candidate.market === request.market && candidate.slug === request.slug,
  );
  if (!page || page.locale !== request.locale) return null;

  const competitor = findCompetitor(page.competitor, options.facts ?? COMPETITOR_FACTS);
  if (!competitor) return null;
  return { page, competitor, checkedAt: checkedDate(page, competitor) };
}

export interface OtherComparison {
  href: string;
  label: string;
}

/** The other published pages of the page's market, ready to link; a draft is never one of them. */
export function otherComparisons(view: Pick<ComparisonView, "page">, options: LoaderOptions = {}): OtherComparison[] {
  const { market, slug } = view.page;
  const registry = options.facts ?? COMPETITOR_FACTS;

  return comparisonsForMarket(market, { ...options, excludeSlug: slug }).flatMap((other) => {
    const competitor = findCompetitor(other.competitor, registry);
    return competitor ? [{ href: comparisonPath(other), label: COPY[market].otherLabel(competitor.name) }] : [];
  });
}
