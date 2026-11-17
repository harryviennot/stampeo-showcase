import { NumberStamp } from "@/components/stamps/StampIcons";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { StepsTable, type StepCell } from "../../platform/StepsTable";
import { LpSection } from "../../shared/LpSection";
import { MessageToLockScreens } from "./MessageToLockScreens";

/** How a campaign works: one message, the same notification on every customer's lock screen, and the three steps under it. */
export function HowSection() {
  const COPY = useLandingCopy().previews.promotionalCampaigns.PROMOTIONAL_CAMPAIGNS_PREVIEW;
  /** The three steps as a table, each over its number. */
  const cells: StepCell[] = COPY.how.steps.map((step, index) => ({
    ...step,
    icon: (
      <span aria-hidden className="flex">
        <NumberStamp number={index + 1} size={40} color="var(--accent)" />
      </span>
    ),
  }));

  return (
    <LpSection section="how" anchor eyebrow={COPY.how.eyebrow} title={COPY.how.title} lead={COPY.how.lead} align="center">
      <MessageToLockScreens />
      <div className="mt-10 lg:mt-14">
        <StepsTable cells={cells} />
      </div>
    </LpSection>
  );
}
