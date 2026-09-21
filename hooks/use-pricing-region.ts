"use client";

import { useContext } from "react";

import {
  RegionPricingContext,
  type RegionPricingValue,
} from "@/components/market/RegionPricingProvider";

/**
 * The region-resolved ladder and trial length (STA-330). Throws outside a
 * RegionPricingProvider on purpose: a price surface silently rendering without
 * one would fall back to nothing at all, which is worse than failing loudly in
 * dev the moment the surface is mounted on an unwired page.
 */
export function usePricingRegion(): RegionPricingValue {
  const value = useContext(RegionPricingContext);
  if (!value) {
    throw new Error("usePricingRegion must be used inside a RegionPricingProvider");
  }
  return value;
}
