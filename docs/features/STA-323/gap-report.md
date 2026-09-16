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
| AC12 revoked row skipped | **(c) trigger** / (a) predicate | **Nothing anywhere writes `revoked_at`.** `skipped_no_consent` is an unreachable status. |
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
