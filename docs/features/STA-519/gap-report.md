# Gap Report: STA-519
AUDITED: 2026-10-26  DIFF: showcase `feat/sta-514-landing-refresh..620b85b`; promo-videos `feat/sta-519-capture-views`
VERDICT: DRIFT FOUND (and gaps) → resolved below

The settled decision (the three not-yet-built charts carry a "Growth" pill) is implemented and tested as recorded.

## Criteria without tests
- AC2 partly (no numbers, no DOM order) → AF-02 now asserts CTA bottom ≤ 600px, phone top ≤ 844px, DOM order, `scrollX` 0.
- AC5 partly (≤ 828w, busiest lazy) → AF-08 covers both.
- AC11 partly (768/1024 never looked at) → AF-05 runs 390/768/1024/1440.
- AC12 partly (no team-member check, verbs EN only) → AF-06 lists the verbs per locale and checks for team-member rows.
- AC13 partly (Cmd+F misses alt/head) → AF-09 also searches the page source.
- AC14 partly (no 768, no pre-load) → AF-10 at 390/768/1440 and on Slow 3G; AC14 now says "once its images have loaded" (verified pixel-identical by canvas diff at 390/768/1440).
- AC15 (es only) → AF-12 shoots es and pl, and checks the typo and desktop refusals.
- `cta.subtitle` "no longer repeats the plan list": not implemented → the plan line was stale (it belonged to the dropped plan-cards section); with the chart grid kept the CTA's plan list is the page's one plain statement of who gets what. Plan updated.
- "No plan names" in the hero subtitle → tested (`plansNamed(subtitle)` is empty).
- "Banned everywhere" only checked on hero/busiest → `problem`, `cta`, `blindSpotCards`, `proAnalytics` now checked for real-time and per-customer claims (Pro-only words are legitimate in the CTA, which names Pro).
- Discover-more card at 252px → AF-13 (measured: 2 lines at 390 in en/es/pl).
- Stale edge case ("no chart shown as Starter's") and the plan's Problem/Decisions contradiction on segments and at-risk → plan text fixed.

## Untested diff behavior
- Unknown flags silently ignored (`--view=habits` would re-shoot the landing captures) → `parseArgs` refuses any unknown flag; tested.
- `--views=top,habits` with no `--sizes` dropped the desktop top → `shotPlan`: top at both sizes, card views on the phone; tested.
- The top view's scroll reset → harmless on a fresh page; LD-14 re-shoots the top.
- Cards found by layout class and `role="table"` → documented in the runner and plan; a missing one stops the run; AF-12 asks to check the card shown is the one named.
- `APP_ORIGIN` routing untested (env check tested) → exercised by every capture in this change; AF-12.
- PhoneScreenshot fade hard-coded its colour → built from `SCREEN`.
- `proCharts.lineChart.comparison` untested → catalog parity covers the key; AF-07 reads the cards.

## Drift
- Placeholder colour (`--paper-hover`, not muted) and the landing's pre-load change → plan LOADING + AC14 updated.
- `APP_ORIGIN`, busiest found by `role="table"`, `--views=` spelling, `ChartHeader` float, the comparison key → plan updated.

## Suspect tests
- llms.txt test missed the `analytiques` line → filter is `/analyti(?:cs|ques)/i` and asserts that line is present.
- ES problem-card rule missed "Quién ha dejado de venir"; PER_CUSTOMER missed "Know your regulars" → rule widened; self-tests carry every shipped phrasing in four locales.
- Busiest-lead test only checked names → now asserts the order Starter, then the chart plans (from `PLAN_FACTS`).
- `{seconds}` and "old mock gone" tests → deleted (they tested internals; AF-06 and AF-09 check what a visitor sees).
- Per-locale chart-pill test added nothing → one test of `chartPillLabel`.
- `NOT_BUILT_YET` duplicate → folded into the every-chart test's name ("built or not yet").
- Hard-coded VIEWS → derived from `SHOT_SIZES` again.
- SHOWCASE_ORIGIN refusal → tested again.

## Unrealistic or missing workflow tests
- Typo'd flag, layout change, 252px card, slow connection, 768, page source → AF-12, AF-12, AF-13, AF-10, AF-05, AF-09.

## Waivers
None.
