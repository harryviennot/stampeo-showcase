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
  // Yearly is the default here too, so the price on the homepage matches the
  // one on /pricing.
  const [interval, setInterval] = useState<BillingInterval>("year");

  return (
    <section id="pricing" className="relative py-16 lg:py-24">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-10">
          <h2 className="text-h2 mb-6">
            {t("title")}
          </h2>
          <p className="text-lead text-[var(--muted-foreground)] max-w-2xl mx-auto">
            {foundingOpen ? t("subtitle") : t("subtitleStandard")}
          </p>
        </ScrollReveal>

        {/* lg:mb-14: the margin note above the recommended card needs the
            extra headroom or it collides with this toggle. */}
        <ScrollReveal delay={150} className="mb-10 lg:mb-14">
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
                // Cheap-to-expensive at every width: the stacked mobile order
                // matches the desktop one.
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
                annotationLabel={highlighted ? t("annotation") : undefined}
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
