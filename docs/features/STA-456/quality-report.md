# Quality Report: STA-456
REVIEWED: 2026-10-13  DIFF: origin/dev...feat/sta-456-in-app-signup (892719f..300eac5)
VERDICT: FINDINGS (minor; nothing blocking)

## Comments
- hooks/useInAppBrowser.ts:6-10: the hook's docblock sits above `let cached`; move it above `export function useInAppBrowser`.
- components/onboarding/steps/InAppAuthChooser.tsx:24-29: 5-line narrative docblock; neighbours use 0-1 lines. Trim to one line (component comment density 1.7x baseline, mostly this block).
- No history narration; no comment contradicts the code.

## File size
- None. AuthenticationStep.tsx 554 → 550; OnboardingWizard.tsx 281 → 321; reset-password/page.tsx 334 → 305.

## Folder tree
- None (lib/auth 21 files).

## Flag-gated paths
- None; one dispatch point in AuthenticationStep's "choose" phase.

## Test shape
- browser-escape.test.ts: "page going hidden" / "page being unloaded" duplicate → one test.each; copied setup ×5 → a start() helper; `advance(1499); advance(1)` asserts nothing in between.
- escape-params.test.ts:50-55 and 76-79 duplicate.
- onboarding-resume.test.ts:76-78 and password-rules.test.ts:29-31 assert constants already pinned by behaviour tests → delete.

## Out of scope notes
- `"signup" | "signin"` defined twice (VerifyMode in a component, ResumeVerifyMode in lib) → one definition in lib.
- Copy: `emailSubtitle` / `passwordPlaceholder` still say "strong password" in all 4 locales.
- Possible hydration mismatch in the wizard's lazy resume read (checked by the coordinator: the wizard renders under Suspense with useSearchParams, client-only).

## Waivers
(none)

---

# Quality Report: STA-456, final pass
REVIEWED: 2026-10-13  DIFF: origin/dev...feat/sta-456-in-app-signup (HEAD 235bcd5)
VERDICT: FINDINGS (minor)

## Previous findings
All fixed (docblocks, test.each, start() helper, the 1499 ms assertion, merged duplicates, constant-only tests, a single VerifyMode). The "strong password" copy is moot after the revert.

## New
- BrowserEscapeGuide.tsx:23-30: 8-line docblock → one line; it claims a focus trap, Escape and an inert page, which hold only on the `showModal()` path, not the `open`-attribute fallback.
- lib/dom/body-scroll-lock.ts says "Locks nest", but Header.tsx:251-261 runs its own `overflow` lock, and the test names its first lock `releaseMenu`. Move Header onto `lockBodyScroll()` or rename the test.
- onboarding-resume.test.ts:139: the test name "leaves the flow as it is today" will go stale.
- Component comment density 1.7x baseline (mostly the guide docblock).
File size, folder tree, flag paths and test shape: none.
