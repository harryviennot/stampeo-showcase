import type { ConsentState } from "../consent";
import { isTrackablePath } from "../consent-routes";
import { serializeSetCookie, syncPrivacyCookies } from "../privacy/cookies";
import {
  buildAdCarrier,
  paidClick,
  parseAdCookie,
  readFbp,
  serializeAdCarrier,
  type AdCarrier,
} from "./ad-ids";
import { carrierCookie, cookieValue, decodeCarrier } from "./codec";
import { AD_COOKIE, GA_COOKIE, SOURCE_COOKIE } from "./cookie-names";
import type { ConsentEvidence } from "./evidence";
import {
  buildGaCarrier,
  parseGaCookie,
  readGaClientId,
  readGaSession,
  serializeGaCarrier,
  type GaCarrier,
  type GaSession,
} from "./ga-ids";
import { readClickIds, type LandingContext } from "./landing";
import {
  buildSourceCarrier,
  parseSourceCookie,
  serializeSourceCarrier,
  type SourceCarrier,
} from "./source";

/**
 * What a visit writes down. Three carriers, each under its own category:
 *
 *   stampeo_src  campaign source        either category allowed
 *   stampeo_ga   GA client and session  analytics allowed
 *   stampeo_ad   the paid click         marketing allowed AND a click id
 *
 * THE LATEST PAID CLICK WINS, the way the ad platforms attribute: a click
 * replaces a stored one of another platform or another id, and the source is
 * replaced only together with it, or when there is none. An organic visit
 * replaces nothing, and the same click seen again (a reload, or the capture
 * re-running after a client-side navigation) is not a newer one. The GA
 * carrier is the exception: it follows the visitor's session, so it is
 * refreshed as the ids change.
 *
 * Every decision is a pure function here; `capturePass` is the thin browser
 * layer that reads the jar, applies them and writes the result.
 */

export interface StoredCarriers {
  src: SourceCarrier | null;
  ga: GaCarrier | null;
  ad: AdCarrier | null;
}

/** The carriers to write now; each null is one to leave as it is. */
export type CapturePlan = StoredCarriers;

/** The identifiers the tags have written into the jar so far. */
export interface LiveIds {
  gaClientId: string | null;
  gaSession: GaSession | null;
  fbp: string | null;
}

export const NO_LIVE_IDS: LiveIds = Object.freeze({
  gaClientId: null,
  gaSession: null,
  fbp: null,
});

const NOTHING: CapturePlan = Object.freeze({ src: null, ga: null, ad: null });

/** A GA carrier unchanged for this long is written again, so it keeps pace with the visitor. */
const GA_REFRESH_SECONDS = 24 * 60 * 60;

export interface CaptureInput {
  landing: LandingContext;
  /** What the visitor allows right now, from the real resolver. */
  consent: ConsentState;
  evidence: ConsentEvidence;
  live: LiveIds;
  stored: StoredCarriers;
  /** Unix seconds. */
  now: number;
}

const sameClick = (stored: AdCarrier, incoming: { vn: string; ci: string }) =>
  stored.vn === incoming.vn && stored.ci === incoming.ci;

/** A click of another platform, or another id, than the one stored. */
function isNewPaidClick(stored: AdCarrier | null, incoming: AdCarrier): boolean {
  return stored === null || !sameClick(stored, incoming);
}

/** The same click, whose browser id the pixel has written since it was stored. */
function withBrowserId(stored: AdCarrier | null, incoming: AdCarrier | null): AdCarrier | null {
  if (stored === null || incoming === null || !sameClick(stored, incoming)) return null;
  return stored.fbp === null && incoming.fbp !== null ? { ...stored, fbp: incoming.fbp } : null;
}

/** Does this carrier rest on the same consent as `evidence`? (The matrix version is not consent.) */
function sameConsent(carrier: ConsentEvidence, evidence: ConsentEvidence): boolean {
  return (
    carrier.cv === evidence.cv &&
    carrier.cr === evidence.cr &&
    carrier.ca === evidence.ca &&
    carrier.g === evidence.g
  );
}

/**
 * The carrier to write for one category: the one just built, else the stored
 * one when the category is still allowed, re-stamped with the evidence of the
 * choice in force so none keeps resting on an earlier one. Null when there is
 * nothing to write.
 */
function carry<T extends ConsentEvidence>(
  built: T | null,
  stored: T | null,
  allowed: boolean,
  evidence: ConsentEvidence,
): T | null {
  const base = built ?? (allowed ? stored : null);
  if (base === null) return null;
  if (sameConsent(base, evidence)) return built;
  return { ...base, ...evidence };
}

/** The GA carrier to write, or null while the stored one still says the same thing. */
function refreshedGa(stored: GaCarrier | null, incoming: GaCarrier): GaCarrier | null {
  if (stored === null) return incoming;
  const changed =
    stored.cid !== incoming.cid || stored.sid !== incoming.sid || stored.sn !== incoming.sn;
  return changed || incoming.at - stored.at >= GA_REFRESH_SECONDS ? incoming : null;
}

