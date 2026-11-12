import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { REWARD_BANNER, STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { GlassCard } from "../../platform/GlassCard";
import { LockScreenNotification } from "../../platform/LockScreenNotification";
import { GoogleWalletPhone } from "../../shared/GoogleWalletPhone";
import { WalletBadges } from "../../shared/WalletBadges";
import { WalletPhone } from "../../shared/WalletPhone";
import { lpBanner } from "../../shared/banner";
import { OwnIconCard } from "./OwnIconCard";

/** Both phones are drawn about 290px wide from `lg` and about 168px below it. */
const IPHONE = { full: 290, narrow: 168 };
const ANDROID = { full: 286, narrow: 166 };

/**
 * The Aurevo card in Apple Wallet and in Google Wallet, side by side, with three glass
 * cards floating over them (the stamp banner on iPhone, the reward banner on Android, the
 * shop's own icon) and the official badges under. From `lg` it is a 960px stage; on a
 * phone the phones and their badges come first, then the three cards.
 */
export function WalletsComposition() {
  return (
    <div className="relative mx-auto flex max-w-[480px] flex-col gap-4 lg:block lg:h-[700px] lg:w-[960px] lg:max-w-none">
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
        title={COPY.wallets.iphone}
        className="relative z-20 w-full lg:absolute lg:top-[336px] lg:left-0 lg:w-[340px]"
      >
        <LockScreenNotification {...lpBanner(STAMP_BANNER)} />
      </GlassCard>

      <GlassCard
        float
        title={COPY.wallets.android}
        className="relative z-20 w-full lg:absolute lg:top-[130px] lg:left-[640px] lg:w-[320px]"
      >
        <LockScreenNotification {...lpBanner(REWARD_BANNER)} />
      </GlassCard>

      <GlassCard
        float
        title={COPY.wallets.icon.title}
        className="relative z-20 w-full lg:absolute lg:top-[400px] lg:left-[620px] lg:w-[340px]"
      >
        <OwnIconCard />
      </GlassCard>
    </div>
  );
}
