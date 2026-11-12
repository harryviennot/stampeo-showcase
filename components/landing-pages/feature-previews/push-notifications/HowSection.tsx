import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { iphoneLayout } from "@/lib/devices/iphone";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { STAMP_BANNER } from "@/lib/landing-pages/copy/shared";
import { StepsTable } from "../../platform/StepsTable";
import { LpSection } from "../../shared/LpSection";
import { lpBanner } from "../../shared/banner";

/** Both phones are drawn at 280px and shrunk to 160px on a phone. */
const PHONE = { full: 280, narrow: 160 };

/**
 * "You scan. Their phone lights up.": the Scanner app's finished stamp and the lock
 * screen it lights up, side by side, sinking behind the table of the three steps.
 */
export function HowSection() {
  return (
    <LpSection section="how" eyebrow={COPY.how.eyebrow} title={COPY.how.title} lead={COPY.how.lead} align="center">
      <StepsTable
        cells={COPY.how.cells}
        visual={
          <>
            <ScannerLoop still width={PHONE.full} narrowWidth={PHONE.narrow} />
            <div
              role="img"
              aria-label={`A lock screen with a notification from ${STAMP_BANNER.sender}: ${STAMP_BANNER.body}`}
            >
              <ScaledBox
                width={PHONE.full}
                height={iphoneLayout(PHONE.full).height}
                narrowTo={PHONE.narrow}
              >
                <NotificationPhoneDemo animate={false} width={PHONE.full} notifications={[lpBanner(STAMP_BANNER)]} />
              </ScaledBox>
            </div>
          </>
        }
      />
    </LpSection>
  );
}
