import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { ActivitySection } from "@/components/landing-pages/feature-previews/analytics/ActivitySection";
import { GlanceSection } from "@/components/landing-pages/feature-previews/analytics/GlanceSection";
import { BlindSpotsSection } from "@/components/landing-pages/feature-previews/analytics/BlindSpotsSection";
import { RecapSection } from "@/components/landing-pages/feature-previews/analytics/RecapSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { DashboardDuo } from "@/components/landing-pages/shared/DashboardDuo";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
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

  return (
    <LandingPageShell slug="platform/analytics">
      <PreviewHero slug="platform/analytics" secondary={null} visual={<DashboardDuo caption={false} priority />} />
      <BlindSpotsSection />
      <GlanceSection />
      <ActivitySection />
      <RecapSection />
      <LpAccentBand copy={ANALYTICS_PREVIEW.band} />
      <RelatedPreviews slug="platform/analytics" />
    </LandingPageShell>
  );
}
