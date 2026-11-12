import { CTAButton } from "@/components/ui/CTAButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RegionText } from "@/components/market/RegionText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { splitAccent } from "@/lib/landing-pages/accent";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";
import { LpSection } from "./LpSection";

/** The closing ask: the page's own headline, the trial CTA and its reassurance. */
export function LpFinalCta({ slug }: Readonly<{ slug: LandingSlug }>) {
  const { before, accent, after } = splitAccent(
    LANDING_PAGES[slug].finalCta.title,
    LANDING_PAGES[slug].finalCta.accent,
  );

  return (
    <LpSection section="final_cta" className="stamp-pattern text-center">
      <ScrollReveal className="relative z-10 mx-auto flex max-w-[840px] flex-col items-center gap-6">
        <h2 className="text-display">
          {before}
          <span className="text-[var(--accent)]">{accent}</span>
          {after}
        </h2>
        <CTAButton label={SHARED.cta} trackAs="final_cta" className="w-full sm:w-auto" />
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          <RegionText raw={SHARED.reassurance} />
        </p>
      </ScrollReveal>
    </LpSection>
  );
}
