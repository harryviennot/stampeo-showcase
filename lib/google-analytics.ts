/**
 * Google Analytics 4, gated on STA-317's consent contract.
 *
 * This file decides WHETHER the tag may run and WHAT it may say. It owns no
 * consent state of its own: `lib/consent.ts` answers what the visitor agreed
 * to, `lib/consent-routes.ts` answers where a tag may fire, and everything
 * here consumes both. It is the analytics-category sibling of
 * `lib/meta-pixel.ts`, and deliberately keeps the same shape.
 *
 * THE SCRIPT IS NEVER LOADED BEFORE THE ANSWER, and specifically NOT via
 * Google Consent Mode. Consent Mode in `denied` state still loads gtag.js and
 * still sends cookieless pings to googletagmanager.com. STA-317's rule is that
 * a refusal leaves nothing behind, which is only true if the script was never
 * fetched. So there is no `<Script src>` in any JSX — a static tag would render
 * before any gate ran — and Google's console warning that Consent Mode is not
 * detected is the expected result rather than a fault.
 *
 * ONCE RESIDENT, IT CANNOT BE UNLOADED. That is why `trackable` is checked on
 * every event and not only at load: a visitor who accepted on `/pricing` and
 * then followed a QR code to a business's enrollment page, or stepped into
 * `/onboarding`, must stop generating events at the boundary, and not calling
 * `gtag` is all that is left by then. Revocation reloads the page — see
 * `clearCookiesFor` in `lib/consent.ts`.
 *
 * GA4 fires `page_view` ONCE, at config time. Every App Router navigation
 * after that is silent unless we send one explicitly, which is what
 * `shouldSendPageView` exists to decide without double-counting.
 */

import {
  CONTACT_CTAS,
  isContactHref,
  isKnownCTALocation,
} from "./cta-taxonomy";

/**
 * The events this site sends.
 *
 * `page_view` is GA4's own name. The two CTA events are custom rather than
 * GA4's recommended `generate_lead`, because they record an INTENT TO LEAVE
 * for the signup flow, not a captured lead — showcase never sees the account
 * get created (see `docs/features/STA-318/plan.md`). They mirror the PostHog
 * vocabulary already in `lib/analytics.ts` so the two tools can be reconciled,
 * and either can be marked as a key event in the GA4 admin.
 */
export type GaEvent = "page_view" | "sign_up_cta_click" | "contact_cta_click";

const GA_SCRIPT_ORIGIN = "https://www.googletagmanager.com/gtag/js";

/**
 * The configured measurement id, or null.
 *
 * Pure so it can be tested; `measurementIdFromEnv` does the actual env read.
 * Whitespace collapses to null because a Docker build arg set to `""` is the
 * realistic typo, and a `config` call on a blank id is a live tag pointed at
 * nothing.
 *
 * The `G-` prefix is REQUIRED rather than cosmetic. A GTM container id
 * (`GTM-…`) pasted here would load a real script that reports to no property,
 * which looks exactly like working tracking; a Meta pixel id would load
 * nothing at all. Both are one-line mistakes between adjacent env vars, and
 * both are better as a dormant tag than as a broken one.
 */
export function readMeasurementId(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? "").trim();
  if (!/^G-[A-Z0-9]+$/i.test(trimmed)) return null;
  return trimmed;
}

/**
 * Read from the environment. Referenced statically so Next inlines it at build
 * time — `NEXT_PUBLIC_*` vars are baked into the bundle, not read at runtime.
 */
export function measurementIdFromEnv(): string | null {
  return readMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}

/** Where gtag.js lives for a given property. */
export function gaScriptSrc(measurementId: string): string {
  return `${GA_SCRIPT_ORIGIN}?id=${measurementId}`;
}

/**
 * May the tag be loaded right now?
 *
 * An AND of four independent facts, each of which can fail alone:
 *
 * - `measurementId` — configured at build time, absent in CI and before deploy.
 * - `analytics`     — the visitor's answer, from `useConsent()`. GA4 is the
 *                     analytics category; the ad pixels take `marketing`.
 *                     Denied on the server and on anything unknown.
 * - `ready`         — false during SSR and the first paint. Acting earlier
 *                     would decide on a server-render placeholder for the
 *                     regime, which means firing at a European visitor on a
 *                     default.
 * - `trackable`     — `isTrackablePath()`. Private routes and any unrecognised
 *                     segment under a locale, which is a business's enrollment
 *                     page whose visitors are our customers' customers.
 */
