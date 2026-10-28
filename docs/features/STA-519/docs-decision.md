# Docs decision: STA-519

No help-center change. Against the diff:

- User-visible behaviour changed? Only on the public marketing page /features/analytics (hero, a captured Busiest times row, the illustrative activity feed and chart pills) and its search snippet and llms.txt. Nothing in the dashboard, scanner or customer card changes.
- New setting or option? No.
- Error message or copy changed? Marketing copy only (`features.analytiques.*`, `metadata.features.analytiques`, `lib/llms-txt.ts`); no product copy.
- Pricing or tier gating changed? No. The plan line and the chart pills restate the existing gating (Analytics charts on Growth and Pro, the 30-day return rate on every plan), except the three illustrative charts the product does not have yet, which also say Growth by Harry's decision (2026-10-26; recorded in plan.md).

Re-shooting the captures: the `landing-shots` row in promo-videos `PLAYBOOK.md` (`--views=habits,busiest`) and AF-12 in `docs/qa/feature-pages.md`.
