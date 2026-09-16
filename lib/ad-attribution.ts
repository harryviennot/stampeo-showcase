import type { ConsentRegime, ConsentState } from "./consent";

/**
 * Ad attribution capture (STA-323).
 *
 * The funnel this exists to close runs:
 *
 *   ad click → landing (tags live) → CTA → /onboarding (no tag) →
 *   app.stampeo.app → business created → Stripe checkout → invoice paid
 *
 * Showcase can only see the first hop. The BUSINESS is created in `web/`
 * (`IdentityStep.tsx`), on another subdomain, so what is captured here has to
 * physically travel there — which is why the carrier is a cookie scoped to
 * `.stampeo.app` and not `sessionStorage`. `lib/consent.ts` and
 * `lib/last-login.ts` already share a cookie the same way.
 *
 * CONSENT GATES CAPTURE, NOT ONLY SENDING. A click id is an advertising
 * identifier, so writing one down is already processing. With neither category
 * granted nothing is written at all — which also means a refusal leaves nothing
 * to delete, matching how the tags themselves behave.
 *
 * THE TWO CATEGORIES BUY DIFFERENT FIELDS. `marketing` permits the platforms'
 * click ids; `analytics` permits the GA4 client id. A visitor who granted one
 * does not thereby grant the other, and the record names which category
 * permitted it so the backend can prove the basis without a lookup it cannot
 * make across domains.
 *
 * THIS COOKIE IS NOT AUTHENTICATION. It is readable and editable in devtools by
 * anyone, and it crosses a subdomain boundary. Parsing is therefore total —
 * malformed, forged or stale input is null, never a throw — and the backend
 * validates everything again. The worst a forged cookie can achieve is a wrong
 * attribution row on the forger's own business.
 */

export const ATTRIBUTION_COOKIE = "stampeo_attribution";

/** Bump when a field changes meaning. A stored record from another version is discarded. */
export const ATTRIBUTION_VERSION = 1;

/** Six months, matching the consent choice that authorises it. */
const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 182;

export type AdVendor = "google" | "meta" | "tiktok" | "direct";

const VENDORS: ReadonlySet<string> = new Set([
  "google",
  "meta",
  "tiktok",
  "direct",
]);

export interface ClickIds {
  gclid: string | null;
  fbclid: string | null;
  ttclid: string | null;
}

export interface UtmFields {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

export interface AttributionRecord extends UtmFields {
  v: number;
  vendor: AdVendor;
  /** GA4 client id, from the `_ga` cookie. Analytics category. */
  browserId: string | null;
  /** gclid / fbclid / ttclid. Marketing category. */
  clickId: string | null;
  landingPath: string;
  landingVariant: string | null;
  referrerHost: string | null;
  /** Which category permitted this record to exist. */
  consentCategory: "analytics" | "marketing";
  consentVersion: number;
  consentRegime: ConsentRegime;
  /** Unix seconds. Evidence of when consent was given. */
  consentAt: number;
  /** Unix seconds. Lets the sender drop a click id older than the ad window. */
  capturedAt: number;
}

/** Empty string is not a value: `?gclid=` is what a broken ad template emits. */
function param(search: URLSearchParams, name: string): string | null {
  const value = search.get(name);
  return value && value.trim() !== "" ? value : null;
}

export function readClickIds(search: string): ClickIds {
  const params = new URLSearchParams(search);
  return {
    gclid: param(params, "gclid"),
    fbclid: param(params, "fbclid"),
    ttclid: param(params, "ttclid"),
  };
}

export function readUtm(search: string): UtmFields {
  const params = new URLSearchParams(search);
  return {
    utmSource: param(params, "utm_source"),
    utmMedium: param(params, "utm_medium"),
    utmCampaign: param(params, "utm_campaign"),
    utmContent: param(params, "utm_content"),
    utmTerm: param(params, "utm_term"),
  };
}

/**
 * Which platform an arrival belongs to.
 *
 * The order is FIXED rather than "whichever parameter came first", because the
 * schema stores one row per vendor and a visitor can arrive carrying two
 * platforms' parameters. A reproducible winner is worth more than a clever one.
 */
export function vendorForClickIds(ids: ClickIds): AdVendor {
  if (ids.gclid) return "google";
  if (ids.fbclid) return "meta";
  if (ids.ttclid) return "tiktok";
  return "direct";
}

/** The click id matching the vendor `vendorForClickIds` chose. */
function clickIdFor(ids: ClickIds): string | null {
  return ids.gclid ?? ids.fbclid ?? ids.ttclid;
}

/**
 * The host that sent this visitor, or null.
 *
 * Our own host is not a referrer: recording it would make every second page
 * look like a referral from ourselves and drown the real sources.
 */
export function referrerHost(
  referrer: string | null | undefined,
  selfHost: string
): string | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return null;
  }
  if (!host) return null;
  const self = selfHost.replace(/^www\./, "");
  if (host === self || host.endsWith(`.${self}`)) return null;
  return host;
}

