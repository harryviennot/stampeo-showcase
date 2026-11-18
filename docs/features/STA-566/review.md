# STA-566 review: Phase A (site events, PostHog hygiene, heatmaps off)

One review, fresh context, 17 Nov 2026, on `feat/sta-566-posthog-journey` (Phase A only: AC13, AC14, H7). No security review:
no auth, billing, Stripe, webhook or migration; the change only removes data from what PostHog receives.

## Coverage (coverage-auditor): 4 BLOCKs → fixed (d431041, 940663f, 57ab01a, 7492808)
- Click ids still reached PostHog through posthog-js's own `$session_entry_<clickid>` properties; the scrub now drops a click
  id after any PostHog prefix, and names the vendor only for a click id that has a value (a ChatGPT landing came out "google").
- The scrub's fixtures were hand-built and hid that; they are now raw events captured from posthog-js on the site's pages
  (`lib/posthog/__fixtures__/`).
- `faq_answer_opened` never fired on the pricing pages (their FAQ is its own markup); now wired, tests on real routes.
- "A failed send never costs the visitor their tap" was untested; now 7 call sites with `capture` throwing.

## Quality (code-quality-reviewer): 4 BLOCKs → fixed
- A history comment and two headers that contradicted the code; `lib/privacy` past 30 entries: the PostHog-only scrub
  moved to `lib/posthog/scrub.ts`.

## Also fixed while there
`session_token` dropped by the scrub itself (the source-scan test is gone); `/join/{code}` gets the `:token` treatment; the
top-level Loyalty link reports `nav_preview_opened`; a double tap in the quiz sends one answer; PostHog sends no
feature-flag request at all (1096d91), since that request carries person properties past the scrub.

## Notes for the PR description
`FAQList` became a client component; `faq` carries the localized question (`position` is the cross-language key); the
legacy quiz and blog FAQs send nothing; scroll depth relies on posthog-js's `$prev_pageview_max_scroll_percentage`.

## Waivers
None.

---

# STA-566 review: Phase B (consent v6, remembered visitors, server steps), 18 Nov 2026

One review per reviewer across the three branches: backend `feat/sta-566-posthog-journey`, showcase
`feat/sta-566-consent-v6`, web `feat/sta-566-consent-v6`.

## Counsel
Harry, 18 Nov: counsel signed off the v6 texts as drafted (refusers' steps counted with no identifier, recordings
under the audience-measurement choice, the in-memory id kept at a grant, withdrawal stops linking without deleting).
The 64 COUNSEL markers were removed and the policy dated 18 November 2026 (933d8ec). One sentence was aligned
afterwards with the approved §5.4: §5.3 names the US exception for PostHog's cookie (6bda652).

## Quality (code-quality-reviewer): 6 BLOCKs → fixed
Five comments contradicting the code (backend `config.py` ×2, `product_analytics/__init__.py`, `queue.py`; showcase
`consent-sync.ts`, `consent.ts`) and `tests/support/product_analytics.py` in a 40-entry folder (moved to
`tests/product_analytics/support.py` + `conftest.py`). Fixed in showcase 3375c00 and backend b6a0a708, with the
NOTEs on `init-options.ts`, `account_deletion.py` and `consent.test.ts`. Remaining NOTEs (test duplication across
levels, copied setup, constant-restating tests) go to the PR description.

## Security (security-reviewer): no BLOCK; 4 MED + 7 LOW
Fixed before merge (they contradicted the signed-off text or are cheap):
- MED an email shown on the sign-up step could reach PostHog through autocapture → `ph-no-capture` + email scrub.
- MED unlinked steps used the outbox row id as uuid and distinct id → random event uuid, cleared at a final
  status; unlinked timestamps rounded to the hour.
- MED a second account in the same browser re-identified the same browser id → browser reset after sign-up and a
  server-side one-account-per-browser-id guard.
- MED deletions defaulted to PostHog's `@current` project → explicit numeric project id; failed deletions alert.
- LOW GPC is a PostHog refusal whatever the GA4 setting; identify payload cleared on every final status; browser
  ids added to Sentry's PII names.
Follow-ups in STA-572: deletion gaps (no business, hard-delete routes, secret rotation, ops erase path), old grants
linking, campaign fields, release order.

## Coverage (coverage-auditor): 1 BLOCK → resolved
- BLOCK the legal texts carry no COUNSEL marker although the plan requires them → resolved by counsel's sign-off
  (above), not waived.
Fixed as AC/policy gaps: tier and interval only on plan steps (§5.4 wording); `first_payment` from the reconcile
sweep and `first_test_stamp` from the legacy mirror; `subscription_ended` only at the real end, dated by Stripe;
`$identify` deferred, not dropped, when the ledger is unreadable; the cookie never outlives the grant; no reload of
another tab for a consent change that doesn't touch PostHog; sign-up tests on `/onboarding`.
Remaining NOTEs (PR description, STA-572 or B5 QA): the server `$identify` merge and erasure of a never-held key are
B5 QA; once-only steps of a business older than 395 days; weekly counts not retried; lease-lost and
`failed_permanent` paths untested; the reseller-discount quote stubbed; §8's retention figures depend on B5's
PostHog settings, which must be set before release.

## Security re-check (same reviewer, targeted)
All 4 MED and the 3 LOW fixes RESOLVED (showcase 9212de5, 42ccbe9; backend 6d8e14da, 44d99b2b, 4ee49b18). Four new
LOWs, fixed in backend 92d922ff: unlinked rows lose their attempt times and keep hour-cut `occurred_at`/`created_at`
(no join by send time); nobody is linked unless their PostHog erasure could run (`deletion_configured()`);
`event_uuid`, `distinct_id` and `uuid` added to Sentry's PII names; migration 240 adds its new columns with
`ADD COLUMN IF NOT EXISTS` so an earlier run upgrades. Open, in STA-572: a US visitor with no choice who lands on a
private page is never linked (less than the policy allows; fails safe).

## Waivers (Phase B)
None.
