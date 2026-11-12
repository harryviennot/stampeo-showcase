import type { Icon } from "@phosphor-icons/react";
import { CardStyleGallery } from "@/components/features/design-de-carte/CardStyleGallery";
import { ArrowsClockwiseIcon, PaletteIcon, SparklesIcon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { LpSection, TINTED_BAND } from "../shared/LpSection";

/** One icon for each fact, in the copy's order. */
const ICONS: Icon[] = [PaletteIcon, SparklesIcon, ArrowsClockwiseIcon];

/**
 * Looks like your shop: the style gallery under the page's own heading, with
 * its CTA hidden, then three facts (stacked on a phone, one row from `sm`).
 * The band's padding and tint are this block's; the gallery adds none.
 */
export function DesignSpotlight() {
  return (
    <LpSection section="spotlight_design" bare>
      <div className={TINTED_BAND}>
        <CardStyleGallery
          showCta={false}
          heading={{ title: FEATURES.design.title, subtitle: FEATURES.design.lead }}
          sectionClassName=""
        />
        <Container>
          <ScrollReveal delay={160}>
            <ul className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3 sm:gap-8 lg:mt-14">
              {FEATURES.design.facts.map((fact, index) => {
                const Icon = ICONS[index];
                return (
                  <li key={fact.text} className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--accent-hover)] ring-1 ring-[var(--border)]">
                      <Icon size={22} weight="duotone" aria-hidden />
                    </span>
                    <span className="min-w-0 text-pretty text-base text-[var(--foreground)]">{fact.text}</span>
                  </li>
                );
              })}
            </ul>
          </ScrollReveal>
        </Container>
      </div>
    </LpSection>
  );
}
