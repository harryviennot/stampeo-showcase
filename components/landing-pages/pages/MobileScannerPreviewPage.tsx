import { getLocale } from "next-intl/server";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { CounterSection } from "@/components/landing-pages/feature-previews/mobile-scanner/CounterSection";
import { WaysSection } from "@/components/landing-pages/feature-previews/mobile-scanner/WaysSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { PhoneCrop } from "@/components/landing-pages/shared/PhoneCrop";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";

/** The scanner preview: staff scan a card with the free app or with the web scanner in a browser. */
export async function MobileScannerPreviewPage({ market }: Readonly<{ market: Market }>) {
  const { MOBILE_SCANNER_PREVIEW: copy } = landingCopy(await getLocale(), market).previews.mobileScanner;

  return (
    <LandingPageShell slug="platform/mobile-scanner" market={market}>
      <PreviewHero
        slug="platform/mobile-scanner"
        market={market}
        secondary={{ label: copy.hero.secondary, href: "#counter" }}
        visual={
          <PhoneCrop height={440}>
            <ScannerLoop width={280} narrowWidth={250} eager />
          </PhoneCrop>
        }
      />
      <CounterSection market={market} />
      <WaysSection />
      <LpAccentBand copy={copy.band} />
      <RelatedPreviews slug="platform/mobile-scanner" market={market} />
    </LandingPageShell>
  );
}
