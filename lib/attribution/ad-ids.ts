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
  oneOf,
  optionalText,
  readVersion,
  requiredText,
  total,
} from "./codec";
import { AD_COOKIE } from "./cookie-names";
import { evidenceFields, readEvidence, type ConsentEvidence } from "./evidence";
import { readClickIds, type ClickIds, type LandingContext } from "./landing";

/**
 * `stampeo_ad`: the paid click that brought the visitor. It exists ONLY for an
 * arrival that carried a platform's click id, and only under the marketing
 * category. An arrival without a click has no `_fbp` copied into any carrier:
 * Meta's own cookie holds it for 90 days, and sign-up forwards it live.
 *
 *   vn      the platform: `meta`, `google` or `tiktok`
 *   ci ct   the click id, and Unix seconds when the click was first seen
 *   fbp     Meta's browser id, once the pixel has written it
 *   cv cr ca p g  the consent evidence (see `evidence.ts`)
 */

const VENDORS = ["meta", "google", "tiktok"] as const;
export type AdVendor = (typeof VENDORS)[number];

export interface AdCarrier extends ConsentEvidence {
  v: typeof CARRIER_VERSION;
  vn: AdVendor;
  ci: string;
  ct: number;
  fbp: string | null;
}

/**
 * Which platform an arrival belongs to, with its click id, or null for no paid
 * click. The order is FIXED, not "whichever parameter came first": one carrier
 * holds one platform, and a visitor can arrive carrying two. A reproducible
 * winner is worth more than a clever one.
 */
export function paidClick(ids: ClickIds): { vendor: AdVendor; clickId: string } | null {
  if (ids.gclid) return { vendor: "google", clickId: ids.gclid };
  if (ids.fbclid) return { vendor: "meta", clickId: ids.fbclid };
  if (ids.ttclid) return { vendor: "tiktok", clickId: ids.ttclid };
  return null;
}

/**
 * Meta's browser id out of the `_fbp` cookie. Already in the wire format
 * (`fb.<subdomain>.<ms>.<random>`), so there is nothing to extract. The cookie
 * exists once the pixel has loaded, which needs marketing consent.
 */
export function readFbp(cookieHeader: string | null | undefined): string | null {
  return cookieValue(cookieHeader, "_fbp")?.trim() || null;
}

/**
 * The carrier for a paid click, or null when the landing carried none.
 * `clickedAt` keeps the moment a click was FIRST seen when the same click is
 * written again to add the browser id; it defaults to when this page loaded.
 */
export function buildAdCarrier(input: {
  landing: LandingContext;
  fbp: string | null;
  evidence: ConsentEvidence;
  clickedAt?: number;
}): AdCarrier | null {
  const click = paidClick(readClickIds(input.landing.search));
  if (click === null) return null;
  return {
    v: CARRIER_VERSION,
    vn: click.vendor,
    ci: click.clickId,
    ct: input.clickedAt ?? input.landing.landedAt,
    // A value past the cap is hostile, and a cut one would look like data.
    fbp: input.fbp !== null && input.fbp.length <= MAX_ID_FIELD ? input.fbp : null,
    ...input.evidence,
  };
}

export function serializeAdCarrier(carrier: AdCarrier): string {
  return encodeCarrier({
    v: carrier.v,
    vn: carrier.vn,
    ci: carrier.ci,
    ct: carrier.ct,
    fbp: carrier.fbp,
    ...evidenceFields(carrier),
  });
}

export function parseAdCarrier(value: unknown): AdCarrier | null {
  return total(() => {
    if (!isRecord(value)) return invalid();
    readVersion(value);
    return {
      v: CARRIER_VERSION,
      vn: oneOf(value, "vn", VENDORS),
      ci: requiredText(value, "ci", MAX_ID_FIELD),
      ct: epoch(value, "ct"),
      fbp: optionalText(value, "fbp", MAX_ID_FIELD),
      ...readEvidence(value),
    };
  });
}

export function parseAdCookie(raw: string | null | undefined): AdCarrier | null {
  return parseAdCarrier(decodeCarrier(raw));
}

export function adCookieFor(value: unknown): CookieAttributes | null {
  const carrier = parseAdCarrier(value);
  return carrier && carrierCookie(AD_COOKIE, serializeAdCarrier(carrier));
}
