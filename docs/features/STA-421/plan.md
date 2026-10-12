# Plan: Reset page hardening batch (STA-418, STA-420, STA-421, STA-425)

ISSUE: STA-421 (https://linear.app/stampeo/issue/STA-421), with STA-418, STA-420 (fixes) and STA-425 in the same batch
BRANCH: `fix/sta-418-420-421-425-reset-hardening` (showcase only)
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-10-11, Harry: "yes yes and approved")

## Problem

Four follow-ups from the STA-419 / STA-416 reviews, all on the showcase's password-reset path:

- **STA-418 (fix):** the reset token (`?token_hash=…&type=recovery`) reaches PostHog in every page URL property (and likely Sentry browser traces), and the page never removes it from the address bar.
- **STA-420 (fix):** before STA-419, each verified reset left a working refresh token in localStorage on the showcase origin (`sb-<ref>-auth-token`). STA-419 stops new ones; existing ones stay usable from that browser.
- **STA-421 (feature):** the reset form never says which account it resets, so a reset link for someone else's account can be used to plant a victim inside the attacker's business.
- **STA-425 (feature):** when Supabase refuses the new password (`same_password`, `weak_password`), the page only says "update failed".

STA-417 (delete the Supabase-pasted templates) is deliberately NOT in this batch: Harry still has to paste those files into prod Supabase, and it is a backend change.

## Decisions

- One branch, one PR to `dev`, all showcase. (Harry, 2026-10-11)
- STA-418: strip `token_hash` / `type` from the address bar as soon as the page has read them, and scrub credential query parameters from every URL-valued property PostHog sends (`before_send`) and from Sentry browser events and transactions (`beforeSend` / `beforeSendTransaction`). One shared scrubber in `lib/privacy/`.
- Credential parameters scrubbed: `token_hash`, `token`, `code`, `access_token`, `refresh_token` (query and fragment), plus `email` (the onboarding forgot link opens `/login?email=…`, security review). `type=recovery` is not a secret but is dropped with `token_hash` from the address bar.
- STA-420: once per page load, if localStorage holds the default Supabase session key, sign that session out with scope `local` (revokes its refresh token server-side) and delete the key, whatever the sign-out result. The cleanup client uses a no-op lock and no auto-refresh, so it can never touch the app session's Web Lock (the STA-419 failure).
- STA-421: after the link is verified, the form names the account (`verifyOtp` already returns the user). If there is no email, nothing is shown.
- STA-425: map Supabase's error `code`: `same_password` and `weak_password` get their own message; anything else keeps today's generic one. Exact copy and whether `weak_password`'s reasons (`length`, `characters`, `pwned`) get separate lines: UX DESIGN pass + copywriting skill.

## UX decisions

From `ux-brief.md` (ux-designer, MODE: DESIGN, 2026-10-11).

