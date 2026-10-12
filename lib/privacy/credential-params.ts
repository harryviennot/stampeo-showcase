/**
 * Removes credential parameters (reset and sign-in tokens, OAuth codes) and
 * the email the sign-in page can be opened with from URLs before analytics or
 * error tracking sees them. The scrubber works on the string, so what is left
 * of a URL is byte for byte what it was: the path, the other parameters and
 * their encoding.
 */

type ParamNames = ReadonlySet<string>;

// Parameters that sign someone in on their own: the reset link and implicit-flow returns.
const SESSION_TOKEN_PARAMS: ParamNames = new Set(["token_hash", "access_token", "refresh_token"]);

const SCRUBBED_PARAMS: ParamNames = new Set([...SESSION_TOKEN_PARAMS, "token", "code", "email"]);

// Deeper than any PostHog or Sentry payload nests a URL; it bounds the walk on a self-referencing object.
const MAX_DEPTH = 12;

function isListed(rawName: string, names: ParamNames): boolean {
  let name = rawName;
  try {
    name = decodeURIComponent(rawName);
  } catch {
    // A malformed escape: compare the raw name.
  }
  return names.has(name.toLowerCase());
}

/** `a=1&b=2` without the listed entries, or null when it held none. */
function dropEntries(params: string, names: ParamNames): string | null {
  const kept: string[] = [];
  let dropped = false;
  for (const entry of params.split("&")) {
    if (isListed(entry.split("=")[0], names)) dropped = true;
    else kept.push(entry);
  }
  return dropped ? kept.join("&") : null;
}

/** A fragment carries parameters either directly (`#a=1`) or after a route (`#/auth?a=1`). */
function scrubFragment(fragment: string, names: ParamNames): string | null {
  const queryAt = fragment.indexOf("?");
  if (queryAt !== -1) {
    const cleaned = dropEntries(fragment.slice(queryAt + 1), names);
    if (cleaned === null) return null;
    return cleaned ? `${fragment.slice(0, queryAt)}?${cleaned}` : fragment.slice(0, queryAt);
  }
  return fragment.includes("=") ? dropEntries(fragment, names) : null;
}

/** One URL without the listed parameters in its query or fragment; a word with no `?` or `#` comes back as it was. */
function scrubUrl(url: string, names: ParamNames): string {
  const hashAt = url.indexOf("#");
  const beforeHash = hashAt === -1 ? url : url.slice(0, hashAt);
  const fragment = hashAt === -1 ? null : url.slice(hashAt + 1);
  const queryAt = beforeHash.indexOf("?");
  const path = queryAt === -1 ? beforeHash : beforeHash.slice(0, queryAt);
  const query = queryAt === -1 ? null : beforeHash.slice(queryAt + 1);

  const cleanQuery = query === null ? null : dropEntries(query, names);
  const cleanFragment = fragment === null ? null : scrubFragment(fragment, names);
  if (cleanQuery === null && cleanFragment === null) return url;

  const nextQuery = cleanQuery ?? query;
  const nextFragment = cleanFragment ?? fragment;
  return path + (nextQuery ? `?${nextQuery}` : "") + (nextFragment ? `#${nextFragment}` : "");
}

/**
 * `text` without the listed parameters, whether it is a URL or text with URLs
 * in it: a message (`GET /reset-password?token_hash=…`) or PostHog's element
 * chain (`a:attr__href="/login?email=…"nth-child="2"`). A URL ends at
 * whitespace or a double quote; everything around it comes back as it was.
 */
function scrubText(text: string, names: ParamNames): string {
  return text.replace(/[^\s"]+/g, (word) => scrubUrl(word, names));
}

export function scrubCredentialParams(text: string): string {
  return scrubText(text, SCRUBBED_PARAMS);
}

/** Whether `url` carries a parameter that signs someone in on its own (the reset link's `token_hash`). */
export function carriesSessionToken(url: string): boolean {
  return scrubText(url, SESSION_TOKEN_PARAMS) !== url;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** A copy of `value` with every string in it, keys included, scrubbed; dates and other objects are kept as they are. */
function scrubValue(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return scrubCredentialParams(value);
  if (depth >= MAX_DEPTH) return value;
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, depth + 1));
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [scrubCredentialParams(key), scrubValue(item, depth + 1)])
    );
  }
  return value;
}

/**
 * A PostHog event with credentials removed from every URL it carries
 * (`$current_url`, `$referrer`, `$initial_current_url`, the element chain,
 * heatmap keys, and the same under `$set` / `$set_once`). The event itself is
 * always kept.
 */
export function scrubPostHogEvent<T>(event: T): T {
  return scrubValue(event) as T;
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
  const scrubbed = scrubValue(event) as { request?: unknown };
  const request = scrubbed.request;
  if (isPlainObject(request) && "query_string" in request) {
    request.query_string = scrubQueryString(request.query_string);
  }
  return scrubbed as T;
}
