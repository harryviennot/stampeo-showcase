# Plan: Meta pixel on showcase (dormant behind a consent gate)

ISSUE: STA-319 (https://linear.app/stampeo/issue/STA-319/install-meta-pixel-on-showcase)
BRANCH: `feat/sta-319-meta-pixel`
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

STA-271 wants Meta ad campaigns pointed at the showcase site, which needs a
Meta pixel to attribute conversions. The pixel sets `_fbp` / `_fbc` cookies, so
under GDPR/CNIL it may not fire before explicit opt-in — and showcase has no
consent layer at all today. PostHog runs cookieless on purpose
(`persistence: "memory"` in `instrumentation-client.ts`, the STA-313 posture),
so the Meta pixel would be the site's first cookie-setting tracker.

STA-317 (the consent banner) is the designated home for that opt-in and is
still in Backlog. Linear marks this issue `blockedBy` STA-317. The user has
chosen to land the pixel code now in a **dormant** state — written, reviewed,
merged, and structurally incapable of firing — so that STA-317 only has to
flip one gate when it ships.

This plan was accepted with that trade-off understood and stated: the work
produces no measurable pixel until STA-317 lands, and a dormant tag is not
verifiable end-to-end with Pixel Helper. The compensating control is that the
deny default is enforced by tests, not by discipline.

## Decisions

- **Dormant-by-construction, not dormant-by-config**: the gate lives in code
  with a test asserting it denies, not in an env flag someone can set in
  Doppler. Flipping it on requires deleting a test that names STA-317.
- **Two independent conditions to load**: a configured `NEXT_PUBLIC_META_PIXEL_ID`
  AND granted marketing consent. Today both are false. Either one false is
  enough to keep the tag off, so a stray env var alone cannot wake it.
- **No `<Script src>` in JSX anywhere**: the fbq loader injects its `<script>`
  imperatively from inside the gated branch. A static tag in JSX would render
  before any gate could run — that is exactly the accident this design forbids.
- **`lib/consent.ts` is real and belongs to STA-317**: `hasMarketingConsent()`
  is implemented, reads the visitor's stored choice, and denies on the server
  and on anything unknown. This issue imports it. (Superseded: it was to be a
  stub hard-returning `false`, with AC1 pinning that; both are dropped, because
  a hard `false` now means the pixel can never fire.)
- **Conversion events are mapped purely**: `metaEventForCTA()` turns a
  `CTALocation` + href into a Meta standard event name or `null`. Pure function,
  unit tested, so the event taxonomy is reviewable without a live pixel.
- **Signup click maps to `Lead`**: showcase CTAs hand off to the app; `Lead` is
  the honest Meta standard event for an outbound intent click, not `CompleteRegistration`.
- **Track calls are always safe to make**: `trackMetaEvent()` no-ops when the
  pixel never loaded. Call sites do not branch on consent — no `fbq is not
  defined` crash is possible.
- **The `<noscript>` fallback pixel is omitted, deliberately**: Meta's base code
  ends with a bare `<img src="facebook.com/tr?...">` inside `<noscript>`. It
  fires with no JavaScript involved, so no JS consent gate can ever suppress
  it — for a JS-disabled visitor it would track unconditionally. It is simply
  not shipped. Losing JS-disabled attribution is the correct trade.
- **`PageView` fires from inside the gated loader, not at parse time**: Meta's
  snippet calls `fbq('track', 'PageView')` inline. Ours calls it only after the
  gate has passed and `init` has run.
- **Automatic advanced matching stays OFF** (Events Manager setting, not code):
  it scrapes email/phone inputs from the DOM and ships hashed values to Meta.
  Showcase collects exactly those in the onboarding/signup flow. Hashed contact
  details are pseudonymised, not anonymised — still personal data under GDPR,
  needing their own basis and specific privacy-policy disclosure. If match rate
  ever justifies it, use *manual* advanced matching so the fields sent are
  explicit and reviewable in a diff.

## Non-goals

- **The consent banner itself.** No UI, no persistence, no copy, no footer
  revisit link, no privacy-policy edit. All of that is STA-317. This issue adds
  zero user-visible surface.
- **The `checkout` conversion event from STA-319's third checkbox.** There is no
  checkout on showcase — it lives in `web/` (the dashboard), behind auth. A
  `Purchase` event therefore cannot fire from this repo. Firing it needs the
  pixel installed in `web/` too, which is a separate issue against a different
  repo. Called out below and to be raised on the Linear issue.
- **Anything in `web/`.** See "Cross-subdomain attribution" below — the funnel
  continues on `app.stampeo.app`, but installing the tag there is a separate
  issue in a separate repo.
- **Creating the pixel in Meta Events Manager** (checkbox 1). Done by the user
  outside the repo: pixel ID `1088158323750710` (a first attempt,
  `2030471740941815`, was created outside the business portfolio and abandoned —
  no history, never wired in). The ID is not load-bearing for this diff either
  way: the code reads `NEXT_PUBLIC_META_PIXEL_ID` and no-ops when unset (AC3).
  Remaining manual steps — confirm portfolio ownership, assign to the ad
  account, domain-verify `stampeo.app`, rank AEM events — are tracked in
  `meta-pixel-setup.md`, not here.
- **Pixel Helper / Test Events verification** (checkbox 3). Impossible while
  dormant; it moves to the STA-317 runbook as the flip-on verification.
- GA4 and the TikTok pixel. Same gate will serve them; not built here.
- Meta Conversions API (server-side). Not requested.

## Edge cases considered

- `NEXT_PUBLIC_META_PIXEL_ID` unset (today): loader no-ops, no network, no
  console noise. Same shape as the existing `NEXT_PUBLIC_POSTHOG_KEY` guard.
- Pixel ID set but consent denied (the STA-317 interim state): still no load.
  This is the case that proves the gate, so it gets its own test.
- Consent granted but pixel ID unset: no load, no crash.
- `trackMetaEvent()` called before/without init: silently drops. Deliberately
  no queue-and-replay — replaying events recorded pre-consent into a
  post-consent pixel would leak exactly what consent is meant to prevent.
- Double init (React strict mode / remount): guarded by an idempotent flag so
  the snippet injects at most once.
- SSR: every entry point is client-only and `typeof window` guarded; the module
  must be importable from a server component without touching `document`.
- Unknown `CTALocation` passed to the mapper: returns `null`, no event. New CTA
  locations stay silent until someone maps them deliberately.
- Ad blockers blocking `connect.facebook.net`: out of scope, no fallback.

## Acceptance criteria

- **AC1**: *(Dropped by the amendment above. `hasMarketingConsent()` is real;
  its deny-by-default behaviour is pinned by `lib/consent.test.ts` in STA-317.
  AC2-AC4 below still hold and are now the gate's real tests.)*
- **AC2**: Given a configured pixel ID and `consent = false`, when
  `shouldLoadMetaPixel()` is evaluated, then it returns `false` — and NOT
  `true` on the strength of the pixel ID alone.
- **AC3**: Given no pixel ID and `consent = true`, when `shouldLoadMetaPixel()`
  is evaluated, then it returns `false`.
- **AC4**: Given a configured pixel ID and `consent = true`, when
  `shouldLoadMetaPixel()` is evaluated, then it returns `true`. (The gate is a
  real gate, not a hard-coded `false` — STA-317 inherits working code.)
- **AC5**: Given the pixel was never initialised, when `trackMetaEvent()` is
  called, then it returns without throwing and performs no network call, and
  NOT a `ReferenceError: fbq is not defined`.
- **AC6**: Given a landing CTA click, when `metaEventForCTA()` maps it, then a
  signup-bound CTA yields `"Lead"`, a demo/contact-bound CTA yields
  `"Contact"`, and an unmapped location yields `null`.
- **AC7**: Given the site is loaded in a browser with the code merged, then no
  request to `connect.facebook.net` is made and no `_fbp` or `_fbc` cookie is
  set, on any route, in any locale. (Manual, Phase 5.)
- **AC8**: Given a server component imports the pixel module, when the page is
  rendered, then the build succeeds and no `document is not defined` error
  occurs — verified by `bun run build` passing.
- **AC9**: Given the existing PostHog CTA events, when the Meta call sites are
  added, then `landing_cta_clicked` still fires with unchanged props, and NOT
  a duplicated or renamed event.

## Touched areas and risks

- **`components/ui/CTAButton.tsx`** — the single funnel for landing CTA
  tracking, used across hero, pricing, FAQ, final CTA. A mistake here is
  sitewide. `PricingTierCard.tsx` calls `trackLandingCTAClicked` directly and
  must get the same treatment or be deliberately left alone; the diff will say
  which.
- **`lib/analytics.ts`** — PostHog taxonomy is live and feeding dashboards.
  Meta calls go alongside, never replacing or renaming an existing capture.
- **`app/[locale]/layout.tsx`** — mount point for the (inert) initialiser.
  Shared by every locale including the `us`/`uk` market routes from STA-315.
- **Consent posture** — the risk this whole design exists to manage. Any
  regression here is a legal exposure, not a bug. AC1/AC2/AC7 are the tripwires.
- **Dead-code drift** — the real risk of the dormant approach: the module sits
  unexercised until STA-317, so a future refactor could silently break it with
  no signal. Mitigated by AC4 keeping the positive path tested.

## Cross-subdomain attribution (affects follow-on issues, not this diff)

The funnel does not end on showcase. Onboarding and checkout continue on
`app.stampeo.app` (`web/`), so attribution has to survive the hop.

The good news: this is cross-**subdomain**, not cross-domain. Showcase is the
apex `stampeo.app`, the app is `app.stampeo.app` — same registrable domain.
Meta's `_fbp` is a first-party cookie scoped to the registrable domain, so a
`_fbp` written on the apex is readable on the app subdomain with no bridging,
no link decoration and no `fbq` cross-domain configuration. The repo already
depends on this shape for auth (`NEXT_PUBLIC_COOKIE_DOMAIN=.stampeo.app`).
Confirm it in Test Events at flip-on rather than assuming it.

Three consequences, all outside this diff:

1. **STA-317's consent cookie MUST be scoped `.stampeo.app`, not host-only.**
   Otherwise `web/` cannot read the consent decision: the banner reappears on
   the app, and the app-side pixel has no opt-in record — so it either fires
   ungated or never fires. This is a design constraint on STA-317 that is not
   currently in its description. Raise it there.
2. **`Purchase` should be a server event, not a browser event.** Checkout sits
   behind auth in `web/`; a client-side `Purchase` is the least reliable event
   available (ad blockers, tab closed on the Stripe return, double-fire on
   refresh). The accurate version is Conversions API fired from the backend at
   Stripe webhook time, where the authoritative amount and currency already
   live. It needs `_fbp` / `_fbc` captured at signup and stored against the
   business so the server event can be attributed. Backend issue.
3. **The `web/` install is its own issue**, and it inherits this same consent
   gate — so STA-317's gate must be reachable from `web/`, or the gate gets
   implemented twice and drifts.

## Docs impact (preliminary)

Probably none. This issue ships no user-visible behavior, no setting, no copy,
and no tier gating — the four Phase 6 questions all look like "no". The
privacy/cookie policy pages under `legal/` do list trackers and WILL need the
Meta entry, but only when the pixel can actually fire: that edit belongs to
STA-317's checklist, not here. To be re-answered against the real diff at
Phase 6 and recorded in `docs-decision.md` either way.
