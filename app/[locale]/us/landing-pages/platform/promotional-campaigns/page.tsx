import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
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
      {/* TODO(STA-552 builder): numbers, how, ideas, delivery, plans, faq (ux-brief, page E). */}
      <LpAccentBand copy={PROMOTIONAL_CAMPAIGNS_PREVIEW.band} />
      <RelatedPreviews slug="platform/promotional-campaigns" />
    </LandingPageShell>
  );
}
