import {
  AD_COOKIE,
  GA_COOKIE,
  LEGACY_ATTRIBUTION_COOKIE,
  SOURCE_COOKIE,
} from "./attribution/cookie-names";
import {
  buildCookie,
  serializeSetCookie,
  syncPrivacyCookies,
  type CookieAttributes,
} from "./privacy/cookies";
import {
  consentMaxAgeSeconds,
  gpcDeniedCategories,
  recordRow,
  resolveWithPolicy,
  rowByKey,
  rowFor,
  surfaceWithPolicy,
} from "./privacy/policy";
import { POLICY_MATRIX, type PolicyRow } from "./privacy/policy-matrix";
import { detectPolicyRow } from "./privacy/region";
import { mintSubjectId, readSid, validSubjectId } from "./privacy/subject";

/**
 * The consent gate for GA4 and the Meta pixel. Nothing in this file loads a tag;
 * it decides whether one may be loaded, and remembers the answer.
 *
 * Two rules run through everything here.
 *
 * ABSENCE OF CONSENT IS NOT CONSENT. No cookie, a corrupt cookie, a country we
 * cannot place, a server render: all of them resolve to denied. The granting
 * paths are the narrow ones.
 *
 * THE TAG IS NEVER LOADED BEFORE THE ANSWER. Not loaded-then-suppressed, and
 * not Google Consent Mode in `denied` state either — that still contacts
 * googletagmanager.com, and Meta has no cookieless mode at all.
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
 * A grant stored under an older version is not carried over, so the visitor
 * is asked again rather than a new tracker quietly inheriting consent that was
 * given for a different list of recipients. A refusal stored under an older
 * version still stands: see `resolveConsent`.
 *
 * What each version's text covers:
 * 1 — The banner: browser-side tags only.
 * 2 — Privacy policy §5.5: we retain the advertising identifier against the
 *     business account, and report conversions server-side, independently of
 *     the browser.
 * 3 — Privacy policy §5.5: Meta also receives hashed contact details, the IP
 *     address and browser characteristics, four reported steps instead of
 *     two, and those steps for signups that did not come through a Meta ad.
 *
 * The backend's `CONSENT_VERSION` mirrors this and must move with it: the
 * backend honours only the versions in `ACCEPTED_CONSENT_VERSIONS` (backend
 * `app/services/attribution/eligibility.py`).
 */
export const CONSENT_VERSION = 3;

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

/**
 * One category's answer in a stored record: granted, refused, or `null` for no
 * choice (written as `-1` by the web dashboard's restore of a refusal).
 */
export type StoredChoice = boolean | null;

export interface ConsentRecord {
  analytics: StoredChoice;
  marketing: StoredChoice;
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
  /** The policy matrix version the choice was made under (cookie `p`). Evidence. */
  policyVersion?: number;
  /** The policy row in force when they chose (cookie `g`). Evidence. */
  regionRow?: string;
  /** `restore` when the web dashboard wrote this record to bring back a refusal made elsewhere (cookie `o`). */
  origin?: "restore";
}

/** A record in which every category was answered: what a visitor's own action writes. */
export type DecidedConsentRecord = ConsentRecord & ConsentState;

/**
 * The choices of a record stored under an older `CONSENT_VERSION`. Only its
 * refusals still decide anything (see `resolveConsent`); its version and moment
 * are the evidence an attribution capture rests on (`captureConsentEvidence`).
 */
