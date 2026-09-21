import { countryForTimezone } from "./timezone-country";

/**
 * The consent gate for GA4, the Meta pixel and the TikTok pixel (STA-318,
 * STA-319, STA-320). Nothing in this file loads a tag; it decides whether one
 * may be loaded, and remembers the answer.
 *
 * Two rules run through everything here.
 *
 * ABSENCE OF CONSENT IS NOT CONSENT. No cookie, a corrupt cookie, a country we
 * cannot place, a server render: all of them resolve to denied. The granting
 * paths are the narrow ones.
 *
 * THE TAG IS NEVER LOADED BEFORE THE ANSWER. Not loaded-then-suppressed, and
 * not Google Consent Mode in `denied` state either — that still contacts
 * googletagmanager.com, and Meta and TikTok have no cookieless mode at all.
 * A refusal therefore has nothing to clean up, because nothing was created.
 *
 * PostHog is deliberately outside all of this: it runs `persistence: "memory"`
 * (see `instrumentation-client.ts`), stores nothing on the device, and so sits
 * outside the ePrivacy consent requirement. It keeps working for refusers,
 * which is the only reason we can measure what the refusal rate is.
 */

export const CONSENT_COOKIE = "stampeo_consent";

/**
 * Bump when a category, a vendor, or the PROCESSING the policy describes
 * changes.
 *
 * A stored choice from an older version is treated as no choice at all, so the
 * visitor is asked again rather than a new tracker quietly inheriting consent
 * that was given for a different list of recipients.
 *
 * ── Version history ─────────────────────────────────────────────────
 * 1 — STA-317. The banner itself: GA4, Meta and TikTok, browser-side only.
 * 2 — STA-323. Privacy policy §5.5. The recipients did not change, but two
 *     things about the processing did, and both are material enough that a
 *     choice made against the old text is not informed consent to the new one:
 *     we now RETAIN the advertising identifier ourselves against the business
 *     account, and we report conversions SERVER-SIDE, after and independently
 *     of anything in the browser.
 *
 * `CONSENT_VERSION` in `backend/app/services/ad_attribution.py` mirrors this
 * and must move with it: the backend rejects an attribution row whose stored
 * choice was made against a different version.
 */
export const CONSENT_VERSION = 2;

/**
 * Six months. CNIL's ceiling for how long a choice may stand.
 *
 * It applies to a REFUSAL just as much as to an acceptance: re-asking someone
 * who already said no, on every visit, is the exact dark pattern the rule
 * exists to stop.
 */
const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 182;

export type ConsentCategory = "analytics" | "marketing";

/**
 * Which set of rules this visitor falls under.
 *
 * `opt-in` — the EU/EEA, the UK, Switzerland, and everywhere we could not
 * place. Nothing fires until they say so.
 *
 * `opt-out` — the United States only. As of 2026 none of the twenty
 * comprehensive state privacy laws requires prior consent; they require notice
 * and a way to opt out. A blocking banner there protects nobody and costs the
 * ad measurement this whole epic exists to produce.
 */
export type ConsentRegime = "opt-in" | "opt-out";

export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentRecord extends ConsentState {
  /** The CONSENT_VERSION this choice was made against. */
  v: number;
  /** Unix seconds. Evidence of when, not part of the decision. */
  at: number;
  /** Which regime was in force when they chose. Evidence, not a decision. */
  regime: ConsentRegime;
  /**
   * A random v4 UUID chaining this person's decisions (STA-324). Optional
   * because a record read from an older cookie predates it.
   */
  subjectId?: string;
}

/** What the visitor is currently being shown, if anything. */
export type ConsentSurface = "none" | "banner" | "notice";

