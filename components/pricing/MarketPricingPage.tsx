import { setRequestLocale } from "next-intl/server";
import { getPlanCatalog } from "@/lib/plan-catalog";
import { MARKETS, type Market } from "@/lib/markets";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";

/**
 * The pricing page for one market.
 *
 * Shared by /pricing, /us/pricing and /uk/pricing so a market cannot end up with
 * a landing page in one currency and a pricing page in another — which is
 * exactly what happened before STA-275: /us quoted dollars while the only
 * pricing route hardcoded MARKETS.int, so a single click on "Pricing" showed a
 * US visitor euros. Adding a market now means adding a route that passes its
 * name here, not copying a page.
 */
export async function MarketPricingPage({
  locale,
  market = "int",
}: Readonly<{ locale: string; market?: Market }>) {
  setRequestLocale(locale);
  // Fixed at render time, like VariantLanding, so the page stays fully cacheable
  // and every block on it quotes the same ladder.
  const pricing = await getPlanCatalog(MARKETS[market].currency.code.toLowerCase());
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header market={market} />
      <main>
        <PricingPageContent pricing={pricing} />
      </main>
      <Footer market={market} />
    </div>
  );
}
