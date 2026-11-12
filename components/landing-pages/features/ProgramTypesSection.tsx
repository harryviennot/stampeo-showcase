import { WalletCard } from "@/components/card/WalletCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { POINTS_SAMPLES } from "@/lib/loyalty-samples";
import { AurevoCard, PassFrame } from "../shared/AurevoCard";
import { LevelCards } from "../shared/LevelCards";
import { LpHeading, LpSection } from "../shared/LpSection";
import { ProgramTypeTabs } from "./ProgramTypeTabs";

const CARD_WIDTH = 280;

/** The bookstore sample: a points card with a big running balance, and its QR code like the stamps card. */
const MARGINALIA = POINTS_SAMPLES.find((sample) => sample.id === "marginalia") ?? POINTS_SAMPLES[0];

/** Choose how you reward: stamps on Aurevo's card, points on a bookstore's, levels on the barbershop's. */
export function ProgramTypesSection() {
  return (
    <LpSection section="program_types">
      <ScrollReveal>
        <ProgramTypeTabs
          heading={<LpHeading title={FEATURES.programTypes.title} lead={FEATURES.programTypes.lead} />}
          visuals={{
            stamps: <AurevoCard stamps={5} width={CARD_WIDTH} />,
            points: (
              <PassFrame width={CARD_WIDTH}>
                <WalletCard
                  design={MARGINALIA.design}
                  pointsBalance={MARGINALIA.pointsBalance}
                  pointsRewards={MARGINALIA.pointsRewards}
                />
              </PassFrame>
            ),
            levels: <LevelCards banner />,
          }}
        />
      </ScrollReveal>
    </LpSection>
  );
}
