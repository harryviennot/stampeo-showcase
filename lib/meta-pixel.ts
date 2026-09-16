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

/**
 * The events this site sends. Meta STANDARD events, not custom ones, so a
 * campaign objective can target them directly and Aggregated Event Measurement
 * can rank them.
 */
export type MetaStandardEvent = "Lead" | "Contact" | "PageView";

export const META_PIXEL_SCRIPT_SRC =
  "https://connect.facebook.net/en_US/fbevents.js";

/**
 * CTAs that mean "I want to start using this". They leave showcase for the
 * app, so `Lead` is the honest event: we see the intent, never the account.
 */
const SIGNUP_CTAS: ReadonlySet<string> = new Set([
  "hero",
  "pricing_starter",
  "pricing_growth",
  "pricing_pro",
  "faq",
  "final_cta",
  "loyalty_picker",
]);

/** CTAs that mean "talk to a human". A different funnel, tracked separately. */
const CONTACT_CTAS: ReadonlySet<string> = new Set(["hero_demo", "final_cta_demo"]);

/**
 * The configured pixel id, or null.
 *
 * Pure so it can be tested; `metaPixelIdFromEnv` does the actual env read.
 * Whitespace collapses to null because a Docker build arg set to `""` is the
 * realistic typo, and `fbq('init', ' ')` is a live tag pointed at nothing.
 */
export function readMetaPixelId(raw: string | null | undefined): string | null {
  const trimmed = (raw ?? "").trim();
  return trimmed === "" ? null : trimmed;
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
  const known =
    SIGNUP_CTAS.has(input.ctaLocation) || CONTACT_CTAS.has(input.ctaLocation);
  if (!known) return null;

  // The destination wins when it disagrees with the location name, mirroring
  // how `CTAButton` already picks its PostHog event. Locale-prefixed hrefs are
  // matched too: `Link` from @/i18n/navigation prefixes at render time, and a
  // call site passing a resolved href must not silently downgrade to Lead.
  if (/^\/(?:[a-z]{2}\/)?contact(?:\/|$|\?|#)/.test(input.href)) return "Contact";
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

  window.fbq?.("init", pixelId);
  window.fbq?.("track", "PageView");
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
  window.fbq?.("track", input.event, input.params);
}
