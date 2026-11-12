import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { ActivitySection } from "@/components/landing-pages/feature-previews/analytics/ActivitySection";
import { GlanceSection } from "@/components/landing-pages/feature-previews/analytics/GlanceSection";
import { HistorySection } from "@/components/landing-pages/feature-previews/analytics/HistorySection";
import { QuestionsSection } from "@/components/landing-pages/feature-previews/analytics/QuestionsSection";
import { Hairline } from "@/components/landing-pages/platform/Hairline";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { DashboardDuo } from "@/components/landing-pages/shared/DashboardDuo";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The analytics preview of /en/features/analytics: English only, noindex, in Platform's style.
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
      <GlanceSection />
      <QuestionsSection />
      <ActivitySection />
      <Hairline />
      <HistorySection />
      <Hairline />
      <LpAccentBand copy={ANALYTICS_PREVIEW.band} />
      <RelatedPreviews slug="platform/analytics" />
    </LandingPageShell>
  );
}
