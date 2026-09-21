/**
 * The Meta (Facebook/Instagram) pixel, gated on STA-317's consent contract.
 *
 * This file decides WHETHER the pixel may run and WHAT it may say. It owns no
 * consent state of its own: `lib/consent.ts` answers what the visitor agreed
 * to, `lib/consent-routes.ts` answers where a tag may fire, and everything
 * here consumes both.
 *
 * THE SCRIPT IS NEVER LOADED BEFORE THE ANSWER. Meta has no cookieless mode
 * and no "denied" state — the only way not to contact connect.facebook.net is
 * not to load it. So a refusal leaves nothing behind to clean up, and there is
 * no `<Script src>` in any JSX: a static tag would render before any gate ran.
 *
 * ONCE RESIDENT, IT CANNOT BE UNLOADED. That is why `trackable` is checked on
 * every event and not only at load: a visitor who accepted on `/pricing` and
 * then followed a QR code to a business's enrollment page must stop generating
 * events at the boundary, and not calling `fbq` is all that is left by then.
 * Revocation reloads the page — see `clearCookiesFor` in `lib/consent.ts`.
 *
 * Meta's `<noscript>` fallback pixel is deliberately not shipped. It is a bare
 * `<img>` that fires with no JavaScript involved, which no JS consent gate can
 * suppress.
 */

import {
  CONTACT_CTAS,
  isContactHref,
  isKnownCTALocation,
} from "./cta-taxonomy";

/**
 * The events this site sends. Meta STANDARD events, not custom ones, so a
 * campaign objective can target them directly and Aggregated Event Measurement
 * can rank them.
 */
export type MetaStandardEvent = "Lead" | "Contact" | "PageView";

export const META_PIXEL_SCRIPT_SRC =
  "https://connect.facebook.net/en_US/fbevents.js";

/**
 * The configured pixel id, or null.
 *
 * Pure so it can be tested; `metaPixelIdFromEnv` does the actual env read.
 * Whitespace collapses to null because a Docker build arg set to `""` is the
 * realistic typo, and `fbq('init', ' ')` is a live tag pointed at nothing.
 *
 * The numeric shape is REQUIRED rather than cosmetic, the mirror of
 * `readMeasurementId` demanding `G-…`: a pixel id is a decimal number, and the
 * realistic mistake is the GA measurement id pasted into the adjacent env var.
 * `fbq('init', 'G-…')` would load a real script initialised against nothing,
 * which looks exactly like working tracking. 5-20 digits leaves headroom over
 * today's 15-16 without accepting a stray character.
 */
