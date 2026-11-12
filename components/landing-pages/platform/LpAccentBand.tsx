import { CTAButton } from "@/components/ui/CTAButton";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RegionText } from "@/components/market/RegionText";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpSection } from "../shared/LpSection";

/**
 * Platform's closing ask: an inset, rounded band on the accent colour, its
 * words in the page's ink (white would not read on orange) and a white button.
 */
export function LpAccentBand() {
  return (
    <LpSection section="final_cta" bare>
      <section className="py-4 lg:py-16">
        <Container>
          <ScrollReveal>
            <div className="flex flex-col items-center gap-5 rounded-[28px] bg-[var(--accent)] px-6 py-14 text-center text-[var(--near-black)] sm:px-12 lg:py-20">
              <h2 className="text-display max-w-[840px] text-balance">{PLATFORM.band.title}</h2>
              <p className="max-w-xl text-pretty text-lead">{PLATFORM.band.sub}</p>
              <CTAButton
                label={SHARED.cta}
                variant="inverse"
                trackAs="final_cta"
                className="mt-2 w-full sm:w-auto"
              />
              <p className="text-sm font-medium">
                <RegionText raw={SHARED.reassurance} />
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </LpSection>
  );
}
