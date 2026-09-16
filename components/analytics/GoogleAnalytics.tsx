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
   * The last path a page_view was recorded for, or null while the tag has
   * never been configured.
   *
   * `gtag('config', …)` sends the first page_view itself, so this is seeded at
   * init rather than left null — otherwise the initial view would be sent
   * twice. After that it is what distinguishes a real navigation from React
   * strict mode running the effect a second time on the same path.
   */
  const lastPageView = useRef<string | null>(null);

  useEffect(() => {
    const measurementId = measurementIdFromEnv();
    const trackable = isTrackablePath(pathname);

    // Re-evaluated on every navigation, not just at mount: `trackable` changes
    // under the visitor's feet when they step into /onboarding or follow a QR
    // link to a business page.
    if (!shouldLoadGa({ measurementId, analytics, ready, trackable })) return;

    if (!isGaLoaded()) {
      // config fires its own page_view, so this path must not send a second.
      initGa(measurementId as string);
      lastPageView.current = pathname;
      return;
    }

    // Already resident, and the visitor navigated client-side. GA4 only
    // reports page_view at config time, so without this every session looks
    // like one page.
    if (
      !shouldSendPageView({
        loaded: true,
        trackable,
        lastPath: lastPageView.current,
        nextPath: pathname,
      })
    ) {
      return;
    }

    lastPageView.current = pathname;
    trackGaPageView({ path: pathname, trackable });
  }, [pathname, analytics, ready]);

  return null;
}
