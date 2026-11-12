import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { FactList } from "../shared/FactList";
import { LevelCards } from "../shared/LevelCards";
import { LpHeading, LpSection } from "../shared/LpSection";
import { PlanChip } from "../shared/PlanChip";

/**
 * Give regulars something to reach: the barbershop's card at three levels
 * under the level-up notification. On a phone the cards sit between the
 * heading and the facts; from `lg` they sit on the left, the words on the right.
 */
export function LevelsSpotlight() {
  const { title, lead } = OUTCOMES.levels;

  return (
    <LpSection section="outcome_levels">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6">
        <ScrollReveal className="lg:col-start-2 lg:row-start-1 lg:self-end">
          <LpHeading title={title} lead={lead} />
        </ScrollReveal>

        <ScrollReveal
          delay={150}
          variant="left"
          className="flex justify-center lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:items-center"
        >
          <LevelCards banner />
        </ScrollReveal>

        <ScrollReveal delay={100} className="lg:col-start-2 lg:row-start-2 lg:self-start">
          <PlanChip plan="Every plan" />
          <FactList facts={OUTCOMES.levels.facts} className="mt-6" />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
