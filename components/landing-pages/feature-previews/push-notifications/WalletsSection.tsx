import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LpSection } from "../../shared/LpSection";
import { WalletsComposition } from "./WalletsComposition";

/** The card on both phones with the notifications floating over them. */
export function WalletsSection() {
  const COPY = useLandingCopy().previews.pushNotifications.PUSH_NOTIFICATIONS_PREVIEW;

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
