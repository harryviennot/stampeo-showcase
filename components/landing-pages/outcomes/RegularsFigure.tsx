import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { LpHeading, LpSection } from "../shared/LpSection";

/** The problem as one sourced figure: the number in handwriting, the claim, the source in small print. */
export function RegularsFigure() {
  const { title, figure } = OUTCOMES.problem;

  return (
    <LpSection section="problem" tinted>
      <ScrollReveal className="flex flex-col items-center text-center">
        <LpHeading title={title} className="mx-auto" />
        <figure className="mt-8 flex flex-col items-center">
          <p
            className="ink-figure inline-block -rotate-2"
            style={{ fontSize: "clamp(5rem, 26vw, 9rem)" }}
          >
            {figure.value}
          </p>
          <p className="mt-4 max-w-2xl text-balance text-lead text-[var(--foreground)]">{figure.text}</p>
          <figcaption className="mt-3 max-w-lg text-pretty text-sm text-[var(--muted-foreground)]">
            {figure.source}
          </figcaption>
        </figure>
      </ScrollReveal>
    </LpSection>
  );
}
