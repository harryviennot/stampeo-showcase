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
   * The last path a PageView was sent for.
   *
   * Two things make this necessary. React strict mode runs the effect twice on
   * mount, and a consent change re-runs it on the same path — without this,
   * either one sends a duplicate PageView and every funnel is inflated.
   */
  const lastPageView = useRef<string | null>(null);

  useEffect(() => {
    const pixelId = metaPixelIdFromEnv();
    const trackable = isTrackablePath(pathname);

    // Re-evaluated on every navigation, not just at mount: `trackable` changes
    // under the visitor's feet when they follow a QR link to a business page.
    if (!shouldLoadMetaPixel({ pixelId, marketing, ready, trackable })) return;
    if (lastPageView.current === pathname) return;
    lastPageView.current = pathname;

    if (!isMetaPixelLoaded()) {
      // init fires its own PageView, so this path must not send a second.
      initMetaPixel(pixelId as string);
      return;
    }

    // Already resident, and the visitor navigated client-side. Meta only fires
    // PageView at init, so without this every session looks like one page.
    trackMetaEvent({ event: "PageView", trackable });
  }, [pathname, marketing, ready]);

  return null;
}
