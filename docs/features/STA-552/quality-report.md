# Quality Report: STA-552
REVIEWED: 2026-11-13  DIFF: feat/sta-546-landing-variants...feat/sta-552-feature-previews (60cee70..002e87c; docs, snapshots, public excluded)
VERDICT: FINDINGS

## Comments
- copy/previews/promotional-campaigns.ts:5, :24, :122: history ("as today's approved feature page words it", "as today's page does", "as today's page shows it"). Fix: name the page (`/en/features/promotional-campaigns`) or delete the clause.
- copy/previews/promotional-campaigns.ts:25-27: STA-549 plan note in a comment. Fix: delete it (tracked in STA-549).
- platform/StepsTable.tsx:16-20: "the card's code and the scanner's frame show above it" fits HowTable only. Fix: "low enough that the top of each phone shows above it".
- feature-previews/analytics/TileFrame.tsx:4-7: claims Platform's tokens, but `INK` is a hand copy of DeliverAnalytics.tsx:40. Fix: export `INK` from DeliverAnalytics and spread it.
- feature-previews/push-notifications/MomentsSection.tsx:12: the doc for `STAMPS` sits on `KEYS`. Fix: move it.
- components/ui/ScannerLoop.tsx:147: repeats the docstring at :138-139. Fix: delete.
- features/design-de-carte/playground/controls.tsx:36: narrative ("stay where they were"). Fix: "so the layout does not move".
- feature-previews/analytics/QuestionsSection.tsx:6-12: 7-line docstring on a 15-line component. Fix: one line.
- feature-previews/promotional-campaigns/IdeasSection.tsx:10-14, :26-30: 10 comment lines in 33. Fix: one line per block.
- "Both phones are drawn at 280px and shrunk to 160px on a phone" x5 (HowTable.tsx:10, mobile-scanner/HowSection.tsx:10, push-notifications/HowSection.tsx:11, promotional-campaigns/HowSection.tsx:7, card-design/WalletsSection.tsx:7). Fix: export one `STEPS_PHONE` from StepsTable.tsx, delete the copies and comments.
- History in new test titles/comments: copy.test.ts:280 "(STA-552)", :296 "(Harry's v2.1 call…)", :82 "(Harry, 13 Nov 2026)"; plan-claims.test.ts:150; previews/registry.test.ts:3 and :7-10; kit.test.tsx:125, :133; extended-components.test.tsx:175. Fix: drop the parentheticals/clauses.
- Density within 1.5x overall; outliers controls.tsx, LpFaq.tsx, AnnotatedWalletCard.tsx, ScannerLoop.tsx (prop JSDoc). Fix: the trims above.

## File size
- No file past the caps. kit.test.tsx 0 -> 418: move the `describe("what the Platform pieces take for the previews")` block (:222-320) into extended-components.test.tsx. mobile-scanner.test.tsx 0 -> 342: drops under 300 once its copied helpers move to lib/testing.

## Folder tree
- None found (platform/ 19 -> 23). Note: if platform/ grows, move HoverRows/StepsTable/ToggleCard/NumberFigures to components/landing-pages/kit/.

## Flag-gated paths
- None found.

## Test shape
- Ratio 0.79.
- Copied setup: async `render` in analytics.test.tsx:40-61 and mobile-scanner.test.tsx:39-60 (add `renderEnAsync` to render-en.tsx); in-order helper x5 with two meanings (one `expectInOrder` in lib/testing); entity decoder x3 duplicating render-en's private ENTITIES (export `decodeEntities`); `pictures` x2; FOLDER/section/page source setup in all 5 page test files (`previewSource(slug, name)` in landing-pages-source.ts).
- Duplicates: the accessible-name + 44px-link loop (analytics:301, mobile-scanner:334); the "no Every plan / Sample data / em dash" check x5 (copy.test.ts:296 covers it); "no sign-up button of their own" x3 -> one `test.each(PREVIEW_SLUGS)`. Section order pinned three ways -> keep registry.test.ts:151, move Hairline positions into one parametrized test, delete the `SECTIONS` table (change detector) and the per-file order tests. Section header check repeated ~12 times -> one `test.each`. HoverRows open-handlers (kit:117-123 = platform-page:239-245), PlatformHero default slots (kit:327 = platform-page:103), AnnotatedWalletCard 44px x3 (keep extended-components) -> delete the copies.
- Dead/process tests: the `TODO(STA-552 builder)` staging machinery (registry.test.ts:45-47, :139-162) and the four "marker is gone" tests; kit.test.tsx:412-418 folder-size test; kit.test.tsx:145-152 re-export pin (import from HoverRows/NumberFigures directly, drop the re-exports in ProgramTypeRows.tsx:11 and NumbersBlock.tsx:7 if only tests use them).
- Source-regex tests where a render would do: extended-components.test.tsx:103-115; card-design.test.tsx:206-232; push-notifications.test.tsx:141-147, :158-200; promotional-campaigns.test.tsx:102-125; kit.test.tsx:322-341, :154-168; previews/registry.test.ts:121, :190-235; shared-sections.test.ts:567 special case + the `PlaygroundSegmented` rename forced by tag-name matching (match callers by import source).

## Other (findability and duplication)
- TileFrame.tsx (`TileFrame` + `TILE`) and mobile-scanner/AppScreen.tsx (`MiniFrame` + `MINI`): same component and constant. Fix: one feature-previews/MiniFrame.tsx with background/color props.
- controls.tsx:28-34 `TAB_SIZES` copies ui/Segmented.tsx:15 and `PlaygroundSegmented` re-implements ui/Segmented. Fix: use ui/Segmented in the playground.
- mobile-scanner/CounterSection.tsx:8 `LEVELS` copies platform/ProgramTypeRowsSection.tsx:18. Fix: export once.
- PreviewHero.tsx:36-57 and PlatformHero.tsx:31-50 render the same words block. Fix: a shared `HeroWords`.
- LiveActivityFeed.tsx:54 `soft` changes two unrelated things. Fix: split or rename.

## Waivers
(none)
