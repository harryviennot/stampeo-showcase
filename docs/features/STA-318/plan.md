# Plan: Google Analytics (GA4) on showcase, consent-gated

ISSUE: STA-318 (https://linear.app/stampeo/issue/STA-318/install-google-analytics-ga4-on-showcase)
BLOCKED BY: STA-317 (cookie consent banner) — still in Backlog, see "Decisions"
BRANCH: `harryviennot2/sta-318-install-google-analytics-ga4-on-showcase`
REPOS: showcase
MIGRATION: no
STATUS: DRAFT

> **AMENDED 2026-09-16, after STA-317 shipped first.** This plan was written
> expecting to land before the consent banner and therefore to define its own
> consent stub. It no longer does. `showcase/lib/consent.ts` now exists and owns
> the whole contract; this issue only consumes it. The read seam is
> `hasAnalyticsConsent()` / `hasMarketingConsent()` (both deny on the server and
> whenever anything is unknown), live changes arrive as the
> `CONSENT_CHANGED_EVENT` (`"stampeo:consent"`) `CustomEvent` on `window` whose
> `detail` is `{ analytics, marketing }`, and `isTrackablePath()` in
> `showcase/lib/consent-routes.ts` is the single allowlist saying where a tag
> may fire. Delete this issue's stub decisions and its deny-by-construction
> acceptance criterion: that guarantee is now `lib/consent.test.ts`'s job, and
> keeping a hard-coded `false` here would mean the tag never fires at all.
> See `docs/features/STA-317/plan.md`.

## Problem

Ad campaign measurement needs GA4 on the showcase site. Today showcase has no
Google tag at all: analytics is PostHog only, running deliberately cookieless
(`persistence: "memory"` in `instrumentation-client.ts`, per STA-313) precisely
so that no consent banner was ever required.

GA4 breaks that posture — it sets `_ga` cookies and, under GDPR/CNIL, may not
fire before explicit opt-in. The banner that would collect that opt-in is
STA-317, which is unbuilt. So this issue cannot ship a tag that actually runs.

Per the user's call at intake: build STA-318 **alone, consent-stubbed**. The GA4
integration lands complete and correct behind a consent interface that defaults
to denied, so nothing fires until STA-317 implements the grant side.

## Decisions

- **Ship inert, not unsafe**: the tag is wired end-to-end but cannot fire, because
  the only consent source available today always answers "denied". Chosen over
  shipping an ungated tag (illegal) or blocking on STA-317 (user declined).
- **No script load before consent, not Consent Mode default-denied**: Google's
  Consent Mode v2 in `denied` state still sends cookieless pings to Google's
  servers. STA-317's acceptance criteria say "no GA/TikTok/Meta requests fire",
  so we gate the `<script>` tag itself — `googletagmanager.com` is never
  contacted until consent is granted. Consent Mode is a later refinement, not
  this issue.
- **`lib/consent.ts` already exists and is STA-317's**: this issue owns neither
  side of it. It calls `hasAnalyticsConsent()` and subscribes to
  `CONSENT_CHANGED_EVENT`, and adds no consent code of its own. (Superseded: this
  decision originally had STA-318 define the read side as a stub.)
- **Env-gated measurement ID**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, absent by
  default, matching the Sentry/PostHog pattern in `.env.example`. The user
  creates the GA4 property (EU data settings) separately; code merges before the
  ID exists and stays dormant until it is set.
- **Testable logic lives in `lib/`**: showcase's runner is `bun test lib` and it
  has no component test setup. All decision logic (should-load, event mapping,
  consent parsing, queue draining) sits in pure `lib/` functions; the React
  components stay thin wiring with no branching worth testing.
- **Events mirror the existing PostHog vocabulary**: GA4 gets the same
  conversions PostHog already tracks, not a parallel taxonomy, so the two can be
  reconciled. GA4 reserved names (`sign_up`, `page_view`) are used where they
  map cleanly, since ad platforms key off them.

## Non-goals

- **The consent banner itself (STA-317).** No UI, no accept/refuse, no
  persistence writing, no footer "change your choice" link, no banner copy in
  EN/FR/ES/PL. This issue only reads a choice it cannot yet set.
- **TikTok and Meta pixels.** Same parent (STA-271), separate issues.
- **Checkout conversion.** *Scope finding:* there is no Stripe checkout on
  showcase. The funnel hands off to `app.stampeo.app` (`redirectToApp()` in
  `OnboardingWizard.tsx`) and checkout happens in `web/`. Measuring it in GA4
  needs cross-domain tracking or a `web/`-side tag — neither is in this issue.
  The issue's third checkbox is therefore only partly satisfiable here; see
  "Open question for the user" below.
- **Privacy/cookie policy page updates.** Listed under STA-317's scope.
- **Changing PostHog.** It stays cookieless and consent-independent.
- **Server-side GA4 / Measurement Protocol.** Client tag only.

## Edge cases considered

- **No measurement ID set** (local dev, preview, before the property exists):
  nothing renders, no script, no errors. This is the default state on merge.
- **ID set but consent denied/unset**: nothing renders. Denied and unset are
  treated identically — absence of consent is not consent.
- **Consent granted mid-session** (once STA-317 exists): the component subscribes
  to a consent-change event so the tag loads without a reload. Until STA-317
  emits it, this path is dead code that the unit tests still cover.
- **Consent revoked mid-session**: we stop sending events immediately. We do
  *not* attempt to unload the already-injected gtag script (not possible) —
  documented as deliberately partial; a reload fully clears it. STA-317 should
  hard-reload on revoke.
- **Events fired before the script finishes loading**: `dataLayer` is created and
  pushed to before the script arrives; gtag replays the queue on load. Standard
  gtag behavior, but asserted in tests so a refactor cannot silently drop the
  first (most valuable) conversion.
- **Events fired while consent is denied**: dropped, never buffered for later
  replay. Buffering pre-consent behavior and flushing on accept is retroactive
  tracking of a non-consenting visitor.
- **SSR / no `window`**: every consent read and event send is a no-op on the
  server. Showcase is statically generated per-locale; a `document.cookie` read
  at module scope would break the build.
- **Malformed consent cookie**: parses to "denied", not a throw.
- **Locale prefixes and market paths** (`/fr`, `/us/pricing`): GA4 records the
  full path as-is. No path normalization — `/us/pricing` vs `/pricing` is a
  distinction ad measurement wants to keep.
- **Client-side route changes**: `next/script` + gtag's default `page_view`
  only fires on initial load, so App Router navigations need an explicit
  `page_view` on pathname change, or every campaign landing looks like a
  one-page session.

## Acceptance criteria

- **AC1**: Given no `NEXT_PUBLIC_GA_MEASUREMENT_ID`, when any showcase page
  renders, then no gtag script tag is emitted and no request to
  `googletagmanager.com` is made — regardless of consent state.
- **AC2**: Given a measurement ID is set and analytics consent is absent
  (no cookie), when any showcase page renders, then no gtag script is emitted,
  no `_ga*` cookie is set, and NOT merely a Consent-Mode-denied tag that still
  pings Google.
- **AC3**: Given a measurement ID is set and consent is explicitly denied, then
  the result is identical to AC2 (denied and unset are indistinguishable to GA).
- **AC4**: Given a measurement ID is set and consent is granted, when a page
  renders, then the gtag script for that ID loads exactly once and a `page_view`
  is recorded.
- **AC5**: Given consent is granted, when the visitor navigates client-side to
  another showcase route, then exactly one additional `page_view` with the new
  path is recorded, and NOT a duplicate for the initial page.
- **AC6**: Given consent is granted, when a signup CTA is clicked, then a
  `sign_up_cta_click` event is recorded carrying `cta_location`, `locale` and
  `href`, and the existing PostHog `landing_cta_clicked` event still fires
  unchanged.
- **AC7**: Given consent is granted, when the onboarding wizard completes and
  redirects to the app, then a GA4 `sign_up` event is recorded.
- **AC8**: Given consent is denied or unset, when any tracked interaction occurs,
  then no GA4 event is queued, sent, or buffered for later replay, and the
  interaction itself still works (navigation, wizard progression).
- **AC9**: Given consent is granted after the page has already rendered, when the
  consent-change event fires, then the tag loads without a full page reload.
- **AC10**: Given consent is granted and then revoked, when a tracked interaction
  occurs, then no further GA4 events are sent.
- **AC11**: A malformed or unrecognized consent cookie value resolves to denied,
  and never throws.

## Touched areas and risks

- **`CTAButton.tsx`** is used on every landing surface (hero, pricing, FAQ, final
  CTA, loyalty picker, variant landings). A throw in the click handler would
  break navigation site-wide — GA sends must be fully guarded.
- **`OnboardingWizard.tsx`** is the conversion funnel. Its effects already have
  `startedRef`/`oauthHandledRef` guards against double-fire; the `sign_up` event
  must respect the same discipline, and must not delay `redirectToApp()`.
- **PostHog coexistence**: both tags on one page. Event names must not collide in
  a way that confuses either tool; `landing_variant` super-property is PostHog-only.
- **Existing `landing_variant` A/B test**: GA4 events should carry the variant too
  or the two tools will disagree on variant performance.
- **Static generation**: showcase pre-renders per locale. Consent must never be
  read during SSR/SSG.
- **Build/lint/type-check gate**: memory note — the dev server blocks the
  showcase build; stop it before running `bun run build`.
- **i18n catalog parity test** (`lib/i18n-catalogs.test.ts`): if any user-facing
  string is added it must exist in all four locales. This issue plans to add
  none (banner copy is STA-317).

## Docs impact (preliminary)

Probably none client-facing: no user-visible behavior, no new setting, no copy,
no tier gating — the tag is inert on merge. The privacy/cookie policy does need
to list GA4, but that is explicitly STA-317's scope and only becomes true when
the tag can actually fire. Revisit at Phase 6 against the real diff.

## Open question for the user (does not block plan approval)

The issue's third checkbox asks to verify **checkout** conversion in DebugView.
Showcase has no checkout. Options, for later: (a) accept signup-handoff as the
showcase-side conversion and measure checkout separately in `web/`; (b) open a
follow-up for cross-domain GA4 between `stampeo.app` and `app.stampeo.app`.
Recommend (a) now, (b) as a follow-up issue.
