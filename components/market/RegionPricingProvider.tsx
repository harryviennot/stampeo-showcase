"use client";

import { createContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

import { detectBrowserCountry } from "@/lib/phone-utils";
import {
  displayTerms,
  type DisplayTerms,
  type RegionCurrency,
} from "@/lib/region-pricing";
import type { Pricing } from "@/lib/pricing";

/** The ladder and trial length every price surface on the page shows. */
export type RegionPricingValue = DisplayTerms;

export const RegionPricingContext = createContext<RegionPricingValue | null>(null);

/** No-op: the browser's country does not change while the page is open. */
const subscribe = () => () => {};

/** The server knows no visitor country, so it renders the page market's terms. */
const serverCountry = () => null;

/**
 * Detected once and cached at module scope: the answer cannot change while the
 * page is open, `useSyncExternalStore` needs an identity-stable snapshot (a
 * primitive — see the loop warning in hooks/use-consent.ts), and re-running
 * `Intl.DateTimeFormat()` on every consumer render is waste.
 */
let cachedCountry: string | null | undefined;
function clientCountry(): string | null {
  if (cachedCountry === undefined) cachedCountry = detectBrowserCountry() ?? null;
  return cachedCountry;
}

/**
 * Hands every price surface the ladder and trial length for the visitor's
 * DETECTED region, whatever page they are on.
 *
 * The server and hydration passes render the page market's terms, so the HTML
 * carries real prices; after hydration the detected region swaps in. Every price
 * text node sits in a `PriceText`.
 *
 * Mounted inside VariantLanding / MarketPricingPage only — never around the
 * layout's tracker siblings (GoogleAnalytics, MetaPixel, AttributionCapture,
 * ConsentBanner): remounting those double-fires page_view, and delaying the
 * LandingTracker subtree freezes `variant: null` into the 182-day attribution
 * cookie. This provider changes no tree shape: the swap only changes text.
 *
 * Detection is display-only. It reuses `detectBrowserCountry()` as-is and must
 * never feed the consent-regime path (`lib/consent.ts`), which derives a
 * visitor's legal opt-in/opt-out status from the same timezone table.
 */
export function RegionPricingProvider({
  ladders,
  defaultCurrency,
  defaultTrialDays,
  children,
}: Readonly<{
  /** Both ladders, fetched server-side so the page stays ISR-cacheable. */
  ladders: Record<RegionCurrency, Pricing>;
  /** The page's market currency: what the server and an undetectable visitor see. */
  defaultCurrency: RegionCurrency;
  defaultTrialDays: number;
  children: ReactNode;
}>) {
  const country = useSyncExternalStore(subscribe, clientCountry, serverCountry);

  const value = useMemo<RegionPricingValue>(
    () =>
      displayTerms(
        ladders,
        { currency: defaultCurrency, trialDays: defaultTrialDays },
        country,
      ),
    [country, ladders, defaultCurrency, defaultTrialDays],
  );

  return (
    <RegionPricingContext.Provider value={value}>
      {children}
    </RegionPricingContext.Provider>
  );
}
