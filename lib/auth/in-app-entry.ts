import { routing } from "@/i18n/routing";

const LOCALES: ReadonlySet<string> = new Set(routing.locales);

/**
 * Meta's in-app browsers open their last full page load, not the current address, on
 * "Open in external browser". An in-app visitor who reached sign-up by an in-page
 * navigation reloads it once through `/start`, so that load is the one handed over.
 * `documentPath` is the pathname of the page's document load.
 */
export function shouldReloadThroughStart(input: { inApp: boolean; documentPath: string | null }): boolean {
  const { inApp, documentPath } = input;
  if (!inApp || documentPath === null) return false;

  const segments = documentPath.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALES.has(segments[0])) segments.shift();
  return segments[0] !== "start" && segments[0] !== "onboarding";
}

/** The forwarding page with the ad click, for that reload. */
export function startAddress(locale: string, params: URLSearchParams): string {
  const query = params.toString();
  return `/${locale}/start${query ? `?${query}` : ""}`;
}
