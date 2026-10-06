import { countryForTimezone } from "../timezone-country";
import { effectiveRow, readServerRegion } from "./policy";
import { POLICY_MATRIX, UNKNOWN_ROW_KEY, type PolicyMatrix, type PolicyRow } from "./policy-matrix";

/**
 * Where the browser learns the visitor's region. Two sources, either of which
 * may be missing: the country in `stampeo_region` and the country of the
 * device's IANA timezone. `effectiveRow` keeps the stricter of the two. Nothing
 * writes `stampeo_region` yet, so today the timezone alone decides. The server
 * render always gets the strict row.
 */

/**
 * Whether `stampeo_region` is read at all. Nothing writes or signs it, so any
 * value in it is the visitor's own; it is turned on only once a trusted writer
 * exists.
 */
export const READ_REGION_COOKIE = false;

/** The country a `stampeo_region` cookie carries, or null. */
export function serverRegion(): string | null {
  if (!READ_REGION_COOKIE || typeof document === "undefined") return null;
  return readServerRegion(document.cookie);
}

/**
 * The country of the device's timezone, or null for a zone we do not map or a
 * browser that refuses `Intl`. Never `navigator.language`: a French visitor
 * whose browser says `en-US` would be read as American and tracked without
 * consent.
 */
export function timezoneRegion(): string | null {
  try {
    return countryForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return null;
  }
}

/** The row this visitor falls under. */
export function detectPolicyRow(matrix: PolicyMatrix = POLICY_MATRIX): PolicyRow {
  if (typeof window === "undefined") return matrix.rows[UNKNOWN_ROW_KEY];
  return effectiveRow(
    { serverCountry: serverRegion(), timezoneCountry: timezoneRegion() },
    matrix,
  );
}
