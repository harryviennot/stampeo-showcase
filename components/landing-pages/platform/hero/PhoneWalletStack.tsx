import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { PHONE_STACK, type StackCard } from "@/lib/landing-pages/platform/phone-stack";

/** A card is laid out 300px wide and 1.282 tall, the width the wallet card is drawn for. */
const CARD_WIDTH = 300;
const CARD_HEIGHT = Math.round(CARD_WIDTH * 1.282);
/** How much of each card behind shows above the next one: its logo and its count. */
const TOP_HEIGHT = 44;
/** The stack is drawn at 255px wide on a phone, so the buttons under it stay in the first screen, and whole from `sm`. */
const PHONE_WIDTH = 255;

/** A card at its laid-out size; the QR code shows on the card in front, as on an open pass. */
function Face({ card, qr = false }: Readonly<{ card: StackCard; qr?: boolean }>) {
  return (
    <div style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <WalletCard
        design={card.design}
        stamps={card.stamps}
        pointsBalance={card.pointsBalance}
        pointsRewards={card.pointsRewards}
        headerLabel={card.headerLabel}
        showQR={qr}
      />
    </div>
  );
}

/**
 * A phone's Wallet, still: the tops of three cards stacked above the front card, which is drawn whole.
 * Nothing in it moves, whatever the reader's motion setting.
 */
export function PhoneWalletStack({ label }: Readonly<{ label: string }>) {
  // The farthest card sits at the top, each one in front of the one before it.
  const tops = [...PHONE_STACK.behind].reverse();

  return (
    <div role="img" aria-label={label} className="mx-auto w-fit">
      <ScaledBox
        width={CARD_WIDTH}
        height={tops.length * TOP_HEIGHT + CARD_HEIGHT}
        to={CARD_WIDTH}
        narrowTo={PHONE_WIDTH}
        breakpoint="sm"
      >
        <div aria-hidden>
          {tops.map((card, index) => (
            <div key={card.id} className="relative" style={{ height: TOP_HEIGHT, zIndex: index + 1 }}>
              <Face card={card} />
            </div>
          ))}
          <div className="relative" style={{ zIndex: tops.length + 1 }}>
            <Face card={PHONE_STACK.front} qr />
          </div>
        </div>
      </ScaledBox>
    </div>
  );
}
