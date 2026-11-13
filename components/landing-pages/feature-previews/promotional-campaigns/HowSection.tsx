import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { STEPS_PHONE, StepsTable } from "../../platform/StepsTable";
import { GoogleWalletPhone } from "../../shared/GoogleWalletPhone";
import { LpSection } from "../../shared/LpSection";
import { WalletPhone } from "../../shared/WalletPhone";

/**
 * "Write it, pick who gets it, send": the card in Apple Wallet and in Google Wallet, side
 * by side (a broadcast lands in both), sinking behind the table of the three steps.
 */
export function HowSection() {
  return (
    <LpSection section="how" eyebrow={COPY.how.eyebrow} title={COPY.how.title} lead={COPY.how.lead} align="center">
      <StepsTable
        cells={COPY.how.cells}
        visual={
          <>
            <WalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} stamps={5} />
            <GoogleWalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} stamps={5} />
          </>
        }
      />
    </LpSection>
  );
}