export interface PriorConsent {
  analytics: StoredChoice;
  marketing: StoredChoice;
  /** The older CONSENT_VERSION this choice was made against. */
  v: number;
  /** Unix seconds, from the older cookie's `t`; 0 when it carried none. */
  at: number;
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
 * `stampeo_ga` and `stampeo_ad` are our own carriers of each category's
 * identifiers. `stampeo_src` (campaign source) holds neither and is cleared
 * only when both categories are refused; the legacy `stampeo_attribution`
 * holds both and goes on any refusal.
 *
 * What must never appear here is CONSENT_COOKIE or the subject cookie:
 * clearing them would erase the very refusal being acted on.
 */
const COOKIE_PATTERNS: Record<ConsentCategory, readonly string[]> = {
  analytics: ["_ga", "_ga_*", "_gid", GA_COOKIE],
  marketing: ["_fbp", "_fbc", "_ttp", AD_COOKIE],
};

/** The carriers the privacy route sets as a server response, which a refusal asks it to clear too. */
const SERVER_SET_CARRIERS: readonly string[] = [
  SOURCE_COOKIE,
  GA_COOKIE,
  AD_COOKIE,
  LEGACY_ATTRIBUTION_COOKIE,
];

/**
 * The regime a country falls under. Anything but the US is opt-in, including
 * `null`: the unknown case is the server render, a timezone we do not map and
 * a browser that refuses `Intl`, and it is always the strict one.
 */
export function consentRegimeForCountry(
  country: string | null | undefined,
): ConsentRegime {
  return rowFor(country).regime;
}

/**
 * What this visitor is taken to have agreed to, by the live policy row's rules
 * (`lib/privacy/policy.ts`): GPC first where the row overrides, then a
 * current choice, then the row's default. An older (`prior`) record's refusals
 * stand and its grants are not carried.
 */
export function resolveConsent(input: {
  record: ConsentRecord | null;
  prior: PriorConsent | null;
  gpc: boolean;
  row: PolicyRow;
}): ConsentState {
  return resolveWithPolicy(input);
}

/**
 * The categories whose trackers must be cleared when a page loads: those GPC
 * denies where the row overrides, since a recorded grant or the opt-out
 * default may have let trackers into the jar before the signal was on.
 */
export function categoriesToClearOnLoad(input: {
  gpc: boolean;
  row: PolicyRow;
}): ConsentCategory[] {
  return gpcDeniedCategories(input.row, input.gpc);
}

/**
 * The categories a stored choice, of any consent version, explicitly refuses: a
 * stored `0`. No record, no choice (`-1`) and a grant are not refusals.
 */
export function explicitRefusals(
  ...stored: Array<{ analytics: StoredChoice; marketing: StoredChoice } | null | undefined>
): ConsentCategory[] {
  return (["analytics", "marketing"] as const).filter((category) =>
    stored.some((choice) => choice?.[category] === false),
  );
}

/**
 * The categories whose cookies a new choice clears: those it revokes. Refusing
 * the last category that was on takes the campaign-source carrier too, so a
 * two-step withdrawal clears it with the second step.
 */
export function categoriesToClearOnChoice(
  before: ConsentState,
  next: ConsentState,
): ConsentCategory[] {
  const revoked = (["analytics", "marketing"] as const).filter(
    (category) => before[category] && !next[category],
  );
  if (revoked.length === 0) return [];
  return next.analytics || next.marketing ? revoked : ["analytics", "marketing"];
}

/**
 * A stable identity for `useConsent`'s snapshot cache.
 *
 * `useSyncExternalStore` compares snapshots by identity, so the hook rebuilds
 * its snapshot object only when this key changes. The key covers EVERY field
 * the snapshot exposes, so a re-decision that keeps the same answers still
 * serves a fresh record and its evidence.
 *
 * The key is a pure function of the underlying facts: a value that varies per
 * call (a Date, an object identity) would rebuild the snapshot every render,
 * which under `useSyncExternalStore` is an infinite loop.
 */
export function consentSnapshotKey(input: {
  record: ConsentRecord | null;
  prior: PriorConsent | null;
  gpc: boolean;
  /** The policy row key and whether tags may start: both are snapshot fields. */
  row: string;
  ready: boolean;
}): string {
  const record = input.record
    ? [
        input.record.v,
        storedCode(input.record.analytics),
        storedCode(input.record.marketing),
        input.record.at,
        input.record.subjectId ?? "",
        input.record.policyVersion ?? "",
        input.record.regionRow ?? "",
        input.record.origin ?? "",
      ].join(".")
    : "none";
  const prior = input.prior
    ? [
        input.prior.v,
        storedCode(input.prior.analytics),
        storedCode(input.prior.marketing),
        input.prior.at,
      ].join(".")
    : "none";
  return `${record}|${prior}|${input.gpc}|${input.row}|${input.ready}`;
}

/** Which consent surface, if any, this visitor should see. */
export function consentSurface(input: {
  record: ConsentRecord | null;
  prior: PriorConsent | null;
  gpc: boolean;
  trackable: boolean;
  row: PolicyRow;
}): ConsentSurface {
  return surfaceWithPolicy(input);
}

/** The cookie's number for an answer: `1` granted, `0` refused, `-1` no choice. */
function storedCode(answer: StoredChoice): 1 | 0 | -1 {
  if (answer === null) return -1;
  return answer ? 1 : 0;
}

/** The JSON object stored in the cookie, and posted to the privacy route. */
export function consentCookieObject(record: ConsentRecord): Record<string, unknown> {
  return {
    v: record.v,
    a: storedCode(record.analytics),
    m: storedCode(record.marketing),
    t: record.at,
    r: record.regime,
    ...(record.subjectId ? { s: record.subjectId } : {}),
    ...(record.policyVersion ? { p: record.policyVersion } : {}),
    ...(record.regionRow ? { g: record.regionRow } : {}),
    ...(record.origin ? { o: record.origin } : {}),
  };
}

/** The cookie VALUE for a choice. Attributes are `consentCookieAttributes`. */
export function serializeConsentCookie(record: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(consentCookieObject(record)));
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
 * The visitor's subject id: the subject cookie, else the one inside their
 * consent record, else a fresh one. Random and meaningless on purpose: it only
 * joins one person's decisions to each other.
 */
export function ensureSubjectId(): string {
  const header = typeof document === "undefined" ? null : document.cookie;
  return readSid() ?? readSubjectId(header) ?? mintSubjectId();
}

/** `1`, `0` or `-1` and nothing else (`undefined` otherwise). Anything we did not write is not consent. */
function choice(value: unknown): StoredChoice | undefined {
  if (value === 1) return true;
  if (value === 0) return false;
  if (value === -1) return null;
  return undefined;
}

/**
 * A stored choice of any version from 1 to CONSENT_VERSION, or null.
 *
 * Null for anything malformed, truncated or forged. Never throws: a corrupt
 * cookie has to degrade into asking again, not into a blank page.
 */
export function consentFromObject(parsed: unknown): ConsentRecord | null {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const v = record.v;
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > CONSENT_VERSION) {
    return null;
  }

