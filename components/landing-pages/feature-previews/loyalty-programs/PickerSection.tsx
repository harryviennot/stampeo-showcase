import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpSection } from "../../shared/LpSection";
import { SampleCard } from "../card-design/SampleCard";
import { PickerCard } from "./PickerCard";

/** The sample cards the suggestion shows are drawn this wide. */
const CARD_WIDTH = 132;

/** Four questions, then a suggestion: stamps, points or either, and whether to add levels. */
export function PickerSection() {
  const { eyebrow, title, lead, ...copy } = LOYALTY_PROGRAMS_PREVIEW.picker;
  // Drawn here on the server and handed to the quiz, so the quiz's bundle stays small.
  const cards = {
    stamps: <SampleCard id="lustre" width={CARD_WIDTH} />,
    points: <SampleCard id="ode" width={CARD_WIDTH} />,
  };

  return (
    <LpSection section="picker" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <PickerCard copy={copy} cards={cards} cta={SHARED.cta} />
    </LpSection>
  );
}
