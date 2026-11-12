import { QRCodeSkeleton } from "@/components/ui/QRCodeSkeleton";
import { SAMPLE_BUSINESS } from "@/lib/landing-pages/copy/shared";
import { ScaledBox } from "../shared/ScaledBox";
import { WalletBadges } from "../shared/WalletBadges";
import { AUREVO } from "../shared/samples";

/** The placard is drawn at this size and shrunk to the width asked for by a fixed CSS scale. */
const DRAWN_WIDTH = 220;
const DRAWN_HEIGHT = 248;

/**
 * The counter flyer: a white tile with the café's logo, a QR mark and the
 * wallet badges. The QR is the still skeleton, not a code: the demo's is the
 * only scannable one on a page.
 */
export function PlacardVisual({
  width = DRAWN_WIDTH,
  narrowWidth,
}: Readonly<{ width?: number; narrowWidth?: number }>) {
  return (
    <ScaledBox width={DRAWN_WIDTH} height={DRAWN_HEIGHT} to={width} narrowTo={narrowWidth}>
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-4 shadow-md ring-1 ring-black/5">
        {/* The logo is white, so it sits on the card's brown. */}
        <div
          className="flex flex-col items-center gap-3 rounded-xl px-6 py-4"
          style={{ backgroundColor: AUREVO.design.background_color }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={AUREVO.design.logo_url} alt={SAMPLE_BUSINESS} className="h-7 w-auto" />
          <QRCodeSkeleton size={96} animated={false} />
        </div>
        <WalletBadges className="gap-2" height="h-7" />
      </div>
    </ScaledBox>
  );
}
