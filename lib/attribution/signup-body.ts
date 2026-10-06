import { readSubjectId, type ConsentState } from "../consent";
import { readSidCookie } from "../privacy/subject";
import { parseAdCookie, serializeAdCarrier } from "./ad-ids";
import { MAX_ID_FIELD, cookieValue, decodeCarrier } from "./codec";
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
 * Nothing here asks whether the account is new. The backend decides that.
 */

export interface SignupBody {
  consent_subject_id?: string;
  ad_attribution_v2?: { src?: object; ga?: object; ad?: object };
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
}): SignupBody {
  const { cookieHeader: header, consent, measurementId } = input;
  const body: SignupBody = {};

  const subject = readSidCookie(header) ?? readSubjectId(header);
  if (subject) body.consent_subject_id = subject;

  const carriers: NonNullable<SignupBody["ad_attribution_v2"]> = {};
  if (consent.analytics || consent.marketing) {
    const src = parseSourceCookie(cookieValue(header, "stampeo_src"));
    if (src) carriers.src = asStored(serializeSourceCarrier(src));
  }
  if (consent.analytics) {
    const ga = parseGaCookie(cookieValue(header, "stampeo_ga"));
    if (ga) carriers.ga = asStored(serializeGaCarrier(ga));
  }
  if (consent.marketing) {
    const ad = parseAdCookie(cookieValue(header, "stampeo_ad"));
    if (ad) carriers.ad = asStored(serializeAdCarrier(ad));
  }
  if (Object.keys(carriers).length > 0) body.ad_attribution_v2 = carriers;

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
  if (Object.keys(live).length > 0) body.live = live;

  return body;
}
