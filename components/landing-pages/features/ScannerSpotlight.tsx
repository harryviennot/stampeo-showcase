import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { FactList } from "../shared/FactList";
import { LpHeading, LpSection } from "../shared/LpSection";
import { ScannerLoop } from "../shared/ScannerLoop";
import { LpTrialButton } from "../shared/LpTrialButton";

/**
 * Stamp from any phone: the Scanner loop, three facts, and the trial in an
 * outline button. A phone stacks heading, phone, facts; from `lg` the phone
 * sits left of the words.
 */
export function ScannerSpotlight() {
  return (
    <LpSection section="spotlight_scanner">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
        <ScrollReveal className="lg:col-start-2 lg:row-start-1 lg:self-end">
          <LpHeading title={FEATURES.scanner.title} lead={FEATURES.scanner.lead} />
        </ScrollReveal>
        <ScrollReveal
          delay={150}
          variant="left"
          className="flex justify-center lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:items-center"
        >
          <ScannerLoop narrowWidth={250} />
        </ScrollReveal>
        <ScrollReveal className="lg:col-start-2 lg:row-start-2 lg:self-start">
          <FactList facts={FEATURES.scanner.facts} />
          <LpTrialButton className="mt-8" />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
