import { CompactPlayground } from "@/components/features/design-de-carte/CompactPlayground";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LpCtaPair } from "../../platform/LpCtaPair";
import { STAMPED_STAGE } from "../../platform/classes";
import { LpSection } from "../../shared/LpSection";

/** The live card and its controls on one stamped stage, with the trial under them: the jump target of the hero's second button. */
export function DesignerSection() {
  const { eyebrow, title, lead } = CARD_DESIGN_PREVIEW.playground;

  return (
    <LpSection section="playground" anchor eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className={`${STAMPED_STAGE} p-5 sm:p-8 lg:p-10`}>
        <CompactPlayground touchTargets />
      </div>
      <div className="mt-10 flex justify-center lg:mt-12">
        <LpCtaPair location="feature_cta" secondary={null} />
      </div>
    </LpSection>
  );
}
