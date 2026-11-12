import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { lpBanner } from "../shared/banner";
import { LpSpotlight } from "../shared/LpSpotlight";
import { PlanLine } from "../shared/PlanLine";

/** Fill a slow day: a lock screen with the café's broadcast, and its plan line right under the lead. */
export function SlowDaysSpotlight() {
  const slowDays = OUTCOMES.slowDays;

  return (
    <LpSpotlight
      section="outcome_slow_days"
      title={slowDays.title}
      lead={slowDays.lead}
      side="left"
      cropOnPhone
      visual={<NotificationPhoneDemo notifications={[lpBanner(slowDays.banner)]} animate={false} eager={false} />}
    >
      <PlanLine>{slowDays.noFees}</PlanLine>
    </LpSpotlight>
  );
}
