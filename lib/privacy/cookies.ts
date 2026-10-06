/**
 * Cookie attributes and the request that asks the server to set them.
 *
 * Every cookie we own is written twice: synchronously through
 * `document.cookie`, so the choice is never lost, and through a first-party
 * response from the privacy route, which browsers do not cap the way they cap a
 * script-written cookie. Both use the same attributes so the second replaces
 * the first rather than sitting beside it.
 */

export const PRIVACY_COOKIES_PATH = "/api/privacy/cookies";

export interface CookieAttributes {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  sameSite: "lax";
  secure: boolean;
  domain?: string;
}

/**
 * A cookie with the site's shared scope: the configured parent domain (so the
 * dashboard can read it), Secure in production only (it would be unwritable on
 * plain-http localhost).
 */
export function buildCookie(name: string, value: string, maxAge: number): CookieAttributes {
  return {
    name,
    value,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
  };
}

/** The `Set-Cookie` value, which is also a valid `document.cookie` assignment. */
export function serializeSetCookie(attrs: CookieAttributes): string {
  let cookie = `${attrs.name}=${attrs.value}; Max-Age=${attrs.maxAge}; Path=${attrs.path}; SameSite=Lax`;
  if (attrs.domain) cookie += `; Domain=${attrs.domain}`;
  if (attrs.secure) cookie += "; Secure";
  return cookie;
}

/** The body the privacy route accepts. Every field is optional. */
export interface PrivacyCookiesBody {
  consent?: Record<string, unknown>;
  sid?: "ensure";
  carriers?: Record<string, unknown>;
  clear?: string[];
}

/**
 * Ask the server to set (or refresh, or clear) cookies. Fire and forget: a
 * failed request costs nothing, because the `document.cookie` write it mirrors
 * has already happened.
 */
export function syncPrivacyCookies(body: PrivacyCookiesBody): void {
  if (typeof window === "undefined" || typeof fetch !== "function") return;
  try {
    void fetch(PRIVACY_COOKIES_PATH, {
      method: "POST",
      keepalive: true,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {
    // Blocked by an extension, offline, or a shimmed fetch: nothing to undo.
  }
}
