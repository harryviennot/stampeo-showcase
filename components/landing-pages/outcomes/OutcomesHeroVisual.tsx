import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";

/**
 * The Outcomes hero: a lock screen with Aurevo's stamp notification already on
 * it. It does not cycle, so the first paint is the finished picture.
 */
export function OutcomesHeroVisual() {
  return <NotificationPhoneDemo notifications={[lpBanner(STAMP_BANNER)]} animate={false} eager />;
}
