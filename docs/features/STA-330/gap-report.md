# Gap Report: STA-330
AUDITED: 2026-09-21 (coverage-auditor, fresh context; diff 3e86c82..HEAD, plan.md, lib/region-pricing.test.ts)
VERDICT AT AUDIT: GAPS FOUND — 5 gaps, 2 drift items. No suspect tests.
STATUS AFTER RESOLUTION PASS: **ALL CLOSED** (commit on this branch; details per item).

security-reviewer: **skipped** — the diff touches no auth, billing, Stripe, webhook, or
migration path (display-only showcase change; billed price still resolved server-side at
checkout, untouched).

## AC coverage map (as audited)

| AC | Coverage |
|---|---|
| AC1 | Unit: regionBilling US/normalization. Page wiring manual (RP-01..04) — accepted structural limit (no component harness). |
| AC2 | Unit: regionBilling other-countries + GB. Page wiring manual (RP-05). |
| AC3 | Unit: null/junk contract. Provider consumption manual (RP-07). |
| AC4 | Manual (RP-08); splitPricingParts tests cover token-targeting. |
| AC5 | Manual (RP-09) + NEW lib test (Gap 3 closure). |
| AC6/6b/6c | Manual (AN-01..03); code-level guard rails verified in diff. |
| AC7 | `bun test lib` — see Gap 5 closure. |
| AC8 | Covered: resolveRegionLadder tests incl. default-slot-is-the-mismatch. |

## Gaps and resolutions

1. **Fallback-in-matching-currency branch untested** (Medium). A ladder that is
   `isFallback` but in the requested currency (baked USD during an outage) must be
   shown; only the cross-currency rejection was pinned. → CLOSED: test added
   ("a fallback ladder in the MATCHING currency is shown").
2. **`FALLBACK_PRICING.usd` amounts unpinned** (Low-Medium). Shape + positivity let a
   transposed amount through. → CLOSED: exact-amount test added (49/79/119,
   468/756/1140, captured from dev 2026-09-21); a deliberate reprice updates both.
3. **AC5's FAQ interpolation had no automated cover despite being pure code** (Medium).
   → CLOSED: lib test feeds every real catalog FAQ answer (variant.faq for all four
   locales, variant.us.faq, pricingPage.faq for all four locales) through
   `interpolatePricing` with BOTH ladders and asserts no leftover braces.
4. **`loading` suppresses the discount pair — inert, untested, beyond "additively only"**
   (Low). Dead code path while no discount is active. → CLOSED as documentation:
   sanctioned in plan.md's 2026-09-21 amendment; runbook "Known state" carries the
   case to add when a promo next activates a discount. Not automatable (component).
5. **AC7 not independently executed by the auditor** (process note — its sandbox has no
   shell). → CLOSED: `bun test lib` run by the main agent after the resolution pass:
   **760 pass, 0 fail** (see verification in the close-out).

## Drift and resolutions

1. **HeroDemo holds with "…" instead of a chip** — reward lines feed WalletCard string
   fields that cannot hold an element. → RESOLVED: sanctioned by plan.md amendment
   (ellipsis idiom for string-interpolated slots); runbook notes it is expected.
2. **ROICalculator `ready` prop + "…"** — figures interpolate into ICU sentences; the
   plan had predicted no held state was needed there. → RESOLVED: same amendment.

Minor (not counted, no action): FAQList `answer` widened to ReactNode (mechanical
enabler); TextSkeleton has three consumers, not the brief's estimated two.

## Waivers
None — every gap was closed rather than waived.
