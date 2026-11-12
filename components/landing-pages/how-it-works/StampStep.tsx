import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { LpSection } from "../shared/LpSection";
import { StampStepVisual } from "./StampStepVisual";
import { StepHeading } from "./StepHeading";

/** Step 3: one scan is the whole job, and the customer sees it at once. The heading sits on the left like the other steps'. */
export function StampStep() {
  const { label, title, lead } = HOW_IT_WORKS.stamp;

  return (
    <LpSection section="step_stamp" anchor>
      <ScrollReveal>
        <StepHeading number={3} label={label} title={title} lead={lead} />
      </ScrollReveal>
      <ScrollReveal delay={150} className="mt-10 lg:mt-14">
        <StampStepVisual />
      </ScrollReveal>
    </LpSection>
  );
}
