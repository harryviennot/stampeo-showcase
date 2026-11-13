import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
import { LEVELS_ON_A_ROW, LevelCards } from "../../shared/LevelCards";
import { LpSection } from "../../shared/LpSection";
import { HoverRows } from "../../platform/HoverRows";
import { PointsMini, RewardsMini, StampsMini } from "./CounterMinis";

/**
 * "One screen for every kind of visit": a row each for stamps, points,
 * rewards and levels, with the Scanner screen that handles it drawn beside the
 * words. The rows open on hover, focus or tap, and every one is open on a phone.
 */
export function CounterSection() {
  const { eyebrow, title, lead, rows } = MOBILE_SCANNER_PREVIEW.counter;

  return (
    <LpSection section="counter" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <HoverRows
        items={rows}
        stackOnPhone={288}
        visuals={{
          stamps: <StampsMini />,
          points: <PointsMini />,
          rewards: <RewardsMini />,
          levels: <LevelCards size={LEVELS_ON_A_ROW} />,
        }}
      />
    </LpSection>
  );
}
