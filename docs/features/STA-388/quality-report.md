# Quality Report: STA-388
REVIEWED: 2026-10-07  DIFF: c8dfa15 (docs excluded)
VERDICT: FINDINGS (minor), all resolved in the follow-up commit

## Comments
- `card-qr.test.ts` header repeated `card-qr.ts`'s docblock. RESOLVED: one line.
- `locale-negotiation.ts:113` called `join` a "route handler" (it is a page).
  RESOLVED: "Top-level folders in app/ outside [locale]".
- `locale-negotiation.ts:87` said the test diffs against `app/[locale]/` only.
  RESOLVED: names both directories.

## File size
None.

## Folder tree
None. New lib code in `lib/routing/`; new helper in `lib/testing/`.

## Flag-gated paths
None.

## Test shape
- Two near-identical reserved-folder tests. RESOLVED: one `test.each` over
  `[locale]` and the app root.
- The `app/` folder walk was copied three times. RESOLVED:
  `lib/testing/app-folders.ts` (`staticSegments`).
- `toContain("qr")` tied the generic guards to this feature. RESOLVED:
  `length > 0`; `/qr` stays pinned by its explicit cases.
- The only test importing from `app/`. RESOLVED: tests `cardQrRedirect` (the
  repo's thin-route pattern).

## Waivers
None.
