import { ArrowRightIcon } from "@/components/icons";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { GoogleWalletPhone } from "../shared/GoogleWalletPhone";
import { LpSection } from "../shared/LpSection";
import { WalletBadges } from "../shared/WalletBadges";
import { WalletPhone } from "../shared/WalletPhone";
import { lpBanner } from "../shared/banner";
import { DeliverAnalytics } from "./DeliverAnalytics";
import { GLASS_BLEED, GlassCard } from "./GlassCard";
import { LockScreenNotification, LockScreenSlice } from "./LockScreenNotification";

/** Both phones are drawn about 290px wide from `lg` and about 168px below it. */
const IPHONE = { full: 290, narrow: 168 };
const ANDROID = { full: 286, narrow: 166 };

/**
 * "Straight to Apple Wallet and Google Wallet": the Aurevo card in Apple Wallet
 * on an iPhone and in Google Wallet on an Android phone, three glass cards
 * floating over them (the analytics, the lock-screen notification, the update
 * on a scan) and the official badges under. From `lg` it is a 960px stage; on
 * a phone the phones and their badges come first, then the three cards.
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
      <div className="relative mx-auto flex max-w-[480px] flex-col gap-4 lg:block lg:h-[804px] lg:w-[960px] lg:max-w-none">
        <div className="relative flex justify-center lg:static">
          <div className="lg:absolute lg:top-0 lg:left-[202px]">
            <WalletPhone width={IPHONE.full} narrowWidth={IPHONE.narrow} stamps={5} />
          </div>
          <div className="relative z-10 mt-6 -ml-3 lg:absolute lg:top-[52px] lg:left-[468px] lg:m-0">
            <GoogleWalletPhone width={ANDROID.full} narrowWidth={ANDROID.narrow} stamps={5} />
          </div>
        </div>

        <WalletBadges className="mb-4 justify-center gap-3 lg:absolute lg:bottom-0 lg:left-1/2 lg:mb-0 lg:-translate-x-1/2" />

        <GlassCard
          float
          title={PLATFORM.deliver.notificationsLabel}
          className="relative z-20 w-full lg:absolute lg:top-[556px] lg:left-[580px] lg:w-[380px]"
        >
          <LockScreenSlice className={`${GLASS_BLEED} px-4 py-6 lg:px-5`}>
            <LockScreenNotification {...lpBanner(STAMP_BANNER)} />
          </LockScreenSlice>
        </GlassCard>

        <GlassCard
          float
          title={PLATFORM.deliver.updatesLabel}
          className="relative z-20 w-full lg:absolute lg:top-[110px] lg:left-[710px] lg:w-[250px]"
        >
          <p className="flex items-center gap-2 text-2xl font-bold tabular-nums text-[var(--foreground)]">
            {PLATFORM.deliver.updatesFrom}
            <ArrowRightIcon size={18} weight="bold" aria-hidden className="text-[var(--accent-hover)]" />
            {PLATFORM.deliver.updatesTo}
          </p>
        </GlassCard>

        <GlassCard
          float
          title={PLATFORM.deliver.analyticsLabel}
          className="relative z-20 w-full lg:absolute lg:top-[384px] lg:left-0 lg:w-[360px]"
        >
          <DeliverAnalytics />
        </GlassCard>
      </div>
    </LpSection>
  );
}
