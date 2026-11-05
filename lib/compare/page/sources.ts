import type { SourcedFact } from "../types";
import { domainOf } from "./format";

export interface SourceEntry {
  url: string;
  title: string;
  domain: string;
  /** `YYYY-MM-DD`, the oldest reading of any fact taken from this page. */
  checkedAt: string;
}

/** One entry per source page, in the order the facts first cite it; a page read on several days shows the oldest. */
export function sourceEntries(facts: readonly SourcedFact[]): SourceEntry[] {
  const entries = new Map<string, SourceEntry>();
  for (const fact of facts) {
    const known = entries.get(fact.sourceUrl);
    if (!known) {
      entries.set(fact.sourceUrl, {
        url: fact.sourceUrl,
        title: fact.sourceTitle,
        domain: domainOf(fact.sourceUrl),
        checkedAt: fact.checkedAt,
      });
    } else if (fact.checkedAt < known.checkedAt) {
      known.checkedAt = fact.checkedAt;
    }
  }
  return [...entries.values()];
}
