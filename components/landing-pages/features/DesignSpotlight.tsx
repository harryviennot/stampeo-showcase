import { CardStyleGallery } from "@/components/features/design-de-carte/CardStyleGallery";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { LpSection } from "../shared/LpSection";

/**
 * The card-style carousel across the full width, on the page's one tinted
 * band, under the page's own heading and without the gallery's CTA (the page
 * has one trial button label).
 */
export function DesignSpotlight() {
  return (
    <LpSection section="spotlight_design" bare>
      <CardStyleGallery
        showCta={false}
        heading={{ title: FEATURES.design.title, subtitle: FEATURES.design.lead }}
      />
    </LpSection>
  );
}
