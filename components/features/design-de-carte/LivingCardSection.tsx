"use client";

import { useTranslations } from "next-intl";
import { HandWaving, Flag, Gift, Stack } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import type { CardDesign } from "@/lib/types/design";

const BENEFIT_ICONS = [HandWaving, Flag, Gift];

export function LivingCardSection() {
  const t = useTranslations("features.design-de-carte.custom.livingCard");
  const benefits = t.raw("benefits") as string[];

  const cardDesign: Partial<CardDesign> = {
    organization_name: t("card.orgName"),
    background_color: "#2C1810",
    stamp_filled_color: "#D4A574",
    icon_color: "#ffffff",
    stamp_icon: "coffee",
    reward_icon: "gift",
    total_stamps: 8,
    secondary_fields: [
      { key: "member", label: t("card.memberLabel"), value: t("card.memberName") },
      { key: "rewards", label: t("card.rewardsLabel"), value: t("card.rewardsValue") },
    ],
  };

  return (
    <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("description")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Card preview */}
          <ScrollReveal variant="right">
            <div className="mx-auto max-w-[300px]">
              <ScaledCardWrapper baseWidth={300}>
                <WalletCard
                  design={cardDesign}
                  stamps={6}
                  showQR={true}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </div>
          </ScrollReveal>

          {/* Explanation */}
          <ScrollReveal variant="left">
            <p className="text-[var(--foreground)] font-medium leading-relaxed mb-6">
              {t("lead")}
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, i) => {
                const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                return (
                  <li key={i} className="flex items-start gap-3.5">
                    <span className="w-9 h-9 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-[18px] h-[18px]" weight="fill" style={{ color: "var(--accent)" }} />
                    </span>
                    <span className="text-[var(--muted-foreground)] leading-relaxed pt-1.5">
                      {benefit}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Stacked rewards — one idea box */}
            <div className="rounded-2xl bg-white border border-[var(--accent)]/10 p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                <Stack className="w-5 h-5" weight="fill" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">
                  {t("stacking.title")}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {t("stacking.description")}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
