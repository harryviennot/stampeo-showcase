import { CTAButton } from "@/components/ui/CTAButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpHeading, LpSection } from "../shared/LpSection";
import { SampleCapture } from "../shared/SampleCapture";
import { SegmentChips } from "./SegmentChips";

/**
 * See it working: the words and the customer groups, the Analytics capture,
 * then the worked example (labelled as one) and the trial button. On a phone
 * the capture sits between the groups and the example; from `lg` it sits
 * beside all of them.
 */
export function RegularsSpotlight() {
  const { title, lead, example } = OUTCOMES.regulars;

  return (
    <LpSection section="outcome_regulars">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
        <ScrollReveal className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <LpHeading title={title} lead={lead} />
          <div className="mt-6">
            <SegmentChips />
          </div>
        </ScrollReveal>

        <ScrollReveal
          delay={150}
          variant="right"
          className="flex justify-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:items-center"
        >
          <SampleCapture alt={OUTCOMES.regulars.alt} />
        </ScrollReveal>

        <ScrollReveal delay={100} className="flex flex-col items-start gap-6 lg:col-start-1 lg:row-start-2 lg:self-start">
          <p className="max-w-xl text-pretty text-sm text-[var(--muted-foreground)]">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
              {example.label}
            </span>
            {example.text}
          </p>
          <CTAButton label={SHARED.cta} variant="outline" trackAs="feature_cta" className="w-full sm:w-auto" />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
