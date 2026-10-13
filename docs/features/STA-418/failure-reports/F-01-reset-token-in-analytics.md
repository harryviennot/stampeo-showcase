CASE: RP-04 (new, `docs/qa/reset-password.md`)
VERDICT: FAILED
SEVERITY: CORE
RUN: 2026-10-10, code review (STA-419 security review), showcase `dev`
SURFACE: showcase `/reset-password`
ACCOUNT: any

## Failed at
Open a reset link `/reset-password?token_hash=…&type=recovery`.

## Expected
The single-use reset token stays between the email and the page: not in analytics, error tracking or the address bar after use.

## Actual
`instrumentation-client.ts` starts PostHog on every route (pageviews on load and history change, autocapture, no `before_send`), so `$pageview`, autocapture and `$pageleave` events carry the token in `$current_url`. The page never removes it from the URL. Sentry browser traces (10% sample) likely carry the URL too. GA4 and Meta are already excluded on this route.

## Evidence
- `showcase/instrumentation-client.ts:4-10`; `node_modules/posthog-js` defaults `2026-01-30`.
- `showcase/app/[locale]/reset-password/page.tsx` reads `token_hash` and never rewrites the URL.

## State at time of failure
- Session: none
- Relevant data: a reset email link

## Aftermath
- RESET performed: none needed
- Run continued: yes

## Hypothesis (optional, clearly speculative)
Low impact on the normal path (the page spends the token within a second), real when that check fails.
