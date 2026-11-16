import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { LpSection } from "../../shared/LpSection";
import { BlindSpots } from "./BlindSpots";

/** Six stamped questions that open on a handwritten ??? and turn, from the control or by a tap, to the answers every plan's dashboard gives. */
export function BlindSpotsSection() {
  const { eyebrow, title, lead } = ANALYTICS_PREVIEW.blindSpots;

  return (
    <LpSection section="blind_spots" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <BlindSpots />
    </LpSection>
  );
}
