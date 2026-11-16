import { ScaledBox } from "@/components/ui/ScaledBox";
import { iphoneLayout } from "@/lib/devices/iphone";
import { GEOLOCATION_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/geolocation";
import { STEPS_PHONE, StepsTable } from "../../platform/StepsTable";
import { LpSection } from "../../shared/LpSection";
import { LockScreenPhone } from "./LockScreenPhone";

/** Three steps in the future tense, and the lock screen they end on, sinking behind the table. */
export function HowSection() {
  const { eyebrow, title, lead, cells } = COPY.how;
  const { sender, body } = COPY.banner;

  return (
    <LpSection section="how" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <StepsTable
        cells={cells}
        visual={
          <div role="img" aria-label={`A lock screen with a notification from ${sender}: ${body}`}>
            <ScaledBox width={STEPS_PHONE.full} height={iphoneLayout(STEPS_PHONE.full).height} narrowTo={STEPS_PHONE.narrow}>
              <LockScreenPhone width={STEPS_PHONE.full} />
            </ScaledBox>
          </div>
        }
      />
    </LpSection>
  );
}
