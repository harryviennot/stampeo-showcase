import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { LpSpotlight } from "../shared/LpSpotlight";
import { PhoneCrop } from "../shared/PhoneCrop";
import { AlwaysThereVisual } from "./AlwaysThereVisual";

/** The card is always on them, and every stamp pings their phone. */
export function AlwaysSpotlight() {
  const { title, lead } = OUTCOMES.always;

  return (
    <LpSpotlight
      section="outcome_always"
      title={title}
      lead={lead}
      visual={
        <PhoneCrop height={520}>
          <AlwaysThereVisual />
        </PhoneCrop>
      }
    />
  );
}
