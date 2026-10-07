# Gap Report: STA-388
AUDITED: 2026-10-07  DIFF: c8dfa15 (docs excluded)
VERDICT: DRIFT + GAPS FOUND, resolved in the follow-up commit (one AC covered
live only, see AC2)

## Criteria without tests
- AC2 (incoming query dropped): the test called `GET()` with no request.
  RESOLVED BY CONSTRUCTION: `cardQrRedirect()` takes no input, so no query can
  reach the Location; a request-carrying unit test would need an unused
  parameter. Checked live (runbook CQ-04 step 2). Plan amended to say so.
- AC3 (partial): no `/qrious-cafe/l/store` matcher case, no `acquisitionSlug`
  assertion for a `qr`-prefixed slug. RESOLVED: both added
  (`middleware-matcher.test.ts`, `locale-negotiation.test.ts`, parametrized
  over `good-vibe…`, `qrious-cafe`, `joint-burger`, both enrollment shapes).
- AC5 / AC6: live by design. AC5 run on dev 2026-10-07; AC6 is Harry's, after
  the deploy (CQ-02, CQ-03).

## Untested diff behavior
- `export const dynamic = "force-dynamic"`: not unit-testable outside Next.
  Covered by the build (`ƒ /qr`, dynamic) and a `next start` check of the
  built server (302, `no-store`).
- `www.stampeo.app/qr` skips the middleware's www→apex 301. CHECKED: prod
  redirects `www` with a 308 at the edge before Next (verified on `/`,
  `/go/app`, `/pricing?utm_source=x`, query kept). Plan's stale claim fixed;
  runbook CQ-04 step 3 asserts the edge 308.

## Drift (in diff, not in plan)
- `join` in `RESERVED_TOP_SEGMENTS` and the two filesystem guards. RESOLVED:
  plan updated (Decisions + File layout). The guards now go through
  `lib/testing/app-folders.ts`, which skips route groups `(x)`, private `_x`
  folders and file routes, so adding one of those cannot fail CI.

## Suspect tests
None.

## Unrealistic or missing workflow tests
- The redirect test asserted an empty body. RESOLVED: removed.
- Missing: an English or Polish phone keeps all three tags through the
  homepage's language redirect. RESOLVED: `card-qr.test.ts` runs the real
  middleware on the tagged landing URL for en, pl and fr (AC3b).
- HEAD, the `/qr/` 308 chain and `www.`: Next/edge behavior, not unit-testable
  here. Checked live and pinned in the runbook (CQ-01, CQ-04).

## Waivers
None requested. AC2 is covered structurally and live rather than by a unit
test; flagged to Harry.
