# Plan: PostHog, from first visit to paying customer

ISSUE: STA-566 · LANE: guarded (consent, personal data, migration, billing hooks) · REPOS: showcase, backend, web
(consent version only) · BRANCH: `feat/sta-566-posthog-journey` · STATUS: APPROVED by Harry on 17 Nov 2026 ("we'll update the cookie accept version and update the privacy policy"), with the coordinator's defaults for H1, H3–H7 below; legal texts carry COUNSEL markers until signed off

## Problem
PostHog keeps no visitor ID between page loads (`persistence: "memory"`, `instrumentation-client.ts:11`), so nobody can be
followed from a landing page through onboarding to a trial a week later; sign-up, trial and payment exist only in the
database, Stripe and the ad platforms. The new pages are live (STA-564): Harry wants to see which pages, sections, CTAs,
languages and channels lead to sign-ups, trials and payments.

## Findings that shape the plan
- The privacy policy promises PostHog keeps no identifier and links no visits (`legal/en/privacy-policy.md` §3.4 :114,
  §5.4 :195-197, §4 :131 "cookieless"); §8 has no PostHog row. Remembering visitors, linking accounts and server events
  are new processing: new text, counsel, `CONSENT_VERSION` 5 → 6 in showcase, backend and web (EU visitors asked again,
  the third time in about five weeks).
- Heatmaps run today for every visitor: the project has `heatmaps_opt_in: true` and the init never turns them off.
  Recordings are off only by the project toggle.
- Refusers have no stored landing page or UTM (`stampeo_src` is kept only with consent): server events can split them
  by language and market only.

## Phasing
- **Phase A, no legal change (ships first):** the new site events (AC13), PostHog hygiene (AC14), heatmaps pinned off in
  code until Phase B (decision H7), and a first PostHog dashboard on today's data (landing → CTA → onboarding, per page
  and language). Lane: standard.
- **Phase B, after counsel:** consent v6, remembered visitors, the account link, server events, recordings and heatmaps
  with consent, the full dashboard (AC1–AC12, AC15, AC16). Lane: guarded.

## Decisions (Harry, 17 Nov, fixed)
PostHog = what works on the site; GA4 / Meta / Google Ads / ChatGPT Ads unchanged; the database and Stripe stay the
truth. Cookie-free by default; a visitor who allows analytics is remembered and linked to their account at sign-up.

