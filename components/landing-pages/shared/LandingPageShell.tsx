import type { ReactNode } from "react";
import { getLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { LandingTracker } from "@/components/analytics/LandingTracker";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";
import { MARKETS, type Market } from "@/lib/markets";
import { getPlanCatalog } from "@/lib/plan-catalog";
import type { RegionCurrency } from "@/lib/region-pricing";

/**
 * The frame of a landing page: tracker, the market's header, the page, the market's footer. The server HTML has
 * the market's prices and trial length (dollars and 14 days in the US, euros and 30 days elsewhere).
 */
export async function LandingPageShell({
  slug,
  market,
  children,
}: Readonly<{ slug: LandingSlug; market: Market; children: ReactNode }>) {
  const page = LANDING_PAGES[slug];
  const locale = await getLocale();
  const marketCurrency: RegionCurrency = MARKETS[market].currency.code.toLowerCase() === "usd" ? "usd" : "eur";
  const [eur, usd] = await Promise.all([getPlanCatalog("eur"), getPlanCatalog("usd")]);

  return (
    <div className="paper-grain min-h-screen bg-[var(--cream)] overflow-x-hidden relative">
      {/* Outside the provider: AttributionCapture snapshots this variant, so nothing may delay it. */}
      <LandingTracker locale={locale} variant={page.variant} />
      <RegionPricingProvider
        ladders={{ eur, usd }}
        defaultCurrency={marketCurrency}
        defaultTrialDays={MARKETS[market].trialDays}
      >
        <Header market={market} mobileMenu="sheet" />
        <main className="relative">{children}</main>
        <Footer market={market} />
      </RegionPricingProvider>
    </div>
  );
}
