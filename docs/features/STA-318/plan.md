# Plan: Google Analytics (GA4) on showcase

ISSUE: STA-318 (https://linear.app/stampeo/issue/STA-318/install-google-analytics-ga4-on-showcase)
DEPENDS ON: STA-317 (cookie consent) — MERGED, PR #128. This plan consumes it.
BRANCH: `harryviennot2/sta-318-install-google-analytics-ga4-on-showcase`
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (16 September 2026, by the user — "lets build it now")

## Problem

Ad campaign measurement needs GA4 on showcase. There is no Google tag today:
analytics is PostHog only, cookieless by design (`persistence: "memory"`).

The blocker is gone. STA-317 shipped the consent gate and named the seams this
issue consumes: `hasAnalyticsConsent()`, `useConsent()`,
`subscribeToConsentChange()` and `isTrackablePath()`. GA4 now becomes the first
real consumer of that gate — it fires for consenting visitors rather than
landing inert.

## Decisions

- **Consume STA-317, add no consent logic.** `lib/consent.ts` already decides
  regime, GPC, storage and revocation, and already lists `_ga`, `_ga_*` and
  `_gid` in its clear-on-revoke patterns. This issue adds a loader, not a second
  opinion about consent.
- **Gate on `analytics`, not `marketing`.** GA4 is the analytics category.
  The Meta and TikTok pixels (STA-319/320) take `marketing`.
- **No script before the answer.** The `<script>` is not rendered at all until
  consent resolves to granted — not Consent Mode `denied`, which still contacts
  `googletagmanager.com`. This is STA-317's stated rule, restated here because
  the temptation to "just use Consent Mode" will recur.
- **Nothing renders until `ready`.** `useConsent()` is false-and-not-ready during
  SSR and first paint. Showcase pre-renders every locale; deciding on the server
  would bake one visitor's answer into a page served to everyone.
- **Respect `isTrackablePath()`.** No tag on private segments (`/onboarding`,
  `/login`, `/reset-password`, `/email-preferences`) or on business acquisition
  pages under `app/[locale]/[slug]`. Those visitors are our customers' customers.
  GA4 is a *consumer* of that predicate, exactly as the banner is.
- **US visitors are tracked without a click.** `resolveConsent` returns granted
  for the `opt-out` regime absent a record, so GA4 fires immediately for US
  visitors who have not answered and do not send GPC. That is STA-317's
  deliberate design, not a bug to work around here.
- **Env-gated measurement ID** (`NEXT_PUBLIC_GA_MEASUREMENT_ID`), absent by
  default. The user creates the GA4 property with EU data settings; the code
  merges before the ID exists and stays dormant until it is set.
- **Testable logic lives in `lib/`.** The runner is `bun test lib` and showcase
  has no component test setup. All branching (may-we-load, event mapping,
  page-path derivation) goes in pure `lib/ga.ts` functions; the component stays
  thin wiring.
- **Reuse `lib/consent.test.ts` conventions** for the new suite: WHY-header
  comment naming the issue, `bun:test`, pure assertions.

## The signup-conversion conflict, and how this plan resolves it

The issue asks to verify "signup click, checkout" conversions. Both collide with
decisions already made elsewhere, and the resolution is a scope boundary:

- **Signup completion is not measurable client-side.** The wizard lives on
  `/onboarding`, a `PRIVATE_SEGMENT`. No tag may fire there, so a GA4 `sign_up`
  on wizard completion is not available to this issue. The showcase-side
  conversion is therefore the **CTA click** — the last measurable point before
  the private funnel.
- **Checkout is not on showcase at all.** It happens in `web/` on
  `app.stampeo.app` after `redirectToApp()`.

Both real conversions are known server-side. The correct fix is the GA4
Measurement Protocol from the backend, which needs no client tag on a private
page — recommended as a follow-up issue, not smuggled in here. See "Open
questions".

## Non-goals

- **Meta and TikTok pixels** (STA-319, STA-320) — sibling issues, `marketing`.
- **Any change to consent behavior, copy, storage, regime or revocation.** If
  this issue seems to need one, that is a STA-317 amendment and a scope
  escalation.
- **Adding `onboarding` to `MARKETING_SEGMENTS`.** STA-317 excluded it on
  purpose. Changing it to win a conversion event is exactly the quiet scope
  growth the guard exists to catch.
- **Server-side GA4 / Measurement Protocol.** The follow-up above.
- **Cross-domain tracking to `app.stampeo.app`.**
- **Changing PostHog**, which stays cookieless and consent-independent so
  refusers remain measurable.
- **Privacy/cookie policy copy** — STA-317 already lists GA4 there.
- **Creating the GA4 property.** The user does this; the issue's first checkbox
  is theirs, not the diff's.

## Edge cases considered

- **No measurement ID**: nothing renders, no errors. Default state on merge.
- **Consent denied or never given (opt-in regime)**: no script, no `_ga*`
  cookie, no request to Google.
- **GPC sent**: denied everywhere, including the US. Handled entirely by
  `resolveConsent`; this issue must not special-case it.
- **US visitor, no record, no GPC**: granted — tag loads on first paint.
- **Consent granted mid-session**: `subscribeToConsentChange` re-renders and the
  script loads without a reload.
- **Consent revoked mid-session**: STA-317 reloads the page
  ([ConsentBanner.tsx:87](../../../components/consent/ConsentBanner.tsx)), so an
  already-running gtag is destroyed by navigation. This issue asserts it does
  not send after revocation, and does not attempt to unload the script itself.
- **Consent granted, but on a non-trackable path**: no tag. A consenting visitor
  who lands directly on `/onboarding` gets no GA4 there, and picks it up when
  they navigate back to a marketing page.
- **Navigating marketing → private → marketing**: the tag must not double-load,
  and must not report the private path as a `page_view`.
- **Client-side route changes**: gtag's automatic `page_view` only fires on
  initial load, so App Router navigations need an explicit one or every campaign
  landing reads as a one-page session.
- **Locale and market paths** (`/fr`, `/us/pricing`): recorded as-is. `/us/pricing`
  vs `/pricing` is a distinction ad measurement wants to keep. Note the browser
  path is what GA sees, not the middleware-rewritten `/en/us/pricing`.
- **Events fired before the script finishes loading**: `dataLayer` is pushed to
  before the script arrives and gtag replays on load. Asserted so a refactor
  cannot silently drop the first, most valuable, conversion.
- **Events attempted while denied**: dropped, never buffered for replay.
  Flushing pre-consent behavior on accept is retroactive tracking.
- **SSR**: every read is a no-op returning denied.

## Acceptance criteria

- **AC1**: Given no `NEXT_PUBLIC_GA_MEASUREMENT_ID`, when any page renders, then
  no gtag script is emitted and no request to `googletagmanager.com` is made,
  regardless of consent.
- **AC2**: Given an ID is set, an opt-in-regime visitor and no stored choice,
  when a marketing page renders, then no script is emitted, no `_ga*` cookie is
  set, and NOT a Consent-Mode-denied tag that still pings Google.
- **AC3**: Given an ID is set and analytics consent is explicitly refused, the
  result is identical to AC2.
- **AC4**: Given an ID is set and analytics consent is granted, when a trackable
  page renders, then the gtag script for that ID loads exactly once and one
  `page_view` is recorded.
- **AC5**: Given an ID is set, a US-regime visitor, no stored choice and no GPC,
  when a trackable page renders, then the tag loads — consent resolving to
  granted without an explicit click.
- **AC6**: Given an ID is set and GPC is present, when any page renders, then no
  script is emitted, in the US regime as well as the EU.
- **AC7**: Given consent is granted, when the visitor is on a non-trackable path
  (`/onboarding`, `/login`, a business acquisition slug), then no script is
  emitted and no `page_view` is recorded for that path.
- **AC8**: Given consent is granted, when the visitor navigates client-side
  between two trackable routes, then exactly one additional `page_view` carrying
  the new path is recorded, and NOT a duplicate of the initial page.
- **AC9**: Given consent is granted, when the visitor navigates from a trackable
  page to a non-trackable one and back, then no `page_view` is recorded for the
  private path and the tag is not loaded a second time.
- **AC10**: Given consent is granted, when a signup CTA is clicked on a trackable
  page, then a `sign_up_cta_click` event is recorded carrying `cta_location`,
  `locale` and `href`, and the existing PostHog `landing_cta_clicked` still fires
  unchanged.
- **AC11**: Given consent is denied or unset, when a tracked interaction occurs,
  then no GA4 event is sent or buffered, and the interaction still works —
  navigation happens, the wizard advances.
- **AC12**: Given consent was granted and is then revoked, when a tracked
  interaction occurs, then no further GA4 event is sent.
- **AC13**: A page view is never recorded for a path `isTrackablePath()` rejects,
  asserted directly against the predicate so the two tables cannot drift.

<!-- AC14-AC17 added 2026-09-20, folding back drift the Phase 3 coverage audit
     found between this plan and the shipped code. See gap-report.md. -->

- **AC14**: Given consent is granted, when a *demo* CTA is clicked (`hero_demo`,
  `final_cta_demo`) or any CTA pointing at `/contact`, then a
  `contact_cta_click` event is recorded instead of `sign_up_cta_click` — a
  different funnel, tracked separately, mirroring the PostHog split.
- **AC15**: Every member of the `CTALocation` union maps to exactly one GA4
  event, asserted against the union **read from `lib/analytics.ts` at runtime**
  rather than copied into the test. (A type-level guard cannot serve here:
  `tsconfig.json` excludes test files from the compile.)
- **AC16**: Given the operator appends `?debug_mode=1`, when the tag loads, then
  the `config` call carries `debug_mode: true` so the session appears in
  GA4 DebugView — the instruction `ga4-setup.md` gives.
- **AC17**: A GA4 event carries `landing_variant` whenever the landing A/B
  variant is live, and omits the key entirely when it is not. Resolves the
  risk recorded below: PostHog carries the variant as a super-property and GA4
  has no equivalent, so the two tools would otherwise disagree about which
  variant earned a signup. A throw from `gtag` never escapes the click handler.

## Touched areas and risks

- **`CTAButton.tsx`** renders on every landing surface. A throw in its click
  handler breaks navigation site-wide; the GA send must be fully guarded and
  must not precede the existing PostHog call.
- **`app/[locale]/layout.tsx`** is the single mount point for every locale. The
  GA component sits beside `<ConsentBanner />`; a mistake here is site-wide.
- **`lib/consent-routes.test.ts`** pins `MARKETING_SEGMENTS`/`PRIVATE_SEGMENTS` to
  the real route folders in both directions. Adding no routes here means it
  should stay green — if it goes red, this issue changed something it should not
  have.
- **`lib/i18n-catalogs.test.ts`** enforces four-locale parity. This plan adds no
  user-facing strings; if one appears, all four locales need it.
- **PostHog coexistence**: two tags on one page, distinct vocabularies. The
  `landing_variant` super-property is PostHog-only — GA4 events should carry the
  variant explicitly or the tools will disagree on variant performance.
- **Static generation**: reading consent during SSR would make pages dynamic.
- **Build gate**: memory note — the showcase dev server blocks `bun run build`.
  Stop it before the Phase 2 verification.

## Docs impact (preliminary)

Likely none client-facing: no dashboard behavior, no setting, no copy, no tier
gating. The privacy policy already lists GA4 (STA-317, commit 7a23674). Revisit
at Phase 6 against the real diff.

## Funnel stitching: deferred by decision

The issue's "signup click, checkout" checkbox cannot be fully satisfied from
showcase alone (see the conflict section above). Cross-domain tracking was
evaluated and **deliberately deferred** — the user will design the funnel later
with their ads consultant.

Evaluated and not chosen for now:

- **GA4 cross-domain linker.** Technically possible, but the handoff is
  `window.location.href` in `redirectToApp()` rather than an anchor click, so
  gtag's automatic `_gl` decoration never runs; the decorating page
  (`/onboarding`) is a `PRIVATE_SEGMENT` with no tag to mint a client ID; and
  `web/` has no analytics or consent layer at all today
  (`web/instrumentation-client.ts` is Sentry-only). Three repos, and it would
  reverse an STA-317 decision.
- **Server-side Measurement Protocol.** The backend already handles
  `checkout.session.completed` (`backend/app/api/routes/webhooks.py`), so the
  real conversions are known server-side. MP events do land in the GA4 property
  and can be marked as key events. For Google Ads *bidding* specifically, GCLID
  via Ads offline conversion import is the stronger signal than `client_id`.

Guidance for whoever picks this up: capture BOTH `gclid` (a URL param on the ad
landing page) and the GA4 `client_id` at the same moment on a marketing page,
and store both. That keeps GA4 reporting and Ads bidding open without redoing
the plumbing.

**Nothing in this issue forecloses any of those options.** No decision here has
to be unwound to add funnel tracking later.
