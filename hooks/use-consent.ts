"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { currentConsent, subscribeToConsentChange } from "@/lib/consent";
import { runPageLifecycle } from "@/lib/privacy/lifecycle";
import {
  SERVER_SNAPSHOT,
  readConsentSnapshot,
  type ConsentSnapshot,
} from "@/lib/privacy/snapshot";

export type { ConsentSnapshot };

/**
 * What this visitor has agreed to, re-read whenever it changes.
 *
 * Mirrors the `useSyncExternalStore` shape used by
 * `components/market/MarketSuggestion.tsx`: the server snapshot is inert, the
 * real answer arrives after mount, and no page becomes dynamic because of it.
 *
 * Each page also runs the privacy lifecycle (`lib/privacy/lifecycle.ts`): in
 * the US it mints the subject id before any tag may load, and it re-issues a
 * standing refusal. It is idempotent, so every consumer of this hook can run it.
 */
export function useConsent(): ConsentSnapshot {
  const pathname = usePathname();
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToConsentChange(onChange),
    [],
  );
  const snapshot = useSyncExternalStore(subscribe, readConsentSnapshot, () => SERVER_SNAPSHOT);

  useEffect(() => {
    runPageLifecycle(pathname ?? "");
  }, [pathname]);

  return snapshot;
}

/**
 * Imperative read for non-React call sites (a click handler that has to decide
 * whether to send an event). Always denied on the server.
 */
export { currentConsent };
