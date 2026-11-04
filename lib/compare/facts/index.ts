import type { CompetitorFacts, Market, SourcedFact } from "../types";
import { FR_COMPETITORS } from "./fr";
import { US_COMPETITORS } from "./us";

/**
 * Every competitor with a comparison page, one file per competitor
 * (`facts/<id>.ts`), listed per market in `us.ts` and `fr.ts`.
 * `facts/validate.test.ts` checks them all.
 */
export const COMPETITOR_FACTS: readonly CompetitorFacts[] = [...US_COMPETITORS, ...FR_COMPETITORS];

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
