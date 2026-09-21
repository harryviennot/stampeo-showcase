import { MARKETS, type Market } from "./markets";

/**
 * The market page a visitor probably wants, when it is not the one they are on.
 *
 * The problem this solved was a price they were never going to be charged: the
 * euro pages quoted EUR 20 while a US business is billed $49. Since STA-330 the
 * NUMBERS follow the visitor's detected region on every page (the
 * RegionPricingProvider swaps the ladder client-side), so the banner no longer
 * guards the price — what `/us` still has that `/` does not is its copy: the
 * US-specific pitch, FAQ and reassurance lines. The banner remains the offer
 * of that page, and the market keys stay the SEO story (each URL asserts one
 * currency to crawlers).
 *
 * Still a link, never a redirect. Google prefers an offer to switch over an
 * IP-based redirect, a link costs a visitor one click if the guess is wrong,
 * and it keeps every page cacheable and identical for crawler and human alike.
 *
 * Suggests only when the market's currency differs from the page's. A UK
 * visitor on `/` is on a page whose market already matches their currency, so
 * sending them to `/uk` would be churn for no benefit.
 */
export function suggestedMarket(
  detectedCountry: string | null | undefined,
  currentMarket: Market,
): Market | null {
  const country = (detectedCountry || "").trim().toUpperCase();
  if (country.length !== 2) return null;

  // Someone already on a market page has been routed, or chose it. Leave them.
  if (currentMarket !== "int") return null;

  const currentCurrency = MARKETS[currentMarket].currency.code;

  for (const market of Object.keys(MARKETS) as Market[]) {
    if (market === currentMarket) continue;
    if (marketCountry(market) !== country) continue;
    // Same currency, nothing to warn about.
    if (MARKETS[market].currency.code === currentCurrency) return null;
    return market;
  }
  return null;
}

/**
 * The country a market targets, read off its hreflang ("en-US" -> "US").
 *
 * Derived rather than stored so a market cannot declare one country in its
 * hreflang and another in a lookup table — the kind of drift that makes a page
 * rank for one region and price for another.
 */
export function marketCountry(market: Market): string | null {
  const region = MARKETS[market].hreflang.split("-")[1];
  return region ? region.toUpperCase() : null;
}
