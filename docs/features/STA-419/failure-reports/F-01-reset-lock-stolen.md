CASE: HK-04 (backend `docs/qa/auth-email-hook.md`, STA-416 pass); new showcase case RP-01 (`docs/qa/reset-password.md`)
VERDICT: FAILED
SEVERITY: CORE
RUN: 2026-10-10, dev (showcase from `origin/dev`, backend from the STA-416 worktree)
SURFACE: showcase `/reset-password` in a desktop browser
ACCOUNT: a plus-alias account created during the STA-416 pass

## Failed at

HK-04 step 3: "Set a new password and sign in with it."

## Expected

The new password is saved and the person is signed in (sent to the dashboard).

## Actual

On submit the page shows: "Lock broken by another request with the 'steal' option." The password is not changed.

## Evidence

- Message reported by Harry from the reset page.
- `showcase/app/[locale]/reset-password/page.tsx:47`: `useRef(createStandaloneClient())`; the argument runs on every render, so every keystroke creates a new supabase-js client.
- Those clients and the app's own browser client (`lib/supabase/client.ts`, `@supabase/ssr` singleton) use the same default storage key, hence the same Web Lock name.
- `node_modules/@supabase/auth-js/dist/main/lib/locks.js:195-210` (auth-js 2.104.1): on a lock-acquire timeout the client re-requests the lock with `{ steal: true }`, which aborts the current holder.
- `page.tsx:105` awaits `updateUser` without a catch, so the abort surfaces raw.

## State at time of failure

- Session: none in the app; recovery token verified by the page on load
- Preceding cases this run: HK-01 to HK-03
- Relevant data: reset email sent through the STA-416 hook (the link itself worked: the form appeared)

## Aftermath

- RESET performed: none
- Dependents skipped: HK-05 (also needs a working reset)
- Run continued: yes

## Hypothesis (optional, clearly speculative)

Not caused by STA-416 (the email and link worked); pre-existing on the page and likely on prod.

Post-fix note (from the coverage audit, verified in `GoTrueClient.js:146-151`): supabase-js takes a
Web Lock only for a client with `persistSession: true` in a browser, so the in-memory recovery
client takes none; that, not the separate storage key, is what ends the contention. Trade-off: a
reload after the link is checked loses the recovery session (QA RP-03).
