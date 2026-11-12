import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { lpBanner } from "../shared/banner";
import { LpSpotlight } from "../shared/LpSpotlight";
import { PlanLine } from "../shared/PlanLine";

const messages = FEATURES.messages;

/** Automatic messages (every plan) and broadcasts (Growth and Pro), beside a lock screen with both banners. */
export function MessagesSpotlight() {
  return (
    <LpSpotlight
      section="spotlight_messages"
      title={messages.title}
      lead={messages.lead}
      cropOnPhone
      visual={
        <NotificationPhoneDemo notifications={messages.banners.map(lpBanner)} animate={false} eager={false} />
      }
    >
      <PlanLine>{messages.broadcast}</PlanLine>
    </LpSpotlight>
  );
}
