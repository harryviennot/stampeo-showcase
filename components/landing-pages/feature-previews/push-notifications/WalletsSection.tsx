import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { LpSection } from "../../shared/LpSection";
import { WalletsComposition } from "./WalletsComposition";

/** "Apple Wallet and Google Wallet, both": the card on both phones with the notifications floating over them. */
export function WalletsSection() {
  return (
    <LpSection
      section="wallets"
      eyebrow={COPY.wallets.eyebrow}
      title={COPY.wallets.title}
      lead={COPY.wallets.lead}
      align="center"
    >
      <WalletsComposition />
    </LpSection>
  );
}
