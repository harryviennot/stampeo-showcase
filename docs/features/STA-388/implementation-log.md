# STA-388 implementation log

- Phase 0: plan approved 2026-10-07 (Harry), with `utm_campaign` added. UX
  DESIGN pass skipped: no screen is added or changed (server redirect onto the
  unchanged homepage).
- Phase 1: tests written first and run failing for the right reason (6 fails:
  `qr` not routed, not skipped, not reserved).
- Phase 2: `app/qr/route.ts` -> `lib/routing/card-qr.ts`; `qr` in the matcher
  and `RESERVED_TOP_SEGMENTS`. `join` added to the reserved set too: the new
  filesystem-driven test requires every top-level app folder to be reserved,
  and `join` was the one missing (no behavior change: the matcher already
  skips it).
- Phase 3: UX POLISH skipped, same reason as DESIGN.
- Phase 4: coverage-auditor (`gap-report.md`) and code-quality-reviewer
  (`quality-report.md`) on c8dfa15; every finding resolved in the follow-up
  commit, AC2 covered by construction + live. Security reviewer not triggered
  (no auth, billing, webhook or migration path).
- Build (clean worktree, CI-equivalent): `bun run lint` 0 errors (6 pre-existing
  warnings in untouched files), `tsc` clean, `bun run build` passes with `ƒ /qr`
  (dynamic); `next start` on the build answers `/qr` 302 + `no-store`.
- Phase 5: `docs/qa/public-urls.md`, CQ-01..04.
- Live on dev 2026-10-07 (AC5): HEAD and GET `/qr` -> 302, fixed Location,
  `no-store`; `/qr?ref=x` same Location; `/qr/` 308 -> `/qr`; `curl -L` for
  fr/en/pl ends 200 on `/`, `/en`, `/pl` with all three tags; same on
  `showcase.dev.stampeo.app`. `/go/app` and `/golden-hour-coffee` unchanged.
- Phase 6 (Harry, prod, after deploy): CQ-02 phone scans, CQ-03 analytics.

## Implementation checklist

DIFF REVIEWED AGAINST THIS LIST: 2026-10-07
N/A ITEMS AND WHY:
- Input validation: the handler reads nothing from the request.
- Authorization / IDOR: public redirect, no data behind it.
- i18n strings: no copy.
- Migrations and the whole Stampeo trap list (CHECK constraints, COALESCE,
  enum maps, stamp columns, pass re-download, liveness, tier gates, Stripe
  objects, auth rate limits, one-active-program): no backend, data or pass code.
- Flag-gated rewrite: no flag.
Applicable and checked: no secrets; comments describe the code as it is;
middleware.ts 136 lines, locale-negotiation.ts 180; new code in a new
`lib/routing/` folder (lib/ holds 75+ files); tests parametrized and driven
through the real `GET` and the real matcher `config`.
