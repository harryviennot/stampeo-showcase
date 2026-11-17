import { getLocale } from "next-intl/server";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { BlindSpotsSection } from "@/components/landing-pages/feature-previews/analytics/BlindSpotsSection";
import { ChartsSection } from "@/components/landing-pages/feature-previews/analytics/ChartsSection";
import { CustomersSection } from "@/components/landing-pages/feature-previews/analytics/CustomersSection";
import { KeyNumbersCard } from "@/components/landing-pages/feature-previews/analytics/KeyNumbersCard";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { DashboardDuo } from "@/components/landing-pages/shared/DashboardDuo";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpSection } from "@/components/landing-pages/shared/LpSection";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";

/** The analytics preview: a loyalty program's numbers, filled in by every scan. */
export async function AnalyticsPreviewPage({ market }: Readonly<{ market: Market }>) {
  const { hero, dashboard, band } = landingCopy(await getLocale(), market).previews.analytics.ANALYTICS_PREVIEW;

  return (
    <LandingPageShell slug="platform/analytics" market={market}>
      <PreviewHero
        slug="platform/analytics"
        market={market}
        secondary={{ label: hero.secondary, href: "#charts" }}
        visual={<KeyNumbersCard />}
      />
      <BlindSpotsSection />
      <ChartsSection market={market} />
      <CustomersSection />
      <LpSection section="dashboard" eyebrow={dashboard.eyebrow} title={dashboard.title} lead={dashboard.lead} align="center">
        <DashboardDuo caption={false} />
      </LpSection>
      <LpAccentBand copy={band} />
      <RelatedPreviews slug="platform/analytics" market={market} />
    </LandingPageShell>
  );
}
