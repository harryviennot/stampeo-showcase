"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useConsent } from "@/hooks/use-consent";
import { isTrackablePath } from "@/lib/consent-routes";
import {
  buildAttributionRecord,
  captureLandingContext,
  readAttributionRecord,
  readClickIds,
  readFbp,
  readGaClientId,
  vendorForClickIds,
  writeAttributionRecord,
} from "@/lib/ad-attribution";

/**
 * Records where this visitor came from, once, into a cookie `web/` can read.
 *
 * The business is created on app.stampeo.app, so this cookie is the only thing
 * that crosses the gap — see the header of `lib/ad-attribution.ts`. Every
 * decision about WHAT may be captured is a pure function there; this component
 * owns only the timing, which is the part that cannot be unit-tested.
 *
 * Renders nothing. It exists for its effect.
 */

/**
 * How long to wait for a tag to write its browser-id cookie — `_ga` for GA4,
 * `_fbp` for Meta — before giving up on it.
 *
 * The tags are injected in sibling effects and their cookies appear a tick
 * after the vendor script executes, so a single synchronous read on mount would
 * almost always miss them. Capture is FIRST-TOUCH-WINS, so writing early would
 * permanently store a record with no browser id and no way to repair it — hence
 * polling rather than a single attempt. The ceiling is short because a visitor
 * who bounces in two seconds is not a conversion we are going to report anyway.
 */
const GA_WAIT_MS = 3000;
const GA_POLL_MS = 250;

export function AttributionCapture() {
  const pathname = usePathname();
  const { analytics, marketing, regime, record, ready } = useConsent();

  useEffect(() => {
    // Snapshot the attribution-relevant inputs EXACTLY ONCE per page load,
    // synchronously, before any gate or wait below. This effect re-runs on
    // every navigation and consent change, and by then `location.search`,
    // `document.referrer` and the `<body>` variant describe the CURRENT page,
    // not the one the ad bought — a mid-poll navigation used to cancel the
    // write and let the re-run store a `direct` record with the wrong landing
    // path, unrepairable for 182 days under first-touch-wins. The snapshot
    // lives in module state (see `captureLandingContext`), so remounts and
    // strict mode keep the first reading; it is memory-only, and nothing is
    // written down until the consent gates below allow it.
    const landing = captureLandingContext(() => ({
      search: window.location.search,
      path: pathname,
      referrer: document.referrer,
      // The live A/B variant, so ad spend can be read against the landing it
      // actually bought. PostHog carries this as a super-property; here it has
      // to be explicit — and it is only on `<body>` while the landing page is
      // mounted, which is exactly when this first run happens.
      variant: document.body.dataset.landingVariant ?? null,
      selfHost: window.location.hostname,
    }));

    if (!ready) return;
    // Nothing either category permits, so there is nothing to wait for.
    if (!analytics && !marketing) return;
    // Never for a landing on a business enrollment page or a private route:
    // those visitors are our customers' customers, not ad prospects. Checked
    // against the SNAPSHOT, because the record describes the landing — a
    // consent granted later on some other page changes nothing about where
    // this visit began.
    if (!isTrackablePath(landing.path)) return;
    // First touch wins. A later organic pageview must not erase the ad click
    // that actually brought someone here.
    if (readAttributionRecord()) return;

    let cancelled = false;
    const startedAt = Date.now();

    // Which platform this arrival will be attributed to, decided before the
    // wait so we only ever block on the cookie this row actually needs.
    // `_fbp` matters for a meta row and nothing else; a google arrival that
    // also carries an fbclid is a google row (gclid wins in
    // `vendorForClickIds`) and must not be delayed waiting for Meta.
    const clickIds = readClickIds(landing.search);
    const wantsFbp = marketing && vendorForClickIds(clickIds) === "meta";

    const attempt = () => {
      if (cancelled) return;

      // The poll exists ONLY to backfill the browser ids, which the tags
      // write a beat after injection. Everything else comes from the landing
      // snapshot, so a navigation mid-poll can no longer swap the landing
      // page for the current one — the re-run effect resumes with the same
      // snapshot and finishes the capture.
      const gaClientId = readGaClientId(document.cookie);
      const fbp = readFbp(document.cookie);
      const withinWindow = Date.now() - startedAt < GA_WAIT_MS;
      // Wait for a cookie only while it could still arrive: a tag that was
      // never permitted never loads, so there is nothing to wait for.
      const awaitingGa = analytics && gaClientId === null;
      const awaitingFbp = wantsFbp && fbp === null;
      if ((awaitingGa || awaitingFbp) && withinWindow) {
        window.setTimeout(attempt, GA_POLL_MS);
        return;
      }

      const captured = buildAttributionRecord({
        search: landing.search,
        gaClientId,
        fbp,
        landingPath: landing.path,
        landingVariant: landing.variant,
        referrer: landing.referrer,
        selfHost: landing.selfHost,
        consent: { analytics, marketing },
        // The stored choice is the evidence. A US opt-out visitor has no
        // record, and the regime is then what justifies the capture — the
        // backend special-cases that shape and ACCEPTS a row with
        // `cr: "opt-out"`, `cv: 0`, `ca: 0` (see `ad_attribution.py`), so
        // the `?? 0` fallbacks here are part of the contract, not a shrug.
        consentVersion: record?.v ?? 0,
        consentRegime: regime,
        consentAt: record?.at ?? 0,
        capturedAt: Math.floor(Date.now() / 1000),
      });

      if (captured) writeAttributionRecord(captured);
    };

    attempt();
    return () => {
      cancelled = true;
    };
  }, [pathname, analytics, marketing, ready, regime, record]);

  return null;
}
