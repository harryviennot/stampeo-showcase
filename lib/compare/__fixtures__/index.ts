import { join } from "node:path";
import type { CompetitorFacts } from "../types";
import { ACME_FIDELITE } from "./acme-fidelite";
import { ACME_LOYALTY } from "./acme-loyalty";

export { ACME_FIDELITE, ACME_LOYALTY };

/** A second US competitor, so a market has more than one page to link between. */
export const GLOBEX_STAMPS: CompetitorFacts = { ...ACME_LOYALTY, id: "globex-stamps", name: "Globex Stamps" };

export const FIXTURE_FACTS: readonly CompetitorFacts[] = [ACME_LOYALTY, GLOBEX_STAMPS, ACME_FIDELITE];

/** The fixture content root: `en/` (US pages) and `fr/` (FR pages), one of the US pages a draft. */
export const FIXTURE_ROOT = join(import.meta.dir, "content");

/** Options that point the loader at the fixtures instead of the real content. */
export const FIXTURES = { root: FIXTURE_ROOT, facts: FIXTURE_FACTS } as const;

/** Slugs of the fixture pages, by state. */
export const FIXTURE_SLUGS = {
  us: ["acme-loyalty", "globex-stamps"],
  usDraft: ["acme-loyalty-draft"],
  fr: ["acme-fidelite"],
} as const;
