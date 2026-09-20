# Gap Report — STA-324 (consent ledger)

AUDITED: 2026-09-20 (Phase 3, fresh-context `coverage-auditor`)
INPUTS: `plan.md`, the implementation diff, the test diff
VERDICT AT AUDIT: **GAPS FOUND + DRIFT FOUND**
STATUS NOW: **all gaps closed**, each fix mutation-verified.

## A correction to the audit's own inputs

The diffs I supplied were incomplete: several files were untracked, so
`git diff` omitted them and the auditor read them from disk instead. It said so
in its report — correctly — and flagged that "existing assertions weakened" was
therefore unverifiable for four files. It is worth recording that this was my
error in preparing the inputs, not a defect in the work, and that no assertion
was in fact weakened: every change below is additive except two test
corrections, both described.

## Gaps and resolutions

| # | Gap | AC | Resolution |
|---|-----|----|-----------|
| 1 | `record_decision` — the only function that writes a row — had **no test**, while the `_FakeDb` harness it needed sat unused | AC1 | `TestRecordDecision`, 6 tests. Also pins that it writes to `consent_records` and nowhere else, and never updates or deletes. |
| 2 | AC3 (v1 decision → v2 decision → two rows, first unchanged) pinned by nothing | AC3 | `test_two_decisions_append_rather_than_replace`. The append-only claim at the heart of the issue now has a test. |
| 3 | The endpoint itself was entirely untested — raw-body parse, always-204, rate limit | AC6–AC8 | New `tests/test_consent_endpoint.py`, 9 tests over a real `TestClient`. |
| 4 | **No payload cap**, despite the plan promising one | AC7 | 4 KB cap checked against `Content-Length` *before* the body is read. **Found independently**: a 5 MB body made the endpoint hang for 60 s with no response. |
| 5 | AC11 "proved" against a hard `DELETE FROM businesses` — which is **not what the product does** | AC11 | See "The finding that mattered most" below. |
| 6 | AC12 had no repo-wide pin | AC12 | `TestAppendOnlyIsEnforcedRepoWide` walks `app/` and fails if any module outside a named allowlist touches the table. **Mutation: a rogue module added → CAUGHT.** |
| 7 | The showcase forged-subject test passed for the wrong reason — every input failed UUID parsing, so the v4 version/variant check was never exercised | AC9 | Added v1, v3 and bad-variant cases. **Mutation: v4 constraints dropped → CAUGHT** (previously MISSED). Same defect class as STA-318 and STA-323; the third time, so it is now the first thing checked. |
| 8 | `version: record.v ?? CONSENT_VERSION` was indistinguishable from a hardcoded constant — every fixture used the current version | plan.md:137 | A fixture at `CONSENT_VERSION - 1`. **Mutation: version hardcoded → CAUGHT.** |
| 9 | The four new retention tests sat **after** the module's `__main__` self-runner, so running the file directly reported PASS while silently skipping them | — | Moved above it. Verified in both modes: 8 under pytest, 8 under direct execution. |

## The finding that mattered most

The audits disagreed with each other about AC11, and the security reviewer was
right.

I had "proved" that deleting a business leaves consent records intact by
running `DELETE FROM businesses`. The product never does that. `purge_business_data`
**anonymises the business and scrubs the user in place** — both are UPDATEs, so
the `ON DELETE SET NULL` cascade never fires at all. `user_id` and `business_id`
would have survived erasure, still joinable to billing records kept for ten
years, on the one table declared exempt from erasure.

Worse, the privacy policy I had already written says, in four languages, that
"the account link is removed and the record remains, describing a decision and
no longer an identifiable person". That sentence was false as implemented.

Fixed by an explicit unlink in `purge_business_data`, which is now the third
permitted writer under AC12 — it clears the two link columns and touches no
part of the decision. Verified against the **real** purge path, not a hard
delete: `business_id → None`, `user_id → None`, decision intact, row surviving.

This is the integration-level version of the same trap the unit tests keep
producing: an assertion that passes because the scenario it sets up is not the
one that happens in production.

## Drift folded back into plan.md

- **AC12 contradicted AC10.** The plan demanded "the application never UPDATEs"
  while also requiring anonymous rows to be linked at signup, which is an
  UPDATE. Resolved as a column-scoped carve-out naming all permitted writers,
  not as a weakening — both permitted updates can only write
  `user_id`/`business_id`.
- Migrations **175** and **176** added (plan said 174, singular).
- **`web/` is touched** (plan said showcase + backend). AC10's linking happens
  where the business is created, which is the dashboard.
- `app/services/retention_cleanup.py` added to the touched-areas list.
- AC13 and AC14 added for the two security findings that changed behaviour.

## Accepted, not fixed

- **`readConsentSubjectId` in `web/` duplicates `readSubjectId` in showcase**,
  including a second copy of the UUID regex. Consistent with how `web/` already
  treats `consent-state.ts` (a deliberate non-port, documented in that file's
  header since STA-323). Both are tested independently; a drift test across
  repos would need a shared package, which is a larger change than this issue.
- **The `is_("business_id", "null")` filter is asserted against a fake that
  records whatever it is handed.** A genuine limitation: the fake defines what
  `"null"` means. Mitigated by the live verification above, which exercised the
  real PostgREST client end to end.

## Verification

- backend `pytest tests/` — **2517 passed**
- showcase `bun test lib` — **693 passed**; web `bun test src` — **1097 passed**
- type-check clean in both; web lint clean
- Live on dev: endpoint writes rows, refusals recorded, forged payloads rejected,
  forged subject ids replaced, unlink-on-erasure confirmed against the real
  purge path, and the prune rule verified across four fixture shapes.

## Waivers

None.
