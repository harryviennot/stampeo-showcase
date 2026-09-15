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

---

## Resolution (2026-09-15, same session)

| # | Finding | Resolution |
|---|---|---|
| 1 | Array members not orphan-checked (24 of 31 keys) | **Fixed.** Rule is now "some element of the base array carries the same field". Verified by planting `faq.items[0].anwser` and watching it fail, then reverting. |
| 2 | Orphan check read `landing.json` only | **Fixed.** Reads every namespace; keys are namespaced ids, and a cross-namespace shadow is an orphan. |
| 3 | English never ICU-validated | **Fixed.** Market-scoped en strings are parsed. |
| 4 | No override/base placeholder parity | **Fixed.** Two guards: rich-text tags must match the base exactly, and an override may not use an argument no shared string uses. |
| 5 | `zł` anchor left `{price} zł` passing | **Fixed.** Anchor accepts a digit or `}`; both shapes added to the self-test. |
| 6 | "No credit card required" unguarded | **Fixed.** Guarded in all four locales, anchored to the payment sense. Writing it immediately caught a false positive on "sin tarjetas que perder", the product's own true tagline, which is now pinned as must-not-flag. |
| 7 | `WORDED_TRIAL` too narrow, `FOUNDING_SUBTREE` unanchored | **Fixed.** Regex covers `30-day free trial`, `free for 30 days`, `30 days for free`, `first month is free`; the founding exemption matches a path segment, not any key containing "founding". |
| 8 | Hero DOM restructured for every market | **Fixed.** Wrapper is conditional. Verified by fetching all six markets: the wrapper and the reassurance line appear on `/us` only, zero times on `/`, `/en`, `/es`, `/pl`, `/uk`. |
| 9 | fr/es/pl demo copy changed vs plan | **Plan corrected, code kept.** The change is forced by token parity and the rendered number is unchanged (still 30). Recorded in plan.md under Edge cases. |
| 10 | fr/es/pl metadata descriptions rewritten | **Plan corrected, code kept.** AC9 requires the glyph gone and a `{token}` would ship literally into a search snippet. Recorded in plan.md under Non-goals. |
| 11 | `marketRobots` tests near-tautological | **Not fixed, accepted.** Both sides derive from one field by design. The gap they appear to cover is page-level and needs a render harness this repo does not have. Covered manually by runbook SE-01/SE-02. |
| 12 | `marketCopy` wrapper thinly tested | **Partially accepted.** Full coverage needs a next-intl double. Covered manually by runbook MK-01/MK-02. |
| 13 | Component key-prefix rewrites untested | **Accepted, mitigated.** All six markets were rendered and diffed against the pre-change output; runbook MK-02 exists specifically for this and is marked load-bearing. |

Open gaps blocking the issue: **none.** Findings 11 to 13 are accepted limits
of a repo with no component test harness, recorded here and carried into the
runbook's "Known state" section rather than waived silently.
