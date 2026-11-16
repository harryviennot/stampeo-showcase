import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { GeofencingHeroAnimation } from "@/components/features/geolocalisation/GeofencingHeroAnimation";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { HowSection } from "@/components/landing-pages/feature-previews/geolocation/HowSection";
import { PrivacySection } from "@/components/landing-pages/feature-previews/geolocation/PrivacySection";
import { StatusSection } from "@/components/landing-pages/feature-previews/geolocation/StatusSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { lpBanner } from "@/components/landing-pages/shared/banner";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { InkArrow, InkNote } from "@/components/ui/InkAnnotation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GEOLOCATION_PREVIEW } from "@/lib/landing-pages/copy/previews/geolocation";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The geolocation preview: English only, noindex, in the Stampeo-Platform look. The feature is coming soon, and says so.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/geolocation");
}

export default function GeolocationPreviewPage() {
  setRequestLocale("en");
  const { sender, title, body } = GEOLOCATION_PREVIEW.banner;

  return (
    <LandingPageShell slug="platform/geolocation">
      <PreviewHero
        slug="platform/geolocation"
        secondary={null}
        visual={
          <ScrollReveal className="mx-auto w-full max-w-[500px] xl:max-w-[600px]">
            <GeofencingHeroAnimation sender={sender} icon={lpBanner({ sender, body }).icon} title={title} body={body}>
              <div className="pointer-events-none absolute top-0 right-[46%] hidden flex-col items-end lg:flex">
                <InkNote rotate={-3} className="whitespace-nowrap">
                  {GEOLOCATION_PREVIEW.heroNote}
                </InkNote>
                <InkArrow variant="downRight" className="-mt-0.5 -mr-6 w-9" delay={0.5} />
              </div>
            </GeofencingHeroAnimation>
          </ScrollReveal>
        }
      />
      <StatusSection />
      <HowSection />
      <PrivacySection />
      <LpFaq faq={GEOLOCATION_PREVIEW.faq} />
      <LpAccentBand copy={GEOLOCATION_PREVIEW.band} />
      <RelatedPreviews slug="platform/geolocation" title={GEOLOCATION_PREVIEW.related.title} />
    </LandingPageShell>
  );
}
