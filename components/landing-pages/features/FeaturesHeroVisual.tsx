import { HeroCardStack } from "@/components/card/HeroCardStack";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";

/** The Aurevo card with its stamp banner over the card's top edge; the stack's peeking cards show from `xl`. */
export function FeaturesHeroVisual() {
  return (
    <div className="relative w-full max-w-[300px] lg:mr-6 xl:mr-24">
      <div className="relative z-20 -mx-3">
        <NotificationBanner {...lpBanner(STAMP_BANNER)} />
      </div>
      <div className="-mt-2">
        <HeroCardStack showQR peekFrom="xl" />
      </div>
    </div>
  );
}
