import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { AurevoCard } from "../shared/AurevoCard";
import { LevelCards } from "../shared/LevelCards";
import { LpHeading, LpSection } from "../shared/LpSection";
import { MarginaliaCard } from "../shared/MarginaliaCard";
import { ProgramTypeTabs } from "./ProgramTypeTabs";

const CARD_WIDTH = 280;

/** Choose how you reward: stamps on Aurevo's card, points on a bookstore's, levels on the barbershop's. */
export function ProgramTypesSection() {
  return (
    <LpSection section="program_types">
      <ScrollReveal>
        <ProgramTypeTabs
          heading={<LpHeading title={FEATURES.programTypes.title} lead={FEATURES.programTypes.lead} />}
          visuals={{
            stamps: <AurevoCard stamps={5} width={CARD_WIDTH} />,
            points: <MarginaliaCard width={CARD_WIDTH} />,
            levels: <LevelCards banner />,
          }}
        />
      </ScrollReveal>
    </LpSection>
  );
}
