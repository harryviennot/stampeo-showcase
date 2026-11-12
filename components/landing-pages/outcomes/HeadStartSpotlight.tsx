import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { AurevoCard } from "../shared/AurevoCard";
import { LpHeading, LpSection } from "../shared/LpSection";
import { HeadStartToggle } from "./HeadStartToggle";
import { LpTrialButton } from "../shared/LpTrialButton";

/**
 * The sourced head-start finding: an empty 8-stamp card, or a 10-stamp card that comes with two, so both need
 * eight more stamps to finish (as in the study), and how many finished each.
 */
export function HeadStartSpotlight() {
  const { title, lead } = OUTCOMES.headStart;

  return (
    <LpSection section="outcome_head_start">
      <HeadStartToggle
        heading={<LpHeading title={title} lead={lead} />}
        emptyCard={<AurevoCard stamps={0} width={300} />}
        headStartCard={<AurevoCard stamps={2} total={10} width={300} />}
        cta={<LpTrialButton />}
      />
    </LpSection>
  );
}
