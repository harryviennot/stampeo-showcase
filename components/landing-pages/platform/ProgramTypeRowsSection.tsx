import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { AurevoCard } from "../shared/AurevoCard";
import { LevelCards } from "../shared/LevelCards";
import { LpSection } from "../shared/LpSection";
import { MarginaliaCard } from "../shared/MarginaliaCard";
import { ScaledBox } from "../shared/ScaledBox";
import { ProgramTypeRows } from "./ProgramTypeRows";

/** The card thumbnail on a row: 200px on a laptop, 128px beside the words on a phone. */
const CARD = { width: 200, height: 257, narrow: 128 };

/** The level cards on a row: the stage shrunk to a third below `lg`, to 0.6 of its drawn width from it. */
const LEVELS = { narrowTo: 128, to: 230.4, breakpoint: "lg" } as const;

/**
 * "Stamps, points or levels": a row each, with the Aurevo card at 5 of 8, the
 * Marginalia points card, and the three level cards. The rows are one client
 * component that opens the one nearest the middle of the screen.
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
              <MarginaliaCard width={CARD.width} />
            </ScaledBox>
          ),
          levels: <LevelCards size={LEVELS} />,
        }}
      />
    </LpSection>
  );
}
