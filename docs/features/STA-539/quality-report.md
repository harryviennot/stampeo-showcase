# STA-539 code-quality review: findings and resolutions

Plan: `docs/features/STA-539/plan.md`. Status: all findings resolved.

8. `PolicySurface` doc described only a row's no-choice surface, and `ConsentSurface` repeated the same union. FIXED: `lib/privacy/policy-matrix.ts` documents `PolicySurface` as "A consent surface: a blocking banner, a notice, or nothing."; `lib/consent.ts` now has `export type ConsentSurface = PolicySurface;`.
9a. History wording in `lib/legal/privacy-regional-rules.test.ts` ("The sentences that described..."). FIXED: "Phrases that describe a notice shown to US visitors, in each locale."
9b. History wording in `lib/consent-gpc.test.ts`. FIXED: "A US grant: the opt-out default, both on."
9c. `lib/attribution/evidence.ts` `clickedAt` doc named the notice dismissal. FIXED: describes an opt-out record that grants everything as "the default with no click".
9d. `lib/attribution/evidence.ts` `captureConsentEvidence` doc said "the notice text in force". FIXED: "the consent text in force".
10. `lib/consent-carry-forward.test.ts` header had a 137-column line. FIXED: re-wrapped at the file's width.
11a. `lib/privacy/choices-ui.test.ts` "the label follows the regime, not the surface a row happens to show" could not fail. FIXED: deleted.
11b. `lib/privacy/choices-ui.test.ts` `test.each` over made-up surfaces that `preferencesView` never reads. FIXED: deleted.
11c. `lib/privacy/choices-ui.test.ts` "the US row shows no surface and still gets the statutory label". FIXED: folded into the footer-label `test.each`, which now takes `ROWS.US` and `ROWS.EEA_UK_CH`.
11d. Backend `tests/privacy/test_policy_matrix.py` `test_only_the_opt_in_rows_show_a_consent_surface`: no backend code reads a row's surface and the SHA test pins the bytes. FIXED: deleted.
12. Duplicate shipped-US pairs (the shipped US row shows nothing, with and without GPC). FIXED, one case each:
    - `lib/consent.test.ts`: one test, "an opt-out visitor with no choice sees no surface at all, GPC or not".
    - `lib/privacy/consent-wiring.test.ts`: the two US expectations are one loop over GPC.
    - `lib/privacy/policy.test.ts`: one test, "the shipped US row shows nothing, GPC or not"; the GPC guard itself is pinned on `US_NOTICE` (gap-report.md, item 2).
    - `lib/consent-carry-forward.test.ts`: the GPC case keeps its state assertion and drops the surface assertion the case above already makes.