  const analytics = choice(record.a);
  const marketing = choice(record.m);
  if (analytics === undefined || marketing === undefined) return null;

  // `t`, `r`, `p` and `g` evidence the choice; they do not make it. Losing
  // them is not a reason to interrupt someone who already answered.
  const p = record.p;
  const policyVersion =
    typeof p === "number" && Number.isInteger(p) && p >= 1 && p <= 1000 ? p : null;
  const regionRow = rowByKey(record.g)?.key ?? null;
  const subjectId = validSubjectId(record.s);
  return {
    v,
    analytics,
    marketing,
    at: typeof record.t === "number" ? record.t : 0,
    regime: record.r === "opt-out" ? "opt-out" : "opt-in",
    ...(subjectId ? { subjectId } : {}),
    ...(policyVersion ? { policyVersion } : {}),
    ...(regionRow ? { regionRow } : {}),
    ...(record.o === "restore" ? { origin: "restore" as const } : {}),
  };
}

/** A stored choice of any version from its raw cookie value, or null. */
export function parseStoredChoice(raw: string | null | undefined): ConsentRecord | null {
  if (!raw || !raw.trim()) return null;
  try {
    return consentFromObject(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return null;
  }
}

/**
 * A choice stored under the current version, or null for "no current choice".
 *
 * Null for an older version too: that record is read by `parsePriorConsent`.
 */
export function parseConsentCookie(
  raw: string | null | undefined,
): ConsentRecord | null {
  const stored = parseStoredChoice(raw);
  return stored && stored.v === CONSENT_VERSION ? stored : null;
}

/**
 * A choice stored under an older version, or null.
 *
 * Returned even without a moment (`at` 0): its refusals still stand.
 */
export function parsePriorConsent(raw: string | null | undefined): PriorConsent | null {
  const stored = parseStoredChoice(raw);
  if (!stored || stored.v === CONSENT_VERSION) return null;
  return {
    v: stored.v,
    analytics: stored.analytics,
    marketing: stored.marketing,
    at: stored.at,
  };
}

/** The raw consent cookie value in a `Cookie:` header or `document.cookie`. */
export function consentCookieValue(header: string | null | undefined): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const entry = part.trim();
    // Match on the whole name: `x_stampeo_consent` is somebody else's cookie,
    // and reading it as ours would let any cookie on the domain grant consent.
    if (!entry.startsWith(`${CONSENT_COOKIE}=`)) continue;
    return entry.slice(CONSENT_COOKIE.length + 1);
  }
  return null;
}

/** The current-version choice carried by a `Cookie:` header or `document.cookie`. */
export function consentRecordFromCookieHeader(
  header: string | null | undefined,
): ConsentRecord | null {
  return parseConsentCookie(consentCookieValue(header));
}

/** The older-version choice carried by a `Cookie:` header or `document.cookie`. */
export function priorConsentFromCookieHeader(
  header: string | null | undefined,
): PriorConsent | null {
  return parsePriorConsent(consentCookieValue(header));
}

