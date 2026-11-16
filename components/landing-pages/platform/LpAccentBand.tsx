import { CTAButton } from "@/components/ui/CTAButton";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RegionText } from "@/components/market/RegionText";
import { AccentText } from "@/lib/landing-pages/AccentText";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import type { BandCopy } from "@/lib/landing-pages/copy/types";
import { LpSection } from "../shared/LpSection";

/** A faint warm glow in two corners and along the edges of the card. */
const GLOW =
  "[background:radial-gradient(70%_90%_at_0%_0%,rgb(249_115_22/0.13),transparent_70%),radial-gradient(70%_90%_at_100%_100%,rgb(249_115_22/0.11),transparent_70%)] shadow-[inset_0_0_80px_rgb(249_115_22/0.07)]";

/**
 * A Platform-style page's closing ask (Platform's own words unless the page
 * brings its `copy`): an inset, rounded cream card with a warm glow at its
 * edges, the headline in the page's ink with its accent word in orange, and the
 * orange trial keycap.
 */
export function LpAccentBand({ copy = PLATFORM.band }: Readonly<{ copy?: BandCopy }>) {
  return (
    <LpSection section="final_cta" bare>
      <section className="py-8 lg:py-16">
        <Container>
          <ScrollReveal>
            <div className="relative isolate overflow-hidden rounded-[28px] bg-[var(--blog-bg)] px-6 py-14 text-center ring-1 ring-[var(--accent)]/15 sm:px-12 lg:py-20">
              <div aria-hidden className={`absolute inset-0 -z-10 rounded-[inherit] ${GLOW}`} />
              <div className="flex flex-col items-center gap-5">
                <h2 className="text-display max-w-[840px] text-balance">
                  <AccentText text={copy.title} accent={copy.accent} />
                </h2>
                <p className="max-w-xl text-pretty text-lead text-[var(--muted-foreground)]">{copy.sub}</p>
                <CTAButton label={SHARED.cta} trackAs="final_cta" keycap className="mt-2 mb-[3px] w-full sm:w-auto" />
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  <RegionText raw={SHARED.reassurance} />
                </p>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </LpSection>
  );
}
