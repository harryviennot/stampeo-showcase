import { FanParallax } from "@/components/landing-variant/FanParallax";
import { HeroCardFan } from "@/components/landing-variant/HeroCardFan";
import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { splitAccent } from "@/lib/landing-pages/accent";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LANDING_PAGES } from "@/lib/landing-pages/pages";
import { LpCtaPair } from "../shared/LpCtaPair";
import { LpSection } from "../shared/LpSection";

/**
 * The Platform page's hero: the headline, the arch of sample cards, then the
 * trial and demo actions under it. The headline and the actions are all the
 * words there are; the numbers come further down. On a laptop the actions rise
 * into the arch between its outer cards.
 */
export function PlatformHero() {
  const { hero } = LANDING_PAGES.platform;
  const { before, accent, after } = splitAccent(hero.h1, hero.accent);

  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-20">
        <Container>
          <h1 className="text-hero mx-auto max-w-4xl text-balance text-center">
            {before}
            <span className="text-[var(--accent)]">{accent}</span>
            {after}
          </h1>
        </Container>

        <FanParallax>
          <div className="mt-8 lg:mt-6">
            <HeroCardFan />
          </div>
        </FanParallax>

        <Container className="relative z-10 -mt-10 lg:-mt-12 xl:-mt-16">
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
