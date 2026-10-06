"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useConsent } from "@/hooks/use-consent";
import { capturePass, type StoredCarriers } from "@/lib/attribution/capture";
import { consentEvidence } from "@/lib/attribution/evidence";
import { captureLandingContext, landingFromUrl } from "@/lib/attribution/landing";
import { measurementIdFromEnv } from "@/lib/google-analytics";
import { metaPixelIdFromEnv } from "@/lib/meta-pixel";

/**
 * Records where this visitor came from into the three carrier cookies `web/`
 * can read: the campaign source, the GA ids and the paid click, each under its
 * own consent category (see `lib/attribution/capture.ts`).
 *
 * The business is created on app.stampeo.app, so these cookies are the only
 * thing that crosses the gap. Every decision about WHAT may be written is a
 * pure function there; this component owns only the timing, which is the part
 * that cannot be unit-tested.
 *
 * Renders nothing. It exists for its effect.
 */

/**
 * How long to wait for a tag to write its browser-id cookie, `_ga` for GA4 and
 * `_fbp` for Meta, before giving up on it.
 *
 * The tags are injected in sibling effects and their cookies appear a tick
 * after the vendor script executes, so a single synchronous read on mount would
 * almost always miss them. The source and the click are written at once, on the
 * first pass; the polling only completes the carriers that need a tag's cookie.
 * The ceiling is short because a visitor who bounces in two seconds is not a
 * conversion we are going to report anyway.
 */
const TAG_WAIT_MS = 3000;
const TAG_POLL_MS = 250;

export function AttributionCapture() {
  const pathname = usePathname();
  const { analytics, marketing, regime, record, prior, ready, row } = useConsent();

  // Every navigation is another pass, so the GA carrier follows the session.
  useEffect(() => {
    // Snapshot the attribution-relevant inputs EXACTLY ONCE per page load,
    // synchronously, before any gate or wait below. This effect re-runs on
    // every navigation and consent change, and by then `location.search`,
    // `document.referrer` and the `<body>` variant describe the CURRENT page,
    // not the one the ad bought. The snapshot lives in module state (see
    // `captureLandingContext`), so remounts and strict mode keep the first
    // reading; it is memory-only, and nothing is written down until consent
    // allows it.
    const landing = captureLandingContext(() =>
      landingFromUrl(window.location.href, {
        referrer: document.referrer,
        // The live A/B variant, so ad spend can be read against the landing it
        // actually bought. It is only on `<body>` while the landing page is
        // mounted, which is exactly when this first run happens.
        variant: document.body.dataset.landingVariant ?? null,
        landedAt: Math.floor(Date.now() / 1000),
      }),
    );

    if (!ready) return;
    // Nothing either category permits, so there is nothing to write or wait for.
    if (!analytics && !marketing) return;
    // An older choice with no recorded moment is no evidence to rest a write on.
    const evidence = consentEvidence({ record, prior, regime, row });
    if (evidence === null) return;

    let cancelled = false;
    const startedAt = Date.now();
    // What earlier passes of this run wrote, so a jar that drops the write is
    // not asked again on every poll.
    const remembered: Partial<StoredCarriers> = {};

    const pass = () => {
      if (cancelled) return;

      const { plan, awaited } = capturePass({
        landing,
        consent: { analytics, marketing },
        evidence,
        measurementId: measurementIdFromEnv(),
        pixelId: metaPixelIdFromEnv(),
        now: Math.floor(Date.now() / 1000),
        remembered,
      });
      Object.assign(remembered, {
        ...(plan.src ? { src: plan.src } : {}),
        ...(plan.ga ? { ga: plan.ga } : {}),
        ...(plan.ad ? { ad: plan.ad } : {}),
      });

      // Wait for a cookie only while it could still arrive: a tag that was
      // never permitted never loads, so there is nothing to wait for.
      if ((awaited.ga || awaited.fbp) && Date.now() - startedAt < TAG_WAIT_MS) {
        window.setTimeout(pass, TAG_POLL_MS);
      }
    };

    pass();
    return () => {
      cancelled = true;
    };
  }, [pathname, analytics, marketing, ready, regime, record, prior, row]);

  return null;
}
