"use client";

import { useLocale } from "next-intl";

import { usePricingRegion } from "@/hooks/use-pricing-region";
import { interpolatePricing } from "@/lib/pricing";

/**
 * A raw i18n string whose pricing tokens resolve to the VISITOR's region, not
 * the page's market.
 *
 * The client leaf that lets async server components (VariantHero, VariantFAQ,
 * VariantFinalCTA, VariantDifferentiator) keep their sentences server-rendered
 * around a client-resolved number: pass `t.raw(...)` output and the server
 * renders the page market's amounts, swapped for the region's after hydration.
 * The span suppresses the hydration text check: Node and the browser can format
 * the same amount differently, and a mismatch would remount the page.
 */
export function RegionText({ raw }: Readonly<{ raw: string }>) {
  const { pricing, trialDays } = usePricingRegion();
  const locale = useLocale();

  return (
    <span suppressHydrationWarning>
      {interpolatePricing(raw, pricing, locale, trialDays)}
    </span>
  );
}
