import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";

/** The phone's width on a phone; desktop scales it to 320px, the How-to hero phone's width. */
const PHONE_WIDTH = 280;

/**
 * The Outcomes hero: a lock screen with Aurevo's stamp notification already on
 * it. It does not cycle, so the first paint is the finished picture.
 */
export function OutcomesHeroVisual() {
  return (
    <div className="h-[572px] w-[280px] shrink-0 lg:h-[654px] lg:w-[320px]">
      <div className="origin-top-left lg:scale-[1.143]" style={{ width: PHONE_WIDTH }}>
        <NotificationPhoneDemo
          notifications={[lpBanner(STAMP_BANNER)]}
          animate={false}
          eager
          width={PHONE_WIDTH}
        />
      </div>
    </div>
  );
}
