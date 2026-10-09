"use client";

import { useLocale } from "next-intl";

import { usePricingRegion } from "@/hooks/use-pricing-region";
import { PriceText } from "@/components/market/PriceText";
import { interpolatePricing } from "@/lib/pricing";

/**
 * A raw i18n string whose pricing tokens resolve to the VISITOR's region, not
 * the page's market.
 *
 * The client leaf that lets async server components (VariantHero, VariantFAQ,
 * VariantFinalCTA, VariantDifferentiator) keep their sentences server-rendered
 * around a client-resolved number: pass `t.raw(...)` output and the server
 * renders the page market's amounts, swapped for the region's after hydration.
 */
export function RegionText({ raw }: Readonly<{ raw: string }>) {
  const { pricing, trialDays } = usePricingRegion();
  const locale = useLocale();

  return (
    <PriceText>{interpolatePricing(raw, pricing, locale, trialDays)}</PriceText>
  );
}