export function planCapture(input: CaptureInput): CapturePlan {
  const { landing, consent, evidence, live, stored, now } = input;
  if (!consent.analytics && !consent.marketing) return NOTHING;
  // Never for a landing on a business's enrollment page or a private route:
  // those visitors are our customers' customers, not ad prospects. Checked
  // against the landing, because the carriers describe where the visit began.
  if (!isTrackablePath(landing.path)) return NOTHING;

  // The click and Meta's browser id are advertising identifiers.
  const incomingAd = consent.marketing
    ? buildAdCarrier({ landing, fbp: live.fbp, evidence })
    : null;
  const newPaidClick = incomingAd !== null && isNewPaidClick(stored.ad, incomingAd);

  const ga =
    consent.analytics && live.gaClientId !== null
      ? refreshedGa(
          stored.ga,
          buildGaCarrier({
            cid: live.gaClientId,
            session: live.gaSession,
            evidence,
            capturedAt: now,
          }),
        )
      : null;

  return {
    src: carry(
      stored.src === null || newPaidClick ? buildSourceCarrier({ landing, evidence }) : null,
      stored.src,
      true,
      evidence,
    ),
    ga: carry(ga, stored.ga, consent.analytics, evidence),
    ad: carry(
      newPaidClick ? incomingAd : withBrowserId(stored.ad, incomingAd),
      stored.ad,
      consent.marketing,
      evidence,
    ),
  };
}

/**
 * Which tag cookies the capture would still wait for. The tags write them a
 * beat after they are injected, so a single read on mount would usually miss
 * them; the carriers that do not need them are written without waiting.
 */
export function awaitedIds(input: Omit<CaptureInput, "now">): { ga: boolean; fbp: boolean } {
  const { landing, consent, live, stored } = input;
  if (!isTrackablePath(landing.path)) return { ga: false, fbp: false };

  // Only a Meta click needs `_fbp`: a Google click that also carries an fbclid
  // is a Google click, and is not held up waiting for Meta.
  const click = consent.marketing ? paidClick(readClickIds(landing.search)) : null;
  const hasBrowserId =
    click !== null &&
    stored.ad !== null &&
    sameClick(stored.ad, { vn: click.vendor, ci: click.clickId }) &&
    stored.ad.fbp !== null;
  return {
    ga: consent.analytics && live.gaClientId === null,
    fbp: click?.vendor === "meta" && live.fbp === null && !hasBrowserId,
  };
}

/** The carriers a cookie jar holds. A forged or unreadable one is no carrier. */
export function readStoredCarriers(cookieHeader: string | null | undefined): StoredCarriers {
  return {
    src: parseSourceCookie(cookieValue(cookieHeader, SOURCE_COOKIE)),
    ga: parseGaCookie(cookieValue(cookieHeader, GA_COOKIE)),
    ad: parseAdCookie(cookieValue(cookieHeader, AD_COOKIE)),
  };
}

/** The identifiers the tags have written into a cookie jar. */
export function readLiveIds(
  cookieHeader: string | null | undefined,
  measurementId: string | null,
): LiveIds {
  return {
    gaClientId: readGaClientId(cookieHeader),
    gaSession: readGaSession(cookieHeader, measurementId),
    fbp: readFbp(cookieHeader),
  };
}

/**
 * Write the planned carriers: into the jar now, so nothing is lost, and by a
 * first-party request to the privacy route, which re-validates them and sets
 * them as a server response that browsers do not cap the way they cap a script
 * cookie. A cookie too big to be one is dropped: losing a source costs a
 * dashboard row, while a header-breaking cookie costs the dashboard itself.
 */
export function writeCapturePlan(plan: CapturePlan): void {
  if (typeof document === "undefined") return;
  const carriers: Record<string, unknown> = {};

  const put = <T extends object>(
    key: string,
    name: string,
    carrier: T | null,
    serialize: (carrier: T) => string,
  ) => {
    if (carrier === null) return;
    const value = serialize(carrier);
    const cookie = carrierCookie(name, value);
    if (cookie === null) return;
    try {
      document.cookie = serializeSetCookie(cookie);
    } catch {
      // Blocked storage. The route may still set it, and losing attribution is
      // not a reason to fail a pageview.
    }
    carriers[key] = decodeCarrier(value);
  };

  put("src", SOURCE_COOKIE, plan.src, serializeSourceCarrier);
  put("ga", GA_COOKIE, plan.ga, serializeGaCarrier);
  put("ad", AD_COOKIE, plan.ad, serializeAdCarrier);

  if (Object.keys(carriers).length > 0) syncPrivacyCookies({ carriers });
}

/**
 * One pass of the capture: read the jar, decide, write, and say what is still
 * awaited. The caller repeats it while something is awaited and the wait has
 * not run out, passing back what earlier passes planned as `remembered`, so a
 * jar that silently drops a write is not asked again on every poll.
 *
 * `measurementId` and `pixelId` say which tags this deployment runs: nothing is
 * awaited from a tag that will never write its cookie.
 */
export function capturePass(input: {
  landing: LandingContext;
  consent: ConsentState;
  evidence: ConsentEvidence;
  measurementId: string | null;
  /** Left out when unknown, which counts as configured. */
  pixelId?: string | null;
  now: number;
  remembered?: Partial<StoredCarriers>;
}): { plan: CapturePlan; awaited: { ga: boolean; fbp: boolean } } {
  const header = typeof document === "undefined" ? "" : document.cookie;
  const jar = readStoredCarriers(header);
  const stored: StoredCarriers = {
    src: jar.src ?? input.remembered?.src ?? null,
    ga: jar.ga ?? input.remembered?.ga ?? null,
    ad: jar.ad ?? input.remembered?.ad ?? null,
  };
  const live = readLiveIds(header, input.measurementId);
  const { landing, consent, evidence, now } = input;

  const plan = planCapture({ landing, consent, evidence, live, stored, now });
  writeCapturePlan(plan);

  const awaited = awaitedIds({
    landing,
    consent,
    evidence,
    live,
    stored: { src: plan.src ?? stored.src, ga: plan.ga ?? stored.ga, ad: plan.ad ?? stored.ad },
  });
  return {
    plan,
    awaited: {
      ga: awaited.ga && input.measurementId !== null,
      fbp: awaited.fbp && input.pixelId !== null,
    },
  };
}