/**
 * The cookies each category is responsible for, so revoking can actually
 * remove them. A trailing `*` matches by prefix.
 *
 * `_ga_*` has to be a prefix: GA4 writes one `_ga_<MEASUREMENT_ID>` cookie per
 * property, and a literal list would leave the real session cookie in place
 * while reporting the visitor as opted out.
 *
 * `stampeo_attribution` (STA-323) is the one entry we set ourselves, and it is
 * here for the same reason the rest are: it holds the ad platforms' click ids
 * and the GA client id, so it is a tracker by content even though it is
 * first-party by origin. Revoking has to delete the carrier, or the identifiers
 * would still cross to app.stampeo.app and be stored against a business after
 * the refusal. It is listed under BOTH categories because it can hold fields
 * bought by either, and a record half-authorised is not authorised.
 *
 * What must never appear here is CONSENT_COOKIE itself — clearing that would
 * erase the very refusal being acted on.
 */
const COOKIE_PATTERNS: Record<ConsentCategory, readonly string[]> = {
  analytics: ["_ga", "_ga_*", "_gid", "stampeo_attribution"],
  marketing: ["_fbp", "_fbc", "_ttp", "stampeo_attribution"],
};

/**
 * The regime a country falls under. Anything but the US is opt-in, including
 * `null`.
 *
 * Null is the case that matters: it is the server render, a timezone we do not
 * map, and a browser that refuses `Intl`. Guessing "US" there would fire three
 * ad pixels at a visitor who never agreed, so the unknown case is the strict
 * one and always will be.
 */
export function consentRegimeForCountry(
  country: string | null | undefined,
): ConsentRegime {
  return (country || "").trim().toUpperCase() === "US" ? "opt-out" : "opt-in";
}

/**
 * What this visitor is taken to have agreed to.
 *
 * The order is the whole design. An explicit choice wins over everything,
 * because someone who clicked a button said something more specific than any
 * signal. Only when there is no choice does GPC decide, and only then does the
 * regime's default apply.
 */
export function resolveConsent(input: {
  record: ConsentRecord | null;
  regime: ConsentRegime;
  gpc: boolean;
}): ConsentState {
  if (input.record) {
    return { analytics: input.record.analytics, marketing: input.record.marketing };
  }
  // Global Privacy Control. Twelve US states require honouring it
  // automatically, with no banner and no confirmation; in the EU it is a plain
  // objection signal and costs us nothing to respect.
  if (input.gpc) return { analytics: false, marketing: false };
  if (input.regime === "opt-out") return { analytics: true, marketing: true };
  return { analytics: false, marketing: false };
}

/**
 * A stable identity for `useConsent`'s snapshot cache.
 *
 * `useSyncExternalStore` compares snapshots by identity, so the hook rebuilds
 * its snapshot object only when this key changes — meaning the key must cover
 * EVERY field the snapshot exposes, not just the two booleans. It once keyed
 * on `analytics`/`marketing` alone, so a re-decision that kept the same
 * answers served the stale record object and `AttributionCapture` stamped the
 * older `consentAt` as its evidence.
 *
 * Equally, the key must be a pure function of the underlying facts: a value
 * that varies per call (a Date, an object identity) would rebuild the snapshot
 * every render, which under `useSyncExternalStore` is an infinite loop.
 */
export function consentSnapshotKey(input: {
  record: ConsentRecord | null;
  regime: ConsentRegime;
  gpc: boolean;
}): string {
  const record = input.record
    ? [
        input.record.v,
        input.record.analytics ? 1 : 0,
        input.record.marketing ? 1 : 0,
        input.record.at,
        input.record.subjectId ?? "",
      ].join(".")
    : "none";
  return `${record}|${input.regime}|${input.gpc}`;
}

/** Which consent surface, if any, this visitor should see. */
export function consentSurface(input: {
  record: ConsentRecord | null;
  regime: ConsentRegime;
  gpc: boolean;
  trackable: boolean;
}): ConsentSurface {
  if (!input.trackable) return "none";
  if (input.record) return "none";
  // A GPC visitor in the US has already opted out, so the notice would be
  // telling them something that is not true of them.
  if (input.gpc && input.regime === "opt-out") return "none";
  return input.regime === "opt-in" ? "banner" : "notice";
}

