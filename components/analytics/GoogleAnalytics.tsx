"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useConsent } from "@/hooks/use-consent";
import { isTrackablePath } from "@/lib/consent-routes";
import {
  initGa,
  isGaLoaded,
  measurementIdFromEnv,
  shouldLoadGa,
  shouldSendPageView,
  trackGaPageView,
} from "@/lib/google-analytics";

/**
 * Mounts the GA4 tag, once the visitor and the route both allow it.
 *
 * Deliberately thin: every decision is a pure function in
 * `lib/google-analytics.ts` so `bun test lib` covers it. Showcase has no
 * component test runner, so a branch written here would be a branch nobody
 * tests. The sibling is `MetaPixel` — same shape, `analytics` consent instead
 * of `marketing`.
 *
 * Renders nothing. It exists for its effect.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const { analytics, ready } = useConsent();

  /**
   * The last path this component instance SAW — not the last one it sent a
   * page_view for. Updated unconditionally at the top of every effect run,
   * untrackable paths included, for two reasons found in review:
   *
   * - A detour must not suppress the return. /pricing → /onboarding (silent)
   *   → /pricing has to count the second /pricing arrival (QA GA-02), which
   *   only works if the ref recorded that /onboarding was seen.
   * - The ref resets to null on a REMOUNT — the locale switcher's
   *   `router.replace(pathname, { locale })` replaces the `[locale]` tree —
   *   while the script (module state in lib/google-analytics.ts) stays
   *   resident. `shouldSendPageView` reads that combination as the remount it
   *   is and sends for the current path; assigning the ref before any early
   *   return below is what keeps the state machine from wedging.
   */
  const lastPageView = useRef<string | null>(null);

  useEffect(() => {
    const measurementId = measurementIdFromEnv();
    const trackable = isTrackablePath(pathname);
    // Read BEFORE any init this run performs: "was the script resident before
    // this effect ran" is what separates the config-sends-the-first-page_view
    // seed from a remount whose path never got one.
    const alreadyLoaded = isGaLoaded();
    const lastPath = lastPageView.current;
    lastPageView.current = pathname;

    // Re-evaluated on every navigation, not just at mount: `trackable` changes
    // under the visitor's feet when they step into /onboarding or follow a QR
    // link to a business page.
    if (!shouldLoadGa({ measurementId, analytics, ready, trackable })) return;

    if (!alreadyLoaded) {
      // config fires its own page_view; `shouldSendPageView` stays silent on
      // this run (`alreadyLoaded: false`), so it is not sent twice.
      initGa(measurementId as string);
    }

    // Already resident, and the visitor navigated client-side — or the tree
    // remounted under a resident script. GA4 only reports page_view at config
    // time, so without this every session looks like one page.
    if (
      !shouldSendPageView({
        loaded: isGaLoaded(),
        trackable,
        alreadyLoaded,
        lastPath,
        nextPath: pathname,
      })
    ) {
      return;
    }

    trackGaPageView({ path: pathname, trackable });
  }, [pathname, analytics, ready]);

  return null;
}
