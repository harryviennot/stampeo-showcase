import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { resolveFanCard } from "@/lib/hero-fan";
import { HoverRows } from "../../platform/HoverRows";
import { LpSection } from "../../shared/LpSection";
import { PassFrame } from "../../shared/PassFrame";

/** The card thumbnail on a row: 200px on a laptop, 128px beside the words on a phone. */
const CARD = { width: 200, height: 257, narrow: 128 };

/** A brand's stamp card at its sample count of stamps, named for a screen reader. */
function StampCard({ id, alt }: Readonly<{ id: string; alt: string }>) {
  const card = resolveFanCard(id);
  if (card.kind !== "stamps") throw new Error(`${id} is not a stamp card`);
  const { sample } = card;

  return (
    <div role="img" aria-label={alt}>
      <ScaledBox width={CARD.width} height={CARD.height} narrowTo={CARD.narrow}>
        <PassFrame width={CARD.width}>
          <WalletCard design={sample.design} stamps={sample.stamps} />
        </PassFrame>
      </ScaledBox>
    </div>
  );
}

/** A row for each way a stamp can look, each with a card that shows it: a preset icon, a shop's own icon, a layout. */
export function StampStyleRows() {
  const { eyebrow, title, lead, rows, cardAlts } = CARD_DESIGN_PREVIEW.stamps;

  return (
    <LpSection section="stamps" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <HoverRows
        items={rows}
        visuals={{
          library: <StampCard id="patoune" alt={cardAlts.library} />,
          own: <StampCard id="smash-club" alt={cardAlts.own} />,
          layout: <StampCard id="gelo" alt={cardAlts.layout} />,
        }}
      />
    </LpSection>
  );
}
