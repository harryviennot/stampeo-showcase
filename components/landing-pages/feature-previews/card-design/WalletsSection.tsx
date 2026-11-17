import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { walletSample } from "@/lib/landing-pages/previews/card-design-samples";
import { STEPS_PHONE, StepsTable } from "../../platform/StepsTable";
import { GoogleWalletPhone } from "../../shared/GoogleWalletPhone";
import { LpSection } from "../../shared/LpSection";
import { WalletPhone } from "../../shared/WalletPhone";

/** A grocer's card in Apple Wallet and Google Wallet side by side, sinking behind the table of what one QR code gets a customer. */
export function WalletsSection() {
  const { wallets, cardFields } = useLandingCopy().previews.cardDesign.CARD_DESIGN_PREVIEW;
  const { eyebrow, title, lead, cells, phoneAlts } = wallets;
  const sample = walletSample(cardFields);

  return (
    <LpSection section="wallets" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <StepsTable
        cells={cells}
        visual={
          <>
            <div role="img" aria-label={phoneAlts.apple} className="shrink-0">
              <WalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} sample={sample} />
            </div>
            <div role="img" aria-label={phoneAlts.google} className="shrink-0">
              <GoogleWalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} sample={sample} />
            </div>
          </>
        }
      />
    </LpSection>
  );
}
