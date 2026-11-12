import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";
import { LpSpotlight } from "../shared/LpSpotlight";

/**
 * Fill a slow day: a lock screen with the café's broadcast. The plans a
 * broadcast comes with and the "no texting fees" note share one line under the
 * lead, so the fee claim never reads as a promise to every plan.
 */
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
      <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-[var(--foreground)]">
        <span className="rounded-full bg-[var(--blog-bg)] px-3 py-1 text-sm font-semibold ring-1 ring-[var(--border)]">
          {SHARED.broadcastPlans}
        </span>
        {slowDays.noFees}
      </p>
    </LpSpotlight>
  );
}
