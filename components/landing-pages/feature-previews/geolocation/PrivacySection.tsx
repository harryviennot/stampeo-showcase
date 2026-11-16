import { GEOLOCATION_PREVIEW } from "@/lib/landing-pages/copy/previews/geolocation";
import { STAMPED_STAGE } from "../../platform/classes";
import { FactList } from "../../shared/FactList";
import { LpSection } from "../../shared/LpSection";
import { PrivacyDiagram } from "./PrivacyDiagram";

/** A stamped stage with the drawing of where a location goes (nowhere past the phone), beside the three facts that say it in words. */
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
