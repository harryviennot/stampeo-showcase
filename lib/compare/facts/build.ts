import type { SourcedFact } from "../types";

/** The page a fact was read from. */
export interface FactSource {
  sourceUrl: string;
  sourceTitle: string;
}

/** The `fact(source, id, value, quote)` builder of one reading session: every fact it builds carries the day it was read. */
export function factsReadOn(checkedAt: string) {
  return (source: FactSource, id: string, value: string, quote: string): SourcedFact => ({
    id,
    value,
    ...source,
    quote,
    checkedAt,
  });
}
