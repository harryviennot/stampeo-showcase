# Plan: Meta pixel on showcase, consent-gated

ISSUE: STA-319 (https://linear.app/stampeo/issue/STA-319/install-meta-pixel-on-showcase)
BRANCH: `harryviennot2/sta-319-install-meta-pixel-on-showcase`
REPOS: showcase
MIGRATION: no
BASE: `harryviennot2/sta-271-...` (the epic branch). NOT `main` — `lib/consent.ts`
is STA-317's and has not reached `main` yet.
STATUS: APPROVED (2026-09-16, by the user)

> Approved with both open questions resolved as proposed: `PricingTierCard`
> gets the Meta call sites, and demo CTAs map to `Contact` kept distinct from
> `Lead`. The user separately confirmed the two load-bearing behaviours:
> business-slug pages are not marketing and must never carry the tag (AC11),
> and the US opt-out regime is intended (AC14).

> **REWRITTEN 2026-09-16, after STA-317 merged (PR #128).** The original plan
> built this pixel *dormant*, defining its own consent stub, because the banner
> did not exist. That premise is gone: `lib/consent.ts` now owns the whole
> contract and this issue is a consumer of it. The pixel **fires for real**.
> The earlier deny-by-construction decisions and AC1 are dropped — a hard-coded
> `false` would now mean the tag never fires at all.

## Problem

STA-271 wants Meta ad campaigns pointed at showcase, which needs a pixel to
attribute conversions. Nothing on the site sends Meta anything today.

STA-317 has since shipped the gate this depends on: a consent record, a banner
and a US notice, a route allowlist, and the read seams
`hasMarketingConsent()` / `useConsent()`. The privacy policy already lists Meta
and its `_fbp` / `_fbc` cookies. So the blocker is resolved and the remaining
work is the tag itself.

This issue is the **first** of the three tag installs (STA-318 GA4, STA-320
TikTok are both still DRAFT), so the loader shape built here becomes the
template those two follow.

## Decisions

### The gate

- **Four conditions, all required, in one pure function.**
  `shouldLoadMetaPixel({ pixelId, marketing, ready, trackable })` returns true
  only when all four hold. Pure, so the whole gate is unit-testable without a
  browser. The four:
  - `pixelId` — `NEXT_PUBLIC_META_PIXEL_ID` present, matching the existing
    PostHog/Sentry env-guard shape.
  - `marketing` — from `useConsent()`, which denies on the server and on
    anything unknown.
  - `ready` — `useConsent().ready`. False during SSR and first paint. Acting
    before it is true would race the regime detection and could fire at a
    European visitor on the strength of a server-render placeholder.
  - `trackable` — `isTrackablePath(usePathname())`. **Not optional and not a
    nicety**: any unrecognised segment under a locale is a business's own
    enrollment page. Firing there would ship a café's customers to Meta, which
    is not something that can be taken back.
- **No `<Script src>` in JSX anywhere.** The loader injects its `<script>`
  imperatively from inside the gated branch. A static tag in JSX renders before
  any gate can run.
- **Nothing is loaded-then-suppressed.** Meta has no cookieless mode; the only
  way not to contact `connect.facebook.net` is to not load the script. Matches
  STA-317's stated posture, so a refusal leaves nothing to clean up.
- **Revocation relies on STA-317's reload.** An `fbq` already resident cannot be
  unloaded, which is why STA-317 reloads the page on revoke. This issue adds no
  teardown of its own and must not pretend to.

### Consequences worth stating plainly

- **US visitors are tracked without clicking anything.** `resolveConsent()`
  returns `marketing: true` for the `opt-out` regime when there is no stored
  record and no GPC signal. So on `/us` the pixel loads on first eligible paint,
  behind a notice rather than a banner. That is STA-317's deliberate design
  decision, not something this issue introduces — but it is the single biggest
  behavioural fact about this pixel and belongs in the runbook, because "the
  pixel fired and I never consented" will otherwise read as a bug.
- **GPC is honoured before any regime default**, so a US visitor sending Global
  Privacy Control gets no pixel.

### Events

- **`PageView` fires from the loader after `init`**, never at parse time.
- **Client-side navigation needs an explicit `PageView`.** Meta's pixel fires
  one `PageView` at init; Next's client routing never reloads the page, so
  without this every visit looks like one page. The subtle half: a navigation
  from a trackable path to a **non**-trackable one must fire nothing. The
  script stays resident — it cannot be unloaded — so per-call path checking is
  the only thing standing between a café's enrollment page and Meta.
- **Conversion events map purely.** `metaEventForCTA({ ctaLocation, href })`
  returns a Meta standard event name or `null`. Unknown locations return `null`
  — a new CTA stays silent until someone maps it deliberately.
- **Signup CTAs → `Lead`.** Showcase hands off to the app; `Lead` is the honest
  standard event for an outbound intent click, not `CompleteRegistration`.
- **Demo/contact CTAs → `Contact`, kept distinct from `Lead`.** They are
  different funnels — self-serve signup versus a sales touch — and campaigns
  will want to optimise for them separately. AEM allows 8 ranked events and this
  uses 3, so the distinction is free. *(Open question at the gate, resolved this
  way unless you say otherwise.)*
- **`PricingTierCard.tsx` gets the Meta call sites too.** It calls
  `trackLandingCTAClicked` directly rather than through `CTAButton`, so it needs
  wiring explicitly. Pricing clicks are the highest-intent signal on the site;
  omitting them would mean optimising campaigns against the weaker events.
  *(Open question at the gate, resolved this way unless you say otherwise.)*
- **Automatic advanced matching stays OFF** (an Events Manager setting, not
  code). It scrapes email/phone inputs from the DOM and ships hashed values to
  Meta; showcase collects exactly those in onboarding. Hashed contact details
  are pseudonymised, not anonymised — still personal data, needing their own
  basis and specific disclosure. If match rate ever justifies it, use *manual*
  advanced matching so what is sent is a reviewable diff.
- **The `<noscript>` fallback is not shipped.** Meta's snippet ends with a bare
  `<img src="facebook.com/tr?...">`. It fires with no JavaScript, so no JS gate
  can suppress it. Losing JS-disabled attribution is the correct trade.

### Structure

- **Decision logic in `lib/`, React component stays thin.** Showcase's runner is
  `bun test lib` and there is no component test setup, so anything with a branch
  in it lives in `lib/meta-pixel.ts` as a pure function. `components/analytics/MetaPixel.tsx`
  mounts, reads the hook, and calls the lib. Same split as STA-317 and as the
  sibling plans.
- **No shared multi-vendor loader abstraction yet.** GA4 and TikTok have
  different snippets, different init signatures and different event
  vocabularies. Factoring a common loader from a sample of one is guesswork;
  the honest moment to extract it is after STA-320, when three real shapes
  exist. Flagged so it is a decision rather than an oversight.

## Non-goals

- **The consent layer.** Shipped by STA-317. This issue adds no consent code,
  no banner, no storage, no policy edit.
- **The `checkout` conversion event** (issue checkbox 3). There is no checkout
  on showcase — it is in `web/`, behind auth. See "Cross-subdomain attribution".
- **Anything in `web/`.** Separate repo, separate issue.
- **Creating the pixel in Events Manager** (checkbox 1). Done: ID
  `1088158323750710`, domain-verified, ad account attached. See
  `meta-pixel-setup.md`.
- **Aggregated Event Measurement ranking.** Needs events Meta has actually seen;
  do it after this ships. Tracked in `meta-pixel-setup.md`.
- GA4 (STA-318) and TikTok (STA-320). Same gate, separate issues.
- Meta Conversions API (server-side). Not requested.

## Edge cases considered

- `NEXT_PUBLIC_META_PIXEL_ID` unset: no load, no network, no console noise.
- Consent granted, pixel ID unset: no load, no crash.
- Pixel ID set, consent refused: no load. The case the whole design exists for.
- First paint / `ready === false`: no load, even for a visitor who accepted on a
  previous visit. One frame of delay is the cost of not racing regime detection.
- Landing directly on a business slug (`/some-cafe`): never initialises at all.
- Navigating trackable → non-trackable after the script loaded: script stays
  resident, but no further `fbq` call is made.
- Consent granted live, without a reload: the component subscribes via
  `useConsent()`, so accepting loads the pixel in the same page view.
- Consent revoked: STA-317 reloads the page. No teardown here.
- Double init (strict mode, remount, consent event storm): idempotent flag, the
  snippet injects at most once.
- `trackMetaEvent()` before/without init: silently drops. **No queue-and-replay**
  — replaying pre-consent events into a post-consent pixel would leak exactly
  what consent prevents.
- SSR: every entry point is `typeof window` guarded and importable from a server
  component without touching `document`.
- Ad blockers blocking `connect.facebook.net`: out of scope, no fallback.

## Acceptance criteria

- **AC1**: *(Dropped. `hasMarketingConsent()` is real and its deny-by-default
  behaviour is pinned by STA-317's `lib/consent.test.ts`.)*
- **AC2**: Given a pixel ID, `ready`, a trackable path and `marketing = false`,
  when `shouldLoadMetaPixel()` is evaluated, then `false` — and NOT `true` on
  the strength of the pixel ID alone.
- **AC3**: Given no pixel ID and `marketing = true`, then `false`.
- **AC4**: Given a pixel ID, `marketing = true`, `ready`, and a trackable path,
  then `true`. (The gate is a real gate.)
- **AC5**: Given the pixel was never initialised, when `trackMetaEvent()` is
  called, then it returns without throwing and performs no network call — NOT
  a `ReferenceError: fbq is not defined`.
- **AC6**: Given a CTA click, when `metaEventForCTA()` maps it, then a
  signup-bound CTA yields `"Lead"`, a contact/demo-bound CTA yields
  `"Contact"`, and an unmapped location yields `null`.
- **AC7**: Given a visitor who has not consented, then no request reaches
  `connect.facebook.net` and no `_fbp` / `_fbc` cookie exists — on any route, in
  any locale. (Manual, Phase 5.)
- **AC8**: Given a server component imports the pixel module, then the build
  succeeds with no `document is not defined` — verified by `bun run build`.
- **AC9**: Given the existing PostHog CTA events, when Meta call sites are
  added, then `landing_cta_clicked` still fires with unchanged props, and NOT a
  duplicated or renamed event.
- **AC10**: Given `ready = false` with every other condition satisfied, then
  `shouldLoadMetaPixel()` returns `false`.
- **AC11**: Given a pixel ID, `marketing = true`, `ready`, and a **non**-trackable
  path (a business slug, `/onboarding`, `/login`), then `false`. The pixel must
  never initialise on a business's enrollment page.
- **AC12**: Given a visitor who accepts in the banner, when the choice is
  committed, then the pixel loads in that same page view without a reload.
- **AC13**: Given the pixel is loaded, when the visitor navigates client-side to
  another trackable path, then exactly one additional `PageView` is sent; when
  they navigate to a non-trackable path, then **no** event is sent.
- **AC14**: Given a US visitor with no stored record and no GPC, then the pixel
  loads without any click. (Encodes STA-317's opt-out regime so a later change
  to it fails loudly here.)

## Touched areas and risks

- **`components/ui/CTAButton.tsx`** — the single funnel for landing CTA
  tracking, used across hero, pricing, FAQ, final CTA. A mistake is sitewide.
- **`components/pricing/PricingTierCard.tsx`** — calls `trackLandingCTAClicked`
  directly; now also gets Meta call sites.
- **`lib/analytics.ts`** — live PostHog taxonomy feeding dashboards. Meta calls
  go alongside, never replacing or renaming a capture (AC9).
- **`app/[locale]/layout.tsx`** — mount point, shared by every locale including
  the `us` / `uk` market routes from STA-315.
- **`lib/consent-routes.ts`** — consumed, not modified. It carries a drift guard
  that fails when a new route folder is added without classifying it; that guard
  now protects this pixel too.
- **Consent posture** — any regression here is legal exposure, not a bug.
  AC7/AC11/AC14 are the tripwires.
- **Template risk** — STA-318 and STA-320 will copy this shape. A weakness here
  gets replicated twice before anyone notices.

## Cross-subdomain attribution (affects follow-on issues, not this diff)

The funnel does not end on showcase: onboarding and checkout continue on
`app.stampeo.app`.

This is cross-**subdomain**, not cross-domain — showcase is the apex
`stampeo.app`, the app is `app.stampeo.app`, same registrable domain. `_fbp` is
a first-party cookie scoped to the registrable domain, so it is readable on the
app subdomain with no bridging or link decoration. STA-317 already scoped the
consent cookie the same way via `NEXT_PUBLIC_COOKIE_DOMAIN` (see the comment in
`consentCookieAttributes`), so the app can read the same choice when it grows a
tracker. Confirm in Test Events rather than assuming.

Three consequences, all outside this diff:

1. **`Purchase` should be a server event, not a browser event.** Checkout sits
   behind auth in `web/`; a client-side `Purchase` is the least reliable event
   available (ad blockers, tab closed on the Stripe return, double-fire on
   refresh). The accurate version is Conversions API from the backend at Stripe
   webhook time, where the authoritative amount and currency already live. It
   needs `_fbp` / `_fbc` captured at signup and stored against the business.
   Backend issue.
2. **The `web/` pixel install is its own issue**, and inherits this same gate —
   so `lib/consent.ts` must be reachable from `web/`, or it gets implemented
   twice and drifts.
3. **AEM ranking** happens once events flow: `Lead` → `Contact` → `PageView`.

## Docs impact (preliminary)

Likely none. STA-317 already updated the privacy policy: §5.3 lists
"Advertising measurement | Meta | `_fbp`, `_fbc`", and §5.1 states no request
reaches Meta before acceptance. Both are already true of this implementation, so
this issue changes no user-visible copy, adds no setting, and alters no tier
gating. To be re-answered against the real diff at Phase 6 and recorded in
`docs-decision.md` either way.
