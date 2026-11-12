import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { StepsTable } from "../../platform/StepsTable";
import { GoogleWalletPhone } from "../../shared/GoogleWalletPhone";
import { LpSection } from "../../shared/LpSection";
import { WalletPhone } from "../../shared/WalletPhone";

/** Both phones are drawn at 280px and shrunk to 160px on a phone, as Platform's How table draws its two. */
const PHONE = { full: 280, narrow: 160 };

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
              <WalletPhone width={PHONE.full} narrowWidth={PHONE.narrow} stamps={5} />
            </div>
            <div role="img" aria-label={phoneAlts.google} className="shrink-0">
              <GoogleWalletPhone width={PHONE.full} narrowWidth={PHONE.narrow} stamps={5} />
            </div>
          </>
        }
      />
    </LpSection>
  );
}
