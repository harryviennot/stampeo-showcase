# Quality Report: STA-389
REVIEWED: 2026-10-07  DIFF: 10b4d3a (code files only)
VERDICT: FINDINGS (minor), all resolved in the follow-up commit

## Comments
- `lib/middleware-matcher.test.ts` and `middleware.ts:130` called `/join` and
  `/internal` "route handlers"; both are pages. RESOLVED: the test title says
  "non-localized routes", the matcher comment names each kind.
- Test header over-explained (30% comment density vs ~14% in neighbouring lib
  tests). RESOLVED: cut to a four-line header.
- Matcher comment grew to two lines. RESOLVED: one line.

## File size
- None. `lib/consent.test.ts` was already over 800 lines; not split here.

## Folder tree
- `lib/` holds 75 files; a new test at its root has no code beside it.
  RESOLVED: moved to `lib/routing/middleware-matcher.test.ts` (STA-388's
  `card-qr` joins the same folder).

## Flag-gated paths
- None.

## Test shape
- The "restore Bun's navigator" teardown was pasted into two files.
  RESOLVED: `lib/testing/restore-globals.ts` (`restoreGlobalsAfterEach`,
  modelled on `restore-env.ts`), used by both. The shared
  `privacy/__fixtures__/fake-browser.ts` `restore()` had the same leak (it put
  back `fetch` and `Intl` but deleted `navigator`) and now restores it too: it
  is what made the suite's pass depend on file order.
- Test-to-code ratio 20:1 on a one-line regex: accepted, one case per excluded
  segment in each direction.

## Waivers
None.
