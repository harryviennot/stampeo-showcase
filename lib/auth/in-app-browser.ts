/**
 * Meta's in-app browsers (Instagram, Facebook, Messenger, Threads) hold none of
 * the phone's Google or Apple logins. Detecting them and building the link that
 * asks the phone's own browser to open a page are both pure.
 */

export type InAppBrowser = "instagram" | "facebook" | "messenger" | "threads";

/**
 * Checked in order: a Messenger user agent also carries the `FBAN` marker
 * Facebook uses, so the more specific names come first.
 */
const IN_APP_MARKERS: ReadonlyArray<readonly [InAppBrowser, RegExp]> = [
  ["threads", /\bBarcelona\b/],
  ["messenger", /MessengerForiOS|\bOrca\b/],
  ["instagram", /\bInstagram\b/],
  ["facebook", /FBAN|FBAV|FB_IAB|FB4A/],
];

/** The Meta app whose browser sent this user agent, or null for any other browser. */
export function classifyInAppBrowser(ua: string): InAppBrowser | null {
  for (const [name, marker] of IN_APP_MARKERS) {
    if (marker.test(ua)) return name;
  }
  return null;
}

export type EscapePlatform = "ios" | "android";

/**
 * The link that asks the phone's own browser to open `path` on `origin`.
 * iOS takes `x-safari-https://`; Android takes an `intent://` with no package
 * (the default browser opens) and no fallback URL (it would reload this page).
 */
export function buildBrowserEscapeUrl(input: {
  platform: EscapePlatform;
  origin: string;
  path: string;
  params: URLSearchParams;
}): string {
  const { platform, origin, path, params } = input;
  const { protocol, host } = new URL(origin);
  const scheme = protocol.replace(/:$/, "");
  const query = params.toString();
  const hostAndPath = `${host}${path}${query ? `?${query}` : ""}`;

  if (platform === "ios") return `x-safari-${scheme}://${hostAndPath}`;

  return `intent://${hostAndPath}#Intent;scheme=${scheme};end`;
}

/** The forwarding page a real browser should open: it records the ad click, then moves on to sign-up. */
export function escapeAddress(locale: string, params: URLSearchParams): string {
  const query = params.toString();
  return `/${locale}/start${query ? `?${query}` : ""}`;
}
