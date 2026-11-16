import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { HowSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/HowSection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { NumbersSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/NumbersSection";
import { PlansSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/PlansSection";
import { Hairline } from "@/components/landing-pages/platform/Hairline";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { PhoneCrop } from "@/components/landing-pages/shared/PhoneCrop";
import { lpBanner } from "@/components/landing-pages/shared/banner";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The broadcasts preview of /en/features/promotional-campaigns: English only, noindex, in Platform's style.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/promotional-campaigns");
}

export default function PromotionalCampaignsPreviewPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="platform/promotional-campaigns">
      <PreviewHero
        slug="platform/promotional-campaigns"
        secondary={null}
        eyebrowPlan={PROMOTIONAL_CAMPAIGNS_PREVIEW.plan}
        visual={
          <PhoneCrop height={440}>
            <NotificationPhoneDemo
              animate={false}
              eager
              notifications={[lpBanner(PROMOTIONAL_CAMPAIGNS_PREVIEW.heroBanner), lpBanner(STAMP_BANNER)]}
            />
          </PhoneCrop>
        }
      />
      {/* TODO(STA-552 v2 builder): this page still renders its first design; render the registry's section list (ux-brief-v2, page E) and delete this marker. */}
      <Hairline />
      <NumbersSection />
      <Hairline />
      <HowSection />
      <IdeasSection />
      <DeliverySection />
      <PlansSection />
      <LpFaq faq={PROMOTIONAL_CAMPAIGNS_PREVIEW.faq} />
      <LpAccentBand copy={PROMOTIONAL_CAMPAIGNS_PREVIEW.band} />
      <RelatedPreviews slug="platform/promotional-campaigns" />
    </LandingPageShell>
  );
}
