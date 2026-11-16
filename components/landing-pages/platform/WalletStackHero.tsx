import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { HeroWords } from "./HeroWords";
import { LpCtaPair } from "./LpCtaPair";
import { WalletStack } from "./WalletStack";

/**
 * Platform's hero section with the stack of wallet cards: the headline, the stack, then the trial and the demo link.
 * On a phone they run in that order, centred; from `lg` the words and the actions sit in the left column,
 * vertically centred on the stack in the right one.
 */
export function WalletStackHero() {
  return (
    <section className="relative pt-24 pb-10 lg:pt-28 lg:pb-14">
      <Container>
        <div className="grid gap-y-6 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8">
          <div className="text-center lg:col-span-6 lg:row-start-1 lg:self-end lg:text-left">
            <HeroWords slug="platform" look="column" />
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-center">
            <WalletStack label={PLATFORM.heroCards.stackAlt} />
          </div>

          <div className="flex flex-col items-center gap-3 lg:col-span-6 lg:row-start-2 lg:items-start lg:self-start">
            <div className="w-full lg:[&>div]:justify-start">
              <LpCtaPair location="hero" />
            </div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              <RegionText raw={SHARED.reassurance} />
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
