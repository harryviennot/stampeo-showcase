import { GEOLOCATION_PREVIEW } from "@/lib/landing-pages/copy/previews/geolocation";
import { STAMPED_STAGE } from "../../platform/classes";
import { FactList } from "../../shared/FactList";
import { LpSection } from "../../shared/LpSection";
import { PrivacyDiagram } from "./PrivacyDiagram";

/**
 * "Their location will stay on their phone": a stamped stage with the drawing of where a location goes (nowhere
 * past the phone) and the three facts that say the same in words, side by side from `lg`.
 */
export function PrivacySection() {
  const { eyebrow, title, lead, facts, alt } = GEOLOCATION_PREVIEW.privacy;

  return (
    <LpSection section="privacy" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className={`mx-auto grid max-w-[1040px] items-center gap-8 p-5 text-left sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12 ${STAMPED_STAGE}`}>
        <div role="img" aria-label={alt} className="mx-auto w-full max-w-[300px] lg:max-w-[440px]">
          <PrivacyDiagram />
        </div>
        <FactList facts={facts} />
      </div>
    </LpSection>
  );
}
