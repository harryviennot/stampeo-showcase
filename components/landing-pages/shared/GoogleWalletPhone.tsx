import { GoogleWalletCard } from "@/components/card/GoogleWalletCard";
import { AndroidPhone } from "@/components/ui/AndroidPhone";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { androidLayout } from "@/lib/devices/android";
import type { PhoneSample } from "@/lib/landing-pages/previews/card-design-samples";
import { SAMPLE_BUSINESS } from "@/lib/landing-pages/copy/shared";
import { aurevoDesign } from "./AurevoCard";

/** The phone is drawn 320px wide, as `WalletPhone`'s iPhone. */
const DRAWN_WIDTH = 320;
/** Google Wallet's light surface. */
const SURFACE = "#f6f7f9";
/** Google masks the pass's square logo into a circle: Aurevo's is its cup. */
const ROUND_LOGO = "/themes/cafe/cup.png";

/** Google Wallet's bar over an open pass: back on the left, more on the right. */
function AppBar() {
  return (
    <div aria-hidden className="flex h-12 items-center justify-between px-1.5 text-[#1f1f1f]">
      <svg viewBox="0 0 24 24" className="h-10 w-10 p-2.5" fill="currentColor">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
      <svg viewBox="0 0 24 24" className="h-10 w-10 p-2.5" fill="currentColor">
        <circle cx="12" cy="5.5" r="1.9" />
        <circle cx="12" cy="12" r="1.9" />
        <circle cx="12" cy="18.5" r="1.9" />
      </svg>
    </div>
  );
}

/**
 * Google Wallet on an Android phone with the Aurevo pass open at `stamps` of 8 (or the `sample` business's pass
 * in its place, with its name beside a round badge), drawn at 320px and shrunk to `width` (`narrowWidth` below `lg`).
 */
export async function GoogleWalletPhone({
  width = DRAWN_WIDTH,
  narrowWidth,
  stamps = 4,
  sample,
}: Readonly<{ width?: number; narrowWidth?: number; stamps?: number; sample?: PhoneSample }>) {
  const design = sample ? { ...sample.design, logo_url: undefined } : { ...(await aurevoDesign()), logo_url: ROUND_LOGO };

  return (
    <ScaledBox width={DRAWN_WIDTH} height={androidLayout(DRAWN_WIDTH).height} to={width} narrowTo={narrowWidth}>
      <AndroidPhone width={DRAWN_WIDTH} statusBar="light" screenBackground={SURFACE}>
        <div style={{ paddingTop: "var(--android-safe-top)" }}>
          <AppBar />
          <div className="px-3">
            <GoogleWalletCard
              design={design}
              organizationName={sample?.name ?? SAMPLE_BUSINESS}
              stamps={sample ? sample.stamps : stamps}
              pointsBalance={sample?.pointsBalance}
              pointsRewards={sample?.pointsRewards}
            />
          </div>
        </div>
      </AndroidPhone>
    </ScaledBox>
  );
}
