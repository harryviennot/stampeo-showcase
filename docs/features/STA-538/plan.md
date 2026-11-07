# Plan: Plan feature lists (STA-538, showcase side)

ISSUE: STA-538 (https://linear.app/stampeo/issue/STA-538)
BRANCH: showcase `feat/sta-538-plan-features`; the main plan is `web/docs/features/STA-538/plan.md` (branch `feat/sta-538-three-plan-picker`)
REPOS: showcase (this change), web (the onboarding plan step)
MIGRATION: no
STATUS: APPROVED (2026-11-07, Harry's review of the web plan step)

## Scope

Only the plan feature copy in `messages/{en,fr,es,pl}/pricing.json`. The lists
live twice (`pricing.<tier>.features` for the landing section,
`pricingPage.<tier>.features` for `/pricing`) and both change the same way.
The web dashboard (onboarding plan step and Billing page) carries the same
lists and must stay identical to `pricingPage.<tier>.*` here.

## Decisions

- Starter, "Stamp or points cards, fully customisable" becomes "Stamps, points
  or levels"; "Automatic stamp and reward notifications" becomes "Automatic
  notifications".
- Growth, "Write your own stamp and reward messages" becomes "Customise
  automatic notifications".
- The feature is called "levels" (FR niveaux, ES niveles, PL poziomy), the
  product's own word from STA-525.
- Release: levels (STA-525) are not on production yet, so this branch ships
  with or after STA-525, together with the web STA-538 branch.

## Left alone

The comparison table's "Loyalty type" row ("Stamps or Points"), the
`/llms.txt` plan facts (`lib/plans/plan-facts.ts`, `lib/llms-txt.ts`) and the
blog and docs pages still say "stamps or points". They are not the plan
feature lists; they get their own pass when levels go live.
