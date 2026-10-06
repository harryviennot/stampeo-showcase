import { currentConsent } from "../consent";
import { measurementIdFromEnv } from "../google-analytics";
import { buildSignupBody } from "./signup-body";

/**
 * Tell the backend a new account was just confirmed in the owner sign-up flow.
 *
 * Called after EVERY successful authentication there: an email code that
 * verified, or a Google or Apple return with a session. Existing users take the
 * same path and send it too, because the backend, not this page, decides
 * whether it acts (an account under a day old, once per user, never an
 * invitee).
 *
 * FIRE AND FORGET. The wizard is about to leave for the dashboard, so the
 * request is `keepalive` and nothing waits for it: a failure of any kind is
 * swallowed, because losing this call costs one conversion report (the business
 * step recovers it), while blocking the flow costs a signup. It goes to our own
 * API from a private route, where no tag runs, and that is as it should be.
 */

/** One call per page lifetime, however many times the flow reports success. */
export interface PageGuard {
  sent: boolean;
}

const PAGE_GUARD: PageGuard = { sent: false };

export interface SignupCallOptions {
  /** The new user's access token. May reject: the call is then not made. */
  getAccessToken: () => Promise<string | null | undefined>;
  /** Defaults to `NEXT_PUBLIC_API_URL`. */
  apiUrl?: string;
  /** Defaults to the configured GA measurement id. */
  measurementId?: string | null;
  guard?: PageGuard;
}

async function send(options: SignupCallOptions): Promise<void> {
  const apiUrl = options.apiUrl ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || typeof document === "undefined") return;

  const token = await options.getAccessToken();
  if (!token) return;

  const body = buildSignupBody({
    cookieHeader: document.cookie,
    consent: currentConsent(),
    measurementId:
      options.measurementId === undefined ? measurementIdFromEnv() : options.measurementId,
  });
  await fetch(`${apiUrl}/account/signup-recorded`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

export function recordAccountSignup(options: SignupCallOptions): void {
  const guard = options.guard ?? PAGE_GUARD;
  if (guard.sent) return;
  guard.sent = true;

  send(options).catch(() => {});
}
