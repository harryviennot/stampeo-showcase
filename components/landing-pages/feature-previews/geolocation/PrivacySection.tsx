import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { CARD_SHADOW } from "../../platform/classes";
import { FactList } from "../../shared/FactList";
import { LpSection } from "../../shared/LpSection";
import { PrivacyDiagram } from "./PrivacyDiagram";

const SURFACE = `rounded-[32px] bg-white ${CARD_SHADOW} ring-1 ring-black/5`;

/** A white card with the drawing of where a location goes (nowhere past the phone), beside the three facts that say it in words. */
export function PrivacySection() {
  const { eyebrow, title, lead, facts, alt } = useLandingCopy().previews.geolocation.GEOLOCATION_PREVIEW.privacy;

  return (
    <LpSection section="privacy" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className={`mx-auto grid max-w-[1040px] items-center gap-8 p-6 text-left sm:p-10 lg:grid-cols-2 lg:gap-12 lg:p-12 ${SURFACE}`}>
        <div role="img" aria-label={alt} className="mx-auto w-full max-w-[300px] lg:max-w-[440px]">
          <PrivacyDiagram />
        </div>
        <FactList facts={facts} />
      </div>
    </LpSection>
  );
}
