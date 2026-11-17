import { AnnotatedWalletCard } from "@/components/features/design-de-carte/AnnotatedWalletCard";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { anatomyDesigns, type AnatomyLabels } from "@/lib/landing-pages/previews/card-design-samples";
import { LpHeading, LpSection } from "../../shared/LpSection";

/**
 * A spa's card, or a boutique's on points, with its handwritten labels under the page's own header.
 * The jump target of the hero's second button.
 */
export function AnatomySection() {
  const { anatomy, cardFields } = useLandingCopy().previews.cardDesign.CARD_DESIGN_PREVIEW;
  const { eyebrow, title, lead, labels, mobileLabels, pointsLabels, pointsMobileLabels } = anatomy;
  /** What each part of each program's card is called: the top right of a stamp card is its count, of a points card its balance. */
  const names: AnatomyLabels = {
    stamps: { desktop: labels, mobile: mobileLabels },
    points: { desktop: pointsLabels, mobile: pointsMobileLabels },
  };

  return (
    <LpSection section="anatomy" anchor bare>
      <AnnotatedWalletCard
        heading={<LpHeading eyebrow={eyebrow} title={title} lead={lead} align="center" />}
        sectionClassName="py-16 lg:py-24"
        toggleSize="lg"
        designs={anatomyDesigns(cardFields)}
        labels={names}
      />
    </LpSection>
  );
}
