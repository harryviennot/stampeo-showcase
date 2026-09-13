"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { CountryCode } from "libphonenumber-js";

import { detectBrowserCountry, localeCountry } from "@/lib/phone-utils";

/** No-op: the browser's country does not change while the page is open. */
const subscribe = () => () => {};

/**
 * The country to pre-select in a phone field.
 *
 * Deliberately NOT a plain `useState(() => detect())`. The browser signals
 * (timezone, `navigator.language`) do not exist during server rendering, so
 * reading them in a render the server also performs made the first client
 * render disagree with the HTML: an `en` page served the US flag and hydrated
 * to the French one, and React threw away the entire form to fix it.
 *
 * `useSyncExternalStore` is the sanctioned way to say "this value is one thing
 * on the server and another in the browser": it hydrates with the server
 * snapshot, then re-renders once with the client's. The flag settles a frame
 * later instead of costing the form a full remount.
 */
export function useDetectedCountry(locale: string): CountryCode {
  const getSnapshot = useCallback(
    () => detectBrowserCountry() ?? localeCountry(locale),
    [locale]
  );
  const getServerSnapshot = useCallback(() => localeCountry(locale), [locale]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
