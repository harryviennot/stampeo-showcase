import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { POINTS_SAMPLES } from "@/lib/loyalty-samples";
import { WalletCard } from "@/components/card/WalletCard";
import { AurevoCard, PassFrame } from "../shared/AurevoCard";
import { LevelCards } from "../shared/LevelCards";
import { LpSection } from "../shared/LpSection";
import { ScaledBox } from "./ScaledBox";
import { ProgramTypeRows } from "./ProgramTypeRows";

/** The card thumbnail on a row: 200px on a laptop, 128px beside the words on a phone. */
const CARD = { width: 200, height: 257, narrow: 128 };

/** The points sample, Marginalia, in the card colours of its own shop. */
const POINTS = POINTS_SAMPLES.find((sample) => sample.id === "marginalia") ?? POINTS_SAMPLES[0];

/**
 * "Stamps, points or levels": a row each, with the Aurevo card at 5 of 8, the
 * Marginalia points card, and the three level cards. The rows are one client
 * component that opens the one nearest the middle of the screen.
 */
export function ProgramTypesSection() {
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
            <ScaledBox width={CARD.width} height={CARD.height} narrowWidth={CARD.narrow}>
              <AurevoCard stamps={5} width={CARD.width} />
            </ScaledBox>
          ),
          points: (
            <ScaledBox width={CARD.width} height={CARD.height} narrowWidth={CARD.narrow}>
              <PassFrame width={CARD.width}>
                <WalletCard
                  design={POINTS.design}
                  pointsBalance={POINTS.pointsBalance}
                  pointsRewards={POINTS.pointsRewards}
                  showQR={false}
                />
              </PassFrame>
            </ScaledBox>
          ),
          levels: (
            <div className="relative h-[114px] w-[128px] lg:h-[204px] lg:w-[230px]">
              <div className="w-[300px] origin-top-left scale-[0.4267] sm:w-[384px] sm:scale-[0.3333] lg:scale-[0.6]">
                <LevelCards />
              </div>
            </div>
          ),
        }}
      />
    </LpSection>
  );
}
