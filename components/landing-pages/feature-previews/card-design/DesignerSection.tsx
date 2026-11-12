import { CompactPlayground } from "@/components/features/design-de-carte/CompactPlayground";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LpSection } from "../../shared/LpSection";
import { LpTrialButton } from "../../shared/LpTrialButton";

/**
 * "Design it your way": the live card and its controls, with the trial offered
 * right under them. It is the jump target of the hero's second button.
 */
export function DesignerSection() {
  const { eyebrow, title, lead } = CARD_DESIGN_PREVIEW.playground;

  return (
    <LpSection section="playground" anchor eyebrow={eyebrow} title={title} lead={lead} align="center">
      <CompactPlayground />
      <div className="mt-10 flex justify-center lg:mt-12">
        <LpTrialButton />
      </div>
    </LpSection>
  );
}
