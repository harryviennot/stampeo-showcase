import { HeroCardStack } from "@/components/card/HeroCardStack";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";

/**
 * The Features hero: the Aurevo card with its stamp notification arriving on
 * the card's top edge. The banner overlaps only the card's top margin, so the
 * card's header (its logo and "5 / 8") still reads under it; both are in the
 * flow, so nothing shifts on first paint. The card is at 5 of 8, as the banner
 * says. The stack's two peeking cards show from `xl`, where the card moves left
 * so the right-hand one ends inside the page; at `lg` the column is too narrow
 * to hold them.
 */
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
