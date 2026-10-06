import { MAX_FIELD, MAX_ID_FIELD } from "./codec";

/**
 * Everything about an arrival that must be read from the LANDING page and
 * nowhere else: the click ids and UTM tags in the query, the path, the
 * referrer, the A/B variant published on `<body>`, and when it happened.
 */

export interface ClickIds {
  gclid: string | null;
  fbclid: string | null;
  ttclid: string | null;
}

export interface UtmFields {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}

/**
 * Empty string is not a value (`?gclid=` is what a broken ad template emits),
 * and no single value may exceed `max`.
 *
 * Truncating rather than rejecting is deliberate: a long campaign name is a
 * reason to shorten it, never a reason to lose the click that paid for the
 * visit.
 */
function param(search: URLSearchParams, name: string, max: number): string | null {
  const value = search.get(name);
  if (!value || value.trim() === "") return null;
  return value.slice(0, max);
}

/**
 * The platforms' click ids. They get the larger cap: a real `fbclid` runs past
 * 100 characters, and a truncated one is an identifier that still looks like
 * data and attributes to nothing.
 */
export function readClickIds(search: string): ClickIds {
  const params = new URLSearchParams(search);
  return {
    gclid: param(params, "gclid", MAX_ID_FIELD),
    fbclid: param(params, "fbclid", MAX_ID_FIELD),
    ttclid: param(params, "ttclid", MAX_ID_FIELD),
  };
}

export function readUtm(search: string): UtmFields {
  const params = new URLSearchParams(search);
  return {
    utmSource: param(params, "utm_source", MAX_FIELD),
    utmMedium: param(params, "utm_medium", MAX_FIELD),
    utmCampaign: param(params, "utm_campaign", MAX_FIELD),
    utmContent: param(params, "utm_content", MAX_FIELD),
    utmTerm: param(params, "utm_term", MAX_FIELD),
  };
}

/**
 * The host that sent this visitor, or null.
 *
 * Our own host is not a referrer: recording it would make every second page
 * look like a referral from ourselves and drown the real sources.
 */
export function referrerHost(
  referrer: string | null | undefined,
  selfHost: string,
): string | null {
  if (!referrer) return null;
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return null;
  }
  if (!host) return null;
  const self = selfHost.replace(/^www\./, "");
  if (host === self || host.endsWith(`.${self}`)) return null;
  return host;
}

export interface LandingContext {
  /** `location.search` as it was on landing: the click ids and UTMs. */
  search: string;
  /** The landing pathname. */
  path: string;
  /** `document.referrer`, which a client-side navigation would overwrite. */
  referrer: string;
  /** The landing A/B variant published on `<body>`, gone after navigation. */
  variant: string | null;
  /** `location.hostname`, for the self-referrer check. */
  selfHost: string;
  /** Unix seconds when the landing page loaded: when the click was first seen. */
  landedAt: number;
}

/** A landing context from a full URL and the parts only the page knows. */
export function landingFromUrl(
  url: string,
  extras: { referrer: string; variant: string | null; landedAt: number },
): LandingContext {
  const parsed = new URL(url);
  return {
    search: parsed.search,
    path: parsed.pathname,
    referrer: extras.referrer,
    variant: extras.variant,
    selfHost: parsed.hostname,
    landedAt: extras.landedAt,
  };
}

let landingContext: LandingContext | null = null;

/**
 * The landing context of this page load, read EXACTLY ONCE.
 *
 * The first call runs `read` and keeps the answer for the lifetime of the
 * document; every later call returns that snapshot and never invokes its
 * reader. Module state on purpose: it survives React remounts and strict
 * mode's double effects within one document, and resets on a hard navigation,
 * which is also when the browser's own `location` and `referrer` reset.
 *
 * Capture waits for the tags' cookies and consent can arrive pages later, and
 * by either point `location.search` and `document.referrer` describe the
 * current page, not the one the ad bought. The snapshot is memory-only:
 * nothing is stored anywhere until consent lets the capture say so.
 */
export function captureLandingContext(read: () => LandingContext): LandingContext {
  if (landingContext === null) landingContext = read();
  return landingContext;
}
