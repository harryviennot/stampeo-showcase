import { MARKETS, type Market as SiteMarket } from "../../markets";
import type { Market } from "../types";

/** The site market whose header, footer, currency and trial length a comparison market uses. */
const SITE_MARKET: Record<Market, SiteMarket> = { us: "us", fr: "int" };

/** The site market a comparison page wears, and the lower-case currency its prices are read in. */
export function pageSetup(market: Market): { siteMarket: SiteMarket; currency: string } {
  const siteMarket = SITE_MARKET[market];
  return { siteMarket, currency: MARKETS[siteMarket].currency.code.toLowerCase() };
}
