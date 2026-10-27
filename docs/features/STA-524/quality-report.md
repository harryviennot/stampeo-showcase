# Quality Report: STA-524 (Stage 1)
REVIEWED: 2026-10-27  DIFF: 93241b8..efc21e3
VERDICT: FINDINGS

## Comments
- proxy.ts:59-61: contradiction - "Before the markdown and shop-slug checks, which would otherwise claim it". This diff reserves `help` and removes `/help` from Markdown eligibility, so neither would claim it. Fix: `// English at a locale-free URL: rewritten before next-intl, so no language cookie or Accept-Language applies.`
- lib/help/config.ts:37-38: contradiction - isHelpPath "Takes the BROWSER path", but language-switcher.ts:5-6 passes the locale-stripped path. Fix: "`/en/help` is false: that copy 308s to `/help`."
- lib/markdown/eligibility.ts:6-9: contradiction with config.ts:45-47 (the X-Robots-Tag exists for non-HTML responses) and proxy.ts:62 (returns before the Markdown check); 4 lines on a one-element const. Fix: `// Not for search yet: lifted with HELP_INDEXABLE (lib/help/config.ts).`
- lib/help/config.ts:10-11: contradiction - "The ONE switch", but eligibility.ts:10 and scripts/seo-smoke.ts:66 hard-code /help's state. Fix: make them read it.
- lib/consent-routes.test.ts:309-311: "A page with no JSX serves no markup" - `/<[A-Za-z]/` also matches TS generics. Fix: match a JSX return (`/return\s*\(\s*</`) or reword.
- LanguageSwitcher.tsx:14, FloatingLanguageSwitcher.tsx:134: over-explained, repeats hidesLanguageSwitcher's doc. Fix: delete both.
- lib/seo/legacy-redirects.ts:157-160: 4-line doc on a 1-line function (sibling uses one line). Fix: one line.
- lib/attribution/capture.ts:139-145: 6-line doc on a 6-line helper. Fix: two lines.
- Density 1.36x overall (under limit). Files over 1.5x: eligibility.ts, legacy-redirects.ts, capture.ts, both language switchers.

## File size
- lib/google-analytics.test.ts: 833 -> 877 (already over 800). The new help block is a duplicate (see Test shape).

## Folder tree
None found.

## Flag-gated paths
- eligibility.ts:10 and seo-smoke.ts:66 hard-code /help's not-indexed state. Fix: `UNINDEXED_PATHS = HELP_INDEXABLE ? [] : ["/help"]`; in seo-smoke, a separate `unindexedPages = HELP_INDEXABLE ? [] : ["/help"]` instead of `privatePages`.
- Cleanup: the plan's launch non-goal must list the Markdown exclusion, the smoke entry, and the tests pinning the switch at false (config.test.ts:15-18, discovery.test.ts).

## Test shape
- Ratio 1.86 (under 3:1).
- google-analytics.test.ts:841-877: duplicate with copied setup. Fix: delete; if wanted, pass a /help href to the existing initGa test.
- legacy-redirects.test.ts:125-130 vs 207-216: duplicate. Fix: drop the 5 REFERENCE_A rows.
- config.test.ts:73-79 duplicates legacy-redirects.test.ts:234-238. Fix: delete.
- config.test.ts:15-22 (merge), 24-27 (keep only `helpHeaders(true)).toEqual([])`), 29-32 (duplicate of routes.test.ts: delete).
- consent-routes.test.ts:191-200: holds by construction. Fix: `mayRunAnyTag = (p) => mayRunAnalytics(p) || mayRunAdvertising(p)` and delete the test.
- proxy-behaviour.test.ts:79-83: fold the Polish case into the test.each at 57-66.
- meta-pixel.test.ts:422: rename PRIVATE_PATHS to NO_AD_PATHS.
- Help path lists and lookalike slugs retyped across 14 and 8 test files. Fix: `lib/help/__fixtures__/paths.ts` exporting HELP_PATHS and HELP_LOOKALIKE_SLUGS.

## Waivers
(filled by the main agent only if the user explicitly waives a finding)