export type ConsentCookieAttributes = CookieAttributes;

/**
 * Everything needed to write the choice down.
 *
 * Lives for the refusal lifetime of the row the record was made under when
 * either category is refused, else its grant lifetime. Not `httpOnly`: the
 * gate runs in the browser and has to read it, and the value is a preference
 * whose worst forgery is showing a visitor a banner they already dismissed.
 */
export function consentCookieAttributes(record: ConsentRecord): ConsentCookieAttributes {
  return buildCookie(
    CONSENT_COOKIE,
    serializeConsentCookie(record),
    consentMaxAgeSeconds(recordRow(record), record),
  );
}

/**
 * Which of the cookies actually present belong to the categories being
 * revoked.
 *
 * Only ever names trackers and their carriers: the consent and subject
 * cookies are not in COOKIE_PATTERNS, so clearing cannot erase the very
 * refusal it is acting on.
 */
export function cookieNamesToClear(
  categories: readonly ConsentCategory[],
  present: readonly string[],
): string[] {
  const patterns = categories.flatMap((category) => COOKIE_PATTERNS[category]);
  if (categories.length > 0) patterns.push(LEGACY_ATTRIBUTION_COOKIE);
  if (categories.includes("analytics") && categories.includes("marketing")) {
    patterns.push(SOURCE_COOKIE);
  }
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
 * The regime this visitor falls under: that of their policy row
 * (`lib/privacy/region.ts`). Nothing writes a server region yet, so today the
 * timezone alone decides. Not IP geolocation, and not `navigator.language`.
 */
export function detectConsentRegime(): ConsentRegime {
  return detectPolicyRow().regime;
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

/** The stored current-version choice, or null. */
export function readConsentRecord(): ConsentRecord | null {
  if (typeof document === "undefined") return null;
  return consentRecordFromCookieHeader(document.cookie) ?? sessionRecord;
}

/**
 * Both readings of the cookie jar that `resolveConsent` and `consentSurface`
 * take: the current choice, and an older-version one whose refusals stand.
 */
export function readStoredConsent(): {
  record: ConsentRecord | null;
  prior: PriorConsent | null;
} {
  if (typeof document === "undefined") return { record: null, prior: null };
  return {
    record: readConsentRecord(),
    prior: priorConsentFromCookieHeader(document.cookie),
  };
}

/**
 * Record a choice and tell the page about it.
 *
 * `at` is stamped here rather than passed in: the timestamp is evidence of
 * when the visitor clicked, and the only moment that is true is this one.
 * `row` is the live policy row the choice is made under. The cookie is written
 * synchronously, then the server is asked to set it again as a first-party
 * response (see `lib/privacy/cookies.ts`).
 */
export function writeConsentRecord(state: ConsentState, row: PolicyRow): DecidedConsentRecord {
  const record: DecidedConsentRecord = {
    v: CONSENT_VERSION,
    analytics: state.analytics,
    marketing: state.marketing,
    at: Math.floor(Date.now() / 1000),
    regime: row.regime,
    // Reused across decisions AND across version bumps, so the ledger can show
    // that one person answered twice rather than two people answering once.
    subjectId: ensureSubjectId(),
    policyVersion: POLICY_MATRIX.version,
    regionRow: row.key,
  };

  if (typeof document !== "undefined") {
    try {
      document.cookie = serializeSetCookie(consentCookieAttributes(record));
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

    syncPrivacyCookies({ consent: consentCookieObject(record), sid: "ensure" });
  }

  return record;
}

/**
 * Delete the cookies belonging to categories the visitor just turned off.
 *
 * Best effort, and honestly so. A cookie can only be deleted with the same
 * Domain and Path it was set with, and we do not know what GA or Meta chose,
 * so every plausible scope is attempted. The carriers our own route set are
 * also cleared by asking it to, in a request that outlives the reload. What
 * this CANNOT do is unload a `gtag` or `fbq` that is already running, which is
 * why revoking reloads the page rather than pretending the tag is gone.
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

  const carriers = cookieNamesToClear(categories, SERVER_SET_CARRIERS);
  if (carriers.length > 0) syncPrivacyCookies({ clear: carriers });
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
  const row = detectPolicyRow();
  return resolveConsent({ ...readStoredConsent(), gpc: detectGpc(), row });
}

/** May Google Analytics load? */
export function hasAnalyticsConsent(): boolean {
  return currentConsent().analytics;
}

/** May the Meta pixel load? */
export function hasMarketingConsent(): boolean {
  return currentConsent().marketing;
}
