import { CompactPlayground } from "@/components/features/design-de-carte/CompactPlayground";
import { PaletteIcon } from "@/components/icons";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { LpSection } from "../shared/LpSection";
import { StepHeading } from "./StepHeading";
import { LpTrialButton } from "../shared/LpTrialButton";

/**
 * Step 1: the card designer, live and compact so the card stays in view on a
 * phone, then the free design help and the trial ("you just designed one").
 */
export function CreateStep() {
  const { label, title, lead, designHelp, ctaLead } = HOW_IT_WORKS.create;

  return (
    <LpSection section="step_create" anchor>
      <ScrollReveal>
        <StepHeading number={1} label={label} title={title} lead={lead} />
      </ScrollReveal>

      <div className="mt-10 lg:mt-14">
        <CompactPlayground />
      </div>

      <ScrollReveal className="mt-10 flex flex-col gap-8 lg:mt-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <p className="flex max-w-md items-start gap-3 text-pretty text-sm text-[var(--muted-foreground)]">
          <PaletteIcon size={20} weight="duotone" aria-hidden className="mt-0.5 shrink-0 text-[var(--accent-hover)]" />
          {designHelp}
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
          <p className="text-lead font-semibold text-[var(--foreground)]">{ctaLead}</p>
          <LpTrialButton />
        </div>
      </ScrollReveal>
    </LpSection>
  );
}
