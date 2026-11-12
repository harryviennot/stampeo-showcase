import { CTAButton } from "@/components/ui/CTAButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RegionText } from "@/components/market/RegionText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { AccentText } from "@/lib/landing-pages/AccentText";
import { LANDING_PAGES, type LandingSlug } from "@/lib/landing-pages/pages";
import { LpSection } from "./LpSection";

/** The closing ask: the page's own headline, the trial CTA and its reassurance. */
export function LpFinalCta({ slug }: Readonly<{ slug: LandingSlug }>) {
  const { title, accent } = LANDING_PAGES[slug].finalCta;

  return (
    <LpSection section="final_cta" className="stamp-pattern text-center">
      <ScrollReveal className="relative z-10 mx-auto flex max-w-[840px] flex-col items-center gap-6">
        <h2 className="text-display text-balance">
          <AccentText text={title} accent={accent} />
        </h2>
        <CTAButton label={SHARED.cta} trackAs="final_cta" className="w-full sm:w-auto" />
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          <RegionText raw={SHARED.reassurance} />
        </p>
      </ScrollReveal>
    </LpSection>
  );
}
