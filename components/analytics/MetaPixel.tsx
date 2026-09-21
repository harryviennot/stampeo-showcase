"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useConsent } from "@/hooks/use-consent";
import { isTrackablePath } from "@/lib/consent-routes";
import {
  initMetaPixel,
  isMetaPixelLoaded,
  metaPixelIdFromEnv,
  shouldLoadMetaPixel,
  shouldSendMetaPageView,
  trackMetaEvent,
} from "@/lib/meta-pixel";

/**
 * Mounts the Meta pixel, once the visitor and the route both allow it.
 *
 * Deliberately thin: every decision is a pure function in `lib/meta-pixel.ts`
 * so `bun test lib` covers it. Showcase has no component test runner, so a
 * branch written here would be a branch nobody tests.
 *
 * Renders nothing. It exists for its effect.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const { marketing, ready } = useConsent();

  /**
   * The last path this component instance SAW — not the last one it sent a
   * PageView for. Updated unconditionally at the top of every effect run,
   * untrackable paths included, so a detour through /onboarding does not
   * suppress the PageView on the return, and always assigned before any early
   * return so a locale-switch remount (ref reset, script still resident)
   * cannot wedge the dedupe. `shouldSendMetaPageView` owns the decision; the
   * same shape as the GA sibling.
   */
  const lastPageView = useRef<string | null>(null);

  useEffect(() => {
    const pixelId = metaPixelIdFromEnv();
    const trackable = isTrackablePath(pathname);
    // Read BEFORE any init this run performs — "resident before this run" is
    // what separates init's own PageView from a remount that needs one sent.
    const alreadyLoaded = isMetaPixelLoaded();
    const lastPath = lastPageView.current;
    lastPageView.current = pathname;

    // Re-evaluated on every navigation, not just at mount: `trackable` changes
    // under the visitor's feet when they follow a QR link to a business page.
    if (!shouldLoadMetaPixel({ pixelId, marketing, ready, trackable })) return;

    if (!alreadyLoaded) {
      // init fires its own PageView; `shouldSendMetaPageView` stays silent on
      // this run (`alreadyLoaded: false`), so it is not sent twice.
      initMetaPixel(pixelId as string);
    }

    // Already resident, and the visitor navigated client-side — or the tree
    // remounted under a resident script. Meta only fires PageView at init, so
    // without this every session looks like one page.
    if (
      !shouldSendMetaPageView({
        loaded: isMetaPixelLoaded(),
        trackable,
        alreadyLoaded,
        lastPath,
        nextPath: pathname,
      })
    ) {
      return;
    }

    trackMetaEvent({ event: "PageView", trackable });
  }, [pathname, marketing, ready]);

  return null;
}
