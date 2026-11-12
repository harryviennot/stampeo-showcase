import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LpCtaPair } from "../../platform/LpCtaPair";
import { NumberFigures } from "../../platform/NumbersBlock";
import { LpSection } from "../../shared/LpSection";

/** "Everything you need to make it yours": the designer's three figures, then the trial and the jump back to the designer. */
export function DesignFigures() {
  const { eyebrow, title, figures } = CARD_DESIGN_PREVIEW.numbers;

  return (
    <LpSection section="numbers" eyebrow={eyebrow} title={title} align="center">
      <NumberFigures items={[...figures]} />
      <div className="mt-12 flex justify-center lg:mt-14">
        <LpCtaPair location="feature_cta" secondary={{ label: CARD_DESIGN_PREVIEW.designerLink, href: "#playground" }} />
      </div>
    </LpSection>
  );
}
