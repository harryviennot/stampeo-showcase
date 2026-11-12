import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { lpBanner } from "../shared/banner";
import { WalletPhone } from "../shared/WalletPhone";

/**
 * The café's card open in Apple Wallet at 5 of 8, with the stamp notification
 * dropping over the top of the screen once when the section is revealed (still
 * for readers who ask for less motion).
 */
export function AlwaysThereVisual() {
  return (
    <div className="relative">
      <WalletPhone width={280} stamps={5} />
      {/* Just under the Dynamic Island of the 280px phone, inside its screen. */}
      <div className="absolute inset-x-[19px] top-[42px] z-20 -translate-y-6 opacity-0 transition-[translate,opacity] duration-700 ease-out delay-500 in-[.revealed]:translate-y-0 in-[.revealed]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none">
        <NotificationBanner {...lpBanner(OUTCOMES.always.banner)} className="bg-white/90!" />
      </div>
    </div>
  );
}
