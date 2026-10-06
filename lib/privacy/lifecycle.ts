import { isTrackablePath } from "../consent-routes";
import {
  consentCookieObject,
  clearPresentCookiesFor,
  consentCookieValue,
  currentConsent,
  emitConsentChange,
  ensureSubjectId,
  parseStoredChoice,
  type ConsentCategory,
  type ConsentState,
  type StoredChoice,
} from "../consent";
import { syncPrivacyCookies, type PrivacyCookiesBody } from "./cookies";
import type { PolicyRow } from "./policy-matrix";
import { detectPolicyRow } from "./region";
import { readSid, writeSidCookie } from "./subject";

/**
 * What a page load does about the subject and the stored choice.
 *
 * Where a row starts tracking without a choice (the US) the subject is minted
 * first: written to the jar, handed to the server, and only then announced, so
 * `ready` turns true for the tag gates after it exists. A refusal in a sliding
 * row is re-issued by the server on each trackable load, and the subject is
 * refreshed the same way. Both happen at most once per document, and never on a
 * page where no tag may run. On every such page the cookies of any category the
 * resolved consent denies (refused, a grant the live row does not honour, or no
 * choice in an opt-in row) are cleared, so neither a carrier written by a
 * request a refusal outran nor a cookie set under an earlier row outlives it.
 */

export interface PageLoadPlan {
  mintSid: boolean;
  syncSid: boolean;
  syncConsent: boolean;
  /** The categories the resolved consent denies, whose cookies must not be in the jar. */
  clear: ConsentCategory[];
}

const NOTHING: PageLoadPlan = { mintSid: false, syncSid: false, syncConsent: false, clear: [] };

export function planPageLoad(input: {
  row: PolicyRow;
  sid: string | null;
  /** The stored choice of any version, if the cookie holds one. */
  stored: { analytics: StoredChoice; marketing: StoredChoice } | null;
  /** What the visitor is taken to allow now, after GPC, the live row and any older refusal. */
  consent: ConsentState;
  trackable: boolean;
  refreshedThisDocument: boolean;
}): PageLoadPlan {
  if (!input.trackable) return NOTHING;
  const mintSid = input.row.mint_subject_before_tags && input.sid === null;
  const due = !input.refreshedThisDocument;
  const refused =
    input.stored !== null && (input.stored.analytics === false || input.stored.marketing === false);
  return {
    mintSid,
    syncSid: mintSid || (due && input.sid !== null),
    syncConsent: due && input.row.refusal_sliding && refused,
    clear: (["analytics", "marketing"] as const).filter((category) => !input.consent[category]),
  };
}

export interface LifecycleSession {
  /** Has this document already refreshed its cookies? */
  refreshed: boolean;
}

const documentSession: LifecycleSession = { refreshed: false };

/** Run the plan for the page now showing. Browser only; safe to call repeatedly. */
export function runPageLifecycle(
  pathname: string,
  session: LifecycleSession = documentSession,
): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const stored = parseStoredChoice(consentCookieValue(document.cookie));
  const plan = planPageLoad({
    row: detectPolicyRow(),
    sid: readSid(),
    stored,
    consent: currentConsent(),
    trackable: isTrackablePath(pathname),
    refreshedThisDocument: session.refreshed,
  });
  // A carrier written by a request that was outrun by a refusal is removed here.
  clearPresentCookiesFor(plan.clear);
  if (!plan.mintSid && !plan.syncSid && !plan.syncConsent) return;

  if (plan.mintSid) writeSidCookie(ensureSubjectId());

  const body: PrivacyCookiesBody = {};
  if (plan.syncSid) body.sid = "ensure";
  if (plan.syncConsent && stored) body.consent = consentCookieObject(stored);
  syncPrivacyCookies(body);
  session.refreshed = true;

  if (plan.mintSid) emitConsentChange(currentConsent());
}
