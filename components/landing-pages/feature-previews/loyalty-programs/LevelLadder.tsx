import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { LADDER_CARDS } from "@/lib/landing-pages/previews/loyalty-ladder";
import { LadderLevel } from "./LadderLevel";

/** How far each level starts below the top from `lg` (Tailwind sees the whole class): 48px a step, Bronze lowest. */
const RISE = ["lg:pt-24", "lg:pt-12", "lg:pt-0"] as const;

/**
 * The barbershop's ladder: one row a level on a phone, Bronze first; from `lg` three panels that climb like a
 * staircase, Bronze lowest. The cards are described once, by `levels.alt`, on the first.
 */
export function LevelLadder() {
  const { ladder, labels, alt } = LOYALTY_PROGRAMS_PREVIEW.levels;

  return (
    <ol className="mx-auto grid max-w-[1040px] gap-4 lg:grid-cols-3 lg:gap-6">
      {ladder.map((level, index) => (
        <LadderLevel
          key={level.name}
          level={level}
          card={LADDER_CARDS[index]}
          labels={labels}
          rise={RISE[index]}
          climbs={index > 0}
          top={index === ladder.length - 1}
          alt={index === 0 ? alt : undefined}
        />
      ))}
    </ol>
  );
}
