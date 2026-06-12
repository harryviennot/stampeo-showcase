"use client";

import { useTranslations } from "next-intl";
import { Check, Sparkle } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { CUSTOM_EXAMPLES } from "@/lib/custom-stamp-presets";
import type { CardDesign } from "@/lib/types/design";

interface GalleryExample {
  orgName: string;
  reward: string;
  caption: string;
}

/**
 * The headline section for STA-216: a gallery of finished cards built from
 * merchant-style icons, each demonstrating a different arrangement and
 * empty-stamp style. Cards are live-rendered WalletCards so they match exactly
 * what the editor and the generated strips produce.
 */
export function CustomIconsSection() {
  const t = useTranslations("features.design-de-carte.custom.customIcons");
  const tp = useTranslations("features.design-de-carte.custom.playground");
  const bullets = t.raw("bullets") as string[];
  const examples = t.raw("gallery.examples") as GalleryExample[];
  const rewardLabel = tp("rewardLabel");

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
          {examples.map((example, index) => {
            const preset = CUSTOM_EXAMPLES[index];
            if (!preset) return null;

            const design: Partial<CardDesign> = {
              organization_name: example.orgName,
              background_color: preset.bg,
              stamp_filled_color: preset.accent,
              total_stamps: preset.totalStamps,
              stamp_icon_mode: "custom",
              custom_stamp_config: preset.config,
              secondary_fields: [
                { key: "reward", label: rewardLabel, value: example.reward },
              ],
            };

            return (
              <ScrollReveal
                key={example.orgName}
                delay={index * 80}
                className="flex flex-col"
              >
                <div className="rounded-2xl bg-white border border-[var(--accent)]/10 p-3 sm:p-4 shadow-sm">
                  <ScaledCardWrapper baseWidth={280}>
                    <WalletCard design={design} stamps={preset.filled} showQR={false} />
                  </ScaledCardWrapper>
                </div>
                <p className="mt-3 text-center text-xs sm:text-sm text-[var(--muted-foreground)]">
                  {example.caption}
                </p>
              </ScrollReveal>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-[var(--muted-foreground)]/70">
          {t("attribution")}
        </p>
      </Container>
    </section>
  );
}
