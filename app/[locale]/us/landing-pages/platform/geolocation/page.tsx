import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { HeroLockScreen } from "@/components/landing-pages/feature-previews/HeroLockScreen";
import { shopBanner } from "@/components/landing-pages/feature-previews/ShopIcon";
import { HowSection } from "@/components/landing-pages/feature-previews/geolocation/HowSection";
import { PrivacySection } from "@/components/landing-pages/feature-previews/geolocation/PrivacySection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
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
  const { hero, banner, faq, band, related } = GEOLOCATION_PREVIEW;

  return (
    <LandingPageShell slug="platform/geolocation">
      <PreviewHero
        slug="platform/geolocation"
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
