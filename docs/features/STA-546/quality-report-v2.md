# Quality Report: STA-546 (v2)
REVIEWED: 2026-11-12  DIFF: origin/dev...feat/sta-546-landing-variants (f369cc5; docs excluded)
VERDICT: FINDINGS

Saved by the coordinator from the reviewer's final message (the reviewer has no write tool). Severity: [H] high, [M] medium, [L] low.

## Ranked
1. [H] "Drawn at W, shrunk to w" fixed-scale implemented 7 ways (platform/ScaledBox, AurevoCard PassFrame, WalletPhone, PlacardVisual, LevelCards scale-[0.78125], HeadStartToggle scale-[0.8], platform/ProgramTypesSection scale-[…]); ShareStepVisual renders twice per breakpoint. Fix: one shared ScaledBox with an optional narrow width / breakpoint.
2. [H] extended-components, features-page and how-it-works tests redefine MESSAGES/render/textOf; lib/testing/render-en.tsx already provides renderEn/textOf (add an optional US-pricing wrapper).
3. [H] The same behaviour is pinned in 2-4 files: LiveActivityFeed cardOnly + otherCallers (features-page, how-it-works); ScanDemo minimal (4 files); section-order slices (how-it-works, outcomes-page, page-visuals vs registry); LpAccentBand; share-tree "no integrations"; Platform LpSectors eyebrow; outline trial button per component (7 places). Keep one of each.
4. [H] LpSection.tsx:80 says "The page's one tinted band." but argument pages have two. Fix the comment.
5. [M] Dead props: HeroCardStack.peekFrom (revert the file to base, drop its test row), LpSpotlight side/cropOnPhone, WalletPhone otherPasses/eager, PhoneCrop 560, LpSection PADDING.hero, AurevoCard's `export { AUREVO }`.
6. [M] CardDesignPlayground 559 → 609 lines with `compact` threaded 19 times; split into playground/ (state hook + controls) and a CompactPlayground.
7. [M] History/provenance comments: passentry mentions in platform copy/page/test, "STA-546 stage G3", "any more", "arrives with the … stage", "v2"/"ACnv2" in test prose.

## Other findings
- [M] Marginalia points card duplicated in features/ and platform/ ProgramTypesSection (both named ProgramTypesSection): shared MarginaliaCard + MARGINALIA in samples.ts; rename the platform one ProgramTypeRowsSection.
- [M] hooks/usePrefersReducedMotion.ts duplicates LanguagePicker's private hook and ProgramTypeRows' matchMedia: use the one hook.
- [M] Placement: LpAccentBand, LpCtaPair, GlassCard are Platform-only → platform/; ScaledBox generic → shared/; PassFrame → shared/PassFrame.tsx; platform/LpBlogPosts → BlogPostsSection.
- [M] PLAN_SECTIONS and hard-coded counts in registry.test.ts copy the registry: delete, keep the invariants.
- [M] page-visuals vs shared-sections overlapping scope: fold after de-duplication; share-tree block to platform-page.
- [M] Implementation-detail tests (class strings, identifiers, file layout, rootMargin literal, `getAllPosts("en").slice(0, 3)` literal, `hasDemoSection(...) && (<a` shape…): delete or replace with render assertions.
- [M] Duplicate AC15 call-site tables in shared-sections.test.ts: one parametrized table driven by otherCallers.
- [L] Wallet badge pair ×3 → shared WalletBadges; accent headline markup ×3 → AccentText; copied class strings (eyebrow ×4, icon tile ×4, dashed rail ×2, arrow link/h3 ×2, outline trial CTA ×7 → LpTrialButton); inconsistent icon array types.
- [L] Copy outside copy modules: "Every plan" (LevelsSpotlight, SegmentChips), TABS_LABEL "Program type".
- [L] ScanDemo `[cycle, setPhase]` naming; duplicated MotionConfig reduced-motion wrapper in LiveActivityFeed and ScanDemo.
- [L] Comment density: new page.tsx files 2x baseline; modified site components 1.7x (one line per new prop).
- [L] globals.css `lp-float` used only by GlassCard: move next to it.

## Waivers
(filled by the main agent only if the user explicitly waives a finding)
