import { readMeasurementId } from "../google-analytics";
import type { CookieAttributes } from "../privacy/cookies";
import {
  CARRIER_VERSION,
  MAX_ID_FIELD,
  carrierCookie,
  cookieValue,
  decodeCarrier,
  encodeCarrier,
  epoch,
  invalid,
  isRecord,
  optionalInteger,
  optionalText,
  readVersion,
  requiredText,
  total,
} from "./codec";
import { evidenceFields, readEvidence, type ConsentEvidence } from "./evidence";

/**
 * `stampeo_ga`: the visitor's Google Analytics identifiers, so a server-side
 * event can join the browser session. Analytics category.
 *
 *   cid     the GA client id, `1234567890.1700000000` (never the `GA1.1.` form)
 *   sid sn  the session id and number, from the property's `_ga_<id>` cookie
 *   at      Unix seconds, when these ids were last read
 *   cv cr ca p g  the consent evidence (see `evidence.ts`)
 */

export const GA_COOKIE = "stampeo_ga";

/** A GA session: the id (a Unix timestamp as text) and how many sessions this client has had. */
export interface GaSession {
  sid: string;
  sn: number;
}

export interface GaCarrier extends ConsentEvidence {
  v: typeof CARRIER_VERSION;
  cid: string;
  sid: string | null;
  sn: number | null;
  at: number;
}

const CLIENT_ID = /^\d{1,20}\.\d{1,20}$/;
const SESSION_ID = /^\d{1,20}$/;
const MAX_SESSION_NUMBER = 2_147_483_647;

/**
 * The GA client id out of a `_ga` cookie value, `GA1.<n>.<a>.<b>` to `<a>.<b>`.
 * The prefix names the cookie's format and domain depth, not the client.
 */
function clientIdFromValue(value: string): string | null {
  const match = /^GA\d+\.\d+\.(\d{1,20}\.\d{1,20})$/.exec(value);
  return match ? match[1] : null;
}

/** The GA client id in a cookie jar, or null. Google writes it once its tag has run. */
export function readGaClientId(cookieHeader: string | null | undefined): string | null {
  const raw = cookieValue(cookieHeader, "_ga");
  return raw === null ? null : clientIdFromValue(raw);
}

/** The name of a property's session cookie: `_ga_` and the measurement id without `G-`. */
export function gaSessionCookieName(measurementId: string | null | undefined): string | null {
  const id = readMeasurementId(measurementId);
  return id === null ? null : `_ga_${id.slice(2)}`;
}

/**
 * The session id and number in a property's `_ga_<id>` value, or null.
 *
 *   GS1.1.<sid>.<sn>.<engaged>.<last>.<j>.<l>.<h>
 *   GS2.1.s<sid>$o<sn>$g<engaged>$t<last>$j<j>$l<l>$h<h>
 *
 * Total: the value is typed by whoever opens devtools.
 */
export function parseGaSessionCookie(value: string | null | undefined): GaSession | null {
  if (typeof value !== "string" || value === "") return null;
  return total(() => {
    const decoded = decodeURIComponent(value);
    const gs1 = /^GS1\.\d+\.(\d{1,20})\.(\d{1,9})(?:\.|$)/.exec(decoded);
    if (gs1) return { sid: gs1[1], sn: Number(gs1[2]) };

    const gs2 = /^GS2\.\d+\.s(\d{1,20})\$o(\d{1,9})(?:\$|$)/.exec(decoded);
    if (gs2) return { sid: gs2[1], sn: Number(gs2[2]) };
    return invalid();
  });
}

/** The property's session in a cookie jar, or null. */
export function readGaSession(
  cookieHeader: string | null | undefined,
  measurementId: string | null | undefined,
): GaSession | null {
  const name = gaSessionCookieName(measurementId);
  return name === null ? null : parseGaSessionCookie(cookieValue(cookieHeader, name));
}

export function buildGaCarrier(input: {
  cid: string;
  session: GaSession | null;
  evidence: ConsentEvidence;
  capturedAt: number;
}): GaCarrier {
  return {
    v: CARRIER_VERSION,
    cid: input.cid.slice(0, MAX_ID_FIELD),
    sid: input.session?.sid ?? null,
    sn: input.session?.sn ?? null,
    at: input.capturedAt,
    ...input.evidence,
  };
}

export function serializeGaCarrier(carrier: GaCarrier): string {
  return encodeCarrier({
    v: carrier.v,
    cid: carrier.cid,
    sid: carrier.sid,
    sn: carrier.sn,
    at: carrier.at,
    ...evidenceFields(carrier),
  });
}

export function parseGaCarrier(value: unknown): GaCarrier | null {
  return total(() => {
    if (!isRecord(value)) return invalid();
    readVersion(value);
    const cid = requiredText(value, "cid", MAX_ID_FIELD);
    const sid = optionalText(value, "sid", MAX_ID_FIELD);
    if (!CLIENT_ID.test(cid) || (sid !== null && !SESSION_ID.test(sid))) return invalid();
    return {
      v: CARRIER_VERSION,
      cid,
      sid,
      sn: optionalInteger(value, "sn", 1, MAX_SESSION_NUMBER),
      at: epoch(value, "at"),
      ...readEvidence(value),
    };
  });
}

export function parseGaCookie(raw: string | null | undefined): GaCarrier | null {
  return parseGaCarrier(decodeCarrier(raw));
}

export function gaCookieFor(value: unknown): CookieAttributes | null {
  const carrier = parseGaCarrier(value);
  return carrier && carrierCookie(GA_COOKIE, serializeGaCarrier(carrier));
}
