import { FanParallax } from "@/components/landing-variant/FanParallax";
import { HeroCardFan } from "@/components/landing-variant/HeroCardFan";
import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { PLATFORM_FAN_SLOTS } from "@/lib/hero-fan";
import { AccentText } from "@/lib/landing-pages/AccentText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LANDING_PAGES } from "@/lib/landing-pages/pages";
import { LpSection } from "../shared/LpSection";
import { LpCtaPair } from "./LpCtaPair";

/**
 * The Platform page's hero: the headline, the homepage's arch of cards dealt
 * with the page's own seven, then the trial and demo actions under it. The
 * headline and the actions are all the words there are; the numbers come
 * further down. On a phone the actions tuck up under the arch; from `lg` they
 * sit clear below its inner cards, between the outer ones.
 */
export function PlatformHero() {
  const { hero } = LANDING_PAGES.platform;

  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-7">
        <Container>
          <h1 className="text-hero mx-auto max-w-4xl text-balance text-center">
            <AccentText text={hero.h1} accent={hero.accent} />
          </h1>
        </Container>

        <FanParallax>
          <div className="mt-8 lg:mt-6">
            <HeroCardFan slots={PLATFORM_FAN_SLOTS} />
          </div>
        </FanParallax>

        <Container className="relative z-10 -mt-10 lg:-mt-8 xl:mt-0">
          <div className="flex flex-col items-center gap-3">
            <LpCtaPair location="hero" />
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              <RegionText raw={SHARED.reassurance} />
            </p>
          </div>
        </Container>
      </section>
    </LpSection>
  );
}
