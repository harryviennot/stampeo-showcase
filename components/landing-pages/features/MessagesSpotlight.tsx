import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";
import { LpSpotlight } from "../shared/LpSpotlight";
import { CroppedPhone } from "./CroppedPhone";

const messages = FEATURES.messages;

/**
 * Automatic messages (every plan) and broadcasts (Growth and Pro), beside a
 * lock screen with both banners stacked. The broadcast line carries its plan
 * label in the same paragraph, so the claim never prints without it.
 */
export function MessagesSpotlight() {
  return (
    <LpSpotlight
      section="spotlight_messages"
      title={messages.title}
      lead={messages.lead}
      visual={
        <CroppedPhone flush>
          <NotificationPhoneDemo
            notifications={messages.banners.map(lpBanner)}
            animate={false}
            eager={false}
          />
        </CroppedPhone>
      }
    >
      <p className="mt-6 max-w-xl text-base text-[var(--foreground)]">
        <span className="mr-2 inline-block rounded-full bg-[var(--accent)]/10 px-3 py-1 align-middle text-xs font-bold text-[var(--accent)]">
          {SHARED.broadcastPlans}
        </span>
        {messages.broadcast}
      </p>
    </LpSpotlight>
  );
}
