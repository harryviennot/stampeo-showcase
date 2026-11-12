import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { AccentText } from "@/lib/landing-pages/AccentText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LANDING_PAGES } from "@/lib/landing-pages/pages";
import { LpSection } from "../shared/LpSection";
import { CardWheel } from "./CardWheel";
import { LpCtaPair } from "./LpCtaPair";

/**
 * The Platform page's hero: the headline, then the wheel of sample cards turning
 * behind the trial and demo actions. The headline and the actions are all the
 * words there are; the numbers come further down.
 */
export function PlatformHero() {
  const { hero } = LANDING_PAGES.platform;

  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 lg:pt-28">
        <Container>
          <h1 className="text-hero mx-auto max-w-4xl text-balance text-center">
            <AccentText text={hero.h1} accent={hero.accent} />
          </h1>
        </Container>

        <CardWheel className="mt-4 lg:mt-6">
          <Container>
            <div className="flex flex-col items-center gap-3 pb-10 sm:pb-24 lg:pb-32">
              <LpCtaPair location="hero" />
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                <RegionText raw={SHARED.reassurance} />
              </p>
            </div>
          </Container>
        </CardWheel>
      </section>
    </LpSection>
  );
}
