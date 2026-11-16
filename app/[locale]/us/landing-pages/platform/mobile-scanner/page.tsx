import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { CounterSection } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterSection";
import { WaysSection } from "@/components/landing-pages/feature-previews/mobile-scanner/WaysSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { PhoneCrop } from "@/components/landing-pages/shared/PhoneCrop";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The scanner preview of /en/features/mobile-scanner: English only, noindex, in Platform's style.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/mobile-scanner");
}

export default function MobileScannerPreviewPage() {
  setRequestLocale("en");
  const { hero, band } = MOBILE_SCANNER_PREVIEW;

  return (
    <LandingPageShell slug="platform/mobile-scanner">
      <PreviewHero
        slug="platform/mobile-scanner"
        secondary={{ label: hero.secondary, href: "#counter" }}
        visual={
          <PhoneCrop height={440}>
            <ScannerLoop width={280} narrowWidth={250} eager />
          </PhoneCrop>
        }
      />
      <CounterSection />
      <WaysSection />
      <LpAccentBand copy={band} />
      <RelatedPreviews slug="platform/mobile-scanner" />
    </LandingPageShell>
  );
}
