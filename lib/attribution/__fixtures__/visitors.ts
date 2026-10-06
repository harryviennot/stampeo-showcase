/**
 * Real visitors for the attribution tests: a region, what they chose, and the
 * landing they arrived on, resolved by the real consent resolver rather than
 * typed in by hand.
 */

import {
  CONSENT_VERSION,
  resolveConsent,
  type ConsentRecord,
  type PriorConsent,
} from "../../consent";
import { rowFor } from "../../privacy/policy";
import type { PolicyRow } from "../../privacy/policy-matrix";
import {
  planCapture,
  type CaptureInput,
  type LiveIds,
  type StoredCarriers,
} from "../capture";
import { consentEvidence } from "../evidence";
import { landingFromUrl } from "../landing";

export const LANDED = 1_791_244_800;
export const FBP = "fb.1.1791244790123.1122334455";
export const GA_CID = "1234567890.1700000000";
export const META_URL =
  "https://stampeo.app/us?fbclid=IwAR_TEST_fbclid_0001&utm_source=meta&utm_medium=paid_social&utm_campaign=us-cr-broad&utm_content=ugc-cafe-15s&utm_term=us-broad";

export const landing = (url: string, referrer = "https://l.facebook.com/") =>
  landingFromUrl(url, { referrer, variant: null, landedAt: LANDED });

export const META_LANDING = landing(META_URL);
export const ORGANIC_LANDING = landing("https://stampeo.app/pricing", "https://www.google.com/");

export const LIVE_ALL: LiveIds = {
  gaClientId: GA_CID,
  gaSession: { sid: "1791244795", sn: 1 },
  fbp: FBP,
};
export const NOTHING_STORED: StoredCarriers = { src: null, ga: null, ad: null };

/** A carrier as it goes over the wire: the cookie's JSON, which leaves empty fields out. */
export const wireOf = (carrier: object | null): unknown =>
  carrier && JSON.parse(JSON.stringify(carrier, (_key, value) => (value === null ? undefined : value)));

/** The names in a `Cookie:` header. */
export const namesIn = (jar: string) => new Set(jar.split(";").map((entry) => entry.trim().split("=")[0]));

export const US = rowFor("US");
export const EU = rowFor("FR");
export const UNKNOWN = rowFor(null);

/** A visitor's state, resolved the way the page resolves it. */
export function visitor(
  row: PolicyRow,
  options: { record?: ConsentRecord | null; prior?: PriorConsent | null; gpc?: boolean } = {},
) {
  const { record = null, prior = null, gpc = false } = options;
  return {
    consent: resolveConsent({ record, prior, regime: row.regime, gpc, row }),
    evidence: consentEvidence({ record, prior, regime: row.regime, row: row.key })!,
  };
}

export const chose = (analytics: boolean, marketing: boolean, regime: "opt-in" | "opt-out", at = 1_791_240_000): ConsentRecord => ({
  v: CONSENT_VERSION,
  analytics,
  marketing,
  at,
  regime,
});

export function plan(
  state: ReturnType<typeof visitor>,
  over: Partial<Omit<CaptureInput, "consent" | "evidence">> = {},
) {
  return planCapture({
    landing: META_LANDING,
    live: LIVE_ALL,
    stored: NOTHING_STORED,
    now: LANDED + 5,
    ...state,
    ...over,
  });
}

