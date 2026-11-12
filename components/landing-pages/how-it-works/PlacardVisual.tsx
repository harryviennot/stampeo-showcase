/* eslint-disable @next/next/no-img-element */
import { QRCodeSkeleton } from "@/components/ui/QRCodeSkeleton";
import { SAMPLE_BUSINESS } from "@/lib/landing-pages/copy/shared";
import { walletBadges } from "@/lib/store-badges";
import { AUREVO } from "../shared/samples";

/** The placard is drawn at this width and shrunk to the width asked for by a fixed CSS scale. */
const DRAWN_WIDTH = 220;
const DRAWN_HEIGHT = 248;

/**
 * The counter flyer: a white tile with the café's logo, a QR mark and the
 * wallet badges. The QR is the still skeleton, not a code: the demo's is the
 * only scannable one on a page.
 */
export function PlacardVisual({ width = DRAWN_WIDTH }: Readonly<{ width?: number }>) {
  const badges = walletBadges("en");
  const scale = width / DRAWN_WIDTH;

  return (
    <div className="shrink-0" style={{ width, height: DRAWN_HEIGHT * scale }}>
      <div
        className="flex flex-col items-center gap-4 rounded-xl bg-white p-4 shadow-md ring-1 ring-black/5"
        style={{ width: DRAWN_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {/* The logo is white, so it sits on the card's brown. */}
        <div
          className="flex flex-col items-center gap-3 rounded-xl px-6 py-4"
          style={{ backgroundColor: AUREVO.design.background_color }}
        >
          <img src={AUREVO.design.logo_url} alt={SAMPLE_BUSINESS} className="h-7 w-auto" />
          <QRCodeSkeleton size={96} animated={false} />
        </div>
        <div className="flex items-center gap-2">
          <img src={badges.apple} alt="Apple Wallet" className="h-7 w-auto" />
          <img src={badges.google} alt="Google Wallet" className="h-7 w-auto" />
        </div>
      </div>
    </div>
  );
}
