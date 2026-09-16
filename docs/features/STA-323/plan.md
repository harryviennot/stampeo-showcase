# Plan: Ad attribution funnel — click → business creation → payment

ISSUE: STA-323 (https://linear.app/stampeo/issue/STA-323/ad-attribution-funnel-click-business-creation-payment)
DEPENDS ON: STA-318 (GA4 on showcase) — code complete, awaiting QA. STA-317 (consent) — MERGED.
BRANCH: `harryviennot2/sta-323-ad-attribution-funnel-click-business-creation-payment`
REPOS: **showcase** (capture) + **web** (forward) + **backend** (persist, send)
MIGRATION: yes — `172_business_ad_attribution.sql` (next free number; 166 is a gap, 171 is the highest)
STATUS: DRAFT

## Problem

Three tags now sit on showcase (GA4, Meta, TikTok to come) and none of them can
see the conversions that matter. The funnel crosses a domain and a private
route:

```
ad click → landing (tags live) → CTA → /onboarding (no tag, PRIVATE_SEGMENT)
        → app.stampeo.app → business created → Stripe checkout → invoice paid
```

Campaigns are therefore optimising against CTA clicks, which is a proxy for
intent and not for revenue. This issue carries the ad identifiers across the
gap and reports the two real conversions server-side.

## The correction that shapes everything

**The business is created in `web/`, not showcase** —
`web/src/components/onboarding/chapters/business/IdentityStep.tsx:295` calls
`createBusiness()`. Showcase's `/onboarding` only creates the *account*, then
`redirectToApp()` hands off to `app.stampeo.app`.

So the STA-323 ticket's original suggestion — ride `OAUTH_STASH_KEY` — is
**wrong and cannot work**: that is `sessionStorage`, which is origin-scoped and
does not cross from `stampeo.app` to `app.stampeo.app`.

**The carrier must be a cookie on `.stampeo.app`.** There is precedent on both
sides: `consentCookieAttributes` already sets the consent cookie on
`NEXT_PUBLIC_COOKIE_DOMAIN` explicitly "so the dashboard on app.stampeo.app can
read the same choice when it grows a tracker", and `lib/last-login.ts` uses the
same mechanism. A cookie also survives the Google OAuth round-trip for free,
which was the other thing `OAUTH_STASH_KEY` was being asked to solve.

## Decisions

- **Capture on the landing page, not at signup.** The GA `client_id` lives in
  the `_ga` cookie and `_fbp` in Meta's — both exist only once their tag has
  loaded, which by design happens only on trackable marketing routes. By
  `/onboarding` they are unreachable.
- **One cookie, all vendors.** `stampeo_attribution` on `.stampeo.app`,
  JSON, same shape as the consent cookie. Adding Meta/TikTok later is a field,
  not a new mechanism.
- **Consent gates capture, not just sending.** Click ids are personal data.
  `analytics` permits the GA fields, `marketing` permits the ad-platform fields,
  and with neither the cookie is never written. The consent evidence (version,
  regime, timestamp) travels inside the cookie so the backend can prove the
  basis without a second lookup.
- **Revocation deletes the carrier.** `stampeo_attribution` is added to
  `COOKIE_PATTERNS` in `lib/consent.ts`, so STA-317's existing revoke path
  clears it with the rest. Rows already stored stop being sent (below).
- **`web/` stays a courier.** It reads the cookie and forwards it; it gets no
  consent library and no tag. The evidence is validated **server-side**, so a
  forged or edited cookie cannot manufacture a lawful basis.
- **Last touch wins, within the platform's window.** A second ad click
  overwrites the row for that vendor. `ON CONFLICT (business_id, vendor) DO
  UPDATE`, and `captured_at` lets the sender drop a click id older than the
  window rather than reporting an unattributable conversion.
- **Two conversions, two triggers**:
  - `sign_up` when the business row is created (`POST /businesses`).
  - `purchase` on **`invoice.paid`**, not `checkout.session.completed`.
    Checkout completing means a card was attached and the trial started; no
    money moved. Reporting that as revenue teaches the bidder to buy trials.
    `handle_invoice_paid` already exists in the webhook map.
- **Attribution never blocks the user.** Capture, forward, persist and send are
  all best-effort. A failure logs and is dropped; no signup, business creation
  or webhook acknowledgement depends on it.
- **Secrets via Settings, never `os.getenv`.** `ga4_api_secret` and
  `ga4_measurement_id` join `app/core/config.py`'s `Settings`, fed by Doppler.
  The API secret **is** a real secret, unlike the measurement id.

## Non-goals

- **Meta CAPI and TikTok Events API.** The storage is vendor-generic and the
  sender is a seam, but only the GA4 Measurement Protocol is implemented here.
  Adding Meta is then a sender, not a schema change.
- **Google Ads offline conversion import via GCLID.** We *store* the gclid so it
  stays available, but the Ads-side import is a decision for the ads consultant.
  Noted in STA-318's plan as the stronger bidding signal.
- **Any client-side tag in `web/` or on `/onboarding`.** The whole point of
  going server-side is not needing one.
- **Backfilling attribution for existing businesses.** Impossible — the clicks
  are gone.
- **Multi-touch attribution history.** One row per business per vendor. If
  attribution disputes ever need a trail, that is an append-only redesign and
  its own issue.
- **Reporting conversions for businesses that signed up before this ships.**

## Schema

Migration `172_business_ad_attribution.sql`, idempotent (`IF NOT EXISTS`).

```sql
CREATE TABLE IF NOT EXISTS business_ad_attribution (
  business_id      uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  vendor           text NOT NULL CHECK (vendor IN ('google','meta','tiktok','direct')),
  browser_id       text,          -- GA client_id / _fbp / _ttp
  click_id         text,          -- gclid / fbclid / ttclid
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  utm_content      text,
  utm_term         text,
  landing_path     text,
  landing_variant  text,          -- ties ad spend to the live A/B test
  referrer_host    text,
  consent_category text NOT NULL CHECK (consent_category IN ('analytics','marketing')),
  consent_version  integer NOT NULL,
  consent_regime   text NOT NULL CHECK (consent_regime IN ('opt-in','opt-out')),
  consent_at       timestamptz,
  captured_at      timestamptz NOT NULL DEFAULT now(),
  revoked_at       timestamptz,
  PRIMARY KEY (business_id, vendor)
);

CREATE TABLE IF NOT EXISTS business_ad_conversion (
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  vendor      text NOT NULL,
  event_name  text NOT NULL CHECK (event_name IN ('sign_up','purchase')),
  sent_at     timestamptz,
  status      text NOT NULL CHECK (status IN ('sent','failed','skipped_stale','skipped_no_consent')),
  detail      text,
  PRIMARY KEY (business_id, vendor, event_name)
);
```

`TEXT` + `CHECK` rather than a Postgres enum: adding a vendor later is a
constraint swap, not an `ALTER TYPE` that cannot run inside a transaction.

The `business_ad_conversion` primary key **is** the idempotency guarantee.
Stripe retries webhooks and `checkout_reconcile_worker.py` re-runs
reconciliation; the insert is what makes a replay a no-op rather than a second
conversion.

Both tables are added to `_CONTENT_TABLES` in
`backend/app/services/account_deletion.py` — `ON DELETE CASCADE` covers a hard
delete, but the real purge path is that tuple, and a business-scoped table
missing from it is silently skipped.

## Edge cases considered

- **No consent**: nothing captured, no cookie, no row, no send. A business
  still gets created normally.
- **Consent granted but no ad click** (organic, direct, newsletter): a `direct`
  row with utm/referrer and no click id, so "where do signups come from" is
  answerable for non-paid channels too.
- **Consent revoked between capture and signup**: the revoke path deleted the
  cookie, so nothing is forwarded.
- **Consent revoked after the row exists**: `revoked_at` is set and the sender
  skips it. Already-sent conversions cannot be recalled — documented, not
  pretended otherwise.
- **Forged or hand-edited attribution cookie**: validated server-side. Unknown
  vendor, bad consent version or a `consent_at` in the future is rejected and
  the row is not written. The cookie is not authentication and grants nothing
  beyond its own attribution.
- **Stale click id** (older than the platform window): stored, but the send is
  recorded as `skipped_stale` rather than reported as an unattributable
  conversion.
- **Stripe webhook replay**: second insert conflicts on the primary key, no
  second send.
- **`invoice.paid` for a renewal, not the first payment**: only the first
  `purchase` per business is sent — the PK enforces it — so month two is not a
  new conversion.
- **Business created without ever visiting showcase** (admin-created, invited
  teammate, reseller): no cookie, no row. Must not error.
- **Business deleted**: cascade plus `_CONTENT_TABLES`.
- **GA4 API secret absent** (local, CI): the sender no-ops and logs once, the
  same dormant-by-default posture as the tag itself.
- **Measurement Protocol returns non-2xx**: recorded as `failed` with the
  detail; never retried in the webhook path, because a retry loop inside a
  Stripe handler risks the webhook timing out.
- **Cookie too large / multiple vendors**: capped; if it would exceed ~2KB the
  oldest vendor entry is dropped rather than the write failing.

## Acceptance criteria

- **AC1**: Given a visitor arrives with `?gclid=…` and grants analytics consent,
  when the landing page loads, then `stampeo_attribution` is written on
  `.stampeo.app` carrying the gclid, the GA `client_id`, the utm fields and the
  consent evidence.
- **AC2**: Given the same arrival and NO consent, then no attribution cookie is
  written at all.
- **AC3**: Given only `marketing` consent (analytics refused), then the cookie
  carries the ad-platform fields and NOT the GA `client_id`.
- **AC4**: Given an attribution cookie exists, when the business is created in
  `web/`, then a `business_ad_attribution` row exists for that business naming
  vendor, click id and campaign.
- **AC5**: Given no attribution cookie, when a business is created, then the
  creation succeeds and no row is written, with no error surfaced to the user.
- **AC6**: Given a business with attribution, when it is created, then exactly
  one `sign_up` conversion is sent and recorded in `business_ad_conversion`.
- **AC7**: Given a business with attribution, when `invoice.paid` fires, then
  exactly one `purchase` conversion is sent carrying value and currency.
- **AC8**: Given `invoice.paid` fires a second time (replay, or a renewal), then
  NO second `purchase` is sent, and the webhook still returns 200.
- **AC9**: Given `checkout.session.completed` fires, then NO `purchase` is sent
  — a started trial is not revenue.
- **AC10**: Given a forged attribution cookie with an unknown vendor or a bad
  consent version, when a business is created, then no row is written and the
  creation still succeeds.
- **AC11**: Given consent is revoked on showcase, then the attribution cookie is
  deleted by the existing revoke path, alongside `_ga` and `_fbp`.
- **AC12**: Given a stored row whose consent was revoked, when a conversion
  would be sent, then it is skipped and recorded as `skipped_no_consent`.
- **AC13**: Given no `ga4_api_secret` is configured, then nothing is sent, the
  business is created normally and the webhook still returns 200.
- **AC14**: Deleting a business removes its attribution and conversion rows.

## Touched areas and risks

- **`webhooks.py` / `billing.py`** — the money path. An exception in the
  attribution hook must not prevent a subscription flip; every call site is
  wrapped and the handler's existing behavior is unchanged on failure. This is
  why the diff gets a `security-reviewer` pass regardless of size.
- **`POST /businesses`** — `create_business` is already doing slug
  normalisation, settings folding and an atomic three-table insert. Attribution
  is written AFTER that transaction commits, never inside it: a failure here
  must not roll back a business.
- **`_CONTENT_TABLES`** — silent skip if forgotten.
- **Migration numbering** — 166 is a gap and glob order is not numeric; confirm
  172 is free in dev before applying, per the migrate.sh traps.
- **Consent contract** — this issue adds a cookie to STA-317's
  `COOKIE_PATTERNS`, which is the one place it reaches into that library.
  `lib/consent.test.ts` must stay green.
- **Three repos, one release** — capture without persistence is harmless
  (a cookie nobody reads); persistence without capture is harmless (no rows).
  So the deploy order is free, which is deliberate.

## Docs impact (preliminary)

**Likely yes, unlike STA-318.** This stores personal data (click ids) against a
business record rather than sending an anonymous page view, so the privacy
policy probably needs a line about attribution data and its retention. Revisit
at Phase 6 with the real diff, and check whether `CONSENT_VERSION` must be
bumped — if the disclosure changes materially, a stored choice made against the
old text is arguably no longer informed.
