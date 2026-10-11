# Security Report: STA-419
REVIEWED: 2026-10-10 (security-reviewer, fresh context; diff + current worktree)
VERDICT: FINDINGS, all LOW and pre-existing; none introduced by this diff

| # | Finding | Resolution |
|---|---|---|
| 1 | LOW (pre-existing; the fix stops new ones): the old reset client saved every verified recovery session, refresh token included, to the showcase's localStorage under `sb-<ref>-auth-token`. On prod today a later visit to the old page reloads it, and an existing entry is a working refresh token on a shared PC until the owner signs out or resets again. | Shipping STA-419 closes the reload path (the new client never reads localStorage). Cleaning up entries already written: follow-up STA-420. |
| 2 | LOW (pre-existing): showcase PostHog records `/reset-password?token_hash=…`; the page never strips the token from the URL. | Follow-up STA-418 (now also: remove `token_hash` from the URL once read). |
| 3 | LOW (pre-existing): a reset link for the attacker's own account signs the victim into it, because the form never shows whose password is being set. | Follow-up STA-421: show the verified account's email on the form. |
| - | Not security: catching the thrown `updateUser` hid a repeat of the lock abort from Sentry. | FIXED: `saveNewPassword` reports a thrown failure (the error only; a test checks the password never appears in the report). |
| - | Not security: RP-01 expected no "Multiple GoTrueClient instances" warning, but dev Strict Mode builds the client twice. | FIXED in `docs/qa/reset-password.md`. |
| - | Optional hardening: `signOut({ scope: "local" })` after the save to end the recovery session server-side. | Not done: the success path does a full page load, which drops the in-memory session; the refresh token is never stored. |

Checked and sound (from the review): `persistSession: false` keeps the recovery session in memory with no Web Lock and no cross-tab broadcast (removing the old cross-talk where recovery events reached the AuthProvider listener); never refreshed; no server-side session; `detectSessionInUrl: false` no longer accepts an `#access_token` fragment; type fixed to `recovery`; fixed redirect target; every error goes through `translateError`; `.catch` / `.finally` on verify; single-use token, StrictMode guard, disabled submit; no IDs from the browser; test secrets are dummies.
