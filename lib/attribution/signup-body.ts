import { readSubjectId, type ConsentRegime, type ConsentState } from "../consent";
import { POLICY_MATRIX, type PolicyRow } from "../privacy/policy-matrix";
import { readSidCookie } from "../privacy/subject";
import { parseAdCookie, serializeAdCarrier } from "./ad-ids";
import { MAX_ID_FIELD, cookieValue, decodeCarrier } from "./codec";
import { AD_COOKIE, GA_COOKIE, SOURCE_COOKIE } from "./cookie-names";
import { gaSessionCookieName, parseGaCookie, serializeGaCarrier } from "./ga-ids";
import { parseSourceCookie, serializeSourceCarrier } from "./source";

/**
 * The body of `POST /account/signup-recorded`, built from the cookie jar.
 *
 * It carries what the backend cannot see from the browser itself: the subject
 * that chains the visitor's consent decisions, the three carriers as stored,
 * and the identifier cookies as they are RIGHT NOW, raw (the backend parses
 * them, and keeps only the property it is configured for).
 *
 * Which of them leave the page is the visitor's choice. Each category's values
 * are left out unless the CURRENT resolved consent allows it, so a visitor
 * under GPC, or one who refused a category, sends none of its identifiers. The
 * subject always goes: it is strictly necessary, and it is how the backend ties
 * a refusal made on the marketing site to the account.
 *
 * The basis (the regime, policy version and row the call is made under) ALWAYS
 * goes, even when everything else is left out: it is what lets the backend
 * record a US visitor's refusal under GPC when no carrier or ledger decision
 * names a regime.
 *
 * Nothing here asks whether the account is new. The backend decides that.
 */

/** The regime in force at the moment of the call, as the backend's fallback basis. */
export interface SignupBasis {
  cr: ConsentRegime;
  /** The policy matrix version. */
  p: number;
  /** The policy row key (`EEA_UK_CH`, `US`, `UNKNOWN`). */
  g: string;
}

export function signupBasis(row: PolicyRow): SignupBasis {
  return { cr: row.regime, p: POLICY_MATRIX.version, g: row.key };
}

export interface SignupBody {
  consent_subject_id?: string;
  ad_attribution_v2?: { src?: object; ga?: object; ad?: object };
  basis: SignupBasis;
  live?: {
    ga?: string;
    ga_sessions?: Record<string, string>;
    fbp?: string;
    fbc?: string;
  };
}

/** A raw cookie value to forward, or null: empty, or past the cap (a cut identifier looks like data). */
function liveValue(header: string | null | undefined, name: string): string | null {
  const value = cookieValue(header, name)?.trim();
  return value && value.length <= MAX_ID_FIELD ? value : null;
}

/** The carrier's JSON as it is stored, re-written from what validated: nothing extra rides along. */
const asStored = (serialized: string): object => decodeCarrier(serialized) as object;

export function buildSignupBody(input: {
  cookieHeader: string | null | undefined;
  consent: ConsentState;
  measurementId: string | null;
  basis: SignupBasis;
}): SignupBody {
  const { cookieHeader: header, consent, measurementId, basis } = input;

  const subject = readSidCookie(header) ?? readSubjectId(header);

  const carriers: NonNullable<SignupBody["ad_attribution_v2"]> = {};
  if (consent.analytics || consent.marketing) {
    const src = parseSourceCookie(cookieValue(header, SOURCE_COOKIE));
    if (src) carriers.src = asStored(serializeSourceCarrier(src));
  }
  if (consent.analytics) {
    const ga = parseGaCookie(cookieValue(header, GA_COOKIE));
    if (ga) carriers.ga = asStored(serializeGaCarrier(ga));
  }
  if (consent.marketing) {
    const ad = parseAdCookie(cookieValue(header, AD_COOKIE));
    if (ad) carriers.ad = asStored(serializeAdCarrier(ad));
  }

  const live: NonNullable<SignupBody["live"]> = {};
  if (consent.analytics) {
    const ga = liveValue(header, "_ga");
    if (ga) live.ga = ga;
    const sessionCookie = gaSessionCookieName(measurementId);
    const session = sessionCookie && liveValue(header, sessionCookie);
    if (sessionCookie && session) live.ga_sessions = { [sessionCookie.slice("_ga_".length)]: session };
  }
  if (consent.marketing) {
    const fbp = liveValue(header, "_fbp");
    if (fbp) live.fbp = fbp;
    const fbc = liveValue(header, "_fbc");
    if (fbc) live.fbc = fbc;
  }

  return {
    ...(subject ? { consent_subject_id: subject } : {}),
    ...(Object.keys(carriers).length > 0 ? { ad_attribution_v2: carriers } : {}),
    basis,
    ...(Object.keys(live).length > 0 ? { live } : {}),
  };
}