/**
 * What may be captured from this arrival, or null to capture nothing.
 *
 * The two categories are read independently, and the record is refused when
 * neither of them buys a field that is actually present — a visitor who
 * granted only `marketing` and arrived organically has nothing this function
 * is permitted to write down, and a row stored on a basis nobody granted is
 * worse than a missing row.
 */
export function buildAttributionRecord(input: {
  search: string;
  gaClientId: string | null;
  landingPath: string;
  landingVariant: string | null;
  referrer: string | null;
  selfHost?: string;
  consent: ConsentState;
  consentVersion: number;
  consentRegime: ConsentRegime;
  consentAt: number;
  capturedAt: number;
}): AttributionRecord | null {
  const ids = readClickIds(input.search);

  // A click id may only be read with marketing consent, so a visitor who
  // refused it has no paid source as far as this record is concerned.
  const clickId = input.consent.marketing ? clickIdFor(ids) : null;
  const browserId = input.consent.analytics ? input.gaClientId : null;

  // Neither category bought anything present. Nothing to store.
  if (!clickId && !input.consent.analytics) return null;

  return {
    v: ATTRIBUTION_VERSION,
    vendor: clickId ? vendorForClickIds(ids) : "direct",
    browserId,
    clickId,
    ...readUtm(input.search),
    landingPath: input.landingPath,
    landingVariant: input.landingVariant,
    referrerHost: referrerHost(input.referrer, input.selfHost ?? "stampeo.app"),
    // The category that PERMITTED the row. A click id is the marketing-gated
    // field, so its presence is what makes this a marketing record.
    consentCategory: clickId ? "marketing" : "analytics",
    consentVersion: input.consentVersion,
    consentRegime: input.consentRegime,
    consentAt: input.consentAt,
    capturedAt: input.capturedAt,
  };
}

/**
 * The cookie VALUE for a record.
 *
 * Keys are short because this rides on every request to both subdomains and
 * competes with the auth cookies for the 4KB header budget.
 */
export function serializeAttributionCookie(record: AttributionRecord): string {
  return encodeURIComponent(
    JSON.stringify({
      v: record.v,
      vn: record.vendor,
      bi: record.browserId,
      ci: record.clickId,
      us: record.utmSource,
      um: record.utmMedium,
      uc: record.utmCampaign,
      uo: record.utmContent,
      ut: record.utmTerm,
      lp: record.landingPath,
      lv: record.landingVariant,
      rh: record.referrerHost,
      cc: record.consentCategory,
      cv: record.consentVersion,
      cr: record.consentRegime,
      ca: record.consentAt,
      at: record.capturedAt,
    })
  );
}

