import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { STAMP_SAMPLES } from "@/lib/loyalty-samples";
import { HoverRows } from "../../platform/HoverRows";
import { LpSection } from "../../shared/LpSection";
import { PassFrame } from "../../shared/PassFrame";

/** The card thumbnail on a row: 200px on a laptop, 128px beside the words on a phone. */
const CARD = { width: 200, height: 257, narrow: 128 };

/** A brand-bank card at its sample count of stamps, named for a screen reader. */
function StampCard({ id, alt }: Readonly<{ id: string; alt: string }>) {
  const sample = STAMP_SAMPLES.find((candidate) => candidate.id === id);
  if (!sample) throw new Error(`No stamp sample called ${id}`);

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

/**
 * "Stamps that look like what you sell": a row for each way a stamp can look,
 * with a card that shows it: a preset icon (the pet groomer's paw), a shop's
 * own icon (bubble tea's boba) and a layout (gelato cones piling up).
 */
export function StampStyleRows() {
  const { eyebrow, title, lead, rows, cardAlts } = CARD_DESIGN_PREVIEW.stamps;

  return (
    <LpSection section="stamps" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <HoverRows
        items={rows}
        visuals={{
          library: <StampCard id="patoune" alt={cardAlts.library} />,
          own: <StampCard id="oba" alt={cardAlts.own} />,
          layout: <StampCard id="gelo" alt={cardAlts.layout} />,
        }}
      />
    </LpSection>
  );
}
