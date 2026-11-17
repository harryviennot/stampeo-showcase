import type { ConsentRecord, PriorConsent } from "../consent";
import { isTrackablePath } from "../consent-routes";
import { resolveWithPolicy, standingChoice } from "../privacy/policy";
import type { PolicyRow } from "../privacy/policy-matrix";
import { isEnrollmentPath } from "./hygiene";

/**
 * How PostHog treats a visitor right now.
 *
 * `remember` is what Google Analytics is allowed: a stored current-version grant of audience measurement where the
 * visitor must opt in, and anything short of a refusal or a Global Privacy Control signal in the United States.
 * It does not depend on the page: the sign-up flow runs on a private page and still needs the visitor's id.
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
}): PostHogMode {
  const { row, record, prior, gpc, pathname } = input;
  const remember = resolveWithPolicy({ row, record, prior, gpc }).analytics;
  const saidYes = remember && record !== null && standingChoice(record, "analytics", row) === true;

  return { remember, record: saidYes && isRecordablePath(pathname) };
}
