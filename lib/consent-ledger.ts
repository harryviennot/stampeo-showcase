/**
 * Reporting a consent decision to the server-side ledger (STA-324).
 *
 * The cookie is what APPLIES a choice. This is what PROVES it: GDPR Art. 7(1)
 * makes demonstrating consent our burden, and a record that lives only on the
 * visitor's device — editable by them, overwritten by their next decision —
 * demonstrates nothing.
 *
 * Everything here is deliberately best-effort. By the time it runs the cookie
 * is written and the banner has closed, so the visitor's choice is already in
 * force. A failure costs one row of evidence and must cost nothing else: no
 * throw, no error surfaced, no retry. The banner is a compliance surface, and
 * a regression that blocks a click is far worse than a missing row.
 */

import { CONSENT_VERSION, type ConsentRecord, type ConsentRegime } from "./consent";

/** Which surface carried the decision. Mirrors the CHECK in migration 174. */
export type ConsentLedgerSurface = "banner" | "notice" | "preferences";

export interface ConsentLedgerPayload {
  subject_id: string | null;
  version: number;
  analytics: boolean;
  marketing: boolean;
  regime: ConsentRegime;
  surface: ConsentLedgerSurface;
  decided_at: number;
}

/**
 * Where the ledger lives, or null if this build has no API configured.
 *
 * Blank collapses to null rather than to a relative URL: a Docker build arg
 * set to `""` is the realistic typo, and `/public/consent` would then post the
 * visitor's consent record to the marketing site's own origin — a 404 at best,
 * and at worst a row that never exists while everything looks fine.
 */
export function consentLedgerEndpoint(): string | null {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/public/consent`;
}

/**
 * The exact body `validate_decision` expects.
 *
 * Built key by key against that allowlist rather than by spreading the record:
 * the backend drops a row whose fields are wrong and still answers 204, so a
 * drifted key here would be indistinguishable from success. `analytics` and
 * `marketing` are real booleans and not the cookie's 1/0, because the backend
 * checks the type directly — `isinstance(True, int)` is True in Python, which
 * is how an int-shaped bool slipped through once already.
 */
export function buildConsentPayload(input: {
  record: ConsentRecord;
  surface: ConsentLedgerSurface;
}): ConsentLedgerPayload {
  return {
    subject_id: input.record.subjectId ?? null,
    version: input.record.v ?? CONSENT_VERSION,
    analytics: input.record.analytics === true,
    marketing: input.record.marketing === true,
    regime: input.record.regime,
    surface: input.surface,
    // The visitor's own clock, as evidence. The server stamps `recorded_at`
    // itself and that is the one an audit would rely on.
    decided_at: input.record.at,
  };
}

/**
 * Report the decision. Returns nothing, tells nobody, and cannot fail loudly.
 *
 * `sendBeacon` rather than `fetch`, because revoking consent RELOADS the page
 * (a running gtag cannot be unloaded, so the honest move is to reload rather
 * than pretend the tag is gone). A `fetch` is cancelled by that navigation,
 * which would lose precisely the decision it matters most to be able to prove.
 * A beacon is handed to the browser and survives the unload.
 */
export function recordConsentDecision(input: {
  record: ConsentRecord;
  surface: ConsentLedgerSurface;
}): void {
  const endpoint = consentLedgerEndpoint();
  if (!endpoint) return;

  try {
    // A plain string, which `sendBeacon` sends as `text/plain;charset=UTF-8`.
    // That keeps it a CORS *simple* request, and the distinction matters: a
    // preflight cannot be sent during unload, so an `application/json` beacon
    // would be dropped by the browser in exactly the revoke-and-reload case
    // this exists for. The endpoint therefore reads the RAW body and parses
    // it itself -- a `dict` parameter would make FastAPI reject this as 422.
    navigator.sendBeacon?.(endpoint, JSON.stringify(buildConsentPayload(input)));
  } catch {
    // Blocked by an extension, no navigator, storage partitioned, offline.
    // All of them cost one row and none of them may reach the visitor.
  }
}
