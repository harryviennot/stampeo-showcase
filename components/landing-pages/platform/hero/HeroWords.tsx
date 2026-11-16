import { AccentText } from "@/lib/landing-pages/AccentText";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";

/** The classes of the headline and the sub, for the two heroes: centred over a fan, or in a column of their own. */
const LOOK = {
  fan: {
    h1: "text-hero mx-auto max-w-4xl text-balance text-center",
    sub: "mx-auto mt-4 max-w-2xl text-center text-pretty text-lead text-[var(--muted-foreground)]",
  },
  column: {
    h1: "text-hero text-balance",
    sub: "mt-4 max-w-2xl text-pretty text-lead text-[var(--muted-foreground)] max-lg:mx-auto",
  },
} as const;

/** What a Platform-style hero says, from its registry entry: the headline with its accent, and the sub. A page with no sub shows none. */
export function HeroWords({ slug, look }: Readonly<{ slug: LandingSlug; look: keyof typeof LOOK }>) {
  const { h1, accent, sub } = LANDING_PAGES[slug].hero;
  const classes = LOOK[look];

  return (
    <>
      <h1 className={classes.h1}>
        <AccentText text={h1} accent={accent} />
      </h1>
      {sub && <p className={classes.sub}>{sub}</p>}
    </>
  );
}
