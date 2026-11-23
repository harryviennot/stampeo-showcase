import { FanParallax } from "@/components/landing-variant/FanParallax";
import { HeroCardFan } from "@/components/landing-variant/HeroCardFan";
import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { PLATFORM_FAN_SLOTS, type FanSlot } from "@/lib/hero-fan";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import type { StackCard } from "@/lib/landing-pages/platform/phone-stack";
import type { Market } from "@/lib/markets";
import { LpSection } from "../../shared/LpSection";
import { LpCtaPair } from "../LpCtaPair";
import { HeroWords } from "./HeroWords";
import { PhoneWalletStack } from "./PhoneWalletStack";

/**
 * Platform's hero: the headline, one picture of real wallet cards, then the trial and the demo link.
 * The picture is a still Wallet stack on a phone and the homepage's arch of Platform's seven cards from `lg`;
 * both are in the markup and CSS shows the one that fits the width. `slots` and `deck` are the fan's and the stack's
 * cards, the season's own by default.
 */
export function PlatformHero({
  market,
  slots = PLATFORM_FAN_SLOTS,
  deck,
}: Readonly<{ market: Market; slots?: FanSlot[]; deck?: readonly StackCard[] }>) {
  const { PLATFORM } = useLandingCopy().platform;
  const { SHARED } = useLandingCopy().shared;

  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-7">
        <Container>
          <HeroWords slug="platform" market={market} look="fan" />
        </Container>

        <div className="mt-6 lg:hidden">
          <PhoneWalletStack label={PLATFORM.heroCards.stackAlt} levelNames={SHARED.levelNames} deck={deck} />
        </div>

        <div className="max-lg:hidden">
          <FanParallax>
            <div className="mt-8 lg:mt-6">
              <HeroCardFan slots={slots} />
            </div>
          </FanParallax>
        </div>

        <Container className="relative z-10 mt-5 lg:-mt-8 xl:mt-0">
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