/** The cookie VALUE for a choice. Attributes are `consentCookieAttributes`. */
export function serializeConsentCookie(record: ConsentRecord): string {
  return encodeURIComponent(
    JSON.stringify({
      v: record.v,
      a: record.analytics ? 1 : 0,
      m: record.marketing ? 1 : 0,
      t: record.at,
      r: record.regime,
      ...(record.subjectId ? { s: record.subjectId } : {}),
    }),
  );
}

/**
 * A v4 UUID, or null. Never anything else.
 *
 * The id is ours to mint, so a value we did not write is not an id -- it is
 * something a visitor typed into their own cookie jar. Replacing it costs one
 * broken chain; trusting it would let a forger write rows under an id of their
 * choosing, or smuggle a non-UUID into a `uuid` column.
 */
function validSubjectId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : null;
}

/**
 * The subject id carried by a cookie jar, REGARDLESS of consent version.
 *
 * Deliberately not part of `parseConsentCookie`, which returns null for a
 * record written against an older `CONSENT_VERSION` -- correctly, because an
 * old choice is not a current one. The subject id is not a choice. Discarding
 * it on a version bump would break the chain at the exact moment it matters
 * most: showing that the same person was re-asked and answered again.
 */
export function readSubjectId(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const entry = part.trim();
    if (!entry.startsWith(`${CONSENT_COOKIE}=`)) continue;
    try {
      const parsed: unknown = JSON.parse(
        decodeURIComponent(entry.slice(CONSENT_COOKIE.length + 1)),
      );
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return null;
      }
      return validSubjectId((parsed as Record<string, unknown>).s);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * The visitor's subject id, minting one if there is nothing to reuse.
 *
 * Random and meaningless on purpose: never derived from an IP, a fingerprint
 * or anything else about the person. It exists only to join one person's
 * decisions to each other.
 */
export function ensureSubjectId(): string {
  const existing =
    typeof document === "undefined" ? null : readSubjectId(document.cookie);
  if (existing) return existing;
  return mintSubjectId();
}

function mintSubjectId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  // Older Safari has `getRandomValues` but not `randomUUID`. Build a v4 by
  // hand rather than falling back to Math.random, which is not a source of
  // identifiers.
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** `1` or `0` and nothing else. Anything we did not write is not consent. */
function choice(value: unknown): boolean | null {
  if (value === 1) return true;
  if (value === 0) return false;
  return null;
}

/**
 * A stored choice, or null for "never answered".
 *
 * Null for anything malformed, truncated, forged or written by an older
 * version. Never throws: a corrupt cookie has to degrade into asking again,
 * not into a blank page.
 */
export function parseConsentCookie(
  raw: string | null | undefined,
): ConsentRecord | null {
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

  const record = parsed as Record<string, unknown>;
  if (record.v !== CONSENT_VERSION) return null;

  const analytics = choice(record.a);
  const marketing = choice(record.m);
  if (analytics === null || marketing === null) return null;

  // `t` and `r` evidence the choice; they do not make it. Losing them is not a
  // reason to interrupt someone who already answered.
  return {
    v: CONSENT_VERSION,
    analytics,
    marketing,
    at: typeof record.t === "number" ? record.t : 0,
    regime: record.r === "opt-out" ? "opt-out" : "opt-in",
    ...(validSubjectId(record.s) ? { subjectId: record.s as string } : {}),
  };
}

/** The stored choice carried by a `Cookie:` header or `document.cookie`. */
export function consentRecordFromCookieHeader(
  header: string | null | undefined,
): ConsentRecord | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const entry = part.trim();
    // Match on the whole name: `x_stampeo_consent` is somebody else's cookie,
    // and reading it as ours would let any cookie on the domain grant consent.
    if (!entry.startsWith(`${CONSENT_COOKIE}=`)) continue;
    return parseConsentCookie(entry.slice(CONSENT_COOKIE.length + 1));
  }
  return null;
}

export interface ConsentCookieAttributes {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite: "lax";
  secure: boolean;
  domain?: string;
}

