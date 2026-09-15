# Docs decision: STA-315

The four questions, against the real diff:

1. **User-visible behaviour changed?** No. Nothing a business owner does inside
   the product behaves differently. The diff changes public marketing copy and
   two SEO directives.
2. **New setting or option?** No.
3. **Error message or copy changed?** Copy, yes, but only on the public
   showcase (`/us` landing, shared feature/loyalty CTAs, meta descriptions).
   No dashboard, onboarding, email or scanner string changed.
4. **Pricing or tier gating changed?** No. The USD ladder and the 14-day US
   trial both shipped under STA-275; this issue only stops the marketing site
   contradicting them.

**Decision: no help-centre page created or updated.** The help centre documents
what owners do inside the dashboard; the landing page is not a documented
surface. The one externally-visible claim change worth knowing about, that
`/us` now states a 14-day trial in the hero, is already documented for staff by
the STA-315 plan and by `docs/qa/us-market-landing.md`.

The `stampeo-help-docs` skill was deliberately not invoked, for the reasons
above.