## Design (Phase B)
- **Remembered visitor:** EU/UK/CH and unplaceable visitors need a v6 analytics grant; US visitors need no refusal and no
  GPC (GA4's gate). A host-only cookie (`cross_subdomain_cookie: false`), expiry = the region's grant lifetime (182 days);
  nothing reaches app.stampeo.app or the API. Not localStorage (never expires), not PostHog's `cookieless_mode`.
- A grant mid-visit keeps the in-memory ID (`set_config({persistence})`), so the visit stays one person (C3).
- **Recordings and heatmaps:** only on an explicit stored v6 grant (never the US default), only on trackable paths,
  inputs masked, console and network capture off, pinned off at init.
- **Withdrawal** (banner, footer, GPC, another tab): stop recording, purge `ph_*` cookies and storage, `reset()`, reload.
- **Person key** = HMAC-SHA256(user id, secret); PostHog never gets an email, name or raw internal ID; business steps carry
  an HMAC `business_key`. The sign-up body gains `ph` (the PostHog ID) only when the visitor is remembered; the backend
  queues `$identify` only while the analytics basis holds. The browser never learns the key; web stays PostHog-free.
- **Server steps**, one per subject: `account_signed_up`, `card_created`, `first_test_stamp`, `checkout_started`,
  `trial_started`, `first_payment`, `subscription_ended {reason, was_paying}`, from a start date, no backfill. Always:
  locale, market, value, currency, tier, interval. Only while analytics isn't refused and a source is stored:
  landing_variant, landing_path, utm_*, referrer_host. `$geoip_disable`, no `$ip`, no `$set`.
- A new `product_event_outbox` table + cron worker, not a destination of the ad outbox (built for ads; stays untouched).
- A weekly aggregate `db_weekly_counts` event (counts only, no person) to check PostHog against the database.

## Acceptance criteria
- AC1 EU/UK/CH/unplaceable, no choice: in-memory ID, no `ph_*` cookie or storage, no recording or heatmap data.
- AC2 That visitor accepts analytics (v6): same ID stored in a host-only cookie (≤ 182 days); recording and heatmaps on
  trackable paths, inputs masked; never on /onboarding, /login, /reset-password, /email-preferences,
  /demo/wallet-select/*, enrollment pages.
- AC3 A stored v6 grant: a visit another day carries the same distinct ID.
- AC4 A remembered visitor refuses analytics (banner, footer, another tab): recording stops, every `ph_*` key removed,
  reload, later events use a new in-memory ID that is never stored again without a new grant.
- AC5 Only a v5-or-older grant: in memory, the banner asks again; an older refusal still stands.
- AC6 US, no choice, no GPC: ID stored, recording and heatmaps off. US with GPC: in memory, `ph_*` cleared, no `ph` sent.
- AC7 A remembered visitor's account is confirmed (code, Google, Apple): `/account/signup-recorded` carries `ph`, and one
  `$identify` is queued only while the basis holds; never in memory, after a refusal, under US GPC, on v5, or for a
  malformed `ph`.
- AC8 Each step of an account created after the start date sends exactly one event (person key, timestamp = when it
  happened); never on a Stripe replay, a renewal, a second checkout or a re-marked step; nothing before the start date.
- AC9 Attribution properties only while analytics isn't refused and a source is stored (refusal checked at send time).
- AC10 Backend payload keys within an allowlist; never an email, name, phone, address, IP, user agent, raw ID, click ID,
  GA ID, fbp or fbc.
- AC11 PostHog down or unset: sign-up, Stripe webhooks, design activation and step marking behave exactly as today;
  retries on 5xx/429/timeouts only; nothing sent without a key.
- AC12 Account deletion queues a PostHog person deletion and deletes queue rows; rows older than 395 days are purged.
- AC13 (Phase A) Exactly one event each, with locale and page: `nav_preview_opened {preview, menu}`,
  `pricing_interval_toggled {interval}`, `faq_answer_opened {faq, position}`, `language_switched {from, to}`,
  `loyalty_quiz_answered {question, answer}`, `loyalty_quiz_completed {result}`; closing an FAQ or re-picking the
  same value sends nothing. Scroll depth from PostHog's `$prev_pageview_max_scroll_percentage`.
- AC14 (Phase A) No PostHog URL carries gclid, gbraid, wbraid, fbclid, oppref or ttclid (`ad_click_vendor` instead);
  `demo_started` has no `session_token`; the wallet-select token is replaced; nothing from enrollment pages.
- AC15 Showcase, backend and web read version 6; the backend accepts v6 carriers; v1–v5 refusals still stand.
- AC16 A week of data: the dashboard shows landing sessions → sign-ups → trials → first payments per landing variant and
  locale, section reach per variant, demo → sign-up, source → first payment, PostHog vs `db_weekly_counts`.

## Stages (disjoint files)
- A1 showcase (Sonnet): site events + hygiene + heatmaps pin. A2 coordinator: Phase A dashboard (PostHog MCP).
- B1 backend (Sonnet): migration, `app/services/product_analytics/*`, worker, hooks, deletion, retention, tests.
- B2 showcase (Sonnet): `lib/posthog/*`, `instrumentation-client.ts`, consent wiring, sign-up body, fixtures.
- B3 legal and copy (Opus, copywriting skill): legal texts + cookie strings in 4 locales, COUNSEL markers.
- B4 version lockstep (Haiku, after B2): backend `eligibility.py`, web `consent-state.ts`, fixtures.
- B5 coordinator: PostHog settings and dashboard, `backend/docs/measurement`, runbook, QA (first: prove a server
  `$identify` merges the browser's anonymous events).

## Tests
Showcase: a pure mode table (region × choice × version × GPC × path), init pins, transitions against a fake client,
storage purge, sign-up body gate, fetch stubbed with `restoreGlobalsAfterEach` (never `mock.module("posthog-js")`).
Backend (FakeDb): person key, basis table, property allowlist, queue idempotency, hooks that never raise, dispatch via
`httpx.MockTransport`, refusal after queueing, deletion, retention; `tests/ad_conversion` untouched and green.
QA: `docs/qa/cookie-consent.md` on dev with a PostHog test project.

## Release order (Phase B)
Backend first (dormant without keys, accepts v6) → showcase after counsel (COUNSEL markers block main) → web the same day
→ Doppler keys → PostHog replay on (masked, 30 days) → dashboard.

## Decisions taken at approval (17 Nov 2026)
- H1: `card_created` = first card made live; `first_test_stamp` = the wizard step `first-stamp:stamp` completed; churn =
  `subscription_ended` only. H2: yes, consent v6 and the EU re-ask (Harry). H3: yes, no capture on enrollment pages and
  click IDs stripped. H4: a separate PostHog test project for dev; the backend sends nothing without a key. H5: the two
  secrets go to Doppler at release. H6: server events start on the Phase B release day. H7: heatmaps pinned off in Phase A.
- Branches: showcase Phase A on `feat/sta-566-posthog-journey`; Phase B showcase on `feat/sta-566-consent-v6`;
  backend on `feat/sta-566-posthog-journey`; web (version only) at B4.

## Open questions
- Counsel: C1 server events about the account for people who refused analytics (pseudonymous key, no attribution): allowed
  on legitimate interest, or skip them? C2 recordings/heatmaps under the audience-measurement choice, or their own
  toggle (and US wiretap-style claims)? C3 keep the in-memory ID at the moment of a grant? C4 on withdrawal after
  sign-up: stop linking enough, or delete linked events? C5 retention, and does the cookie-free default still meet the
  CNIL exemption? C6 the v6 wording in 4 languages, PostHog's role (processor) in §4/§8.
- Harry: H1 step definitions (card_created = first card made live? first_test_stamp = the wizard step? churn = ended only?).
  H2 accept a third EU re-ask now, or batch v6 later? H3 stop PostHog on enrollment pages and strip click IDs from its
  URLs? H4 a separate PostHog test project for dev? H5 two new secrets (person-key HMAC, a personal API key for
  deletions). H6 the start date for server events. H7 pin heatmaps off now, until Phase B?

## Docs decision
No help-center page (the dashboard doesn't change). Legal texts in 4 locales (Phase B). `backend/docs/measurement/*`: a
PostHog destination row, v6, release order, console checklist. Runbook `docs/qa/cookie-consent.md`.
