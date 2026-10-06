import { currentConsent } from "../consent";
import { measurementIdFromEnv } from "../google-analytics";
import { detectPolicyRow } from "../privacy/region";
import { buildSignupBody, signupBasis } from "./signup-body";

/**
 * Tell the backend a new account was just confirmed in the owner sign-up flow.
 *
 * Called after EVERY successful authentication there: an email code that
 * verified, or a Google or Apple return with a session. Existing users take the
 * same path and send it too, because the backend, not this page, decides
 * whether it acts (an account under a day old, once per user, never an
 * invitee).
 *
 * The wizard is about to leave for the dashboard, so the returned promise
 * resolves once the `keepalive` request has been handed to the browser (not
 * when it is answered), and after `dispatchTimeoutMs` at the latest. It never
 * rejects: a failure of any kind is swallowed, because losing this call costs
 * one conversion report (the business step recovers it), while blocking the
 * flow costs a signup. It goes to our own API from a private route, where no
 * tag runs.
 */

/** The longest the wizard waits for the request to be handed to the browser. */
export const DISPATCH_TIMEOUT_MS = 1_500;

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
  /** Defaults to `DISPATCH_TIMEOUT_MS`. */
  dispatchTimeoutMs?: number;
}

/** Builds and sends the request; `dispatched` is called as soon as `fetch` has been invoked. */
async function send(options: SignupCallOptions, dispatched: () => void): Promise<void> {
  const apiUrl = options.apiUrl ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || typeof document === "undefined") return;

  const token = await options.getAccessToken();
  if (!token) return;

  const body = buildSignupBody({
    cookieHeader: document.cookie,
    consent: currentConsent(),
    measurementId:
      options.measurementId === undefined ? measurementIdFromEnv() : options.measurementId,
    basis: signupBasis(detectPolicyRow()),
  });
  const request = fetch(`${apiUrl}/account/signup-recorded`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  dispatched();
  await request;
}

export function recordAccountSignup(options: SignupCallOptions): Promise<void> {
  const guard = options.guard ?? PAGE_GUARD;
  if (guard.sent) return Promise.resolve();
  guard.sent = true;

  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, options.dispatchTimeoutMs ?? DISPATCH_TIMEOUT_MS);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    send(options, done).catch(() => {}).finally(done);
  });
}
