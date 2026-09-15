# Gap Report: STA-315

AUDITED: 2026-09-15 (coverage-auditor, fresh context, three inputs)
VERDICT: GAPS FOUND + DRIFT FOUND

Root cause of most coverage gaps: `showcase/` has **no component or page test
harness** (`lib/*.test.ts` only). Every AC whose subject is "when the page
renders" or "when metadata is generated" is pinned by a pure-function proxy at
best. That is a standing property of this repo, not something this issue
introduced, and it is recorded here rather than silently absorbed.

## Findings the audit raised

### Must fix (accepted, resolved below)

1. **AC4 is far weaker than it claims.** Of ~31 flattened `variant.us.*` keys,
   only 6 were genuinely orphan-checked. The other 24 are array members, for
   which the rule collapsed to "the base array exists", so
   `variant.us.faq.items[0].anwser` passed. That is AC4's own failure mode
   (silent fallback to European copy) surviving across the bulk of the new
   subtree.
2. **The orphan check read `landing.json` only**, while `MARKET_SCOPED` exempts
   `variant.(us|uk).*` in *every* namespace. A market subtree in `pricing.json`
   would have escaped parity and the orphan check together.
3. **English messages are never ICU-validated.** The "every message is valid
   ICU" test runs inside `describe.each(OTHER_LOCALES)`, so every string this
   issue adds is en-only and was never parsed.
4. **No override/base placeholder parity.** Nothing verified that
   `variant.us.hero.title` still carries `<accent>`, or that an override does
   not introduce a placeholder the component never passes. That is exactly the
   literal-`{trialDays}`-on-/us bug `VariantDifferentiator` already carries a
   comment about.
5. **The `zł` anchor left a hole.** `\d\s*zł` does not match
   `"{starterPrice} zł/mies."`, where the preceding character is `}`. Glyph
   baked, only the number interpolated: the precise failure the guard exists
   for.
6. **"No credit card required" had no guard**, despite plan.md stating it as an
   absolute honesty rule (it would be false under `requires_card_upfront`). It
   is strictly analogous to the AC8 trial-wording rule and deserves the same
   enforcement.
7. **`WORDED_TRIAL` narrower than AC8's wording**; `FOUNDING_SUBTREE` matched
   "founding" anywhere in a key rather than the founding subtree.
8. **Drift: the hero CTA block was restructured for every market.** A new flex
   wrapper was added so the reassurance line could sit under the CTA row,
   changing DOM and spacing on `/`, `/en`, `/es`, `/pl`, `/uk`. plan.md requires
   those be byte-identical.

### Drift accepted, plan corrected rather than code reverted

9. **fr/es/pl demo copy changed**, which plan.md called "deliberately
   unchanged". This is *forced*: once the English `rewarded` / `rewardText` /
   `rewardTop` take a `{trialDays}` argument, the catalog's own token-parity
   test requires every locale to take it too. The plan did not anticipate the
   cascade. The rendered number is unchanged for those markets (30), so this is
   a source change, not a copy change, for fr/es/pl.
10. **fr/es/pl `metadata.json` founding descriptions rewritten.** AC9 required
    removing the glyph; a `{token}` is not available here because metadata is
    not run through `interpolatePricing` and would ship the literal token into a
    search snippet. Removing the price was the only honest option, and it
    touches a non-goal subtree. Recorded, not reverted.

### Noted, not fixed (with reasons)

11. **`marketRobots` agreement tests are near-tautological.** True: both sides
    derive from one field. They guard against someone reintroducing a hardcoded
    value in the helper, which is worth little. The gap they appear to cover,
    AC6/AC7 at the *page* level, cannot be closed without a page-render harness
    (see root cause). Left in place, honestly labelled.
12. **`marketCopy` wrapper untested; only `marketScopedKey` is.** Closed in part
    by the new delegation test; full coverage needs a next-intl double, which is
    more harness than this diff earns.
13. **Component key-prefix rewrites are untested.** The largest non-US
    regression surface in the diff. Mitigated by manual verification of all five
    markets against the running dev server (see runbook), not by a test.
