"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ScrollReveal } from "../ui/ScrollReveal";
import {
  formatPrice,
  isFoundingProgramOpen,
  yearlyCardView,
  type BillingInterval,
  type TierId,
} from "@/lib/pricing";
import { PricingTierCard, type FeatureItem } from "@/components/pricing/PricingTierCard";
import { BillingIntervalToggle } from "@/components/pricing/BillingIntervalToggle";

const TIERS = [
  { id: "starter" as const, trackAs: "pricing_starter" as const },
  { id: "growth" as const, trackAs: "pricing_growth" as const, highlighted: true },
  { id: "pro" as const, trackAs: "pricing_pro" as const },
];

/**
 * Landing-page pricing block. Client-side because of the cadence switcher —
 * the card itself was already a client component, so the boundary only moves
 * up by one level.
 */
export function PricingSection() {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const foundingOpen = isFoundingProgramOpen();
  // Monthly is the default: it is the price most people compare on, and the
  // yearly saving is advertised on the toggle itself.
  const [interval, setInterval] = useState<BillingInterval>("month");

  return (
    <section id="pricing" className="relative py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-h2 mb-6">
            {t("title")}
          </h2>
          <p className="text-lead text-[var(--muted-foreground)] max-w-2xl mx-auto">
            {foundingOpen ? t("subtitle") : t("subtitleStandard")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150} className="mb-10">
          <BillingIntervalToggle value={interval} onChange={setInterval} />
        </ScrollReveal>

        <ScrollReveal
          delay={200}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-md lg:max-w-none mx-auto"
        >
          {TIERS.map(({ id, trackAs, highlighted }) => {
            const view = yearlyCardView(id as TierId, interval, foundingOpen);
            return (
              <PricingTierCard
                key={id}
                name={t(`${id}.name`)}
                tagline={t(`${id}.tagline`)}
                features={t.raw(`${id}.features`) as FeatureItem[]}
                featuresLabel={t(`${id}.featuresLabel`)}
                price={view.price}
                discount={view.discount}
                // Both cadences quote a per-month figure so they compare
                // directly; the yearly total sits in the sub-label.
                perMonthLabel={t("perMonth")}
                forLifeLabel={view.isYearly ? t("perMonth") : t("forLife")}
                subLabel={
                  view.isYearly
                    ? t("billedYearlyTotal", {
                        price: formatPrice(view.yearlyTotal, locale),
                        saving: formatPrice(view.yearlySaving, locale),
                      })
                    : t("billedMonthly")
                }
                cta={t("cta")}
                ctaHref="/onboarding"
                ctaSubtext={t("ctaSubtext")}
                highlighted={highlighted}
                popularLabel={highlighted ? t("popular") : undefined}
                trackAs={trackAs}
              />
            );
          })}
        </ScrollReveal>

        {foundingOpen && (
          <ScrollReveal delay={300} className="mt-8 text-center">
            <p className="text-[var(--muted-foreground)] text-sm font-medium max-w-2xl mx-auto">
              {t("foundingReassurance")}
            </p>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
