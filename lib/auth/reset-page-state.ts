/**
 * What the reset page shows. It follows the outcome of checking the link, held
 * in state, never the address bar: the page removes the token from the URL as
 * soon as it has read it.
 */

export type VerifyFailureReason = "linkExpired" | "network" | "rateLimited";

/** The outcome of checking the reset link with Supabase. */
export type VerifyState =
  | { status: "pending" }
  | { status: "verified"; email?: string }
  | { status: "failed"; reason: VerifyFailureReason };

export type ResetPageView =
  | { view: "verifying" }
  | { view: "form"; email?: string }
  | { view: "no-session"; reason: VerifyFailureReason }
  | { view: "success" };

export function resetPageView(input: { hasToken: boolean; verify: VerifyState; saved: boolean }): ResetPageView {
  const { hasToken, verify, saved } = input;
  if (saved) return { view: "success" };
  if (!hasToken) return { view: "no-session", reason: "linkExpired" };
  switch (verify.status) {
    case "pending":
      return { view: "verifying" };
    case "verified":
      return verify.email ? { view: "form", email: verify.email } : { view: "form" };
    case "failed":
      return { view: "no-session", reason: verify.reason };
  }
}

/** The page's own address (path, query, fragment) without the reset link's `token_hash` and `type`. */
export function addressWithoutRecoveryParams(href: string): string {
  const url = new URL(href, "https://stampeo.invalid");
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  return url.pathname + url.search + url.hash;
}
