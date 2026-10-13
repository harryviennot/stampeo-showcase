"use client";

import { useSyncExternalStore } from "react";
import { classifyInAppBrowser, type InAppBrowser } from "@/lib/auth/in-app-browser";

/**
 * The Meta app whose browser the visitor is in, or null for a real browser.
 * The server render can't know, so it answers null and the client swaps in the
 * real value on hydration.
 */

// The user agent doesn't change during a session, so read it once.
let cached: { value: InAppBrowser | null } | null = null;

function getSnapshot(): InAppBrowser | null {
  if (cached === null) {
    const ua = typeof navigator === "undefined" ? "" : navigator.userAgent || "";
    cached = { value: classifyInAppBrowser(ua) };
  }
  return cached.value;
}

function getServerSnapshot(): InAppBrowser | null {
  return null;
}

function subscribe(): () => void {
  return () => {};
}

export function useInAppBrowser(): InAppBrowser | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
