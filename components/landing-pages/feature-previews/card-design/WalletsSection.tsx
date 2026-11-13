import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { STEPS_PHONE, StepsTable } from "../../platform/StepsTable";
import { GoogleWalletPhone } from "../../shared/GoogleWalletPhone";
import { LpSection } from "../../shared/LpSection";
import { WalletPhone } from "../../shared/WalletPhone";

/**
 * "One card, ready for every phone": the same card in Apple Wallet and in
 * Google Wallet side by side, sinking behind the table of what one QR code gets
 * a customer.
 */
export function WalletsSection() {
  const { eyebrow, title, lead, cells, phoneAlts } = CARD_DESIGN_PREVIEW.wallets;

  return (
    <LpSection section="wallets" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <StepsTable
        cells={cells}
        visual={
          <>
            <div role="img" aria-label={phoneAlts.apple} className="shrink-0">
              <WalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} stamps={5} />
            </div>
            <div role="img" aria-label={phoneAlts.google} className="shrink-0">
              <GoogleWalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} stamps={5} />
            </div>
          </>
        }
      />
    </LpSection>
  );
}
