import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { LpHeading, LpSection } from "../shared/LpSection";
import { PlanLine } from "../shared/PlanLine";
import { QuietHoursVisual } from "./QuietHoursVisual";

/** Fill a quiet hour: the page's second tinted band, a centred heading over the pair of phones. */
export function QuietHoursSpotlight() {
  const { title, lead } = OUTCOMES.slowDays;

  return (
    <LpSection section="outcome_slow_days" tinted>
      <ScrollReveal>
        <LpHeading title={title} lead={lead} align="center" />
      </ScrollReveal>
      <ScrollReveal delay={150} className="mt-10 lg:mt-14">
        <QuietHoursVisual />
      </ScrollReveal>
      <ScrollReveal delay={100} className="mt-2 flex justify-center text-center">
        <PlanLine>{OUTCOMES.slowDays.noFees}</PlanLine>
      </ScrollReveal>
    </LpSection>
  );
}
