import {
  consentSnapshotKey,
  detectGpc,
  readStoredConsent,
  resolveConsent,
  type ConsentRecord,
  type ConsentState,
  type PriorConsent,
} from "../consent";
import { subjectGateOpen } from "./policy";
import { POLICY_MATRIX, UNKNOWN_ROW_KEY, type PolicySurface } from "./policy-matrix";
import { detectPolicyRow } from "./region";
import { readSid } from "./subject";

export interface ConsentSnapshot extends ConsentState {
  /** The stored current-version choice, or null if there is none. */
  record: ConsentRecord | null;
  /** A choice stored under an older version, whose refusals still stand. */
  prior: PriorConsent | null;
  gpc: boolean;
  /**
   * False during the server render and the first paint, and, in a row that
   * starts tracking without a choice (the US), until the subject id exists.
   *
   * Nothing consent-shaped may be decided until this is true. The server
   * cannot know the visitor's region, so `regime` is a placeholder there;
   * rendering the banner on its strength would show a French banner to an
   * American and make the page's HTML depend on the visitor.
   */
  ready: boolean;
  /** The policy row key in force (`EEA_UK_CH`, `US`, `UNKNOWN`). */
  row: string;
  /** What that row shows the visitor: a blocking banner or a notice. */
  surface: PolicySurface;
}

/**
 * The server answer: denied, not ready, and the strict row.
 *
 * A single frozen object rather than a fresh one per call, because
 * `useSyncExternalStore` compares snapshots by identity and a new object every
 * render is an infinite loop.
 */
export const SERVER_SNAPSHOT: ConsentSnapshot = Object.freeze({
  analytics: false,
  marketing: false,
  record: null,
  prior: null,
  gpc: false,
  ready: false,
  row: UNKNOWN_ROW_KEY,
  surface: POLICY_MATRIX.rows[UNKNOWN_ROW_KEY].surface,
});

let cached: ConsentSnapshot = SERVER_SNAPSHOT;
let cachedKey = "";

/**
 * The client's snapshot, rebuilt only when `consentSnapshotKey` changes. The
 * key covers every field the snapshot exposes and is a pure function of the
 * cookie's parsed facts, so it holds still across renders until something
 * actually changes and cannot loop the store.
 */
export function readConsentSnapshot(): ConsentSnapshot {
  const { record, prior } = readStoredConsent();
  const row = detectPolicyRow();
  const gpc = detectGpc();
  const ready = subjectGateOpen(row, readSid());
  const key = consentSnapshotKey({ record, prior, gpc, row: row.key, ready });

  if (key !== cachedKey) {
    cachedKey = key;
    const state = resolveConsent({ record, prior, gpc, row });
    cached = { ...state, record, prior, gpc, ready, row: row.key, surface: row.surface };
  }
  return cached;
}
