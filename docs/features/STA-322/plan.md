# Plan: Meta conversions to parity with Google — CAPI sender + the vendor leak

ISSUE: STA-322 (https://linear.app/stampeo/issue/STA-322/server-side-conversion-events-meta-capi-google-tiktok-from-the-stripe)
DEPENDS ON: STA-323 (attribution funnel) — the pipeline this rides on. STA-319 (Meta pixel) — the browser half. STA-317 (consent) — MERGED.
BRANCH: `harryviennot2/sta-322-meta-capi-sender`
REPOS: **backend** (the sender, the bulk) + **showcase** (capture `_fbp`)
MIGRATION: **yes** — `177_conversion_status_no_sender.sql`. Corrected from "no":
`business_ad_attribution` is indeed vendor-generic, but
`business_ad_conversion.status` carries a CHECK constraint
(`'sent','failed','skipped_stale','skipped_no_consent'`), so the new
`skipped_no_sender` status cannot be written without extending it. Folding it
into `failed` was rejected — migration 172's own comment says `skipped_*` rows
exist so "we never tried" and "we tried and the platform refused" stay
distinguishable, and a vendor with no sender is squarely the former.
STATUS: APPROVED (2026-09-21, by the user — "lets go and do stage one and 2 together along with the fix")

> Approved as ONE issue covering the vendor-leak fix and the Meta sender
> together, rather than splitting the fix onto STA-323. The leak regression test
> is still written and watched to fail FIRST, before any sender code exists.

## Problem

STA-323 built the whole cross-domain funnel and it works — for Google. The
pipeline is vendor-generic in storage and Google-only in delivery:

```
ad click (?gclid | ?fbclid)
  → showcase  AttributionCapture → stampeo_attribution cookie on .stampeo.app
  → web/      reads it at business creation, POSTs to backend
  → backend   business_ad_attribution, one row per (business, vendor)
  → backend   sign_up   at business creation   (businesses.py:274)
  → backend   purchase  at invoice paid        (billing.py:1722)
```

Meta's half stops at the showcase boundary: `PageView`, `Lead`, `Contact` from
the pixel, then nothing. So Meta campaigns optimise against a CTA click, CAC is
unknowable and ROAS is unmeasurable — the exact thing this epic exists to fix.

STA-323 declared Meta CAPI a Non-goal and said "adding Meta is then a sender,
not a schema change". That is true, and this issue is that sender. But the
implementation did not honour the Google-only intent, which produces the defect
below.

## THE DEFECT — fix this first, it is live

`send_conversion` → `_send_one` → `build_conversion_payload` contain **no vendor
filter**. `vendor` is used only for bookkeeping (the claim slot and the status
row). Every row is POSTed to the GA4 Measurement Protocol, and
`build_conversion_payload` does:

```python
if row.get("click_id"):
    params["gclid"] = row["click_id"]      # ← for ANY vendor
```

So a visitor who arrives on `?fbclid=…` gets `vendor='meta'`, and at invoice
paid their **Meta click id is sent to Google, labelled as a gclid**.

Three consequences, all bad, none visible:

1. **GA4 is polluted.** It receives a conversion carrying a `gclid` that is not
   a Google click id and can never be joined to a Google ad. It lands as a junk
   conversion against Google's attribution — the direct answer to "does this
   interfere with Google Analytics": today, yes.
2. **A Meta identifier is disclosed to Google.** Not a consent violation of the
   *category* (the visitor consented to marketing), but it is a disclosure to a
   recipient the privacy policy does not name for that identifier.
3. **It is silent.** `_send_one` records `status="sent"` on any 2xx, and the
   Measurement Protocol 204s almost unconditionally. The `business_ad_conversion`
   table therefore fills with `sent` rows that delivered nothing useful.

**It is untested.** `tests/test_ad_attribution.py` uses only `vendor="google"`
and `vendor="direct"`. No test constructs a `meta` row, which is why the gap
report for STA-323 did not catch this either.

This gets a regression test and a fix **before** the Meta sender is written.
Building the new sender first would mean building it on top of a path that is
already mis-delivering Meta data.

## Decisions

### Sequencing

- **Two stages in one issue, fix first.** Stage 1: vendor-gate the existing
  sender so only `google` and `direct` reach GA4, with a regression test that
  fails on today's code. Stage 2: the Meta sender. Stage 1 is independently
  correct and shippable — if Stage 2 slips, the leak is still closed.
- **GA4's behaviour does not change.** Same endpoint, same payload, same inline
  no-retry 2s-timeout posture, same dormant default. `direct` rows continue to
  go to GA4: an organic signup carrying a GA client id is a legitimate GA4
  conversion, and it is the only vendor whose rows have no click id.

### The sender

- **Dispatch on vendor, not a chain of ifs.** A `vendor → sender` mapping, so a
  vendor with no sender is a recorded no-op (`skipped_no_sender`) rather than a
  fall-through to whatever endpoint happens to be first. TikTok then becomes a
  table entry. The fall-through is precisely what caused the defect.
- **Per-vendor event names.** The stored `EventName` stays GA4-shaped
  (`sign_up` | `purchase`) because it is the database's vocabulary and is in a
  CHECK constraint. Each sender maps it: Meta gets `CompleteRegistration` and
  `Purchase`.
- **`fbc` must be constructed, not forwarded.** Meta does not accept a raw
  `fbclid`; it wants `fb.1.<click_timestamp_ms>.<fbclid>`. `captured_at` is the
  closest honest timestamp we hold (capture happens on the landing page, within
  seconds of the click). A raw fbclid in the `fbc` field silently fails to match.
- **`event_id` is deterministic**, derived from `(business_id, vendor,
  event_name)`. Meta dedups browser and server events on `event_name` +
  `event_id`, and a deterministic id means a replay cannot double-count even if
  the claim row were ever lost. Today's browser events (`Lead`, `Contact`) share
  no name with the server events, so there is nothing to collide with yet — this
  is for when `Purchase` eventually exists on both sides.
- **Dormant by default.** No access token or no pixel id → return, exactly as
  `ga4_api_secret` already gates GA4. Local, CI and production-before-the-secret
  all behave identically.
- **ONE token across all environments, so the environment guard is fail-closed.**
  Meta's Events Manager issues a single access token per dataset, and we are not
  going to have a dev credential and a prod credential. That means dev, CI and
  production all hold a token that writes into the **same** dataset, and the only
  thing separating dev traffic from production reporting is the Test Event Code.

  This **inverts the safety default the rest of this codebase relies on.**
  Everywhere else, unset means safe: no pixel id, no tag; no API secret, dormant.
  Here a *missing* `meta_test_event_code` outside production is the dangerous
  state — dev signups would land in real campaign reporting and corrupt the ROAS
  number this epic exists to produce. So it is enforced, not documented:

  - **Outside production, refuse to send without a test event code.**
    `settings.environment != "production" and not settings.meta_test_event_code`
    → return, like any other dormant case. A dev box that forgets the code sends
    nothing, which is the harmless failure.
  - **In production, never attach the code even if it is set.** Meta excludes
    test events from reporting, so a stray code in prod would silently discard
    every real conversion — the same hazard `ga4_debug_mode` carries, in the same
    direction. Ignore it and log loudly rather than trusting configuration.

  `settings.environment` already exists (`app/core/config.py:247`) and
  `== "production"` is the established idiom (`impersonation.py:164`).
- **A configuration gap must not consume the idempotency slot.** Found while
  verifying Google and Meta side by side, and a regression this issue
  introduced rather than inherited. The primary key on
  `business_ad_conversion` is one-shot: once a row exists for
  (business, vendor, event), nothing can ever be sent for it again. That is
  right for a delivered conversion and wrong for "the credentials were missing
  at the time", which is temporary and fixable.

  Because `send_conversion` now proceeds when ANY vendor is configured (it
  previously returned early on GA4 alone), a row for the *other*, unconfigured
  vendor reached the claim and burned its slot. In development that is the
  DEFAULT state — Meta is suppressed without a test event code — so every Meta
  row would have been undeliverable before anyone could test one, including
  every MC runbook case.

  So sender readiness is checked BEFORE the claim: an unconfigured vendor logs
  and returns, leaving no row. An absent row is recoverable; a row is not. A
  vendor with no integration at all (TikTok) is still recorded, because that
  cannot change without a deploy.
- **Consent still governs, unchanged.** `should_send_conversion` already
  short-circuits on `revoked_at` and on a stale click id; both apply to Meta
  without modification. CAPI is not a consent loophole.

### The capture side (showcase)

- **`_fbp` becomes the `browser_id` for Meta rows.** Migration 172's own comment
  already says `browser_id` is "the GA4 client id / _fbp / _ttp", but
  `buildAttributionRecord` hard-codes the GA client id for every vendor. So a
  `meta` row currently carries a *Google* identifier in the field Meta would be
  matched on. Making it vendor-specific is what the schema always intended.
- **`_fbp` is gated on MARKETING consent, not analytics.** This is the subtle
  one. Today `browserId = input.consent.analytics ? input.gaClientId : null`,
  which is right for GA4 — `_ga`/`_gid` are in `COOKIE_PATTERNS.analytics`. But
  `_fbp` is in `COOKIE_PATTERNS.marketing`. Reusing the analytics gate for
  `_fbp` would store a marketing identifier on analytics consent. The gate has
  to become per-vendor, and `consentCategory` on the record has to reflect which
  category actually bought the field.
- **`_fbp` needs the same arrival wait as `_ga`.** `AttributionCapture` polls up
  to `GA_WAIT_MS` for the `_ga` cookie because capture is first-touch-wins and a
  premature write is permanent. `_fbp` appears a tick after `fbevents.js`
  executes, with the same race. The poll condition currently keys off `analytics`
  alone and must also wait when `marketing` is granted and `_fbp` is absent.

## Non-goals

- **TikTok Events API.** The dispatch table makes it an entry; STA-320 has not
  even installed the pixel. Not here.
- **Google Ads offline conversion import via gclid.** Still the ads consultant's
  call, as STA-318 noted.
- **Changing GA4's payload, endpoint, retry posture or event names.**
- **Meta advanced matching (email/phone).** Automatic matching stays off per
  STA-319. Sending hashed contact details server-side is a *bigger* disclosure
  than the browser version and needs its own decision and policy text.
- **Backfilling conversions for businesses that already signed up.** The window
  has closed on their click ids and the rows were already marked `sent`.
- **A retry queue.** Same reasoning as STA-323: a retry loop inside a Stripe
  webhook risks the webhook timing out, which turns a missed conversion into a
  billing problem. Failures are recorded, not retried.
- **Multi-touch attribution.** One row per business per vendor, unchanged.

## Edge cases considered

- `meta` row, no access token configured: recorded `skipped_no_sender` (or the
  dormant early return), never sent to GA4.
- `tiktok` row today: no sender, recorded and dropped. **This is the defect's
  other half** — it is currently going to Google too.
- `direct` row: GA4 only, as now. No Meta send, because there is no `fbclid` and
  `_fbp` alone attributes nothing Meta can bill against.
- A visitor with both `gclid` and `fbclid`: `vendorForClickIds` picks Google by
  priority and writes ONE row, so Meta never learns about them. Pre-existing
  STA-323 behaviour, deliberately unchanged here — noted because it caps Meta's
  observed conversion count and someone will eventually ask why.
- Marketing refused, analytics accepted: no `fbclid`, no `_fbp`, `vendor='direct'`.
  Meta gets nothing, correctly.
- Analytics refused, marketing accepted: `fbclid` captured, no GA client id.
  Meta row with a click id and no `browser_id` — must still send.
- Click id older than `CLICK_ID_WINDOW_DAYS` (90): already `skipped_stale`.
  Meta's own attribution windows are shorter, so 90 days is conservative in the
  right direction.
- `_fbp` present but the pixel was blocked mid-load: `fbclid` alone is enough
  for CAPI. Match quality drops; the event still lands.
- Business deleted: `ON DELETE CASCADE` on the attribution row already handles it.
- Revoked after signup but before payment: `revoked_at` short-circuits, so the
  `purchase` is never sent. Pre-existing and correct.

## Acceptance criteria

**Stage 1 — the leak**

- **AC1**: Given a row with `vendor='meta'`, when a conversion is sent, then
  **no** request is made to `google-analytics.com`, and NOT a payload carrying
  the `fbclid` as `gclid`. (This test must fail on today's code.)
- **AC2**: Given a row with `vendor='tiktok'`, then likewise no GA4 request.
- **AC3**: Given a row with `vendor='google'`, then the GA4 payload is
  byte-identical to today's. The fix must not perturb the working path.
- **AC4**: Given a row with `vendor='direct'` and a `browser_id`, then it still
  goes to GA4 as `client_id`.
- **AC5**: Given a vendor with no configured sender, then the outcome is
  recorded in `business_ad_conversion` with a distinguishable status, and NOT
  `sent`.

**Stage 2 — the Meta sender**

- **AC6**: Given `vendor='meta'` with a `click_id` and a configured token, when
  `sign_up` is sent, then Meta receives `CompleteRegistration`, and when
  `purchase` is sent, then Meta receives `Purchase` with the invoice's real
  value and currency.
- **AC7**: Given a `click_id` of `abc123` captured at unix `t`, then the payload's
  `fbc` is exactly `fb.1.<t*1000>.abc123`, and NOT the bare `fbclid`.
- **AC8**: Given a `meta` row whose `browser_id` is present, then it is sent as
  `fbp`; given it is absent, then the event is still sent on `fbc` alone.
- **AC9**: Given no `meta_capi_access_token`, then nothing is sent and no
  exception escapes — the dormant default, matching GA4.
- **AC10**: Given the same `(business, vendor, event)` twice, then exactly one
  HTTP call is made, and the `event_id` is identical across both attempts.
- **AC11**: Given `revoked_at` is set, then no Meta request is made and the
  status is `skipped_no_consent`.
- **AC12**: Given Meta returns a non-2xx or the call raises, then the status is
  `failed` with a truncated detail, the Stripe webhook still returns 200, and
  no retry is attempted.
- **AC16**: Given `environment != "production"` and no `meta_test_event_code`,
  then **nothing is sent**, even with a valid token and a complete `meta` row.
  The shared token must not be able to write production data from a dev box.
- **AC17**: Given `environment == "production"` and a `meta_test_event_code`
  that is somehow set, then the payload does **NOT** carry `test_event_code` —
  because Meta excludes test events from reporting, so honouring it would
  discard every real conversion.
- **AC18**: Given `environment != "production"` **with** a test event code, then
  the payload carries it, so the event is visible in the Test Events tab and
  absent from reporting.
- **AC19**: Given a `google` row and GA4 unconfigured while Meta IS configured,
  then **no row at all** is written to `business_ad_conversion` — the slot stays
  open for a later attempt once credentials are fixed.
- **AC20**: Given a `meta` row suppressed by the environment guard (the default
  dev state), then likewise no row is written.
- **AC21**: Given a configured vendor, then the slot IS claimed before sending,
  so a Stripe replay cannot send the same conversion twice.
- **AC22**: Given both vendors configured and a business holding one `google`
  row and one `meta` row, then each is delivered to its own platform in the same
  pass, and neither payload carries the other's identifier.

**Capture side**

- **AC13**: Given marketing consent and a `_fbp` cookie, when the attribution
  record is built for a `meta` vendor, then `browserId` is the `_fbp` value and
  `consentCategory` is `marketing`.
- **AC14**: Given marketing consent **refused** but analytics granted, then
  `_fbp` is NOT captured even if the cookie somehow exists.
- **AC15**: Given a `google` vendor row, then `browserId` remains the GA client
  id, gated on analytics consent. No behaviour change for Google.

## Testing

Style follows the repo: pure functions, no network, no DB.

**Backend — `tests/test_ad_attribution.py` (extend) and a new
`tests/test_meta_capi.py`**

- The vendor dispatch table: one test per vendor asserting which sender is
  chosen, including the no-sender case. This is the test whose absence caused
  the defect.
- `fbc` construction, including a `captured_at` that is `None` or zero.
- Event-name mapping both directions.
- Dormant default with an empty token, and with a token but no pixel id.
- Deterministic `event_id` stability across calls.
- The GA4 payload snapshot for `vendor='google'`, to pin AC3.
- Consent short-circuits reused from the existing `should_send_conversion` tests,
  now also exercised with a `meta` row.

HTTP is stubbed — `_send_one` must not be refactored into something that needs a
live endpoint to test. Run: `docker cp` the changed test files in, then
`docker exec fidelity-backend-1 python -m pytest -q` (tests/ is not mounted).

**Showcase — `lib/ad-attribution.test.ts` (extend)**

- `_fbp` read from a cookie header, including absent and malformed.
- Per-vendor `browserId` selection and the marketing-vs-analytics gate (AC13–15).
- The existing google/direct cases must stay green unchanged.

**Runbook — `docs/qa/cookie-consent.md`**

The MP section exists from STA-319. Add an MC (Meta conversions) section:

- MC-01 — a `?fbclid=` landing with marketing accepted writes a `meta`
  attribution cookie carrying `_fbp`. BLOCKER.
- MC-02 — completing signup produces `CompleteRegistration` in Meta's **Test
  Events** tab. BLOCKER.
- MC-03 — paying an invoice produces `Purchase` with the correct amount and
  currency.
- MC-04 — **the negative that matters**: with a `?fbclid=` journey, GA4
  DebugView shows **no** conversion carrying that id. Pins AC1 in the wild.
- MC-05 — a `?gclid=` journey still reaches GA4 exactly as before. Pins AC3.
- MC-06 — revoking marketing between signup and payment suppresses `Purchase`.

## What is needed from you

Nothing blocks Stage 1. Stage 2 needs three values.

| What | Where to get it | Secret? |
|---|---|---|
| **Conversions API access token** | Events Manager → your dataset → **Settings** → Conversions API → *Generate access token*. **One token, shared across environments** — Events Manager issues a single token per dataset. | **Yes.** Doppler → `Settings`, never `os.getenv`. Never in `.env.example`, the Dockerfile, or any `NEXT_PUBLIC_*`. |
| **Test Event Code** — **required outside production**, not optional | Events Manager → dataset → **Test Events** tab. A code like `TEST12345`. | No, but it is environment-specific: set in dev, **absent in prod**. |
| **Pixel / dataset id, server-side** | Already known: `1088158323750710`. The backend needs its own copy; today only showcase has it, as a `NEXT_PUBLIC_*` build arg. | No — but it still goes through settings, not a literal. |

### Because the token is shared, the test event code is a safety control

It is no longer a debugging convenience. One token means dev and prod write into
one dataset, and the code is the only boundary. The guard in Decisions enforces
it both ways so neither mistake is possible: **no code outside production → send
nothing**; **code present in production → ignore it**.

Set it in Doppler's dev config and leave it unset in prod. That is the whole
operational rule.

### If you do want two real credentials

Events Manager only ever offers one, but Business Settings → **System Users** is
the path that issues additional tokens: create a system user, assign it the
dataset with Manage permission, generate a token from there. Meta moves this
around, so navigate by function.

Worth it only if you want dev genuinely unable to write production data. The
shared-token-plus-guard above is the cheaper answer and, given the guard is
fail-closed, an adequate one. A third option — a **separate dev dataset** with
its own pixel id — gives the strongest isolation but means maintaining two
datasets and two ids forever, which is a real cost for a marketing site.

Proposed settings, mirroring the GA4 block in `app/core/config.py:135-138`:

```python
meta_pixel_id: str = ""
meta_capi_access_token: str = ""
# The Meta analogue of ga4_debug_mode: routes events to the Test Events tab
# instead of into reporting. NEVER set in production.
meta_test_event_code: str = ""
```

**Why the test event code matters more than it looks.** GA4's Measurement
Protocol 204s for a valid and an invalid `api_secret` alike, which is why
`ga4_debug_mode` exists. Meta's CAPI is better — it returns errors — but it
still accepts a well-formed event that matches nothing and reports success. The
Test Events tab is the only place to confirm an event actually arrived and was
attributed, before trusting a `sent` row.

**Also worth confirming on your end:** that Meta's data processing terms are
accepted for the portfolio, and that the dataset is still assigned to the ad
account (both from the STA-319 setup guide). Server-side events land in the same
dataset, so an unassigned dataset means campaigns still cannot optimise.

## Touched areas and risks

- **`app/services/ad_attribution.py`** — the file the defect is in and the file
  the sender goes in. Called inline from a Stripe webhook handler
  (`billing.py:1722`) and from business creation (`businesses.py:274`). Every
  exit must stay silent-and-safe; a raised exception here is a billing incident,
  not a lost conversion.
- **GA4's live data** — AC3 exists because the fix touches the payload builder
  that Google's working path shares. A snapshot test pins it.
- **`lib/ad-attribution.ts`** — `buildAttributionRecord` is first-touch-wins and
  writes a permanent cookie. A wrong `browserId` cannot be repaired later.
- **`AttributionCapture.tsx`** — the polling window is the only untestable part
  of the capture path. Extending it for `_fbp` risks delaying or dropping the
  write for visitors who refused analytics.
- **Consent categories** — mixing `_fbp` into the analytics gate would be a
  legal exposure rather than a bug. AC14 is the tripwire.
- **Privacy policy** — see below. Not a code risk but a shipping gate.

## Docs impact (preliminary)

**Checked, not assumed: GA4's server-side reporting IS already disclosed.**
STA-323/324 added **§5.5 "Conversion measurement from our servers"**, which
describes the whole mechanism accurately — the identifier surviving the
subdomain move, the two events, the fact that it happens server-side and
independently of the browser, and that revocation stops future reports but
cannot recall sent ones. So there is no pre-existing GA4 finding here. Good.

**But §5.5 is written Google-only, and that makes the defect a disclosure
problem as well as a data-quality one.** The wording names one identifier and
one recipient:

- §5.5: "the identifier the advertising platform added to the link you followed
  — **for Google, the `gclid`**" and "we then report two things **to Google**".
- §5.3: `stampeo_attribution` → Recipient "**Stampeo, then Google**".

Today an `fbclid` is being sent to Google. The policy discloses sending *a
gclid* to Google; it does not disclose sending a Meta click identifier to
Google, because nobody intended that. Stage 1 fixes the behaviour, which is the
right remedy — the policy should not be widened to describe a bug.

The Phase 6 edit for Stage 2 is then small and well-scoped, not a new section:

1. §5.5 — name `fbclid` alongside `gclid`, and change "to Google" to cover both
   recipients, each receiving only its own identifier.
2. §5.3 — the `stampeo_attribution` row's Recipient becomes "Stampeo, then
   Google or Meta".
3. The same edit in `fr`, `es` and `pl`. Per the copywriting rules these are not
   literal translations; §5.5's existing phrasing in each locale is the model.

No help-centre page: business owners neither see nor configure this.
