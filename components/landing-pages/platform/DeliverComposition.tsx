import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { ArrowRightIcon, ArrowsClockwiseIcon, BellIcon, ChartIcon } from "@/components/icons";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { REWARD_BANNER, SHARED, STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { LpSection } from "../shared/LpSection";
import { phoneCropClass } from "../shared/PhoneCrop";
import { WalletBadges } from "../shared/WalletBadges";
import { WalletPhone } from "../shared/WalletPhone";
import { lpBanner } from "../shared/banner";
import { GlassCard } from "./GlassCard";

/**
 * The part of the desktop capture the analytics card shows, as fractions of the capture: the first two figures and
 * the visits chart, which every plan has. It stops short of the busiest-times card, which is Growth and Pro.
 */
const CROP = { x: 0.215, y: 0.178, width: 0.453, height: 0.4 };
const CAPTURE = { width: 2560, height: 1600 };
const CROP_ASPECT = (CROP.width * CAPTURE.width) / (CROP.height * CAPTURE.height);

/** The wallet phone is drawn at 300px and shrunk to 220px on a phone. */
const PHONE = { full: 300, narrow: 220 };

const ICON = "text-[var(--accent-hover)]";

/** The dashboard card over the wallet phone: the figures, cropped out of the desktop capture. */
async function AnalyticsCard({ className }: Readonly<{ className: string }>) {
  const t = await getTranslations("variant.dashboard");
  const shot = landingShot("en", "desktop");
  const imageWidth = 100 / CROP.width;
  // The crop's offsets are percentages of the box, whose height is the box's width over `CROP_ASPECT`.
  const top = -CROP.y * imageWidth * (CAPTURE.height / CAPTURE.width) * CROP_ASPECT;

  return (
    <GlassCard
      float
      title={PLATFORM.deliver.analyticsLabel}
      icon={<ChartIcon size={18} weight="duotone" aria-hidden className={ICON} />}
      className={className}
    >
      <div
        className="relative overflow-hidden rounded-lg bg-[var(--paper-hover)] ring-1 ring-black/5"
        style={{ aspectRatio: CROP_ASPECT }}
      >
        <Image
          src={shot.src}
          width={shot.width}
          height={shot.height}
          alt={t("alt.desktop")}
          sizes="420px"
          className="absolute max-w-none"
          style={{ width: `${imageWidth}%`, left: `${-CROP.x * imageWidth}%`, top: `${top}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--muted-foreground)]">{SHARED.sampleData}</p>
    </GlassCard>
  );
}

/**
 * "Straight to Apple Wallet and Google Wallet": the Aurevo card in Apple
 * Wallet and the lock screen beside it, three glass cards floating over them
 * (the dashboard, the notification, the update on a scan) and the official
 * badges under. On a phone it is the dashboard card, one phone cut short with
 * the other two cards laid over it, and the badges.
 */
export function DeliverComposition() {
  return (
    <LpSection
      section="deliver"
      eyebrow={PLATFORM.deliver.eyebrow}
      title={PLATFORM.deliver.title}
      lead={PLATFORM.deliver.lead}
      align="center"
    >
      <div className="relative mx-auto flex max-w-[480px] flex-col gap-4 lg:block lg:h-[700px] lg:max-w-[1040px] lg:gap-0">
        <AnalyticsCard className="relative z-20 w-full lg:absolute lg:top-[404px] lg:left-[max(0px,calc(50%-520px))] lg:w-[380px]" />

        <div className="relative lg:static">
          <div
            className={`flex justify-center ${phoneCropClass(440)} lg:absolute lg:top-0 lg:left-[calc(50%-316px)]`}
          >
            <WalletPhone width={PHONE.full} narrowWidth={PHONE.narrow} stamps={5} />
          </div>

          <div className="absolute top-[34%] right-0 z-10 w-[176px] lg:top-[210px] lg:right-auto lg:left-[min(calc(50%+296px),calc(100%-196px))] lg:w-[196px]">
            <GlassCard
              float
              title={PLATFORM.deliver.updatesLabel}
              icon={<ArrowsClockwiseIcon size={18} weight="bold" aria-hidden className={ICON} />}
            >
              <p className="flex items-center gap-2 text-2xl font-bold tabular-nums text-[var(--foreground)]">
                {PLATFORM.deliver.updatesFrom}
                <ArrowRightIcon size={18} weight="bold" aria-hidden className={ICON} />
                {PLATFORM.deliver.updatesTo}
              </p>
            </GlassCard>
          </div>

          <div className="absolute inset-x-3 -bottom-6 z-10 lg:inset-x-auto lg:top-[470px] lg:bottom-auto lg:left-[min(calc(50%+176px),calc(100%-320px))] lg:w-[320px]">
            <GlassCard
              float
              title={PLATFORM.deliver.notificationsLabel}
              icon={<BellIcon size={18} weight="duotone" aria-hidden className={ICON} />}
            >
              <NotificationBanner {...lpBanner(STAMP_BANNER)} />
            </GlassCard>
          </div>
        </div>

        <div className="hidden lg:absolute lg:top-10 lg:left-[calc(50%+4px)] lg:block">
          <NotificationPhoneDemo width={300} animate={false} eager={false} notifications={[lpBanner(REWARD_BANNER)]} />
        </div>
      </div>

      <WalletBadges className="mt-14 justify-center gap-3 lg:mt-8" />
    </LpSection>
  );
}
