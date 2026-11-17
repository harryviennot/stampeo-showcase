/**
 * The string work behind every URL scrubber of the site: removing a set of
 * named parameters from a URL's query and fragment, or from the URLs inside a
 * piece of text. It works on the string, so what is left of a URL is byte for
 * byte what it was: the path, the other parameters and their encoding.
 */

export type ParamNames = ReadonlySet<string>;

export function isListed(rawName: string, names: ParamNames): boolean {
  let name = rawName;
  try {
    name = decodeURIComponent(rawName);
  } catch {
    // A malformed escape: compare the raw name.
  }
  return names.has(name.toLowerCase());
}

/** `a=1&b=2` without the listed entries, or null when it held none. */
export function dropEntries(params: string, names: ParamNames): string | null {
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

/** One URL without the listed parameters; what is left of it is byte for byte what it was. */
export function scrubUrlParams(url: string, names: ParamNames): string {
  return scrubUrl(url, names);
}

/**
 * `text` without the listed parameters, whether it is a URL or text with URLs
 * in it: a message (`GET /reset-password?token_hash=…`) or PostHog's element
 * chain (`a:attr__href="/login?email=…"nth-child="2"`). A URL ends at
 * whitespace or a double quote; everything around it comes back as it was.
 */
export function scrubTextParams(text: string, names: ParamNames): string {
  return text.replace(/[^\s"]+/g, (word) => scrubUrl(word, names));
}
