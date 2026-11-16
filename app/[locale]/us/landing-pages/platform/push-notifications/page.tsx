import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { DaySection } from "@/components/landing-pages/feature-previews/push-notifications/DaySection";
import { EditorSection } from "@/components/landing-pages/feature-previews/push-notifications/EditorSection";
import { WalletsSection } from "@/components/landing-pages/feature-previews/push-notifications/WalletsSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpDemo } from "@/components/landing-pages/shared/LpDemo";
import { PhoneCrop } from "@/components/landing-pages/shared/PhoneCrop";
import { lpBanner } from "@/components/landing-pages/shared/banner";
import { PUSH_NOTIFICATIONS_PREVIEW } from "@/lib/landing-pages/copy/previews/push-notifications";
import { REWARD_BANNER, STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The notifications preview of /en/features/push-notifications: English only, noindex, in Platform's style.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/push-notifications");
}

export default function PushNotificationsPreviewPage() {
  setRequestLocale("en");

  return (
    <LandingPageShell slug="platform/push-notifications">
      <PreviewHero
        slug="platform/push-notifications"
        visual={
          <PhoneCrop height={440}>
            <NotificationPhoneDemo
              animate={false}
              eager
              notifications={[lpBanner(STAMP_BANNER), lpBanner(REWARD_BANNER)]}
            />
          </PhoneCrop>
        }
      />
      <DaySection />
      <WalletsSection />
      <EditorSection />
      <LpDemo eyebrow={PUSH_NOTIFICATIONS_PREVIEW.demo.eyebrow} align="center" />
      <LpAccentBand copy={PUSH_NOTIFICATIONS_PREVIEW.band} />
      <RelatedPreviews slug="platform/push-notifications" />
    </LandingPageShell>
  );
}
