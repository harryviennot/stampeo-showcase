"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { heroVariant, type HeroVariant } from "@/lib/landing-pages/platform/variants";

/** The hero the query string asks for (`?hero=shelf`); anything else is the stack. */
export function heroFromSearch(search: string): HeroVariant {
  return heroVariant(new URLSearchParams(search));
}

const subscribe = () => () => {};

/**
 * Shows the stack hero, or the shelf when the address says `?hero=shelf`. The server and the first client render
 * both show the stack, so the page is static and its first paint never waits for the query string; a visitor who
 * asked for the shelf gets it as soon as the page is interactive.
 */
export function HeroVariantSwitch({ stack, shelf }: Readonly<{ stack: ReactNode; shelf: ReactNode }>) {
  const variant = useSyncExternalStore<HeroVariant>(
    subscribe,
    () => heroFromSearch(window.location.search),
    () => "stack",
  );

  return variant === "shelf" ? shelf : stack;
}
