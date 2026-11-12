import { WalletCard } from "@/components/card/WalletCard";
import { IPhone } from "@/components/ui/IPhone";
import { POINTS_SAMPLES } from "@/lib/loyalty-samples";
import { AurevoCard, PassFrame } from "../shared/AurevoCard";

/** The phone is drawn 320px wide; the card fills its screen less 14px a side. */
const PHONE_WIDTH = 320;
const CARD_WIDTH = 258;

/** The customer's other passes, stacked at the bottom of the screen. */
const OTHER_PASSES = ["salon", "marginalia"].flatMap((id) => POINTS_SAMPLES.filter((sample) => sample.id === id));
/** How much of each stacked pass shows above the next, and of the front one above the screen's edge. */
const PEEK = 44;
const FRONT = 64;

/** Apple Wallet with the Aurevo card open at 4 of 8 and the other passes stacked below it. */
export function HowHeroVisual() {
  return (
    <div className="h-[531px] w-[260px] shrink-0 lg:h-[654px] lg:w-[320px]">
      <div className="origin-top-left scale-[0.8125] lg:scale-100" style={{ width: PHONE_WIDTH }}>
        <IPhone width={PHONE_WIDTH} statusBar="light" screenBackground="#f2f2f7" eager>
          <div
            className="px-3.5"
            style={{ paddingTop: "calc(var(--iphone-safe-top) + 12px)" }}
          >
            <AurevoCard stamps={4} width={CARD_WIDTH} />
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
      </div>
    </div>
  );
}
