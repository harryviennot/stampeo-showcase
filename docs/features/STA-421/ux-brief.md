# UX Brief: STA-421 (with STA-425)
MODE: DESIGN  DOMAIN: showcase  VERDICT: READY  (ux-designer, 2026-10-11)

## Already shipped
- `verifyOtp` already returns the user; `page.tsx:73-79` keeps only `error`. `saveNewPassword` returns the email only after a save.
- Login's verify phase already shows the account email under the `h1` (`login/page.tsx:263-270`): the pattern to reuse.
- Code-first error mapping exists in web (`web/src/lib/auth-error-copy.ts`); the showcase only matches substrings, so `same_password` / `weak_password` fall to `updateFailed`.
- The live client checklist ships; submit is disabled until all 5 checks pass.
- Policy facts: local config `minimum_password_length = 6`, no character requirements; leaked-password protection off on both cloud projects. So only `same_password` can fire today; the `weak_password` reason lines ship dormant.
- The realistic "no email" case is "no recovery session": with no `token_hash` the form renders at once and saving fails with "Auth session missing!". STA-418 makes this common (a reload after the URL is stripped). The onboarding "Forgot password?" link already lands there (`AuthenticationStep.tsx:469-474`).

## Placement
- STA-421: a `<p>` in the subtitle slot under the `h1` (`text-[var(--muted-foreground)] mt-2 text-sm`), the address itself `text-[var(--foreground)] font-medium`, `wrap-anywhere` on the address only. Never truncate or mask (a lookalike only differs at its end; masking protects nothing). Only when verify returned an email; no placeholder.
- STA-425: inline under the New password field, below the checklist (field-value problems are inline on this page; link/connection failures use the top box). One `<p>` per message in a `role="alert"` container referenced by the input's `aria-describedby`; `aria-invalid` while shown; `text-sm text-red-600 dark:text-red-400`; no icon, no red border. One line for `same_password`; `weak_password` one line per known reason (`length`, `characters`, `pwned`), unknown reasons ignored, none left → the generic weak line. Lines clear when New password changes; stay when only Confirm changes; the next submit replaces them. Anything else keeps today's top-box messages, never raw Supabase text.
- Copy intent: `same_password` = already the current password, choose another (not phrased as a failure); `length` = make it longer (no number); `characters` = that symbol does not count (likely an accented letter or space), name a few that do; `pwned` = appears in a public list of passwords leaked from other sites, cannot be used, without suggesting Stampeo was breached; generic weak = a concrete next step.

## Proposed additions
- "Not your address" hint under the email: one muted `text-xs` line, `mt-1`, centred, text only, "if this isn't your email, don't set a password here"; hidden with the email. Prevents a mistake.
- No recovery session → no form: the form shows only once `verifyOtp` succeeded; otherwise title + the red box (`linkExpired` with no token, else the verify error) + one full-width pill to `/login` built like the success state's. Based on the verify result in state, not the URL (`useSearchParams` follows `replaceState`). Prevents a mistake. Needs its own AC and test.

## Rejected additions
Truncating/masking the email; a "request a link for your own account" button; email on the success state or pre-filled login; the top red box for same/weak; red input border or icon; moving focus after a refusal (iOS won't open the keyboard); clearing both fields; disabling submit while unchanged; red checklist items mirroring server reasons; a "sign in instead" link on `same_password`; password-manager wiring (`autocomplete` / `passwordrules`, its own issue).

## Mobile shape
390x844: fixed logo header; centred card: `h1` (two lines in fr/es/pl), email line, hint, red box (page-level only), New password + 2-column checklist + refusal lines, Confirm + mismatch hint, full-width submit pill. About 600px with a two-line refusal and the French title. The refusal clears on the first keystroke, so the keyboard never hides a live message. POLISH: the shell has no side padding and the card uses `p-8`, so its border touches the screen edges; match login's `px-3 sm:px-0` / `p-4 sm:p-8`. Pre-existing: 20px eye-toggle tap targets.

## Components to reuse
Login's title + email slot; the page's red box; the mismatch line's position; the success state's pill (auth routes use hand-built pills, and `/reset-password` is consent-excluded).

## New components required
None.

## Open questions for the user
1. Cloud auth policy (min length, character requirements, leaked-password protection) decides whether the weak lines ever show; the checklist says "Min 6" while an unused key says 8.
2. Verify failing on the network after the URL is stripped: retry with the token in memory, or treat as needing a new link?
3. The onboarding "Forgot password?" link to a tokenless `/reset-password`: fix in this batch or separately?
4. Make login's forgot phase reachable by URL (separate issue).
