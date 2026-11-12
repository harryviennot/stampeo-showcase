import { HeroCardStack } from "@/components/card/HeroCardStack";
import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";

/**
 * The Features hero: the Aurevo card (the stack's two peeking cards show from
 * `lg`) with its stamp notification dropping onto the card's top edge, over its
 * header row. The banner is absolute inside a box whose top padding holds its
 * upper part, so the visual never shifts on first paint. The card is at 5 of 8,
 * as the banner says. From `xl` the card moves left so the right-hand peeking
 * card ends inside the page.
 */
export function FeaturesHeroVisual() {
  return (
    <div className="relative w-full max-w-[300px] pt-9 lg:mr-6 xl:mr-24">
      <div className="absolute inset-x-[-12px] top-0 z-20">
        <NotificationBanner {...lpBanner(STAMP_BANNER)} />
      </div>
      <HeroCardStack showQR />
    </div>
  );
}
