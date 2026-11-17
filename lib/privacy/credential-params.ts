/**
 * Removes credential parameters (reset and sign-in tokens, OAuth codes) and
 * the email the sign-in page can be opened with from URLs before analytics or
 * error tracking sees them. PostHog's events lose two more things: the ad
 * platforms' click ids (their vendor is named instead) and the demo session
 * token in the wallet-select page's address. The scrubber works on the string,
 * so what is left of a URL is byte for byte what it was: the path, the other
 * parameters and their encoding.
 */

import { AD_CLICK_PARAMS, AD_CLICK_VENDORS, adClickVendor, adClickVendorOfName, type AdClickVendor } from "./ad-click-params";
import { dropEntries, isListed, scrubTextParams, type ParamNames } from "./url-params";

// Parameters that sign someone in on their own: the reset link and implicit-flow returns.
const SESSION_TOKEN_PARAMS: ParamNames = new Set(["token_hash", "access_token", "refresh_token"]);

const SCRUBBED_PARAMS: ParamNames = new Set([...SESSION_TOKEN_PARAMS, "token", "code", "email"]);

// What PostHog's events lose from every URL: the credentials and the ad click ids.
const POSTHOG_PARAMS: ParamNames = new Set([...SCRUBBED_PARAMS, ...AD_CLICK_PARAMS]);

// The token of a demo session: the wallet-select page's path, and the pass link its buttons lead to.
const DEMO_TOKEN_PATH = /(\/demo\/(?:wallet-select|pass)\/)[^/?#\s"]+/g;
const DEMO_TOKEN_PLACEHOLDER = ":token";

// Deeper than any PostHog or Sentry payload nests a URL; it bounds the walk on a self-referencing object.
const MAX_DEPTH = 12;

export function scrubCredentialParams(text: string): string {
  return scrubTextParams(text, SCRUBBED_PARAMS);
}

/** Whether `url` carries a parameter that signs someone in on its own (the reset link's `token_hash`). */
export function carriesSessionToken(url: string): boolean {
  return scrubTextParams(url, SESSION_TOKEN_PARAMS) !== url;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** A copy of `value` with every string in it, keys included, run through `scrub`, and the entries whose key `dropKey` accepts left out; dates and other objects are kept as they are. */
function scrubValue(
  value: unknown,
  scrub: (text: string) => string,
  dropKey: (key: string) => boolean = () => false,
  depth = 0
): unknown {
  if (typeof value === "string") return scrub(value);
  if (depth >= MAX_DEPTH) return value;
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, scrub, dropKey, depth + 1));
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !dropKey(key))
        .map(([key, item]) => [scrub(key), scrubValue(item, scrub, dropKey, depth + 1)])
    );
  }
  return value;
}

/**
 * A PostHog event with credentials and ad click ids removed from every URL it
 * carries (`$current_url`, `$referrer`, `$initial_current_url`, the element
 * chain, heatmap keys, and the same under `$set` / `$set_once`), the click ids
 * PostHog copies into properties of their own (`gclid`, `$initial_fbclid`)
 * dropped, and the demo session token replaced by a placeholder. When a click
 * id was there, `properties.ad_click_vendor` names its platform (the first of
 * Google, Meta, OpenAI and TikTok when several are). The event itself is
 * always kept.
 */
export function scrubPostHogEvent<T>(event: T): T {
  const vendors = new Set<AdClickVendor>();
  const scrub = (text: string) => {
    const vendor = adClickVendor(text);
    if (vendor) vendors.add(vendor);
    return scrubTextParams(text, POSTHOG_PARAMS).replace(DEMO_TOKEN_PATH, `$1${DEMO_TOKEN_PLACEHOLDER}`);
  };
  const dropKey = (key: string) => {
    const vendor = adClickVendorOfName(key);
    if (vendor) vendors.add(vendor);
    return vendor !== null;
  };
  const scrubbed = scrubValue(event, scrub, dropKey) as { properties?: unknown };
  const vendor = AD_CLICK_VENDORS.find((candidate) => vendors.has(candidate));

  if (vendor && isPlainObject(scrubbed) && isPlainObject(scrubbed.properties)) scrubbed.properties.ad_click_vendor = vendor;
  return scrubbed as T;
}

/** A Sentry query string is text (`a=1&b=2`), a map, or a list of pairs. */
function scrubQueryString(queryString: unknown): unknown {
  if (typeof queryString === "string") {
    const cleaned = dropEntries(queryString.startsWith("?") ? queryString.slice(1) : queryString, SCRUBBED_PARAMS);
    return cleaned ?? queryString;
  }
  if (Array.isArray(queryString)) {
    return queryString.filter(
      (pair) => !(Array.isArray(pair) && typeof pair[0] === "string" && isListed(pair[0], SCRUBBED_PARAMS))
    );
  }
  if (isPlainObject(queryString)) {
    return Object.fromEntries(Object.entries(queryString).filter(([name]) => !isListed(name, SCRUBBED_PARAMS)));
  }
  return queryString;
}

/**
 * A Sentry error event or transaction with credentials removed from every URL
 * in it (request, referrer header, breadcrumbs, transaction name, trace and
 * span data). The event itself is always kept.
 */
export function scrubSentryEvent<T extends object>(event: T): T {
  const scrubbed = scrubValue(event, scrubCredentialParams) as { request?: unknown };
  const request = scrubbed.request;
  if (isPlainObject(request) && "query_string" in request) {
    request.query_string = scrubQueryString(request.query_string);
  }
  return scrubbed as T;
}
