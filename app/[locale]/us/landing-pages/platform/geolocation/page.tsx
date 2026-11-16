import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { GEOLOCATION_PREVIEW } from "@/lib/landing-pages/copy/previews/geolocation";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The geolocation preview: English only, noindex, in Platform's style. The feature is coming soon, and says so.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/geolocation");
}

export default function GeolocationPreviewPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="platform/geolocation">
      <PreviewHero slug="platform/geolocation" secondary={null} eyebrowChip={GEOLOCATION_PREVIEW.heroChip} visual={null} />
      {/* TODO(STA-552 v2 builder): this page still renders its first design; render the registry's section list (ux-brief-v2, page F) and delete this marker. */}
      <LpAccentBand copy={GEOLOCATION_PREVIEW.band} />
      <RelatedPreviews slug="platform/geolocation" title={GEOLOCATION_PREVIEW.related.title} />
    </LandingPageShell>
  );
}
