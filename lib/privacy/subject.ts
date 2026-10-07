import { buildCookie, serializeSetCookie, type CookieAttributes } from "./cookies";

/**
 * The compliance subject: a random v4 UUID in its own strictly necessary
 * cookie. It chains one person's consent decisions and, at sign-up, joins them
 * to the account. It is never derived from anything about the visitor.
 */

export const SID_COOKIE = "stampeo_sid";
export const SID_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

/**
 * A v4 UUID (lowercased), or null. Never anything else: the id is ours to
 * mint, so a value we did not write is something a visitor typed into their
 * own cookie jar. Trusting it would let a forger write rows under an id of
 * their choosing, or smuggle a non-UUID into a `uuid` column.
 */
export function validSubjectId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value.toLowerCase()
    : null;
}

/** The subject in a `Cookie:` header or `document.cookie`, matched on the whole name. */
export function readSidCookie(header: string | null | undefined): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const entry = part.trim();
    if (entry.startsWith(`${SID_COOKIE}=`)) {
      return validSubjectId(entry.slice(SID_COOKIE.length + 1));
    }
  }
  return null;
}

/** A fresh random id, never `Math.random`, which is not a source of identifiers. */
export function mintSubjectId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  // Older Safari has `getRandomValues` but not `randomUUID`: build a v4 by hand.
  const bytes = new Uint8Array(16);
  cryptoObj.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function sidCookieAttributes(sid: string): CookieAttributes {
  return buildCookie(SID_COOKIE, sid, SID_MAX_AGE_SECONDS);
}

/**
 * The subject written this page's lifetime, held in case the cookie write was
 * refused (private mode, blocked cookies). A fallback, never a cache: the
 * cookie is the source of truth whenever it is readable.
 */
let sessionSid: string | null = null;

/** The subject this visitor has, or null. */
export function readSid(): string | null {
  const stored = typeof document === "undefined" ? null : readSidCookie(document.cookie);
  return stored ?? sessionSid;
}

/** Write the subject synchronously, keeping it in memory if the jar refuses it. */
export function writeSidCookie(sid: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = serializeSetCookie(sidCookieAttributes(sid));
  } catch {
    // Blocked storage throws; the read-back below catches a silent drop too.
  }
  sessionSid = readSidCookie(document.cookie) === sid ? null : sid;
}
