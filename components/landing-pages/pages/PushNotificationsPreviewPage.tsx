import { getLocale } from "next-intl/server";
import { HeroLockScreen } from "@/components/landing-pages/feature-previews/HeroLockScreen";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { shopBanner } from "@/components/landing-pages/feature-previews/ShopIcon";
import { DaySection } from "@/components/landing-pages/feature-previews/push-notifications/DaySection";
import { EditorSection } from "@/components/landing-pages/feature-previews/push-notifications/EditorSection";
import { WalletsSection } from "@/components/landing-pages/feature-previews/push-notifications/WalletsSection";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LandingPageShell } from "@/components/landing-pages/shared/LandingPageShell";
import { LpDemo } from "@/components/landing-pages/shared/LpDemo";
import { landingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";

/** The notifications preview: every stamp and reward reaches the lock screen on its own. */
export async function PushNotificationsPreviewPage({ market }: Readonly<{ market: Market }>) {
  const copy = landingCopy(await getLocale(), market).previews.pushNotifications.PUSH_NOTIFICATIONS_PREVIEW;

  return (
    <LandingPageShell slug="platform/push-notifications" market={market}>
      <PreviewHero
        slug="platform/push-notifications"
        market={market}
        visual={<HeroLockScreen alt={copy.hero.alt} notification={shopBanner(copy.hero.banner)} />}
      />
      <DaySection />
      <WalletsSection />
      <EditorSection />
      <LpDemo {...copy.demo} align="center" />
      <LpAccentBand copy={copy.band} />
      <RelatedPreviews slug="platform/push-notifications" />
    </LandingPageShell>
  );
}
