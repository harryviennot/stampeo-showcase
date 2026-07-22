"use client";

import { useTranslations } from "next-intl";
import { Check, Sparkle } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { STAMP_SAMPLES } from "@/lib/loyalty-samples";

/** Brand-bank cards whose stamps are merchant-style custom icons, each
 *  demonstrating a different arrangement / empty-stamp treatment. */
const EXAMPLE_IDS = ["lustre", "pulp", "gelo", "oba"];

/**
 * The headline section for STA-216: a gallery of finished cards built from
 * merchant-style icons. Cards come from the hand-designed brand bank
 * (lib/loyalty-samples), so they match the style gallery above and what the
 * editor's generated strips actually produce.
 */
export function CustomIconsSection() {
  const t = useTranslations("features.design-de-carte.custom.customIcons");
  const bullets = t.raw("bullets") as string[];
  const captions = t.raw("gallery.examples") as string[];
  const examples = EXAMPLE_IDS.map((id) =>
    STAMP_SAMPLES.find((s) => s.id === id)
  ).filter((s) => s !== undefined);

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full bg-[var(--accent)]/5 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
            <Sparkle className="w-3.5 h-3.5" weight="fill" />
            {t("badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("description")}
          </p>

          <ul className="mt-7 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-x-6 gap-y-2.5">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
              >
                <span className="w-5 h-5 rounded-full bg-[var(--accent)]/12 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[var(--accent)]" weight="bold" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        {/* Example gallery — the proof of the claim */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {examples.map((sample, index) => (
            <ScrollReveal key={sample.id} delay={index * 80} className="flex flex-col">
              <div className="rounded-2xl bg-white border border-[var(--accent)]/10 p-3 sm:p-4 shadow-sm">
                <ScaledCardWrapper baseWidth={280}>
                  <WalletCard design={sample.design} stamps={sample.stamps} showQR={false} />
                </ScaledCardWrapper>
              </div>
              <p className="mt-3 text-center text-xs sm:text-sm text-[var(--muted-foreground)]">
                {captions[index] ?? ""}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
