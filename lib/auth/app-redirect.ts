const DEFAULT_APP_URL = "https://app.stampeo.app";

const WEB_SCHEMES = new Set(["https:", "http:"]);

/**
 * `redirect` when it is a plain http(s) URL on the app's origin (scheme, host
 * and port), else null. Comparing the host alone lets `javascript://<app host>/…`
 * through, which runs script once assigned to `location.href`. The scheme is
 * pinned to http(s) because opaque URLs all share the origin "null" and a
 * `blob:` URL reports the origin of the URL inside it.
 */
export function sameOriginAppUrl(
  redirect: string | null | undefined,
  appUrl: string
): string | null {
  if (!redirect) return null;
  try {
    const target = new URL(redirect);
    const app = new URL(appUrl);
    const allowed =
      WEB_SCHEMES.has(app.protocol) &&
      target.protocol === app.protocol &&
      target.origin === app.origin &&
      !target.username &&
      !target.password;
    return allowed ? target.toString() : null;
  } catch {
    return null;
  }
}

/** Where the login page sends the browser after a successful sign-in. */
export function postLoginUrl(
  redirect: string | null | undefined,
  appUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL
): string {
  const fallback = appUrl || DEFAULT_APP_URL;
  return sameOriginAppUrl(redirect, fallback) ?? fallback;
}