export function shouldLoadGa(input: {
  measurementId: string | null;
  analytics: boolean;
  ready: boolean;
  trackable: boolean;
}): boolean {
  return (
    input.measurementId !== null &&
    input.analytics &&
    input.ready &&
    input.trackable
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
export function shouldSendGaEvent(input: {
  loaded: boolean;
  trackable: boolean;
}): boolean {
  return input.loaded && input.trackable;
}

/**
 * Should a `page_view` be sent for this navigation?
 *
 * Pure, and separate from the send gate, because the two ways to get this
 * wrong are opposite and both silent:
 *
 * - Sending nothing on client-side navigation. gtag reports `page_view` only
 *   at config time, so every campaign landing would read as a one-page
 *   session.
 * - Sending one per effect run. React strict mode mounts effects twice, and a
 *   consent change re-runs the same effect on the same path; either inflates
 *   every funnel.
 *
 * `alreadyLoaded` — was the script resident BEFORE this effect run — is what
 * tells the two null-`lastPath` states apart, and both are real:
 *
 * - `alreadyLoaded: false` is the run that injects the tag. `config` sends the
 *   first `page_view` itself, so this run is deliberately silent here.
 * - `alreadyLoaded: true` with a null `lastPath` is a REMOUNT: the locale
 *   switcher's `router.replace(pathname, { locale })` replaces the `[locale]`
 *   tree, resetting the component's ref while the script (module state) stays
 *   resident. The post-switch path never got a page_view — config fired for
 *   the pre-switch one — so this run must send. Treating it as the config
 *   seed used to wedge the session: no page_view ever again.
 *
 * `lastPath` is the last path the caller SAW, not the last one it sent for.
 * The caller updates it on every navigation — untrackable ones included — so
 * /pricing → /onboarding (silent) → /pricing counts the return (QA GA-02)
 * while a same-path re-render still dedupes.
 */
export function shouldSendPageView(input: {
  loaded: boolean;
  trackable: boolean;
  alreadyLoaded: boolean;
  lastPath: string | null;
  nextPath: string;
}): boolean {
  if (!shouldSendGaEvent({ loaded: input.loaded, trackable: input.trackable })) {
    return false;
  }
  if (!input.alreadyLoaded) return false;
  if (input.lastPath === null) return true;
  return input.lastPath !== input.nextPath;
}

/**
 * The GA4 event for a landing CTA click, or null to send nothing.
 *
 * The location allowlist is checked BEFORE the destination, so a CTA nobody
 * has mapped cannot smuggle itself in by pointing at `/contact`. A new CTA
 * stays silent until someone maps it deliberately: a missing event is a gap in
 * a dashboard, a wrong one is a campaign optimising against noise.
 */
export function gaEventForCTA(input: {
  ctaLocation: string;
  href: string;
}): GaEvent | null {
  if (!isKnownCTALocation(input.ctaLocation)) return null;

  // The destination wins when it disagrees with the location name, mirroring
  // how `CTAButton` already picks its PostHog event. `isContactHref` matches
  // locale-prefixed hrefs too — see `lib/cta-taxonomy.ts`.
  if (isContactHref(input.href)) return "contact_cta_click";
  if (CONTACT_CTAS.has(input.ctaLocation)) return "contact_cta_click";
  return "sign_up_cta_click";
}

/* -------------------------------------------------------------------------
 * Browser side. Everything below is a no-op off the browser.
 * ---------------------------------------------------------------------- */

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

let initialised = false;

/** Has the tag been injected in this page's lifetime? */
export function isGaLoaded(): boolean {
  return initialised;
}

/**
 * Inject gtag.js and configure the property.
 *
 * Idempotent: React strict mode mounts effects twice, and a consent change can
 * re-run the same effect, so the snippet must inject at most once.
 *
 * The `dataLayer` stub is Google's own, retyped rather than reworded. It must
 * push the `arguments` OBJECT and not a rest array — gtag.js reads
 * `arguments.length` and the callee shape off what it finds in the queue, so a
 * spread here silently breaks every queued call made before the script lands.
 * That is also what makes calls issued during the download replay rather than
 * disappear.
 */
export function initGa(measurementId: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (initialised) return;
  initialised = true;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    } as GtagFn;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = gaScriptSrc(measurementId);
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    // DebugView shows only sessions explicitly flagged, and the setup guide
    // tells the operator to append `?debug_mode=1`. Passing it through here is
    // what makes that instruction true.
    ...(readDebugMode(window.location.search) ? { debug_mode: true } : {}),
  });
}

/** Is this session asking to appear in DebugView? */
export function readDebugMode(search: string): boolean {
  return new URLSearchParams(search).get("debug_mode") === "1";
}

/**
 * Send one event.
 *
 * `trackable` is a required argument rather than something read inside, so a
 * call site cannot forget the page check: the type system asks for it. Drops
 * silently when the tag never loaded — deliberately with NO queue-and-replay,
 * because replaying events recorded before consent into a tag loaded after it
 * would leak exactly what consent prevents.
 */
export function trackGaEvent(input: {
  event: GaEvent;
  trackable: boolean;
  params?: Record<string, unknown>;
}): void {
  if (!shouldSendGaEvent({ loaded: isGaLoaded(), trackable: input.trackable })) {
    return;
  }

  // Guarded because every call site is a click handler: a throw here -- an ad
  // blocker that replaced `gtag` with something hostile, a CSP violation --
  // would otherwise propagate out of the handler and cost the visitor the
  // navigation. Losing the measurement is the acceptable failure; losing the
  // signup is not.
  try {
    window.gtag?.("event", input.event, {
      ...(input.params ?? {}),
      ...landingVariantParam(),
    });
  } catch {
    // Deliberately silent: there is no second reporting channel to complain
    // through, and a console error on every click is its own bug report.
  }
}

/**
 * The live landing A/B variant, as `{ landing_variant }` or nothing at all.
 *
 * PostHog carries the variant as a super-property attached to every event;
 * GA4 has no equivalent, so it has to ride on each event or the two tools
 * disagree about which variant earned a signup. `LandingTracker` publishes it
 * on `<body>` for exactly this.
 *
 * Absent stays absent. Defaulting to the control would credit it for every
 * conversion that began somewhere other than the landing page.
 */
function landingVariantParam(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const variant = document.body?.dataset?.landingVariant;
  return variant ? { landing_variant: variant } : {};
}

/**
 * Report a client-side navigation.
 *
 * Takes the decision already made by `shouldSendPageView` rather than making
 * it, so the caller owns the `lastPath` bookkeeping and this stays a sender.
 */
export function trackGaPageView(input: {
  path: string;
  trackable: boolean;
}): void {
  trackGaEvent({
    event: "page_view",
    trackable: input.trackable,
    params: {
      page_path: input.path,
      page_location:
        typeof window === "undefined" ? undefined : window.location.href,
      page_title: typeof document === "undefined" ? undefined : document.title,
    },
  });
}
