import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { AurevoCard } from "../shared/AurevoCard";
import { LpHeading, LpSection } from "../shared/LpSection";
import { HeadStartToggle } from "./HeadStartToggle";
import { LpTrialButton } from "../shared/LpTrialButton";

/** The sourced head-start finding: a card that starts empty or with two stamps, and how many finished it. */
export function HeadStartSpotlight() {
  const { title, lead } = OUTCOMES.headStart;

  return (
    <LpSection section="outcome_head_start">
      <HeadStartToggle
        heading={<LpHeading title={title} lead={lead} />}
        emptyCard={<AurevoCard stamps={0} width={300} />}
        headStartCard={<AurevoCard stamps={2} width={300} />}
        cta={<LpTrialButton />}
      />
    </LpSection>
  );
}
