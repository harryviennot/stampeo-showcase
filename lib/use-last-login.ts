"use client";

import { useSyncExternalStore } from "react";
import { readLastLogin, type LastLogin } from "./last-login";

// useSyncExternalStore wants a stable snapshot reference. Cache the last
// parsed value keyed by the raw cookie string so repeat calls during the
// same render return the same object identity.
let cachedRaw: string | null = null;
let cachedValue: LastLogin | null = null;

function getSnapshot(): LastLogin | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie;
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = readLastLogin();
  return cachedValue;
}

function getServerSnapshot(): LastLogin | null {
  return null;
}

function subscribe(): () => void {
  // The cookie does not push updates while the chooser is on screen — a
  // no-op subscribe is correct.
  return () => {};
}

export function useLastLogin(): LastLogin | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