/**
 * Everything needed to write the choice down.
 *
 * Not `httpOnly`: the gate runs in the browser and has to read it. That is
 * safe here in a way it would not be for a session — the value is a preference
 * whose worst forgery is showing a visitor a banner they already dismissed.
 *
 * Shares `NEXT_PUBLIC_COOKIE_DOMAIN` with `lib/last-login.ts` so the dashboard
 * on `app.stampeo.app` can read the same choice when it grows a tracker.
 */
export function consentCookieAttributes(
  record: ConsentRecord,
): ConsentCookieAttributes {
  return {
    name: CONSENT_COOKIE,
    value: serializeConsentCookie(record),
    maxAge: SIX_MONTHS_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  };
}

/**
 * Which of the cookies actually present belong to the categories being
 * revoked.
 *
 * Only ever names third-party trackers: our own cookies are not in
 * COOKIE_PATTERNS, so clearing cannot erase the very refusal it is acting on.
 */
export function cookieNamesToClear(
  categories: readonly ConsentCategory[],
  present: readonly string[],
): string[] {
  const patterns = categories.flatMap((category) => COOKIE_PATTERNS[category]);
  const matched = present.filter((name) =>
    patterns.some((pattern) =>
      pattern.endsWith("*")
        ? name.startsWith(pattern.slice(0, -1))
        : name === pattern,
    ),
  );
  return [...new Set(matched)];
}

/* -------------------------------------------------------------------------
 * Browser side.
 *
 * Everything below is a no-op off the browser and returns the DENYING answer
 * there. Showcase pre-renders every locale, so a consent read during a server
 * render would either break the build or — worse — bake one visitor's answer
 * into a page served to everyone.
 * ---------------------------------------------------------------------- */

/** Fired on `window` after a choice is committed. STA-318/319/320 subscribe. */
export const CONSENT_CHANGED_EVENT = "stampeo:consent";

/** Fired on `window` to open the preferences dialog from anywhere (the footer). */
export const CONSENT_OPEN_EVENT = "stampeo:consent-open";

/**
 * Does this browser send Global Privacy Control?
 *
 * A legally binding opt-out in twelve US states, which is why it is read
 * before any regime default applies.
 */
export function detectGpc(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean })
    .globalPrivacyControl === true;
}

/**
 * The regime this visitor falls under, from the TIMEZONE alone.
 *
 * Deliberately not `detectBrowserCountry()`, which falls back to
 * `navigator.language`: a French visitor whose browser is set to `en-US` and
 * whose timezone we do not map would be read as American and tracked without
 * consent. Dropping that fallback makes the failure mode "an American sees the
 * European banner" — which costs data, not compliance.
 *
 * Not IP geolocation either. See `lib/market-suggestion.ts` for why this
 * codebase places visitors on the client or not at all, and note that showcase
 * is a standalone Docker build with no edge geo header to read.
 */
export function detectConsentRegime(): ConsentRegime {
  if (typeof window === "undefined") return "opt-in";
  try {
    return consentRegimeForCountry(
      countryForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone),
    );
  } catch {
    return "opt-in";
  }
}

/** Every cookie name currently readable by script on this document. */
function presentCookieNames(): string[] {
  if (typeof document === "undefined") return [];
  return document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter(Boolean);
}

/**
 * The choice made in this page's lifetime, held in case the cookie write was
 * refused.
 *
 * Safari's private mode and "block all cookies" both make `document.cookie`
 * a no-op or a throw. Without this, clicking Refuse would appear to do
 * nothing: the write fails, the reader re-reads an unchanged jar, and the
 * banner stays up. In the opt-out regime it is worse than cosmetic, because a
 * refusal that cannot be stored resolves straight back to granted.
 *
 * A fallback, never a cache. The cookie is the source of truth whenever it is
 * readable, so a choice made in another tab still wins here.
 */
let sessionRecord: ConsentRecord | null = null;

