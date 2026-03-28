"use client";

import { useSyncExternalStore } from "react";

/**
 * Detects if the user is on a mobile phone (not tablet, not small desktop window).
 * Uses navigator.userAgentData.mobile (modern API) with UA string fallback.
 */

function detectMobilePhone(): boolean {
  if (typeof navigator === "undefined") return false;

  // Modern API (Chrome 90+, Edge 90+) — returns true only for phones
  if ("userAgentData" in navigator) {
    const uad = navigator.userAgentData as { mobile?: boolean } | undefined;
    if (uad?.mobile !== undefined) {
      return uad.mobile;
    }
  }

  // Fallback: UA string
  // "Android.*Mobile" matches phones but not tablets
  // "iPhone" matches all iPhones; iPads report as desktop Safari
  return /iPhone|Android.*Mobile|webOS|iPod|BlackBerry|Windows Phone/i.test(
    navigator.userAgent
  );
}

// Static value — UA doesn't change during session
let cachedValue: boolean | null = null;

function getSnapshot(): boolean {
  if (cachedValue === null) {
    cachedValue = detectMobilePhone();
  }
  return cachedValue;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(): () => void {
  // UA never changes, no subscription needed
  return () => {};
}

export function useIsMobilePhone(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
