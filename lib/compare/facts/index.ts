import type { CompetitorFacts, Market, SourcedFact } from "../types";

/**
 * Every competitor with a comparison page, one file per competitor
 * (`facts/<id>.ts`). `facts/validate.test.ts` checks them all.
 */
export const COMPETITOR_FACTS: readonly CompetitorFacts[] = [];

export function findCompetitor(
  id: string,
  registry: readonly CompetitorFacts[] = COMPETITOR_FACTS,
): CompetitorFacts | undefined {
  return registry.find((competitor) => competitor.id === id);
}

/** The competitor's facts for one market, empty when it has none there. */
export function marketFacts(competitor: CompetitorFacts, market: Market): SourcedFact[] {
  return competitor.markets[market]?.facts ?? [];
}
