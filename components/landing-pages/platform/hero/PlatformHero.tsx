import { LpSection } from "../../shared/LpSection";
import { WalletStackHero } from "./WalletStackHero";

/** Platform's hero section: the stack of wallet cards under its headline, with the trial and the demo link. */
export function PlatformHero() {
  return (
    <LpSection section="hero" bare>
      <WalletStackHero />
    </LpSection>
  );
}
