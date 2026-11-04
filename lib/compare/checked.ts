import { factIdsIn } from "./body-checks";
import { marketFacts } from "./facts";
import { STANDARD_FACT_IDS, type CompetitorFacts, type ComparisonPage, type SourcedFact } from "./types";

const STANDARD_IDS: readonly string[] = STANDARD_FACT_IDS;

/**
 * The competitor facts a page shows: every standard row the competitor has in
 * the page's market, plus every `<Fact>` its prose cites. Stampeo's own facts
 * carry no date and never count. The checked date and the sources list both
 * read this set, so they cannot disagree.
 */
export function usedFacts(page: Pick<ComparisonPage, "market" | "content">, competitor: CompetitorFacts): SourcedFact[] {
  const cited = new Set(factIdsIn(page.content).flatMap((use) => (use.id ? [use.id] : [])));
  return marketFacts(competitor, page.market).filter((fact) => STANDARD_IDS.includes(fact.id) || cited.has(fact.id));
}

/**
 * The "Checked" date of a page: the oldest `checkedAt` among the facts it
 * shows. Re-reading one fact does not freshen the page.
 */
export function checkedDate(page: Pick<ComparisonPage, "market" | "content">, competitor: CompetitorFacts): string {
  const used = usedFacts(page, competitor);

  if (used.length === 0) {
    throw new Error(`No competitor fact on the ${competitor.id} ${page.market} page, so it has no checked date`);
  }
  return used.reduce((oldest, fact) => (fact.checkedAt < oldest ? fact.checkedAt : oldest), used[0].checkedAt);
}
