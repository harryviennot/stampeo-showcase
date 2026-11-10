import { join } from "node:path";
import { allComparisonPages } from "../content";
import type { CompetitorFacts, ComparisonPage, SourcedFact } from "../types";
import { ACME_FIDELITE } from "./acme-fidelite";
import { ACME_LOYALTY } from "./acme-loyalty";
import { BRAVO_CARTE } from "./bravo-carte";
import { GLOBEX_STAMPS } from "./globex-stamps";

export { ACME_FIDELITE, ACME_LOYALTY, BRAVO_CARTE, GLOBEX_STAMPS };

export const FIXTURE_FACTS: readonly CompetitorFacts[] = [ACME_LOYALTY, GLOBEX_STAMPS, ACME_FIDELITE, BRAVO_CARTE];

/** The fixture content root: `en/` (US pages) and `fr/` (FR pages), each market with a draft. */
export const FIXTURE_ROOT = join(import.meta.dir, "content");

/** Options that point the loader at the fixtures instead of the real content. */
export const FIXTURES = { root: FIXTURE_ROOT, facts: FIXTURE_FACTS } as const;

/** Slugs of the fixture pages, by state. */
export const FIXTURE_SLUGS = {
  us: ["acme-loyalty", "globex-stamps"],
  usDraft: ["acme-loyalty-draft"],
  fr: ["acme-fidelite", "bravo-carte"],
  frDraft: ["acme-fidelite-brouillon"],
} as const;

/** A fixture page by slug, drafts included. */
export function fixturePage(slug: string): ComparisonPage {
  const page = allComparisonPages(FIXTURES).find((candidate) => candidate.slug === slug);
  if (!page) throw new Error(`No fixture comparison "${slug}"`);
  return page;
}

/** The competitor with its US facts replaced by `transform(its US facts)`. */
export function withUsFacts(
  competitor: CompetitorFacts,
  transform: (facts: SourcedFact[]) => SourcedFact[],
): CompetitorFacts {
  const us = competitor.markets.us!;
  return { ...competitor, markets: { ...competitor.markets, us: { ...us, facts: transform(us.facts) } } };
}
