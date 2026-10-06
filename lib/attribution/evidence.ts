import {
  CONSENT_VERSION,
  type ConsentRecord,
  type ConsentRegime,
  type PriorConsent,
} from "../consent";
import { rowByKey } from "../privacy/policy";
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
 * The version and moment a capture rests on, or null to capture nothing.
 *
 * A current choice is its own evidence. Without one, an older-version choice
 * that refused something is what the visitor's state rests on (its refusals
 * still stand), so the capture carries that version and moment; such a choice
 * with no moment evidences nothing, and nothing is captured. Otherwise the
 * visitor is under the US opt-out default, an older grant being no choice at
 * all: the notice text in force (`CONSENT_VERSION`) and no consent moment (`0`),
 * because nobody clicked.
 */
export function captureConsentEvidence(
  record: ConsentRecord | null,
  prior: PriorConsent | null,
): { consentVersion: number; consentAt: number } | null {
  if (record && record.v === CONSENT_VERSION) {
    return { consentVersion: record.v, consentAt: record.at };
  }
  if (prior && (!prior.analytics || !prior.marketing)) {
    return Number.isFinite(prior.at) && prior.at > 0
      ? { consentVersion: prior.v, consentAt: prior.at }
      : null;
  }
  return { consentVersion: CONSENT_VERSION, consentAt: 0 };
}

/**
 * The evidence for a capture under the visitor's current state: their choice,
 * the regime and policy row in force now, and the matrix version. Null when
 * the choice evidences nothing (see `captureConsentEvidence`).
 */
export function consentEvidence(input: {
  record: ConsentRecord | null;
  prior: PriorConsent | null;
  regime: ConsentRegime;
  row: string;
}): ConsentEvidence | null {
  const base = captureConsentEvidence(input.record, input.prior);
  if (base === null) return null;
  return {
    cv: base.consentVersion,
    cr: input.regime,
    ca: base.consentAt,
    p: POLICY_MATRIX.version,
    g: rowByKey(input.row)?.key ?? UNKNOWN_ROW_KEY,
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