/** The stored choice, or null. */
export function readConsentRecord(): ConsentRecord | null {
  if (typeof document === "undefined") return null;
  return consentRecordFromCookieHeader(document.cookie) ?? sessionRecord;
}

/**
 * Record a choice and tell the page about it.
 *
 * `at` is stamped here rather than passed in: the timestamp is evidence of
 * when the visitor clicked, and the only moment that is true is this one.
 */
export function writeConsentRecord(
  state: ConsentState,
  regime: ConsentRegime,
): ConsentRecord {
  const record: ConsentRecord = {
    v: CONSENT_VERSION,
    analytics: state.analytics,
    marketing: state.marketing,
    at: Math.floor(Date.now() / 1000),
    regime,
    // Reused across decisions AND across version bumps, so the ledger can show
    // that one person answered twice rather than two people answering once.
    subjectId: ensureSubjectId(),
  };

  if (typeof document !== "undefined") {
    const attrs = consentCookieAttributes(record);
    let cookie = `${attrs.name}=${attrs.value}; Max-Age=${attrs.maxAge}; Path=${attrs.path}; SameSite=Lax`;
    if (attrs.domain) cookie += `; Domain=${attrs.domain}`;
    if (attrs.secure) cookie += "; Secure";
    try {
      document.cookie = cookie;
    } catch {
      // Blocked storage throws here. It can also fail without throwing, which
      // is why the check below reads the jar back rather than trusting this.
    }

    // Did it stick? A browser can refuse the write silently (private mode), or
    // drop it for an attribute it dislikes (`Secure` over plain http). Keeping
    // the record in memory only when it did NOT stick means the cookie stays
    // the source of truth, and the fallback clears itself the moment a write
    // succeeds rather than shadowing a later choice made in another tab.
    sessionRecord = consentRecordFromCookieHeader(document.cookie) ? null : record;
  }

  return record;
}

/**
 * Delete the cookies belonging to categories the visitor just turned off.
 *
 * Best effort, and honestly so. A cookie can only be deleted with the same
 * Domain and Path it was set with, and we do not know what GA or Meta chose,
 * so every plausible scope is attempted. What this CANNOT do is unload a
 * `gtag` or `fbq` that is already running — which is why revoking reloads the
 * page rather than pretending the tag is gone.
 */
export function clearCookiesFor(categories: readonly ConsentCategory[]): void {
  if (typeof document === "undefined") return;

  const host = window.location.hostname;
  const parent = host.split(".").slice(-2).join("."); // stampeo.app
  const domains = [
    undefined,
    host,
    `.${host}`,
    parent && parent !== host ? `.${parent}` : undefined,
    process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  ];

  for (const name of cookieNamesToClear(categories, presentCookieNames())) {
    for (const domain of domains) {
      let cookie = `${name}=; Max-Age=0; Path=/`;
      if (domain) cookie += `; Domain=${domain}`;
      try {
        document.cookie = cookie;
      } catch {
        // Same as above: a refused write is not a reason to fail the click.
      }
    }
  }
}

/** Announce a committed choice to anything listening (the pixel loaders). */
export function emitConsentChange(state: ConsentState): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGED_EVENT, { detail: state }));
}

/** Subscribe to consent changes. Returns the unsubscribe. */
export function subscribeToConsentChange(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}

/**
 * What may fire right now.
 *
 * Reads live every time rather than caching, because the answer changes the
 * moment someone clicks and a stale `true` would be a tracker firing after a
 * refusal. On the server it is always denied.
 */
export function currentConsent(): ConsentState {
  if (typeof window === "undefined") return { analytics: false, marketing: false };
  return resolveConsent({
    record: readConsentRecord(),
    regime: detectConsentRegime(),
    gpc: detectGpc(),
  });
}

/** May Google Analytics load? The seam STA-318 consumes. */
export function hasAnalyticsConsent(): boolean {
  return currentConsent().analytics;
}

/** May the Meta and TikTok pixels load? The seam STA-319 and STA-320 consume. */
export function hasMarketingConsent(): boolean {
  return currentConsent().marketing;
}
