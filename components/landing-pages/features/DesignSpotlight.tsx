import { CardStyleGallery } from "@/components/features/design-de-carte/CardStyleGallery";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { LpSection, TINTED_BAND } from "../shared/LpSection";

/** The card-style carousel under the page's heading, on its tinted band, without the gallery's CTA. */
export function DesignSpotlight() {
  return (
    <LpSection section="spotlight_design" bare>
      <CardStyleGallery
        showCta={false}
        heading={{ title: FEATURES.design.title, subtitle: FEATURES.design.lead }}
        sectionClassName={TINTED_BAND}
      />
    </LpSection>
  );
}
