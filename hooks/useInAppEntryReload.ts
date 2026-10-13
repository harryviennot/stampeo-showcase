"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { escapeParamsFromCookies } from "@/lib/auth/escape-params";
import { classifyInAppBrowser } from "@/lib/auth/in-app-browser";
import { shouldReloadThroughStart, startAddress } from "@/lib/auth/in-app-entry";

/** The pathname of this page's document load, or null when the browser does not say. */
function documentPath(): string | null {
  const entry = performance.getEntriesByType?.("navigation")[0];
  if (!entry) return null;
  try {
    return new URL(entry.name).pathname;
  } catch {
    return null;
  }
}

/** Reloads sign-up once through `/start` in Meta's in-app browsers; true while that reload is under way. */
export function useInAppEntryReload(skip: boolean): boolean {
  const locale = useLocale();
  const [reloading] = useState(
    () =>
      !skip &&
      typeof window !== "undefined" &&
      shouldReloadThroughStart({
        inApp: classifyInAppBrowser(navigator.userAgent) !== null,
        documentPath: documentPath(),
      })
  );

  useEffect(() => {
    if (reloading) window.location.replace(startAddress(locale, escapeParamsFromCookies(document.cookie)));
  }, [reloading, locale]);

  return reloading;
}
