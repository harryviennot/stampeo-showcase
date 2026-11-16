import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { LpSection } from "../../shared/LpSection";
import { BlindSpots } from "./BlindSpots";

/**
 * "What a paper card can't tell you": production's blind-spot cards, finished. Six stamped questions that open on
 * a handwritten ??? and turn, from the control or by a tap, to the answers the sample café's dashboard gives on
 * every plan.
 */
export function BlindSpotsSection() {
  const { eyebrow, title, lead } = ANALYTICS_PREVIEW.blindSpots;

  return (
    <LpSection section="blind_spots" eyebrow={eyebrow} title={title} lead={lead} align="center" tinted>
      <BlindSpots />
    </LpSection>
  );
}
