CASE: ED-01
VERDICT: AMBIGUOUS
SEVERITY: EDGE
RUN: 2026-09-21, `feat/sta-330-region-detected-pricing` at `fd8c880`
SURFACE: `https://showcase.dev.stampeo.app`
ACCOUNT: `No session (raw HTTP fetch)`

## Failed at

Step 2: Open `/programme-fondateur` (and its price reveal).

## Expected

Founder page amounts remain `€` even for the US-spoofed browser; `/llms.txt` prose still quotes EUR. You do NOT see `$` on either surface.

## Actual

`GET /programme-fondateur` returns HTTP 307 with `Location: /fr/pricing`; there is no founder page or price reveal to inspect. `/llms.txt` does continue to quote EUR prices and contains no USD pricing ladder.

## Evidence

- `curl -I https://showcase.dev.stampeo.app/programme-fondateur` returned HTTP 307 and `location: /fr/pricing`.
- Browser navigation also ended on the regular pricing page.
- `https://showcase.dev.stampeo.app/llms.txt` lists Starter/Growth/Pro and annual-equivalent prices in EUR.

## State at time of failure

- Session: no session for the HTTP redirect check
- Preceding cases this run: RP-05 and RP-06 passed; RP-09 failed independently
- Relevant data: showcase branch commit `fd8c880`; public dev environment

## Aftermath

- RESET performed: none needed
- Dependents skipped: none
- Run continued: yes

## Hypothesis (optional, clearly speculative)

The runbook case appears stale relative to the existing post-founder-program redirect. Clarify whether the route should be restored or ED-01 should assert only the frozen source/`llms.txt` surfaces.

## Resolution (2026-09-21, fix track)

ROOT CAUSE: stale runbook case, not product. `/programme-fondateur` (and
`/founding-partner`) 307 to the pricing page since the founding program closed
on 2026-08-04 — documented at `lib/pricing.ts` `FOUNDING_PROGRAM_END_DATE`. The
case was authored from the plan's "frozen surfaces" list without checking the
route was still reachable. The reachable frozen surface behaved correctly:
`/llms.txt` quotes EUR only.

FIX: ED-01 rewritten in docs/qa/region-pricing.md to assert the redirect plus
the `/llms.txt` EUR prose. No product change, no regression test (nothing to
regress).
