import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { LpCtaPair } from "../../platform/LpCtaPair";
import { NumberFigures } from "../../platform/NumberFigures";
import { LpSection } from "../../shared/LpSection";

/** The two measured figures, each over its line. */
const ITEMS = COPY.numbers.figures.map(({ value, text }) => ({ value, label: text }));

/**
 * "Your customers keep the card": the two figures Stampeo measures, handwritten, with
 * where they come from under them and the trial offered right after. Two figures sit as a
 * centred pair, not in a row of three with an empty place.
 */
export function NumbersSection() {
  return (
    <LpSection
      section="numbers"
      eyebrow={COPY.numbers.eyebrow}
      title={COPY.numbers.title}
      lead={COPY.numbers.lead}
      align="center"
    >
      <div className="sm:[&>ul]:mx-auto sm:[&>ul]:max-w-3xl sm:[&>ul]:grid-cols-2">
        <NumberFigures items={ITEMS} source={COPY.numbers.sourceLine} />
      </div>
      <div className="mt-12 flex justify-center lg:mt-14">
        <LpCtaPair location="feature_cta" secondary={null} />
      </div>
    </LpSection>
  );
}
