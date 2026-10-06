import type { CookieAttributes } from "../privacy/cookies";
import {
  CARRIER_VERSION,
  MAX_FIELD,
  carrierCookie,
  decodeCarrier,
  encodeCarrier,
  epoch,
  invalid,
  isRecord,
  optionalText,
  readVersion,
  requiredText,
  total,
} from "./codec";
import { SOURCE_COOKIE } from "./cookie-names";
import { evidenceFields, readEvidence, type ConsentEvidence } from "./evidence";
import { readUtm, referrerHost, type LandingContext } from "./landing";

/**
 * `stampeo_src`: where the visit came from, in campaign terms. The UTM tags,
 * the landing page and variant, and the referrer's host. It holds no
 * identifier, so either consent category permits it.
 *
 *   us um uc uo ut  utm_source, _medium, _campaign, _content, _term
 *   lp lv rh        landing path, landing variant, referrer host
 *   at              Unix seconds, when the landing page loaded
 *   cv cr ca p g    the consent evidence (see `evidence.ts`)
 */

export interface SourceCarrier extends ConsentEvidence {
  v: typeof CARRIER_VERSION;
  us: string | null;
  um: string | null;
  uc: string | null;
  uo: string | null;
  ut: string | null;
  lp: string;
  lv: string | null;
  rh: string | null;
  at: number;
}

export function buildSourceCarrier(input: {
  landing: LandingContext;
  evidence: ConsentEvidence;
}): SourceCarrier {
  const { landing, evidence } = input;
  const utm = readUtm(landing.search);
  return {
    v: CARRIER_VERSION,
    us: utm.utmSource,
    um: utm.utmMedium,
    uc: utm.utmCampaign,
    uo: utm.utmContent,
    ut: utm.utmTerm,
    lp: landing.path.slice(0, MAX_FIELD),
    lv: landing.variant?.slice(0, MAX_FIELD) || null,
    rh: referrerHost(landing.referrer, landing.selfHost)?.slice(0, MAX_FIELD) ?? null,
    at: landing.landedAt,
    ...evidence,
  };
}

/** The cookie VALUE for a carrier. Fields are short because the cookie rides on every request. */
export function serializeSourceCarrier(carrier: SourceCarrier): string {
  return encodeCarrier({
    v: carrier.v,
    us: carrier.us,
    um: carrier.um,
    uc: carrier.uc,
    uo: carrier.uo,
    ut: carrier.ut,
    lp: carrier.lp,
    lv: carrier.lv,
    rh: carrier.rh,
    at: carrier.at,
    ...evidenceFields(carrier),
  });
}

/** A carrier from its JSON, or null for anything malformed, forged or from another version. */
export function parseSourceCarrier(value: unknown): SourceCarrier | null {
  return total(() => {
    if (!isRecord(value)) return invalid();
    readVersion(value);
    return {
      v: CARRIER_VERSION,
      us: optionalText(value, "us", MAX_FIELD),
      um: optionalText(value, "um", MAX_FIELD),
      uc: optionalText(value, "uc", MAX_FIELD),
      uo: optionalText(value, "uo", MAX_FIELD),
      ut: optionalText(value, "ut", MAX_FIELD),
      lp: requiredText(value, "lp", MAX_FIELD),
      lv: optionalText(value, "lv", MAX_FIELD),
      rh: optionalText(value, "rh", MAX_FIELD),
      at: epoch(value, "at"),
      ...readEvidence(value),
    };
  });
}

/** A carrier from a cookie value, or null. */
export function parseSourceCookie(raw: string | null | undefined): SourceCarrier | null {
  return parseSourceCarrier(decodeCarrier(raw));
}

/** The cookie to set for a posted carrier, or null when it is invalid or too big to be one. */
export function sourceCookieFor(value: unknown): CookieAttributes | null {
  const carrier = parseSourceCarrier(value);
  return carrier && carrierCookie(SOURCE_COOKIE, serializeSourceCarrier(carrier));
}