- PLACEMENT: everything stays on `app/[locale]/reset-password/page.tsx`; both items are states of the one form that owns recovery.
- STA-421: the bare email under the `h1`, in the subtitle slot the login verify phase uses (`login/page.tsx:263-270`), the address itself in ink + medium weight. `wrap-anywhere` on the address only; **never truncated or masked** (a lookalike `ines@example.com.evil.io` is only visible at its end). Shown only when verify returned an email; appears with the form, so nothing shifts.
- STA-425: refusal lines **inline under the New password field, below the checklist**, not in the top red box (that box stays for link and connection failures). `role="alert"`, linked by `aria-describedby`, `aria-invalid` on the input, `text-red-600 dark:text-red-400` (AA at small size). One line for `same_password`; for `weak_password` one line per known reason in the order `length`, `characters`, `pwned` (unknown reasons ignored; none left → the generic weak line). Lines clear when New password changes, stay when only Confirm changes; the next submit replaces them.
- ADDED: "not your address" hint under the email (one muted `text-xs` line, text only: if this isn't your email, don't set a password here) - prevents a mistake (the email makes the person notice; this tells them what to do). AC9.
- ADDED: **no recovery session → no form.** The form shows only once `verifyOtp` succeeded; otherwise the title, the red box (`linkExpired` when there is no token, else the verify error) and one full-width pill to sign in - prevents a mistake (after STA-418 strips the URL, a reload, which iOS Safari does when switching to Mail, would show a form that can never save). Based on the verify result in state, not the URL. AC10.
- REJECTED: truncating/masking the email; a "request a link for your own account" button; email on the success state; the top red box for same/weak; red input border or icon; moving focus after a refusal; clearing both fields; disabling submit while unchanged; turning checklist items red; a "sign in instead" link on `same_password`; password-manager wiring (own issue).
- MOBILE: 390x844 card ~600px with a two-line refusal and the French title; the refusal clears on the first keystroke, so the keyboard never hides a live message. POLISH: give the page shell login's `px-3 sm:px-0` / `p-4 sm:p-8` (the card currently touches the screen edges).
- REUSES: login's title + email slot, the page's red box, the mismatch line's position, the success state's pill / NEW: none.

## Non-goals

- Matching the client checklist to the server password policy (dev/prod policy currently looser: only `same_password` fires today; the `weak_password` lines ship dormant).
- Making login's forgot-password phase reachable by URL.

- STA-417 (backend template deletion).
- Changing the reset email or the forgot-password form.
- A general PostHog privacy pass beyond credential URL parameters.
- Showing the email anywhere other than the reset form.

## Edge cases considered

- Reset link opened in a browser with PostHog blocked or consent refused: scrubbing is harmless.
- `replaceState` before `verifyOtp` resolves: the token is read into memory first; a reload after that needs a new email (already true since STA-419).
- localStorage unavailable (Safari private mode, blocked storage): the cleanup is skipped silently.
- The default key holds an expired or already-revoked session: sign-out errors; the key is deleted anyway.
- The default key never existed (new browsers, everyone after this ships): no client is created, no network call.
- `weak_password` without `reasons`: the generic weak-password line.
- Verified user with no email (should not happen for email resets): no line shown.

## Acceptance criteria

- AC1 (STA-418): Given `/reset-password?token_hash=X&type=recovery`, when the page has read the token, then the address bar shows `/reset-password` with no `token_hash` or `type`, and the link still verifies.
- AC2 (STA-418): Given a PostHog event whose `$current_url`, `$referrer`, `$initial_current_url` (incl. under `$set` / `$set_once`) or any other URL-valued property contains `token_hash`, `token`, `code`, `access_token` or `refresh_token` (query or fragment), when it is sent, then those parameters are removed and the rest of the URL is unchanged, and NOT the event dropped.
- AC3 (STA-418): Given a Sentry browser event or transaction whose `request.url` (or transaction name / breadcrumb URLs) carries those parameters, when it is sent, then they are removed.
- AC4 (STA-420): Given localStorage holds `sb-<ref>-auth-token`, when any showcase page loads, then that session is signed out with scope `local` and the key is deleted, even if the sign-out fails; the cookie session is untouched; and NOT a Web Lock requested on the app session's lock name.
- AC5 (STA-420): Given no such key, when a page loads, then no Supabase client is created and no request is made.
- AC6 (STA-421): Given a verified reset link, when the form shows, then it names the account's email; given no email, then no line, and NOT a placeholder.
- AC7 (STA-425): Given Supabase answers `same_password`, then the page says the new password must differ from the current one; given `weak_password`, then it says what to change (per the UX/copy decision); given any other error, then today's generic message, and NOT the raw Supabase text.
- AC8: All new copy in fr, en, es, pl (copywriting skill), no em dashes; catalog parity holds.
- AC9 (STA-421): Given the email line shows, then a hint under it says not to set a password if the address is not yours; hidden whenever the email is.
- AC10: Given no recovery session (no token in the URL, a reload after the token was stripped, or verify failed), when the page renders, then it shows the reason in the red box and a pill to sign in, and NOT the password form; given verify succeeded, then the form.
- AC11 (STA-425 detail): Given `weak_password` with reasons, then one line per known reason (`length`, `characters`, `pwned`, in that order); the lines clear when New password changes and stay when only Confirm changes.
- AC13 (STA-418): Given a page load whose URL carries a sign-in token (`token_hash`, `access_token`, `refresh_token`), then PostHog is not started for that load and sends nothing; given any other URL (a `?code=` promo link included), then PostHog starts as before.

