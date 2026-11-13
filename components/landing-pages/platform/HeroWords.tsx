import { AccentText } from "@/lib/landing-pages/AccentText";
import type { PlanChip as Plan } from "@/lib/landing-pages/copy/types";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";
import { EYEBROW } from "../shared/LpSection";
import { PlanChip } from "../shared/PlanChip";

/** The classes of each element of the words, for the two heroes: plain centred paragraphs over a fan, or a column of their own. */
const LOOK = {
  fan: {
    eyebrow: `mb-4 text-center ${EYEBROW} text-[var(--accent-hover)]`,
    h1: "text-hero mx-auto max-w-4xl text-balance text-center",
    sub: "mx-auto mt-4 max-w-2xl text-center text-pretty text-lead text-[var(--muted-foreground)]",
  },
  column: {
    eyebrow: `${EYEBROW} text-[var(--accent-hover)]`,
    h1: "text-hero text-balance",
    sub: "mt-4 max-w-2xl text-pretty text-lead text-[var(--muted-foreground)]",
  },
} as const;

/**
 * What a Platform-style hero says, from its registry entry: a small label (with a plan chip beside it in a
 * `column` hero when it has one), the headline with its accent, and the sub. A page with no label or sub shows none.
 */
export function HeroWords({
  slug,
  look,
  eyebrowPlan,
}: Readonly<{ slug: LandingSlug; look: keyof typeof LOOK; eyebrowPlan?: Plan }>) {
  const { eyebrow, h1, accent, sub } = LANDING_PAGES[slug].hero;
  const classes = LOOK[look];

  return (
    <>
      {eyebrow &&
        (look === "column" ? (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <p className={classes.eyebrow}>{eyebrow}</p>
            {eyebrowPlan && <PlanChip plan={eyebrowPlan} />}
          </div>
        ) : (
          <p className={classes.eyebrow}>{eyebrow}</p>
        ))}
      <h1 className={classes.h1}>
        <AccentText text={h1} accent={accent} />
      </h1>
      {sub && <p className={classes.sub}>{sub}</p>}
    </>
  );
}
