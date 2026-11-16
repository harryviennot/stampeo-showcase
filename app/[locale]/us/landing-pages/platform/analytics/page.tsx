import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The analytics preview of /en/features/analytics: English only, noindex, in the Stampeo-Platform look.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/analytics");
}

export default function AnalyticsPreviewPage() {
  setRequestLocale("en");

  const { hero, dashboard, band } = ANALYTICS_PREVIEW;

  return (
    <LandingPageShell slug="platform/analytics">
      <PreviewHero
        slug="platform/analytics"
        secondary={{ label: hero.secondary, href: "#charts" }}
        visual={<KeyNumbersCard />}
      />
      <BlindSpotsSection />
      <ChartsSection />
      <CustomersSection />
      <LpSection section="dashboard" eyebrow={dashboard.eyebrow} title={dashboard.title} lead={dashboard.lead} align="center">
        <DashboardDuo caption={false} />
      </LpSection>
      <LpAccentBand copy={band} />
      <RelatedPreviews slug="platform/analytics" />
    </LandingPageShell>
  );
}
