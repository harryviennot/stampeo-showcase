"use client";

import { Fragment } from "react";
import { useLocale } from "next-intl";

import { usePricingRegion } from "@/hooks/use-pricing-region";
import { splitPricingParts } from "@/lib/region-pricing";
import { interpolatePricing } from "@/lib/pricing";
import { TextSkeleton } from "@/components/ui/TextSkeleton";

/** Day counts and percentages are short; money runs to "1 140 $". */
const NARROW_TOKENS = new Set(["trialDays", "freeMonths", "yearlyDiscount"]);

/**
 * A raw i18n string whose pricing tokens resolve to the VISITOR's region
 * (STA-330), not the page's market.
 *
 * The client leaf that lets async server components (VariantHero, VariantFAQ,
 * VariantFinalCTA, VariantDifferentiator) keep their sentences server-rendered
 * around a client-resolved number: pass `t.raw(...)` output and the tokens
 * render as skeleton chips until detection resolves, then as the region's
 * amounts via the same `interpolatePricing` the server path uses.
 */
export function RegionText({ raw }: Readonly<{ raw: string }>) {
  const { pricing, trialDays, ready } = usePricingRegion();
  const locale = useLocale();

  if (ready) {
    return <>{interpolatePricing(raw, pricing, locale, trialDays)}</>;
  }

  return (
    <>
      {splitPricingParts(raw).map((part, i) =>
        part.type === "text" ? (
          <Fragment key={i}>{part.value}</Fragment>
        ) : (
          <TextSkeleton key={i} ch={NARROW_TOKENS.has(part.value) ? 2 : 4} />
        ),
      )}
    </>
  );
}
