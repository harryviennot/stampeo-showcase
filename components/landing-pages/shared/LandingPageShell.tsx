import type { ReactNode } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { LandingTracker } from "@/components/analytics/LandingTracker";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";
import { featureLinksFor } from "@/lib/landing-pages/preview-nav";
import { MARKETS } from "@/lib/markets";
import { getPlanCatalog } from "@/lib/plan-catalog";

/** The frame of a US landing page: tracker, US header, the page, US footer; the server HTML has US prices. */
export async function LandingPageShell({
  slug,
  children,
}: Readonly<{ slug: LandingSlug; children: ReactNode }>) {
  const page = LANDING_PAGES[slug];
  const featureLinks = featureLinksFor(slug);
  const [eur, usd] = await Promise.all([getPlanCatalog("eur"), getPlanCatalog("usd")]);

  return (
    <div className="paper-grain min-h-screen bg-[var(--cream)] overflow-x-hidden relative">
      {/* Outside the provider: AttributionCapture snapshots this variant, so nothing may delay it. */}
      <LandingTracker locale="en" variant={page.variant} />
      <RegionPricingProvider
        ladders={{ eur, usd }}
        defaultCurrency="usd"
        defaultTrialDays={MARKETS.us.trialDays}
      >
        <Header market="us" featureLinks={featureLinks} mobileMenu="v2" />
        <main className="relative">{children}</main>
        <Footer market="us" featureLinks={featureLinks} />
      </RegionPricingProvider>
    </div>
  );
}
