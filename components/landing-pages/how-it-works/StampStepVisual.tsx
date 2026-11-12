import { NotificationBanner } from "@/components/features/notifications-push/NotificationBanner";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { ScanDemo } from "@/components/features/scanner-mobile/ScanDemo";
import { InkArrow } from "@/components/ui/InkAnnotation";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { lpBanner } from "../shared/banner";
import { PhoneCrop } from "../shared/PhoneCrop";

const CAPTION = "mt-4 text-center text-sm font-semibold text-[var(--foreground)]";

/**
 * The stamp, from both sides: the staff phone scanning (no recording dot, no
 * timing) and the customer's lock screen with the café's own default stamp
 * notification, kept on screen. On a phone the lock screen is a strip with the
 * banner, since two whole phones would be a screen and a half; from `lg` it is
 * the phone.
 */
export function StampStepVisual() {
  const { youCaption, theyCaption } = HOW_IT_WORKS.stamp;
  const notification = lpBanner(STAMP_BANNER);

  return (
    <div className="mx-auto flex w-full max-w-[340px] flex-col items-center gap-3 lg:max-w-none lg:flex-row lg:items-start lg:justify-center lg:gap-8">
      <figure className="flex w-full flex-col items-center lg:w-auto">
        <PhoneCrop height={440}>
          <ScanDemo chrome="minimal" />
        </PhoneCrop>
        <figcaption className={CAPTION}>{youCaption}</figcaption>
      </figure>

      <InkArrow variant="down" className="h-12 w-7 lg:hidden" />
      <InkArrow variant="right" className="hidden w-20 lg:mt-[250px] lg:block" />

      <figure className="flex w-full flex-col items-center lg:w-auto">
        <div className="w-full rounded-[28px] bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-3 pb-4 pt-6 shadow-xl ring-1 ring-black/10 lg:hidden">
          <p className="text-center text-[56px] font-extralight leading-none tracking-tight text-white">9:41</p>
          <div className="mt-5">
            <NotificationBanner {...notification} />
          </div>
        </div>
        <div className="hidden lg:block">
          <NotificationPhoneDemo notifications={[notification]} animate={false} eager={false} />
        </div>
        <figcaption className={CAPTION}>{theyCaption}</figcaption>
      </figure>
    </div>
  );
}
