import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { AurevoCard } from "../shared/AurevoCard";
import { LEVELS_ON_A_ROW, LevelCards } from "../shared/LevelCards";
import { LpSection } from "../shared/LpSection";
import { PassFrame } from "../shared/PassFrame";
import { VANITY } from "../shared/samples";
import { ProgramTypeRows } from "./ProgramTypeRows";

/** The card thumbnail on a row: 200px on a laptop, 128px beside the words on a phone. */
const CARD = { width: 200, height: 257, narrow: 128 };

/**
 * "Stamps, points or levels": a row each, with the Aurevo card at 5 of 8, the
 * Vanity salon's points card with its reward ring, and the three level cards.
 * The rows are one client component that opens the one a visitor points at.
 */
export function ProgramTypeRowsSection() {
  return (
    <LpSection
      section="program_types"
      eyebrow={PLATFORM.programTypes.eyebrow}
      title={PLATFORM.programTypes.title}
      lead={PLATFORM.programTypes.lead}
      align="center"
    >
      <ProgramTypeRows
        visuals={{
          stamps: (
            <ScaledBox width={CARD.width} height={CARD.height} narrowTo={CARD.narrow}>
              <AurevoCard stamps={5} width={CARD.width} />
            </ScaledBox>
          ),
          points: (
            <ScaledBox width={CARD.width} height={CARD.height} narrowTo={CARD.narrow}>
              <PassFrame width={CARD.width}>
                <WalletCard
                  design={VANITY.design}
                  pointsBalance={VANITY.pointsBalance}
                  pointsRewards={VANITY.pointsRewards}
                />
              </PassFrame>
            </ScaledBox>
          ),
          levels: <LevelCards size={LEVELS_ON_A_ROW} />,
        }}
      />
    </LpSection>
  );
}
