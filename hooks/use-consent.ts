"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  currentConsent,
  detectConsentRegime,
  detectGpc,
  readConsentRecord,
  resolveConsent,
  subscribeToConsentChange,
  type ConsentRecord,
  type ConsentRegime,
  type ConsentState,
} from "@/lib/consent";

export interface ConsentSnapshot extends ConsentState {
  /** The stored choice, or null if they have never answered. */
  record: ConsentRecord | null;
  regime: ConsentRegime;
  gpc: boolean;
  /**
   * False during the server render and the first paint.
   *
   * Nothing consent-shaped may be decided until this is true. The server
   * cannot know the visitor's timezone, so `regime` is a placeholder there;
   * rendering the banner on its strength would show a French banner to an
   * American and, worse, would make the page's HTML depend on the visitor,
   * which is exactly what keeps showcase static.
   */
  ready: boolean;
}

/**
 * The server answer: denied, and not ready.
 *
 * A single frozen object rather than a fresh one per call, because
 * `useSyncExternalStore` compares snapshots by identity and a new object every
 * render is an infinite loop.
 */
const SERVER_SNAPSHOT: ConsentSnapshot = Object.freeze({
  analytics: false,
  marketing: false,
  record: null,
  regime: "opt-in" as const,
  gpc: false,
  ready: false,
});

let cached: ConsentSnapshot = SERVER_SNAPSHOT;
let cachedKey = "";

/**
 * Same identity-stability problem on the client, solved by only building a new
 * object when something actually changed.
 */
function clientSnapshot(): ConsentSnapshot {
  const record = readConsentRecord();
  const regime = detectConsentRegime();
  const gpc = detectGpc();
  const state = resolveConsent({ record, regime, gpc });
  const key = `${record ? `${record.analytics}${record.marketing}` : "none"}|${regime}|${gpc}`;

  if (key !== cachedKey) {
    cachedKey = key;
    cached = { ...state, record, regime, gpc, ready: true };
  }
  return cached;
}

/**
 * What this visitor has agreed to, re-read whenever it changes.
 *
 * Mirrors the `useSyncExternalStore` shape used by
 * `components/market/MarketSuggestion.tsx`: the server snapshot is inert, the
 * real answer arrives after mount, and no page becomes dynamic because of it.
 */
export function useConsent(): ConsentSnapshot {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToConsentChange(onChange),
    [],
  );
  return useSyncExternalStore(subscribe, clientSnapshot, () => SERVER_SNAPSHOT);
}

/**
 * Imperative read for non-React call sites (a click handler that has to decide
 * whether to send an event). Always denied on the server.
 */
export { currentConsent };
