import {
  CONSENT_VERSION,
  type ConsentRecord,
  type ConsentRegime,
  type PriorConsent,
} from "../consent";
import { recordRow, rowByKey } from "../privacy/policy";
import { POLICY_MATRIX, UNKNOWN_ROW_KEY } from "../privacy/policy-matrix";
import { epoch, integer, invalid, oneOf } from "./codec";

/**
 * The consent evidence every carrier carries, so the backend can prove the
 * basis a value was captured on without a lookup it cannot make from another
 * domain:
 *
 *   cv  the consent version the choice (or the notice) was made against
 *   cr  the regime in force, `opt-in` or `opt-out`
 *   ca  when the visitor chose, in Unix seconds; 0 when nobody clicked
 *   p   the policy matrix version
 *   g   the policy row key (`EEA_UK_CH`, `US`, `UNKNOWN`)
 */
export interface ConsentEvidence {
  cv: number;
  cr: ConsentRegime;
  ca: number;
  p: number;
  g: string;
}

/**
 * When a current record's visitor clicked, or 0 when nothing in it was a click
 * in the row it was made under: a restore, a category left undecided, or a US
 * record that grants everything, which is the notice dismissed.
 */
function clickedAt(record: ConsentRecord): number {
  const noClick =
    leavesNoClick(record) ||
    (recordRow(record).regime === "opt-out" && record.analytics && record.marketing);
  return noClick ? 0 : record.at;
}

/** A restore, or a category left undecided: neither is a click, in any version. */
function leavesNoClick(choice: {
  analytics: boolean | null;
  marketing: boolean | null;
  origin?: "restore";
}): boolean {
  return choice.origin === "restore" || choice.analytics === null || choice.marketing === null;
}

/**
 * The version and moment a capture rests on, or null to capture nothing.
 *
 * A current choice is its own evidence. Without one, an older-version choice
 * that refused something is what the visitor's state rests on (its refusals
 * still stand), so the capture carries that version and moment; such a choice
 * with no moment evidences nothing, and nothing is captured. Otherwise (the US
 * opt-out default, an older grant being no choice at all, or an older record
 * that was restored or left a category open) the notice text in force
 * (`CONSENT_VERSION`) and no consent moment (`0`), because nobody clicked.
 */
export function captureConsentEvidence(
  record: ConsentRecord | null,
  prior: PriorConsent | null,
): { consentVersion: number; consentAt: number } | null {
  if (record && record.v === CONSENT_VERSION) {
    return { consentVersion: record.v, consentAt: clickedAt(record) };
  }
  if (prior && (prior.analytics === false || prior.marketing === false) && !leavesNoClick(prior)) {
    return Number.isFinite(prior.at) && prior.at > 0
      ? { consentVersion: prior.v, consentAt: prior.at }
      : null;
  }
  return { consentVersion: CONSENT_VERSION, consentAt: 0 };
}

/**
 * The evidence for a capture under the visitor's current state: their choice,
 * the regime and policy row it was made under (the live row when there is no
 * current record), and the matrix version. Null when the choice evidences
 * nothing (see `captureConsentEvidence`).
 */
export function consentEvidence(input: {
  record: ConsentRecord | null;
  prior: PriorConsent | null;
  /** The key of the live policy row. */
  row: string;
}): ConsentEvidence | null {
  const base = captureConsentEvidence(input.record, input.prior);
  if (base === null) return null;
  const live = rowByKey(input.row) ?? POLICY_MATRIX.rows[UNKNOWN_ROW_KEY];
  const row = input.record && input.record.v === CONSENT_VERSION ? recordRow(input.record) : live;
  return {
    cv: base.consentVersion,
    cr: row.regime,
    ca: base.consentAt,
    p: POLICY_MATRIX.version,
    g: row.key,
  };
}

/** The evidence fields of a carrier, in the order they are written. */
export function evidenceFields(evidence: ConsentEvidence): Record<string, unknown> {
  return { cv: evidence.cv, cr: evidence.cr, ca: evidence.ca, p: evidence.p, g: evidence.g };
}

/** The evidence of a stored carrier. Rejects (see `total`) on any field it does not recognise. */
export function readEvidence(r: Record<string, unknown>): ConsentEvidence {
  return {
    cv: integer(r, "cv", 1, 1000),
    cr: oneOf(r, "cr", ["opt-in", "opt-out"] as const),
    ca: epoch(r, "ca"),
    p: integer(r, "p", 1, 1000),
    g: rowByKey(r.g)?.key ?? invalid(),
  };
}
