# Gap Report: STA-323

AUDITED: 2026-09-16 (coverage-auditor, fresh context: plan + diff + tests only)
DIFF: `3f1aba4` (backend) + `905db84` (showcase) + `d7c6523` (web)
VERDICT: **GAPS FOUND + DRIFT FOUND**

Legend: (a) implemented and tested · (b) implemented, untested · (c) not
implemented · (d) untestable at this layer, deferred to manual QA.

## AC-by-AC

| AC | Verdict | Note |
|---|---|---|
| AC1 cookie written with the arrival | (a) content / (b) carrier | `attributionCookieAttributes` and `writeAttributionRecord` are imported by NO test. The `.stampeo.app` scoping is the single point the design rests on, and only AT-01/AT-04 would catch a host-only regression. `consent.test.ts` pins its own cookie's Domain; this does not. |
| AC2 no consent captures nothing | (a) | |
| AC3 marketing only → no GA client id | (a) | Negative half asserted explicitly. |
| AC4 cookie → row | (b) + (d) | Mapping tested; `store_attribution`'s upsert, the route call site and web's forwarding are not. |
| AC5 no cookie → creation succeeds | (b) + (d) | Only `validate_attribution(None)` covered. The AC is about the route. |
| AC6 exactly one `sign_up` | (b) | No test touches `send_conversion`/`_send_one`/`_claim`/`_finish`. |
| AC7 one `purchase` with value+currency | (b) + **DEFECT** | See below. |
| AC8 replay sends no second | (b) + (d) | Idempotency rests on an untested assumption that supabase-py RAISES on PK conflict. If it returns an error object instead, `_claim` returns True and a duplicate is sent. |
| AC9 checkout.session.completed sends nothing | (b) | Correct by omission; absence never asserted. Defeated in practice by the AC7 defect. |
| AC10 forged cookie rejected | (a) partly / **(c) partly** | `consent_version` is only `isinstance(int)` — never compared to the live `CONSENT_VERSION`. The plan's "a `consent_at` in the future is rejected" was never implemented. |
| AC11 revoke deletes the carrier | (b) | `consent.test.ts` was NOT updated. Its fixtures omit the cookie and its assertions are exact, so deleting the new `COOKIE_PATTERNS` entry breaks no test. |
| AC12 revoked row skipped | (a) — closed after review | Trigger built: `revoke_attribution` + owner-scoped endpoint + `AdAttributionRevoker`. Covered by `TestRevokeAttribution` and `web/src/lib/consent-state.test.ts`. |
| AC13 no API secret → nothing sent | (b) + (d) | No test sets or clears the setting. |
| AC14 deletion removes rows | (b) + (d) | `test_account_deletion.py` still asserts only the three original tables. Removing either new table breaks no test — the exact "silent skip" the plan names as the risk. |

## The AC7 defect, in full

Stripe fires `invoice.paid` with `amount_paid == 0` for the trial-opening
`subscription_create` invoice, and **this module already knows it**:
`invoice_paid_sends_receipt` and `resolve_invoice_paid_updates` both guard on
`amount_paid > 0`. The STA-323 call has no such guard, so it sends `purchase`
with `value=0.0` at trial start and the primary key then makes the real first
payment a silent no-op.

That is exactly what AC9 and the plan's decision ("Reporting that as revenue
teaches the bidder to buy trials") exist to prevent, arriving through the other
event. AT-08 as written would NOT catch it — it finds one `purchase` row with
status `sent`, and never checks the value.

## Untested diff behavior (risk-ordered)

1. `billing.py` — the zero-value trial invoice above.
2. `_claim` — idempotency rests on an untested supabase-py exception assumption.
3. Synchronous `httpx.post` with a 5s timeout, inline in `POST /businesses` and
   inline in the Stripe handler. The plan's "Attribution never blocks the user"
   is not what shipped.
4. `_client_id` — the comment claims "Deterministic, so a replay derives the
   same id", but Python's `hash()` for `str` is salted per process. Two workers,
   or one worker after a restart, derive different ids for the same gclid, so
   GA4 invents a second user and `sign_up`/`purchase` never join. The test
   asserts only truthiness — written so it cannot catch this.
5. `_as_datetime`'s string branch: PostgREST returns `captured_at` as an ISO
   string, but every staleness test passes a `datetime`. The branch that always
   runs in production is never exercised.
6. `send_conversion` adds a DB round trip to ~100% of signups that have no
   attribution.
7. web's forwarding branch.
8. `AttributionCapture`'s 3s poll — (d) by construction, but a marketing-only
   visitor writes immediately and may race `LandingTracker`'s
   `document.body.dataset.landingVariant`, silently losing `landing_variant`.
9. A crash between `_claim` and `_finish` leaves a row permanently
   `status='failed', detail='in flight'`, never retried.

## Drift

- **First-touch-wins on the client contradicts the plan's "last touch wins".**
  `writeAttributionRecord` refuses to overwrite for six months, so the backend's
  `ON CONFLICT DO UPDATE` and the multi-vendor story are unreachable for the
  same browser.
