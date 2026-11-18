import type { ConsentRecord, PriorConsent } from "../consent";
import { isTrackablePath } from "../consent-routes";
import { consentMaxAgeSeconds, recordRow, resolveWithPolicy, standingChoice } from "../privacy/policy";
import { POLICY_MATRIX, type PolicyMatrix, type PolicyRow } from "../privacy/policy-matrix";
import { isEnrollmentPath } from "./hygiene";

/**
 * How PostHog treats a visitor right now.
 *
 * `remember` is what Google Analytics is allowed: a stored current-version grant of audience measurement where the
 * visitor must opt in, and anything short of a refusal or a Global Privacy Control signal in the United States.
 * It does not depend on the page: the sign-up flow runs on a private page and still needs the visitor's id.
 *
 * A visitor with Global Privacy Control, where the row lets the signal override a choice, is never remembered,
 * whatever the matrix lets Google Analytics do for them.
 *
 * `record` (session recordings and heatmaps) is narrower: the visitor's own stored yes, never the United States
 * default, and only on a page where a tag may run. A United States visitor's stored grant can only have come from
 * the privacy dialog, because that row shows no banner or notice.
 */

export interface PostHogMode {
  remember: boolean;
  record: boolean;
}

/** Whether recordings and heatmaps may run on this browser path: a page where a tag may run, and never an enrollment page. */
function isRecordablePath(pathname: string): boolean {
  return isTrackablePath(pathname) && !isEnrollmentPath(pathname);
}

export function posthogMode(input: {
  row: PolicyRow;
  /** The choice stored under the current consent version. */
  record: ConsentRecord | null;
  /** A choice stored under another version: its refusals stand, its grants do not. */
  prior: PriorConsent | null;
  gpc: boolean;
  /** The browser's path, language prefix included. */
  pathname: string;
  matrix?: PolicyMatrix;
}): PostHogMode {
  const { row, record, prior, gpc, pathname, matrix = POLICY_MATRIX } = input;
  const signalOverrides = gpc && row.gpc_overrides_choice;
  const remember = !signalOverrides && resolveWithPolicy({ row, record, prior, gpc }, matrix).analytics;
  const saidYes = remember && record !== null && standingChoice(record, "analytics", row) === true;

  return { remember, record: saidYes && isRecordablePath(pathname) };
}

const DAY_SECONDS = 60 * 60 * 24;
const HOUR_SECONDS = 60 * 60;

/**
 * The days PostHog's cookie may live for a remembered visitor: until the stored grant that lets PostHog remember them
 * expires, and never past the row's grant lifetime. A visitor remembered by default (no stored grant) gets the full
 * lifetime. Fractional, so the cookie ends with the grant rather than up to a day after it.
 */
export function postHogCookieDays(input: { row: PolicyRow; record: ConsentRecord | null; nowSeconds?: number }): number {
  const { row, record, nowSeconds = Date.now() / 1000 } = input;
  const grantSeconds = row.grant_ttl_days * DAY_SECONDS;
  if (record === null || standingChoice(record, "analytics", row) !== true) return row.grant_ttl_days;

  const grantEnds = record.at + Math.min(consentMaxAgeSeconds(recordRow(record), record), grantSeconds);
  return Math.min(Math.max(grantEnds - nowSeconds, HOUR_SECONDS), grantSeconds) / DAY_SECONDS;
}
