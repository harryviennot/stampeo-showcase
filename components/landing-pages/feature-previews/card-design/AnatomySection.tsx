import { AnnotatedWalletCard } from "@/components/features/design-de-carte/AnnotatedWalletCard";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LpHeading, LpSection } from "../../shared/LpSection";

/**
 * "Every part of the card is yours": the card with its handwritten labels (numbered dots and chips on a
 * phone), under the page's own header. The card brings its own stamps and points switch.
 */
export function AnatomySection() {
  const { eyebrow, title, lead } = CARD_DESIGN_PREVIEW.anatomy;

  return (
    <LpSection section="anatomy" bare>
      <AnnotatedWalletCard
        heading={<LpHeading eyebrow={eyebrow} title={title} lead={lead} align="center" />}
        sectionClassName="py-16 lg:py-24"
        toggleSize="lg"
      />
    </LpSection>
  );
}