- **The plan's "cookie too large → oldest vendor dropped" was never built.** One
  record, no size check, no test, no QA case.
- **Two rejection rules not in the plan**: `marketing` without a click id, and
  `direct` with one. Tested, but they discard rows the plan's schema accepts.
- `LandingTracker` publishing `document.body.dataset.landingVariant` is a new
  cross-tree DOM seam the plan does not mention.
- **The cookie is never consumed after a business is created.** A second
  business from the same browser reuses the click id and fires a second
  `sign_up`.
- The branch also carries STA-318/STA-319 work (`905db84`), which the STA-323
  plan scopes out. Known and accepted: the three issues share a branch.

## Suspect tests — tests that pass for the wrong reason

- `ad-attribution.test.ts` "a forged vendor is rejected" — **cannot fail.** The
  payload uses key `vendor`, the parser reads `vn`, and the payload omits `lp`
  which the parser requires. Delete the `VENDORS` allowlist entirely and it
  still passes.
- "a forged consent category is rejected" — same defect; returns null at the
  vendor check, so the category branch it names is never reached.
- "a record from an older version is discarded" — passes version+1 (newer), and
  is null for two other reasons.
- `test_payload_never_contains_personal_identifiers` — a tautology. Nothing in
  the diff could make it fail.
- `test_a_row_at_the_window_edge_still_sends` uses `WINDOW - 1`, not the
  boundary; `>` vs `>=` is untested.
- The backend docstring claims "takes an injected `db`, so a tiny stub stands
  in" — no such test exists, and `SimpleNamespace` is imported and never used.
  The docstring makes the file read as if AC6/AC8/AC12/AC13 were covered.

No test was weakened. `consent.test.ts` and `test_account_deletion.py` were left
untouched — which is the AC11/AC14 gap, not a weakening.

## Waivers

None.

---

# Addendum — 2026-09-20: remaining gaps closed

The AC table above is the audit as written on 2026-09-16. Rather than trust it,
every row it left open was **re-checked by mutation** against the code as it
stands today: the guard was deleted, the suite re-run, and the row only marked
closed once the suite went red.

| AC | Was | Now | Evidence |
|---|---|---|---|
| AC1 carrier | `attributionCookieAttributes` / `writeAttributionRecord` imported by no test | **closed** | `describe("the attribution cookie as a carrier")` in `lib/ad-attribution.test.ts`. Mutations CAUGHT: Domain attribute dropped · Domain omitted from the Set-Cookie string · first-touch-wins removed · SameSite tightened to Strict · Max-Age cut to an hour · blocked-storage guard removed. |
| AC8 idempotency | rested on an untested assumption that supabase-py raises on PK conflict | **closed, assumption verified** | The assumption is correct, checked against the installed library rather than reasoned about: `postgrest.SyncQueryRequestBuilder.execute` raises `APIError` on any non-2xx, and PostgREST answers a PK conflict with 409. `TestClaimIsTheIdempotencyGuarantee` pins it. Mutations CAUGHT: `_claim` returns True on conflict · claim row no longer in-flight · claim result ignored. |
| AC11 cookie clearing | `consent.test.ts` untouched; deleting the `COOKIE_PATTERNS` entry broke nothing | **closed (fixed earlier)** | Mutation CAUGHT: `stampeo_attribution` dropped from both categories. |
| AC14 deletion | `test_account_deletion.py` asserted only the three original tables | **closed (fixed earlier)** | Mutations CAUGHT: either table dropped from `_CONTENT_TABLES`. |

Writing the AC8 tests exposed a second defect in the process: `_FakeQuery` had
no `insert` method, so `.insert(...)` raised `AttributeError` and `_claim`'s
bare `except Exception` swallowed it. The first version of the test therefore
"passed" the conflict case for entirely the wrong reason. `insert()` was added
to the shared stub; no existing assertion was weakened.

## Still open, deliberately

- **Untested #3, the synchronous `httpx.post`** inline in `POST /businesses`
  and in the Stripe handler. Not a new defect: `handle_invoice_paid` already
  makes a synchronous `resend.Emails.send()` call, so this adds a second
  blocking call to a handler that was already blocking. Timeout reduced 5s → 2s
  rather than rebuilding the call path. Worth a follow-up issue, not a blocker.
- **AC4/AC5/AC6/AC13 route-level behaviour** — `(d)` in the table above,
  genuinely untestable at the unit layer. Covered by runbook cases AT-01→AT-10
  in `docs/qa/cookie-consent.md`, which have not yet been executed.

## Verification at close

- backend `pytest tests/` — **2467 passed**
- showcase `bun test lib` — **657 passed**
- web `bun test src` — **1091 passed**
- showcase + web `bun run type-check` — clean; `bun run build` — both succeed
- dev DB: `business_ad_attribution` and `business_ad_conversion` both report
  `rowsecurity = true` with **0 policies** — the intended backend-only posture,
  closing the security review's HIGH finding on dev. **Prod still pending**, via
  PR to `main` only.
