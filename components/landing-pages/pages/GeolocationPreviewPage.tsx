import { getLocale } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { HeroLockScreen } from "@/components/landing-pages/feature-previews/HeroLockScreen";
import { shopBanner } from "@/components/landing-pages/feature-previews/ShopIcon";
import { HowSection } from "@/components/landing-pages/feature-previews/geolocation/HowSection";
import { PrivacySection } from "@/components/landing-pages/feature-previews/geolocation/PrivacySection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";
import { faqPageJsonLd } from "@/lib/structured-data";

/** The geolocation preview. The feature is coming soon, and says so. */
export async function GeolocationPreviewPage({ market }: Readonly<{ market: Market }>) {
  const { hero, banner, faq, band, related } = landingCopy(await getLocale(), market).previews.geolocation.GEOLOCATION_PREVIEW;

  return (
    <LandingPageShell slug="platform/geolocation" market={market}>
      <JsonLd data={faqPageJsonLd([...faq.items])} />
      <PreviewHero
        slug="platform/geolocation"
        market={market}
        secondary={{ label: hero.secondary, href: "#how" }}
        visual={
          <HeroLockScreen
            alt={hero.alt}
            notification={shopBanner({ sender: banner.sender, body: `${banner.title}. ${banner.body}` })}
          />
        }
      />
      <HowSection />
      <PrivacySection />
      <LpFaq faq={faq} />
      <LpAccentBand copy={band} />
      <RelatedPreviews slug="platform/geolocation" title={related.title} />
    </LandingPageShell>
  );
}
