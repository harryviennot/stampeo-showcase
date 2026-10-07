# STA-389 fix log

- F0 failure report: `failure-reports/prefixed-slug-404.md`.
- F1 regression test: `lib/middleware-matcher.test.ts`, run through Next's own
  matcher (`unstable_doesMiddlewareMatch`). Failed 6/7 shop cases before the fix.
- F2 fix: `middleware.ts` matcher, each excluded name matched as a whole first
  segment (`(?:api|…)(?:/|$)`). Live on local dev: `/golden-hour-coffee` 404
  before, 200 after.
- Test isolation: `lib/consent.test.ts` and `lib/consent-carry-forward.test.ts`
  deleted Bun's own `navigator` after each test, and Next's matcher helper reads
  it at import, so the new test errored in the full run (alone it passed). Both
  now put the runtime's `navigator` back. Full suite: 2183 pass, 0 fail.
- F3 UX polish: skipped. No UI changed; the shop page itself is untouched.
- F4 audit: coverage-auditor and security-reviewer skipped (11-line product
  diff, no auth/billing/webhook/migration path). code-quality-reviewer run
  because the diff adds a file.
- F5 runbook: new `docs/qa/public-urls.md`, SU-01..03. SU-02 is the case that
  would have caught this; re-run it on prod after the deploy.

## Implementation checklist

DIFF REVIEWED AGAINST THIS LIST: 2026-10-07
N/A ITEMS AND WHY:
- Input validation / authorization / IDOR: no route added or changed.
- i18n strings: no copy.
- Migrations, CHECK constraints, COALESCE, enum maps, stamp columns, pass
  re-download, liveness, tier gates, Stripe objects, auth rate limits,
  one-active-program: the diff is one middleware matcher string.
Applicable and checked: no secrets; comment describes the matcher as it is;
middleware.ts stays at 136 lines; `lib/` already holds its tests flat beside
the code; the test is parametrized and drives the real `config`.
