import { setRequestLocale } from "next-intl/server";
import { getPlanCatalog } from "@/lib/plan-catalog";
import { MARKETS, type Market } from "@/lib/markets";
import type { RegionCurrency } from "@/lib/region-pricing";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";

/**
 * The pricing page for one market.
 *
 * Shared by /pricing, /us/pricing and /uk/pricing so a market cannot end up with
 * a landing page in one currency and a pricing page in another — which is
 * exactly what happened before STA-275: /us quoted dollars while the only
 * pricing route hardcoded MARKETS.int, so a single click on "Pricing" showed a
 * US visitor euros. Adding a market now means adding a route that passes its
 * name here, not copying a page.
 *
 * Since STA-330 the market no longer fixes what a visitor sees either: both
 * ladders are fetched at render time (the page stays fully cacheable) and the
 * RegionPricingProvider resolves the browser's detected region after hydration.
 * The market currency remains the default for an undetectable visitor.
 */
export async function MarketPricingPage({
  locale,
  market = "int",
}: Readonly<{ locale: string; market?: Market }>) {
  setRequestLocale(locale);
  const marketCurrency: RegionCurrency =
    MARKETS[market].currency.code.toLowerCase() === "usd" ? "usd" : "eur";
  const [eur, usd] = await Promise.all([getPlanCatalog("eur"), getPlanCatalog("usd")]);
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <RegionPricingProvider
        ladders={{ eur, usd }}
        defaultCurrency={marketCurrency}
        defaultTrialDays={MARKETS[market].trialDays}
      >
        <Header market={market} />
        <main>
          <PricingPageContent market={market} />
        </main>
        <Footer market={market} />
      </RegionPricingProvider>
    </div>
  );
}
