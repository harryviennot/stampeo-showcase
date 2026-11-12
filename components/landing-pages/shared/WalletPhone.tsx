import { WalletCard } from "@/components/card/WalletCard";
import { IPhone } from "@/components/ui/IPhone";
import { iphoneLayout } from "@/lib/devices/iphone";
import { POINTS_SAMPLES } from "@/lib/loyalty-samples";
import { AurevoCard } from "./AurevoCard";
import { PassFrame } from "./PassFrame";
import { ScaledBox } from "./ScaledBox";

/** The phone is drawn 320px wide; the card fills its screen less 14px a side. */
const DRAWN_WIDTH = 320;
const CARD_WIDTH = 258;

/** The customer's other passes, stacked at the bottom of the screen. */
const OTHER_PASSES = ["salon", "marginalia"].flatMap((id) => POINTS_SAMPLES.filter((sample) => sample.id === id));
/** How much of each stacked pass shows above the next, and of the front one above the screen's edge. */
const PEEK = 44;
const FRONT = 64;

/**
 * Apple Wallet with the Aurevo card open at `stamps` of 8 and the customer's other
 * passes stacked below it, drawn at 320px and shrunk to `width` (`narrowWidth` below `lg`).
 */
export function WalletPhone({
  width = DRAWN_WIDTH,
  narrowWidth,
  stamps = 4,
}: Readonly<{ width?: number; narrowWidth?: number; stamps?: number }>) {
  return (
    <ScaledBox width={DRAWN_WIDTH} height={iphoneLayout(DRAWN_WIDTH).height} to={width} narrowTo={narrowWidth}>
      <IPhone width={DRAWN_WIDTH} statusBar="light" screenBackground="#f2f2f7">
        <div className="px-3.5" style={{ paddingTop: "calc(var(--iphone-safe-top) + 12px)" }}>
          <AurevoCard stamps={stamps} width={CARD_WIDTH} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-3.5 bottom-0 overflow-hidden select-none"
          style={{ height: PEEK * (OTHER_PASSES.length - 1) + FRONT }}
        >
          {OTHER_PASSES.map((pass, index) => (
            <div key={pass.id} className="absolute inset-x-0" style={{ top: index * PEEK }}>
              <PassFrame width={CARD_WIDTH}>
                <WalletCard
                  design={pass.design}
                  pointsBalance={pass.pointsBalance}
                  pointsRewards={pass.pointsRewards}
                  showQR={false}
                />
              </PassFrame>
            </div>
          ))}
        </div>
      </IPhone>
    </ScaledBox>
  );
}
