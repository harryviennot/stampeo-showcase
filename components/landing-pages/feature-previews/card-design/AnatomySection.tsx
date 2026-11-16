import { AnnotatedWalletCard } from "@/components/features/design-de-carte/AnnotatedWalletCard";
import { ANATOMY_DESIGNS, type AnatomyLabels } from "@/lib/landing-pages/previews/card-design-samples";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LpHeading, LpSection } from "../../shared/LpSection";

const { eyebrow, title, lead, labels, mobileLabels, pointsLabels, pointsMobileLabels } = CARD_DESIGN_PREVIEW.anatomy;

/** What each part of each program's card is called: the top right of a stamp card is its count, of a points card its balance. */
const LABELS: AnatomyLabels = {
  stamps: { desktop: labels, mobile: mobileLabels },
  points: { desktop: pointsLabels, mobile: pointsMobileLabels },
};

/**
 * A spa's card, or a boutique's on points, with its handwritten labels under the page's own header.
 * The jump target of the hero's second button.
 */
export function AnatomySection() {
  return (
    <LpSection section="anatomy" anchor bare>
      <AnnotatedWalletCard
        heading={<LpHeading eyebrow={eyebrow} title={title} lead={lead} align="center" />}
        sectionClassName="py-16 lg:py-24"
        toggleSize="lg"
        designs={ANATOMY_DESIGNS}
        labels={LABELS}
      />
    </LpSection>
  );
}