function text(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * A stored record, or null.
 *
 * Null for anything malformed, truncated, forged or written by another
 * version. Never throws: this value is attacker-controlled, and a corrupt
 * cookie has to degrade into "no attribution" rather than into a failed signup.
 *
 * The vendor and consent category are checked against their allowed sets HERE
 * as well as in the backend, so a forged value cannot reach the database's
 * CHECK constraint and surface as a 500 in the middle of business creation.
 */
export function parseAttributionCookie(
  raw: string | null | undefined
): AttributionRecord | null {
  if (!raw || !raw.trim()) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const r = parsed as Record<string, unknown>;
  if (r.v !== ATTRIBUTION_VERSION) return null;

  const vendor = typeof r.vn === "string" ? r.vn : "";
  if (!VENDORS.has(vendor)) return null;

  const category = r.cc === "analytics" || r.cc === "marketing" ? r.cc : null;
  if (category === null) return null;

  const landingPath = text(r.lp);
  if (landingPath === null) return null;

  return {
    v: ATTRIBUTION_VERSION,
    vendor: vendor as AdVendor,
    browserId: text(r.bi),
    clickId: text(r.ci),
    utmSource: text(r.us),
    utmMedium: text(r.um),
    utmCampaign: text(r.uc),
    utmContent: text(r.uo),
    utmTerm: text(r.ut),
    landingPath,
    landingVariant: text(r.lv),
    referrerHost: text(r.rh),
    consentCategory: category,
    consentVersion: count(r.cv),
    consentRegime: r.cr === "opt-out" ? "opt-out" : "opt-in",
    consentAt: count(r.ca),
    capturedAt: count(r.at),
  };
}

/* -------------------------------------------------------------------------
 * Browser side. Everything below is a no-op off the browser.
 * ---------------------------------------------------------------------- */

/**
 * The GA4 client id, read out of the `_ga` cookie.
 *
 * Format is `GA1.1.<client_id>`, and the client id itself is the last two
 * dot-separated parts (`1234567890.1700000000`). Google does not expose it any
 * other way synchronously — `gtag('get', …)` is a callback — and the cookie
 * only exists once the tag has loaded, which is exactly the condition we want
 * to require anyway.
 */
export function readGaClientId(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const entry = part.trim();
    if (!entry.startsWith("_ga=")) continue;
    const value = entry.slice(4);
    const bits = value.split(".");
    if (bits.length < 4) return null;
    return `${bits[0]}.${bits[1]}.${bits[2]}.${bits[3]}`;
  }
  return null;
}

/** Everything needed to write the record down, mirroring `consentCookieAttributes`. */
export function attributionCookieAttributes(record: AttributionRecord) {
  return {
    name: ATTRIBUTION_COOKIE,
    value: serializeAttributionCookie(record),
    maxAge: SIX_MONTHS_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    // The whole point: `web/` on app.stampeo.app has to read this.
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  };
}

/** The record currently stored, or null. */
export function readAttributionRecord(): AttributionRecord | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const entry = part.trim();
    if (!entry.startsWith(`${ATTRIBUTION_COOKIE}=`)) continue;
    return parseAttributionCookie(entry.slice(ATTRIBUTION_COOKIE.length + 1));
  }
  return null;
}

/**
 * Write the record down.
 *
 * FIRST TOUCH WINS on the client: an existing record is not overwritten by a
 * later organic pageview, or the ad click that actually brought someone here
 * would be erased by their next visit. Last-touch resolution between two
 * genuine ad clicks is the backend's job, where `captured_at` can be compared
 * across vendors.
 */
export function writeAttributionRecord(record: AttributionRecord): void {
  if (typeof document === "undefined") return;
  if (readAttributionRecord()) return;

  const attrs = attributionCookieAttributes(record);
  let cookie = `${attrs.name}=${attrs.value}; Max-Age=${attrs.maxAge}; Path=${attrs.path}; SameSite=Lax`;
  if (attrs.domain) cookie += `; Domain=${attrs.domain}`;
  if (attrs.secure) cookie += "; Secure";
  try {
    document.cookie = cookie;
  } catch {
    // Blocked storage. Losing attribution is not a reason to fail a pageview.
  }
}
