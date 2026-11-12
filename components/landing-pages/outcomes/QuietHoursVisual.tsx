import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { InkArrow } from "@/components/ui/InkAnnotation";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { lpBanner } from "../shared/banner";
import { SampleCapture } from "../shared/SampleCapture";

/** The caption under a capture: its margin and one line of text, which the banner on a phone sits above. */
const CAPTION = 36;

/**
 * Find a quiet hour, then fill it. On a phone: the busiest-times capture cut
 * short, with the broadcast banner over its faded bottom. From `lg`: that
 * phone, an arrow, and the lock screen the broadcast lands on.
 */
export function QuietHoursVisual() {
  const banner = lpBanner(OUTCOMES.slowDays.banner);

  return (
    <div className="flex flex-col items-center lg:flex-row lg:items-start lg:justify-center lg:gap-6">
      <div className="relative w-full lg:w-auto">
        <SampleCapture view="phone-busiest" crop={360} alt={OUTCOMES.slowDays.alt} />
        <div
          className="absolute inset-x-4 mx-auto max-w-[340px] lg:hidden"
          style={{ bottom: CAPTION + 12 }}
        >
          <NotificationBanner {...banner} className="bg-white/90!" />
        </div>
      </div>

      {/* The arrow sits at the phones' mid height: a 280px phone is 572px tall. */}
      <InkArrow variant="right" delay={0.5} className="hidden h-8 w-20 shrink-0 lg:mt-[260px] lg:block" />

      <div className="hidden lg:block">
        <NotificationPhoneDemo notifications={[banner]} animate={false} eager={false} width={280} />
      </div>
    </div>
  );
}
