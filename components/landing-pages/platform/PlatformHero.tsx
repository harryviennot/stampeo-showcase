import { FanParallax } from "@/components/landing-variant/FanParallax";
import { HeroCardFan } from "@/components/landing-variant/HeroCardFan";
import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { PLATFORM_FAN_SLOTS, type FanSlot } from "@/lib/hero-fan";
import { AccentText } from "@/lib/landing-pages/AccentText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";
import { EYEBROW, LpSection } from "../shared/LpSection";
import { LpCtaPair, type SecondaryAction } from "./LpCtaPair";

/**
 * A Platform-style hero: the headline, the homepage's arch of cards dealt
 * with the page's own seven (Platform's unless a preview brings its `slots`),
 * then the trial and second actions under it. Platform's is the headline and
 * the actions alone; a preview's registry entry adds a small label above the
 * headline and a sub under it. On a phone the actions tuck up under the arch;
 * from `lg` they sit clear below its inner cards, between the outer ones.
 */
export function PlatformHero({
  slug = "platform",
  slots = PLATFORM_FAN_SLOTS,
  secondary,
}: Readonly<{ slug?: LandingSlug; slots?: FanSlot[]; secondary?: SecondaryAction | null }>) {
  const { h1, accent, eyebrow, sub } = LANDING_PAGES[slug].hero;

  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-7">
        <Container>
          {eyebrow && <p className={`mb-4 text-center ${EYEBROW} text-[var(--accent-hover)]`}>{eyebrow}</p>}
          <h1 className="text-hero mx-auto max-w-4xl text-balance text-center">
            <AccentText text={h1} accent={accent} />
          </h1>
          {sub && (
            <p className="mx-auto mt-4 max-w-2xl text-center text-pretty text-lead text-[var(--muted-foreground)]">{sub}</p>
          )}
        </Container>

        <FanParallax>
          <div className="mt-8 lg:mt-6">
            <HeroCardFan slots={slots} />
          </div>
        </FanParallax>

        <Container className="relative z-10 -mt-10 lg:-mt-8 xl:mt-0">
          <div className="flex flex-col items-center gap-3">
            <LpCtaPair location="hero" secondary={secondary} />
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              <RegionText raw={SHARED.reassurance} />
            </p>
          </div>
        </Container>
      </section>
    </LpSection>
  );
}
