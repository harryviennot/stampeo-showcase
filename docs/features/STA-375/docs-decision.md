# Docs decision: STA-375

The four questions, against the real diff:

1. **User-visible behaviour changed?** No. Nothing a business owner does inside the product behaves differently. The landing page's sector carousel shows six more sample businesses.
2. **New setting or option?** No.
3. **Error message or copy changed?** Copy, yes, but only on the public showcase: six new entries in `landing.sectorCards.sectors` in four locales. No dashboard, onboarding, email or scanner string changed.
4. **Pricing or tier gating changed?** No. The new entries quote no price, and Harvest Row's reward is currency-free ("10% off at 200 points").

**Decision: no help-centre page created or updated.** The help centre documents what owners do inside the dashboard. A marketing carousel is not a documented surface.

## Workflow phases skipped

Harry asked on 2026-10-05 to merge to `dev` after Phase 2 (tests, type-check and lint green). These phases did not run before the merge:

- Phase 3, UX polish pass at 390px and 1440px (`ux-review.md`).
- Phase 4, coverage audit and code-quality review (`gap-report.md`, `quality-report.md`).
- Phase 5, runbook amendment in `docs/qa/`.
- Phase 6, manual QA.

AC9 (390px rendering in four locales) therefore has no recorded check beyond the type, lint, test and production-build runs.