export function readMetaPixelId(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? "").trim();
  if (!/^[0-9]{5,20}$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Read from the environment. Referenced statically so Next inlines it at build
 * time — `NEXT_PUBLIC_*` vars are baked into the bundle, not read at runtime.
 */
export function metaPixelIdFromEnv(): string | null {
  return readMetaPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
}

/**
 * May the pixel script be loaded right now?
 *
 * An AND of four independent facts, each of which can fail alone:
 *
 * - `pixelId`   — configured at build time, absent in CI and before deploy.
 * - `marketing` — the visitor's answer, from `useConsent()`. Denied on the
 *                 server and on anything unknown.
 * - `ready`     — false during SSR and the first paint. Acting earlier would
 *                 decide on a server-render placeholder for the regime, which
 *                 means firing at a European visitor on a default.
 * - `trackable` — `isTrackablePath()`. Any unrecognised segment under a locale
 *                 is a business's enrollment page, and its visitors are our
 *                 customers' customers rather than ad prospects.
 */
export function shouldLoadMetaPixel(input: {
  pixelId: string | null;
  marketing: boolean;
  ready: boolean;
  trackable: boolean;
}): boolean {
  return (
    input.pixelId !== null && input.marketing && input.ready && input.trackable
  );
}

/**
 * May an event be sent right now?
 *
 * Separate from the load gate because the two answers diverge: the script
 * stays resident across a client-side navigation onto a page it may not report
 * on. `loaded` is not a proxy for consent — consent was already required to
 * reach `loaded`.
 */
export function shouldSendMetaEvent(input: {
  loaded: boolean;
  trackable: boolean;
}): boolean {
  return input.loaded && input.trackable;
}

/**
 * Should a `PageView` be sent for this navigation?
 *
 * The deliberate mirror of `shouldSendPageView` in `lib/google-analytics.ts` —
 * see its comment for the full reasoning. The two facts that matter:
 *
 * - `alreadyLoaded` (was the script resident BEFORE this effect run) is what
 *   tells the init run — where `fbq('init')`'s own PageView must not be
 *   doubled — apart from a REMOUNT with a null `lastPath`, which is the locale
 *   switcher replacing the `[locale]` tree while the pixel stays resident.
 *   The remounted path never got a PageView, so that case sends.
 * - `lastPath` is the last path the caller SAW, not the last one sent for:
 *   updated on every navigation including untrackable ones, so a detour
 *   through /onboarding does not suppress the PageView on the return, while a
 *   same-path re-render still dedupes.
 */
export function shouldSendMetaPageView(input: {
  loaded: boolean;
  trackable: boolean;
  alreadyLoaded: boolean;
  lastPath: string | null;
  nextPath: string;
}): boolean {
  if (!shouldSendMetaEvent({ loaded: input.loaded, trackable: input.trackable })) {
    return false;
  }
  if (!input.alreadyLoaded) return false;
  if (input.lastPath === null) return true;
  return input.lastPath !== input.nextPath;
}

/**
 * The Meta event for a landing CTA click, or null to send nothing.
 *
 * The location allowlist is checked BEFORE the destination, so a CTA nobody
 * has mapped cannot smuggle itself in by pointing at `/contact`. A new CTA
 * stays silent until someone maps it deliberately: a missing event is a gap in
 * a dashboard, a wrong one is a campaign optimising against noise.
 */
export function metaEventForCTA(input: {
  ctaLocation: string;
  href: string;
}): MetaStandardEvent | null {
  if (!isKnownCTALocation(input.ctaLocation)) return null;

  // The destination wins when it disagrees with the location name, mirroring
  // how `CTAButton` already picks its PostHog event. `isContactHref` matches
  // locale-prefixed hrefs too — see `lib/cta-taxonomy.ts`.
  if (isContactHref(input.href)) return "Contact";
  if (CONTACT_CTAS.has(input.ctaLocation)) return "Contact";
  return "Lead";
}

/* -------------------------------------------------------------------------
 * Browser side. Everything below is a no-op off the browser.
 * ---------------------------------------------------------------------- */

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: unknown;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

let initialised = false;

/** Has the script been injected in this page's lifetime? */
export function isMetaPixelLoaded(): boolean {
  return initialised;
}

/**
 * Inject the pixel and fire its first PageView.
 *
 * Idempotent: React strict mode mounts effects twice, and a consent change can
 * re-run the same effect, so the snippet must inject at most once.
 *
 * The stub-and-queue bootstrap is Meta's own, retyped rather than reworded —
 * it exists so calls made before `fbevents.js` finishes downloading are
 * replayed instead of lost, and `fbevents.js` itself inspects `_fbq.push`.
 */
export function initMetaPixel(pixelId: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (initialised) return;
  initialised = true;

  if (!window.fbq) {
    const fbq = function (this: unknown, ...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue?.push(args);
    } as FbqFn;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = META_PIXEL_SCRIPT_SRC;
  document.head.appendChild(script);

  // Guarded for the same reason as `trackMetaEvent` below: when `window.fbq`
  // pre-existed (an extension's shim rather than our stub), these calls run
  // through code we do not own, and a throw here would propagate out of the
  // loader effect and take the page tree down with it.
  try {
    window.fbq?.("init", pixelId);
    window.fbq?.("track", "PageView");
  } catch {
    // Deliberately silent — the convention `trackGaEvent` set: there is no
    // second reporting channel to complain through.
  }
}

/**
 * Send one event.
 *
 * `trackable` is a required argument rather than something read inside, so a
 * call site cannot forget the page check: the type system asks for it. Drops
 * silently when the pixel never loaded — deliberately with NO queue-and-replay,
 * because replaying events recorded before consent into a pixel loaded after it
 * would leak exactly what consent prevents.
 */
export function trackMetaEvent(input: {
  event: MetaStandardEvent;
  trackable: boolean;
  params?: Record<string, unknown>;
}): void {
  if (
    !shouldSendMetaEvent({ loaded: isMetaPixelLoaded(), trackable: input.trackable })
  ) {
    return;
  }

  // Guarded because every call site is a click handler, mirroring
  // `trackGaEvent` exactly: a throw here — an ad blocker that replaced `fbq`
  // with something hostile, a CSP violation — would otherwise propagate out of
  // the handler and cost the visitor the navigation. In `CTAButton` this call
  // runs BEFORE the GA one, so an unguarded throw would cost every GA CTA
  // event too. Losing the measurement is the acceptable failure; losing the
  // signup is not.
  try {
    window.fbq?.("track", input.event, input.params);
  } catch {
    // Deliberately silent: there is no second reporting channel to complain
    // through, and a console error on every click is its own bug report.
  }
}
