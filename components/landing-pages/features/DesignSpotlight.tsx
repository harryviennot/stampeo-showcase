import { CardStyleGallery } from "@/components/features/design-de-carte/CardStyleGallery";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { LpSection } from "../shared/LpSection";

/**
 * The card-style carousel across the full width, on the page's one tinted
 * band (`LpSection`'s `tinted` colour and beat), under the page's own heading
 * and without the gallery's CTA (the page has one trial button label). The
 * heading stays centred over the centred carousel, as the Outcomes figure's
 * does over its figure.
 */
export function DesignSpotlight() {
  return (
    <LpSection section="spotlight_design" bare>
      <CardStyleGallery
        showCta={false}
        heading={{ title: FEATURES.design.title, subtitle: FEATURES.design.lead }}
        sectionClassName="py-16 lg:py-24 bg-[var(--blog-bg)]"
      />
    </LpSection>
  );
}
