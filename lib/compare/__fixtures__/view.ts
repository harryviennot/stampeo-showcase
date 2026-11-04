import { FALLBACK_PRICING } from "../../pricing";
import { loadComparison } from "../page/load";
import type { ComparisonView } from "../page/view";
import { buildStampeoColumn } from "../stampeo";
import { FIXTURES, fixturePage } from "./index";

/** A fixture page as the route builds it: the loaded page, its competitor, and Stampeo's column priced from the baked ladder. */
export function fixtureView(slug: string): ComparisonView {
  const { market, locale } = fixturePage(slug);
  const loaded = loadComparison({ market, locale, slug }, FIXTURES);
  if (!loaded) throw new Error(`No fixture comparison "${slug}"`);
  const pricing = market === "fr" ? FALLBACK_PRICING.eur : FALLBACK_PRICING.usd;
  return { ...loaded, stampeo: buildStampeoColumn(market, pricing) };
}
