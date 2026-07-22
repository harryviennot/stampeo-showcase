"use client";

import { useSyncExternalStore } from "react";

/**
 * Detects the visitor's wallet platform so we can offer the matching wallet
 * button first (Apple on iOS, Google on Android) instead of asking them to
 * choose. Mirrors the backend's `detect_device_type` (backend demo.py): a
 * User-Agent check with an added iPadOS case (modern iPads report as desktop
 * Safari, so we fall back to touch + "Macintosh").
 */

export type DevicePlatform = "ios" | "android" | "desktop";

function detectPlatform(): DevicePlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";

  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  // iPadOS 13+ masquerades as macOS Safari — a Mac UA that also reports touch
  // is an iPad.
  if (
    /macintosh/i.test(ua) &&
    typeof document !== "undefined" &&
    "ontouchend" in document
  ) {
    return "ios";
  }
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

// The UA doesn't change during a session, so compute once and cache.
let cached: DevicePlatform | null = null;

function getSnapshot(): DevicePlatform {
  if (cached === null) cached = detectPlatform();
  return cached;
}

// Server render can't know the device; assume desktop (shows both buttons) and
// let the client swap in the real value on hydration.
function getServerSnapshot(): DevicePlatform {
  return "desktop";
}

function subscribe(): () => void {
  return () => {};
}

export function useDevicePlatform(): DevicePlatform {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
