import { LpSection } from "../shared/LpSection";
import { HeroVariantSwitch } from "./HeroVariantSwitch";
import { WalletShelfHero } from "./WalletShelfHero";
import { WalletStackHero } from "./WalletStackHero";

/**
 * Platform's hero: the stack of wallet cards, or the straight shelf of nine when the address says `?hero=shelf`
 * (the two are shown for comparing until one is picked). One section either way.
 */
export function PlatformHero() {
  return (
    <LpSection section="hero" bare>
      <HeroVariantSwitch stack={<WalletStackHero />} shelf={<WalletShelfHero />} />
    </LpSection>
  );
}
