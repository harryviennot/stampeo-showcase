import type { Market as SiteMarket } from "../markets";
import { comparisonPath, comparisonsForMarket, type LoaderOptions } from "./content";
import { COMPETITOR_FACTS, findCompetitor } from "./facts";
import { COPY } from "./page/copy";
import type { Market } from "./types";

export interface FooterComparison {
  href: string;
  label: string;
}

/**
 * The comparison market a footer links to: the US footer lists the US pages,
 * the international footer in French the French ones. Every other footer
 * (international English, Spanish, Polish, UK) has no comparison written for it.
 */
function comparisonMarketOf(market: SiteMarket, locale: string): Market | null {
  if (market === "us") return "us";
  if (market === "int" && locale === "fr") return "fr";
  return null;
}

/** The label over the footer's comparison links, or null on a footer that has none. */
export function footerComparisonsTitle(market: SiteMarket, locale: string): string | null {
  const comparisonMarket = comparisonMarketOf(market, locale);
  return comparisonMarket ? COPY[comparisonMarket].footerTitle : null;
}

/** The published comparison pages a footer links to; drafts never appear. */
export function footerComparisons(market: SiteMarket, locale: string, options: LoaderOptions = {}): FooterComparison[] {
  const comparisonMarket = comparisonMarketOf(market, locale);
  if (!comparisonMarket) return [];

  const registry = options.facts ?? COMPETITOR_FACTS;
  return comparisonsForMarket(comparisonMarket, options).flatMap((page) => {
    const competitor = findCompetitor(page.competitor, registry);
    return competitor ? [{ href: comparisonPath(page), label: COPY[comparisonMarket].otherLabel(competitor.name) }] : [];
  });
}
