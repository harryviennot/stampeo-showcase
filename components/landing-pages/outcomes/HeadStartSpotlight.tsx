import { CTAButton } from "@/components/ui/CTAButton";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { AurevoCard } from "../shared/AurevoCard";
import { LpHeading, LpSection } from "../shared/LpSection";
import { HeadStartToggle } from "./HeadStartToggle";

/** The sourced head-start finding: a card that starts empty or with two stamps, and how many finished it. */
export function HeadStartSpotlight() {
  const { title, lead } = OUTCOMES.headStart;

  return (
    <LpSection section="outcome_head_start">
      <HeadStartToggle
        heading={<LpHeading title={title} lead={lead} />}
        emptyCard={<AurevoCard stamps={0} width={300} />}
        headStartCard={<AurevoCard stamps={2} width={300} />}
        cta={<CTAButton label={SHARED.cta} variant="outline" trackAs="feature_cta" className="w-full sm:w-auto" />}
      />
    </LpSection>
  );
}
