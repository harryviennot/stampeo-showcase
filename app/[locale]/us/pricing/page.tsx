import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketPricingPage } from "@/components/pricing/MarketPricingPage";
import { MARKETS, marketRobots, type Market } from "@/lib/markets";

/**
 * Pricing for the US pilot (served at /us/pricing via the middleware
 * rewrite, and directly at /en/us/pricing).
 *
 * Exists so a visitor on /us cannot navigate out of their own currency: the
 * shared nav used to point at /pricing, which quotes the international ladder.
 * Its robots directive is DERIVED from the market, not written here. This file
 * used to hardcode `index: false` while `MARKETS.us.indexable` was true and
 * `indexablePilotPaths()` was already advertising this URL in the sitemap, so
 * the sitemap invited Google to a page telling it to go away. The comment that
 * replaced this one claimed the directive "tracks the pilot landing page"; it
 * did not, because tracking something by hand is not tracking it.
 */
const MARKET: Market = "us";
const M = MARKETS[MARKET];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "pricingPage.meta" });
  return {
    title: t("title"),
    description: t("description"),
    robots: marketRobots(MARKET),
    // Its own canonical: this page must not collapse into /pricing, which
    // quotes a different currency.
    alternates: { canonical: `${M.path}/pricing` },
    openGraph: { locale: M.ogLocale },
  };
}

export default function UsPricingPage() {
  return <MarketPricingPage locale="en" market={MARKET} />;
}
