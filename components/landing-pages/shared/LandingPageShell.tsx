import type { ReactNode } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { LandingTracker } from "@/components/analytics/LandingTracker";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";
import { MARKETS } from "@/lib/markets";
import { getPlanCatalog } from "@/lib/plan-catalog";

/**
 * The frame of a US landing page: tracker, US header, the page, US footer.
 *
 * Both ladders are fetched at render time so the page stays cacheable; the
 * server HTML carries the US ladder and trial length, and after hydration
 * `RegionPricingProvider` swaps to the visitor's detected region.
 */
export async function LandingPageShell({
  slug,
  children,
}: Readonly<{ slug: LandingSlug; children: ReactNode }>) {
  const page = LANDING_PAGES[slug];
  const [eur, usd] = await Promise.all([getPlanCatalog("eur"), getPlanCatalog("usd")]);

  return (
    <div className="paper-grain min-h-screen bg-[var(--cream)] overflow-x-hidden relative">
      {/* Outside the provider: AttributionCapture snapshots the variant this
          stamps, so the provider must never gate or delay it. */}
      <LandingTracker locale="en" variant={page.variant} />
      <RegionPricingProvider
        ladders={{ eur, usd }}
        defaultCurrency="usd"
        defaultTrialDays={MARKETS.us.trialDays}
      >
        <Header market="us" />
        <main className="relative">{children}</main>
        <Footer market="us" />
      </RegionPricingProvider>
    </div>
  );
}
