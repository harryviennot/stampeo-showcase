import { IPhone } from "@/components/ui/IPhone";
import { AurevoCard } from "../shared/AurevoCard";

/** The phone is drawn 320px wide (a 286px screen); the card fills the screen less 14px a side. */
const PHONE_WIDTH = 320;
const CARD_WIDTH = 258;

/**
 * The How-to hero: a phone showing the Aurevo card at 4 of 8 stamps. Drawn once
 * at 320px and shrunk to 260px by CSS on a phone, so one set of images loads
 * and the card never changes size when the page hydrates.
 */
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
        </IPhone>
      </div>
    </div>
  );
}