## File layout

- `lib/privacy/credential-params.ts` (new): the URL / object scrubber shared by PostHog and Sentry (pure, tested).
- `instrumentation-client.ts`: `before_send` for PostHog; `beforeSend` / `beforeSendTransaction` for Sentry.
- `lib/supabase/legacy-recovery-session.ts` (new): the STA-420 cleanup (storage and client injected, tested), called once from `lib/supabase/auth-provider.tsx`.
- `lib/supabase/recovery-client.ts`: `saveNewPassword` returns the Supabase error `code` (and weak-password `reasons`); `passwordErrorKey(...)` maps it to a catalog key (tested).
- `app/[locale]/reset-password/page.tsx` (~290 lines): strips the URL, shows the email, uses the mapped message. Stays under the 500-line component limit.
- `messages/{fr,en,es,pl}/auth.json`: new `auth.resetPassword.*` keys.

## Touched areas and risks

- **Analytics:** the scrubber must not drop events or alter non-credential parameters (`utm_*`, `ref`, locale paths); tested on real event shapes.
- **Auth provider:** the cleanup runs on every page; it must stay a no-op without the key and never take the app session's lock.
- **Translation catalogs:** parity test across four locales.
- **Consent:** PostHog / GA / Meta gating is unchanged (`lib/consent-routes.ts`).

## Docs impact (preliminary)

Probably none for the help center (security and error copy on an existing page).

## Gate answers (Harry, 2026-10-11)

1. Onboarding "Forgot password?" now links to `/login?email=<their email>` (in this batch). AC12: given the sign-up step's forgot link, then it opens the login with the email filled, and NOT `/reset-password` without a token.
2. Verify failing on the network: the network message + the sign-in pill, no retry.

## Implementation notes (2026-10-11)

- AC4 scope: the cleanup is mounted in the `[locale]` root layout, so it runs on every localized page; it reads one localStorage key and downloads supabase-js only when that key exists (the `PkceCallbackHandler` pattern).
- The cleanup client uses its own storage key with an adapter mapping only the legacy key: on the default key, its `signOut` would broadcast `SIGNED_OUT` on the app client's BroadcastChannel and drop the real UI session (reproduced, now covered by a test).
- Verify failures: `rateLimited` (429) keeps the existing "too many requests" message; connection failures the network message; everything else "link expired". Never raw Supabase text.
- `history.replaceState` runs one tick after mount so Next's patched router method syncs `useSearchParams` (verified only in a browser: RP-04).
- PostHog's first request (feature flags) sends the page's initial URL as person properties and bypasses `before_send`, so the scrubber alone cannot cover it. The showcase uses no feature flags, so PostHog no longer requests them on load (`advanced_disable_feature_flags_on_first_load`), and it is not started at all on a page load carrying a sign-in token (AC13).
- The scrubber also cleans URLs inside text (exception messages, span descriptions, breadcrumb messages, PostHog's `$elements_chain`) and URLs used as object keys (`$heatmap_data`). A URL ends at whitespace or a double quote.
- Sentry's server and edge configs use the same `beforeSend` / `beforeSendTransaction` as the browser.
- A verify error the page does not recognise counts as an expired link (never Supabase's text).
- The expired-link copy points to "Forgot password?" on the sign-in page, which is where the page's only button leads.
