import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { shopBanner } from "@/components/landing-pages/feature-previews/ShopIcon";
import { DaySection } from "@/components/landing-pages/feature-previews/push-notifications/DaySection";
import { EditorSection } from "@/components/landing-pages/feature-previews/push-notifications/EditorSection";
import { WalletsSection } from "@/components/landing-pages/feature-previews/push-notifications/WalletsSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpDemo } from "@/components/landing-pages/shared/LpDemo";
import { PhoneCrop } from "@/components/landing-pages/shared/PhoneCrop";
import { PUSH_NOTIFICATIONS_PREVIEW } from "@/lib/landing-pages/copy/previews/push-notifications";
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
  const { banner, alt } = PUSH_NOTIFICATIONS_PREVIEW.hero;

  return (
    <LandingPageShell slug="platform/push-notifications">
      <PreviewHero
        slug="platform/push-notifications"
        visual={
          <PhoneCrop height={440}>
            <div role="img" aria-label={alt}>
              <div aria-hidden>
                <NotificationPhoneDemo animate={false} eager notifications={[shopBanner(banner)]} />
              </div>
            </div>
          </PhoneCrop>
        }
      />
      <DaySection />
      <WalletsSection />
      <EditorSection />
      <LpDemo {...PUSH_NOTIFICATIONS_PREVIEW.demo} align="center" />
      <LpAccentBand copy={PUSH_NOTIFICATIONS_PREVIEW.band} />
      <RelatedPreviews slug="platform/push-notifications" />
    </LandingPageShell>
  );
}
