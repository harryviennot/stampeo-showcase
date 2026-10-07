import { buildCookie, type CookieAttributes } from "../privacy/cookies";

/**
 * How a carrier becomes a cookie value and back.
 *
 * A carrier is URL-encoded JSON in a cookie on the shared parent domain, so it
 * rides on every request to both subdomains for six months alongside the
 * chunked auth cookies. It is also editable in devtools and arrives in a posted
 * body, so reading is TOTAL: anything malformed, forged, oversized or from
 * another version is null, never a throw.
 */

/** Bump when a field changes meaning. A carrier of another version is discarded. */
export const CARRIER_VERSION = 2;

/** Free-text fields (UTM tags, landing path, variant, referrer host). */
export const MAX_FIELD = 128;

/**
 * Identifier fields (click ids, cookie values). Larger, because a real `fbclid`
 * runs past 100 characters and a truncated one attributes to nothing.
 */
export const MAX_ID_FIELD = 512;

/**
 * Ceiling on one serialized cookie value. A crafted landing link could
 * otherwise plant a cookie big enough to push the visitor over the
 * request-header limit, and give them a persistent 431 on the dashboard until
 * they cleared it by hand.
 */
export const MAX_COOKIE_BYTES = 2048;

/** Six months, as long as the consent choice that permits a carrier. */
export const CARRIER_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

/** 2100-01-01 in Unix seconds: past it a timestamp is forged, not a clock. */
const MAX_EPOCH_SECONDS = 4_102_444_800;

class Invalid extends Error {}

/** Reject the value being read; `total` turns it into null. */
export function invalid(): never {
  throw new Invalid();
}

/** Run a reader that may reject its input: null when it does, whatever it is. */
export function total<T>(read: () => T): T | null {
  try {
    return read();
  } catch {
    return null;
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The cookie value for a carrier's fields: empty fields are left out, the rest URL-encoded JSON. */
export function encodeCarrier(fields: Record<string, unknown>): string {
  const kept = Object.entries(fields).filter(([, value]) => value !== null && value !== undefined);
  return encodeURIComponent(JSON.stringify(Object.fromEntries(kept)));
}

/** The JSON object a cookie value holds, or null for anything else or anything oversized. */
export function decodeCarrier(raw: string | null | undefined): Record<string, unknown> | null {
  if (!raw || !raw.trim() || raw.length > MAX_COOKIE_BYTES) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** The cookie to set for a serialized carrier, or null when it is too big to be one. */
export function carrierCookie(name: string, serialized: string): CookieAttributes | null {
  if (serialized.length > MAX_COOKIE_BYTES) return null;
  return buildCookie(name, serialized, CARRIER_MAX_AGE_SECONDS);
}

/** A cookie's raw value in a `Cookie:` header, matched on the whole name. */
export function cookieValue(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const entry = part.trim();
    if (entry.startsWith(`${name}=`)) return entry.slice(name.length + 1);
  }
  return null;
}

/* -- Field readers. Each rejects the whole carrier on a value it will not accept. -- */

/** The carrier's version: only the current one is read. */
export function readVersion(r: Record<string, unknown>): void {
  if (r.v !== CARRIER_VERSION) invalid();
}

/** A string within `max`, or null when absent. An empty string is absent. */
export function optionalText(r: Record<string, unknown>, key: string, max: number): string | null {
  const value = r[key];
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > max) return invalid();
  return value;
}

/** A non-empty string within `max`. */
export function requiredText(r: Record<string, unknown>, key: string, max: number): string {
  return optionalText(r, key, max) ?? invalid();
}

/** An integer in `[min, max]`. Booleans, fractions and strings are rejected. */
export function integer(r: Record<string, unknown>, key: string, min: number, max: number): number {
  const value = r[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return invalid();
  }
  return value;
}

/** An integer in `[min, max]`, or null when absent. */
export function optionalInteger(
  r: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
): number | null {
  return r[key] === undefined || r[key] === null ? null : integer(r, key, min, max);
}

/** A Unix-seconds timestamp: an integer from the epoch to the year 2100. */
export function epoch(r: Record<string, unknown>, key: string): number {
  return integer(r, key, 0, MAX_EPOCH_SECONDS);
}

/** A string that is one of `allowed`. */
export function oneOf<T extends string>(
  r: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T {
  const value = r[key];
  return allowed.find((candidate) => candidate === value) ?? invalid();
}
