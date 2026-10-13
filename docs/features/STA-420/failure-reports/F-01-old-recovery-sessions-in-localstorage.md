CASE: RP-05 (new, `docs/qa/reset-password.md`)
VERDICT: FAILED
SEVERITY: CORE
RUN: 2026-10-10, code review (STA-419 security review), showcase prod before STA-419
SURFACE: showcase, any page, a browser that completed a reset before STA-419
ACCOUNT: an owner who reset their password before 2026-10-11

## Failed at
Open devtools → Application → Local Storage on the showcase origin after an old reset.

## Expected
No Supabase session in localStorage (the app session lives in cookies).

## Actual
Before STA-419 the reset page's client used supabase-js defaults, which saved the recovery session, refresh token included, under `sb-<ref>-auth-token` in localStorage. STA-419 stops new ones; existing entries stay as working refresh tokens until the owner signs out everywhere or resets again. On a shared counter PC anyone can copy one.

## Evidence
- Old `createStandaloneClient()` in `reset-password/page.tsx` (pre-STA-419), supabase-js default storage.
- `lib/supabase/auth-provider.tsx` clears `sb-*` localStorage only on an auth error.

## State at time of failure
- Session: any
- Relevant data: a localStorage entry from a past reset

## Aftermath
- RESET performed: none needed
- Run continued: yes

## Hypothesis (optional, clearly speculative)
Nothing on the showcase reads that key any more, so revoking and deleting it on load is safe.
