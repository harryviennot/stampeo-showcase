import { marketFacts } from "@/lib/compare/facts";
import { competitorText } from "@/lib/compare/page/rows";
import type { ComparisonView } from "@/lib/compare/page/view";
import { isStampeoFactId } from "@/lib/compare/stampeo";

/**
 * A fact written into a sentence: a competitor's value from its facts file
 * (`price.entry`) or a Stampeo value from the plan catalog
 * (`stampeo.price.starter`). Text only, no styling, so it reads as the
 * sentence around it.
 */
export function Fact({ id, view }: { id: string; view: Pick<ComparisonView, "page" | "competitor" | "stampeo"> }) {
  if (isStampeoFactId(id)) return <>{view.stampeo.facts[id]}</>;

  const fact = marketFacts(view.competitor, view.page.market).find((candidate) => candidate.id === id);
  if (!fact) throw new Error(`<Fact id="${id}"> has no ${view.competitor.id} fact for the ${view.page.market} market`);
  return <>{competitorText(fact.value, view.page.market)}</>;
}
