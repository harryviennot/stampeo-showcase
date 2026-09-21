# Docs decision — STA-330

The four Phase 7 questions, answered against the final diff:

1. **User-visible behavior changed?** Yes — but only on the pre-signup marketing
   site: displayed prices and trial-day numbers now follow the visitor's detected
   region. The help center's audience is business owners using the product
   post-signup, and everything they are documented on is unchanged: billed
   prices, trial length, and checkout still derive from the business address
   exactly as before. No help-center page describes how the showcase renders its
   pricing ladder, so there is nothing to update. → no help-docs change.
2. **New setting or option?** No.
3. **Error message or copy changed?** One marketing string
   (`common.marketSuggestion.prompt`, all four locales) — showcase banner copy,
   not referenced by any help page.
4. **Pricing/tier gating changed?** No — display only; gating and billing
   untouched.

DECISION: no help-center create/update. In-repo docs updated instead (this
folder, `docs/qa/region-pricing.md`, `docs/qa/us-market-landing.md` amendment,
`docs/features/STA-317/plan.md` amendment, and the corrected in-code doc
comments in `lib/plan-catalog.ts`, `lib/markets.ts`, `lib/market-suggestion.ts`).
