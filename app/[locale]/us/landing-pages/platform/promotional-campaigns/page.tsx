import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { shopBanner } from "@/components/landing-pages/feature-previews/ShopIcon";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { HowSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/HowSection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { TextingSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/TextingSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { PhoneCrop } from "@/components/landing-pages/shared/PhoneCrop";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The campaigns preview of /en/features/promotional-campaigns: English only, noindex, in Platform's style.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/promotional-campaigns");
}

export default function PromotionalCampaignsPreviewPage() {
  setRequestLocale("en");
  const { heroBanner, hero } = PROMOTIONAL_CAMPAIGNS_PREVIEW;

  return (
    <LandingPageShell slug="platform/promotional-campaigns">
      <PreviewHero
        slug="platform/promotional-campaigns"
        secondary={{ label: "See how it works", href: "#how" }}
        visual={
          <PhoneCrop height={440}>
            <div role="img" aria-label={hero.alt}>
              <div aria-hidden>
                <NotificationPhoneDemo animate={false} eager notifications={[shopBanner(heroBanner)]} />
              </div>
            </div>
          </PhoneCrop>
        }
      />
      <HowSection />
      <TextingSection />
      <IdeasSection />
      <DeliverySection />
      <LpFaq faq={PROMOTIONAL_CAMPAIGNS_PREVIEW.faq} answerLink={{ words: "see pricing", href: "/pricing" }} />
      <LpAccentBand copy={PROMOTIONAL_CAMPAIGNS_PREVIEW.band} />
      <RelatedPreviews slug="platform/promotional-campaigns" />
    </LandingPageShell>
  );
}
