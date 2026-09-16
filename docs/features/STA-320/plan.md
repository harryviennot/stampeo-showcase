# Plan: TikTok pixel on showcase, consent-gated

ISSUE: STA-320 (https://linear.app/stampeo/issue/STA-320/install-tiktok-pixel-on-showcase)
BRANCH: `harryviennot2/sta-320-install-tiktok-pixel-on-showcase`
REPOS: showcase
MIGRATION: no
BASE: `harryviennot2/sta-319-install-meta-pixel-on-showcase`, NOT the epic branch.
STA-319 edits `CTAButton.tsx` and `PricingTierCard.tsx`, which this issue edits
again at the same lines. Basing on the epic guarantees a conflict in the one
file where a bad merge is sitewide.
STATUS: DRAFT

> **REWRITTEN 2026-09-16, after STA-317 merged (PR #128) and STA-319 landed.**
> The first draft built this pixel *inert*, defining its own consent stub,
> because no banner existed. That premise is gone twice over: `lib/consent.ts`
> owns the contract, and STA-319 has already built the loader shape this issue
> was told to follow. The old deny-by-construction decisions, the `holdConsent`
> defence-in-depth layer, and old AC1/AC6 are dropped.
>
> Two corrections from the first draft, both load-bearing:
> - **`CompleteRegistration` is not reachable.** The account really is created
>   on showcase in `OnboardingWizard`, but `/onboarding` is in
>   `PRIVATE_SEGMENTS`, so the pixel never loads there. Signup CTAs map to the
>   click, as STA-319 decided.
> - **Pricing CTAs no longer map to `InitiateCheckout`.** There is no checkout
>   on showcase, so the label would promise Stripe-correlated data we cannot
>   deliver, and it would split a group Meta keeps whole.

## Problem

STA-271 wants TikTok ad campaigns pointed at showcase, which needs a pixel to
attribute conversions. Nothing on the site sends TikTok anything today.

The two blockers from the first draft are both resolved. STA-317 shipped the
gate: a consent record, a banner and a US notice, the route allowlist, and the
read seams `hasMarketingConsent()` / `useConsent()`. The privacy policy already
lists TikTok and its `_ttp` cookie (§5.3), and §5.1 already promises no request
reaches TikTok before acceptance. And the pixel now exists in Ads Manager:
ID `DALA1OBC77UDHLL44GCG`, first-party cookies ON.

This is the **third and last** of the three tag installs, so unlike STA-319 it
invents nothing — it is the sample that makes a shared abstraction honest.

## UX decisions

No UI surface. The component renders `null`; the only visible artefact on the
site is STA-317's banner, which already shipped. `ux-designer` not invoked.

## Decisions

### The gate — mirrored from STA-319, deliberately

- **Four conditions, all required, in one pure function.**
  `shouldLoadTikTokPixel({ pixelId, marketing, ready, trackable })`, the same
  shape and the same argument names as `shouldLoadMetaPixel`. Divergence here
  would be gratuitous: two gates that differ in wording but not in meaning are
  two gates to audit.
- **`shouldSendTikTokEvent({ loaded, trackable })`** for the per-event check,
  for the same reason STA-319 has one: the script stays resident across a
  client-side navigation onto a page it may not report on.
- **No `<Script src>` in JSX.** Injected imperatively from inside the gated
  branch. A static tag renders before any gate runs.
- **Nothing loaded-then-suppressed.** `lib/consent.ts` states it outright:
  TikTok has no cookieless mode. Not loading the script is the only way not to
  contact `analytics.tiktok.com`.
- **Revocation relies on STA-317's reload.** No teardown here.

### What is NOT mirrored, and why

- **TikTok's consent-mode calls (`holdConsent` / `grantConsent`) are not used.**
  The first draft planned them as defence in depth. They are dead weight under
  this architecture: the script is only injected once consent is already
  granted, so a hold that is immediately granted gates nothing. They also
  require a **Cookie Consent Mode** toggle in Events Manager to do anything at
  all, which makes them a layer whose activation lives outside the repo and
  cannot be asserted by a test. A guarantee that silently depends on a
  dashboard setting is worse than no guarantee, because it reads like one.
- **Enhanced data postback should be OFF** (an Events Manager setting, not
  code). It collects page content, clicks, button interactions and time spent
  automatically. It is TikTok's analogue of the automatic advanced matching
  STA-319 refused, and broader. The route allowlist keeps it off `/onboarding`
  where email and phone are typed — but that is one table entry deep, and
  enhanced postback is what turns an allowlist slip from a leaked page view
  into leaked form interactions. It is also undeclared: the policy's tracker
  table names cookies, and this is not a cookie.
  **Recorded as a decision the code cannot enforce — the runbook must read the
  toggle's real state rather than assume it.**

### Events

- **`ttq.page()` fires from the loader after `ttq.load()`**, never at parse time.
- **Client-side navigation needs an explicit `ttq.page()`**, and a navigation
  onto a non-trackable path must fire nothing.
- **Conversion events map purely.** `tiktokEventForCTA({ ctaLocation, href })`
  returns a TikTok standard event or `null`. Unknown locations return `null`.
  The CTA groupings are **imported from one shared source with STA-319's**, not
  re-declared: two copies of `SIGNUP_CTAS` drifting apart is how a pricing CTA
  ends up reported to one vendor and not the other.
- **Signup CTAs → `ClickButton`.** TikTok's vocabulary has no `Lead`. The
  honest options are `ClickButton` (what literally happened) or `SubmitForm`
  (TikTok's lead-gen analogue, but no form is submitted). Taking the accurate
  one. *(Open question at the gate — see below.)*
- **Demo/contact CTAs → `Contact`**, matching STA-319's split.
- **Standard events only, never custom ones.** TikTok's own docs are
  inconsistent about names (`Purchase` vs `CompletePayment` in different
  places), so the exact strings get confirmed against **Events Manager → Event
  Builder** for this account before the tests are written, not taken from a
  doc page.

### Structure

- **Decision logic in `lib/tiktok-pixel.ts`, component thin.** `bun test lib`
  is the runner; anything with a branch lives in `lib/`.
- **Now is the moment to extract the shared loader — but not in this issue.**
  STA-319 deferred the abstraction until three real shapes existed. After this
  lands they do. Extracting it *here* would mean refactoring two shipped
  pixels behind a third one's tests. Raising it as a follow-up instead.

## Non-goals

- **The consent layer.** STA-317 shipped it. No consent code, storage, banner
  or policy edit in this diff.
- **The `checkout` conversion event** (issue checkbox 3). No checkout on
  showcase; it is in `web/` behind auth. Same cross-subdomain analysis as
  STA-319's — a real `CompletePayment` is a TikTok Events API call from the
  backend at Stripe webhook time. Backend issue, not this one.
- **`CompleteRegistration`.** Unreachable: `/onboarding` is private.
- **Events API / server-side deduplication**, advanced matching, PII hashing.
- **Anything in `web/`.**
- GA4 (STA-318). Same gate, separate issue.
- **The shared multi-vendor loader refactor.** Follow-up, see above.
- **Verification with TikTok Pixel Helper** is now possible and IS in scope —
  unlike the first draft, the tag fires for real. It happens at Phase 6.

## Edge cases considered

- `NEXT_PUBLIC_TIKTOK_PIXEL_ID` unset: no load, no network, no console noise.
- Consent granted, pixel ID unset: no load, no crash.
- Pixel ID set, consent refused: no load. The case the design exists for.
- `ready === false` (SSR, first paint): no load, even for a visitor who
  accepted last visit. Acting earlier races regime detection.
- Landing directly on a business slug (`/some-cafe`): never initialises.
- Navigating trackable → non-trackable after load: script stays resident, no
  further `ttq` call.
- Consent granted live without reload: `useConsent()` subscription loads it in
  the same page view.
- Consent revoked: STA-317 reloads. No teardown here.
- Double init (strict mode, remount, consent event storm): idempotent flag.
- `trackTikTokEvent()` before init: silently drops. **No queue-and-replay** —
  replaying pre-consent events would leak exactly what consent prevented.
- SSR: every entry point `typeof window` guarded, importable from a server
  component.
- US opt-out regime: a US visitor with no stored record and no GPC is tracked
  without clicking. STA-317's deliberate design, inherited, and pinned by an AC
  so a change to it fails loudly here too.
- Ad blockers blocking `analytics.tiktok.com`: out of scope, no fallback.

## Acceptance criteria

- **AC1**: Given a pixel ID, `ready`, a trackable path and `marketing = false`,
  then `shouldLoadTikTokPixel()` is `false` — and NOT `true` on the strength of
  the pixel ID alone.
- **AC2**: Given no pixel ID and `marketing = true`, then `false`. A whitespace
  ID (`" "`) counts as no pixel ID.
- **AC3**: Given a pixel ID, `marketing = true`, `ready` and a trackable path,
  then `true`. (The gate is a real gate.)
- **AC4**: Given `ready = false` with every other condition satisfied, then
  `false`.
- **AC5**: Given a pixel ID, `marketing = true`, `ready`, and a **non**-trackable
  path (a business slug, `/onboarding`, `/login`), then `false`.
- **AC6**: Given the pixel was never initialised, when `trackTikTokEvent()` is
  called, then it returns without throwing and performs no network call — NOT
  a `ReferenceError: ttq is not defined`.
- **AC7**: Given a CTA click, when `tiktokEventForCTA()` maps it, then a
  signup-bound CTA yields `"ClickButton"`, a contact/demo-bound CTA yields
  `"Contact"`, and an unmapped location yields `null`.
- **AC8**: Given the CTA groupings, when both pixels map the same
  `cta_location`, then they agree on which funnel it belongs to — asserted
  against the shared source, so a new CTA cannot reach one vendor only.
- **AC9**: Given a visitor who has not consented, then no request reaches
  `analytics.tiktok.com` and no `_ttp`, `ttcsid` or `ttclid` cookie exists — on
  any route, in any locale. (Manual, Phase 6.)
- **AC10**: Given a server component imports the pixel module, then
  `bun run build` succeeds with no `document is not defined`.
- **AC11**: Given the existing PostHog and Meta CTA events, when TikTok call
  sites are added, then both still fire with unchanged props, and NOT a
  duplicated or renamed event.
- **AC12**: Given a visitor who accepts in the banner, then the pixel loads in
  that same page view without a reload.
- **AC13**: Given the pixel is loaded, when the visitor navigates client-side
  to another trackable path, then exactly one additional `ttq.page()` is sent;
  to a non-trackable path, **no** event is sent.
- **AC14**: Given a US visitor with no stored record and no GPC, then the pixel
  loads without any click. (Encodes STA-317's opt-out regime.)
- **AC15**: Given the pixel has already initialised, when the load path runs
  again, then `ttq.load` is not called a second time.

## Touched areas and risks

- **`components/ui/CTAButton.tsx`** — now carries PostHog *and* Meta *and*
  TikTok. Three vendors in one click handler, used sitewide. The highest-risk
  file in the diff; AC11 is its tripwire.
- **`components/pricing/PricingTierCard.tsx`** — same, and it calls
  `trackLandingCTAClicked` directly rather than through `CTAButton`.
- **The CTA groupings** — extracting `SIGNUP_CTAS` / `CONTACT_CTAS` out of
  `lib/meta-pixel.ts` into a shared module touches shipped STA-319 code. It is
  a pure move with no behaviour change, and AC8 pins the result, but it means
  this diff can break Meta. Worth calling out because "TikTok issue breaks the
  Meta pixel" is not where anyone would look.
- **`lib/consent.ts` / `lib/consent-routes.ts`** — consumed, never modified.
  The drift guard in `consent-routes.test.ts` now protects this pixel too.
- **`app/[locale]/layout.tsx`** — mount point, shared by every locale and the
  `us` / `uk` market routes.
- **Consent posture** — regressions here are legal exposure, not bugs.
  AC1/AC5/AC9/AC14 are the tripwires.
- **Events Manager settings are outside the repo.** Enhanced data postback and
  Cookie Consent Mode are dashboard toggles no test can assert. The runbook
  records their observed state.

## Cross-subdomain attribution (affects follow-on issues, not this diff)

**The funnel is not attributed past showcase today, and this diff does not
change that.** Worth stating plainly because the cookie-scope argument suggests
otherwise: showcase is the apex `stampeo.app`, the app is `app.stampeo.app`,
same registrable domain, so a first-party cookie scoped to `.stampeo.app` is
readable on both — STA-317 already scopes the consent cookie that way via
`NEXT_PUBLIC_COOKIE_DOMAIN` (`consentCookieAttributes`). Real groundwork, and
not sufficient. Three things break the chain, each on its own:

1. **Nothing on `app.stampeo.app` reports to TikTok.** `web/` has no pixel, no
   `ttq`, no consent code. A shared cookie attributes nothing with no tag to
   read it.
2. **`ttclid` is dropped at the handoff.** It arrives as a URL parameter on the
   landing URL; `redirectToApp()` in `OnboardingWizard.tsx` navigates to a bare
   `appUrl` with no query string. Nothing in showcase captures `ttclid`,
   `fbclid` or `utm_*` at all today.
3. **`/onboarding` is in `PRIVATE_SEGMENTS`.** The last event TikTok sees is
   the CTA click.

Also unverified: which domain TikTok's SDK sets `_ttp` on. Meta's `_fbp` uses
the registrable domain; do not assume TikTok matches. Confirm in devtools.

Three consequences, all outside this diff:

1. **Click-ID capture** — persist `ttclid` / `fbclid` / `utm_*` against the
   business at signup. Showcase + backend issue.
2. **The `web/` pixel install is its own issue**, and inherits this gate — so
   `lib/consent.ts` must be reachable from `web/`, or it gets implemented twice
   and drifts.
3. **`CompletePayment` should be a server event** — TikTok Events API from the
   Stripe webhook, where the authoritative amount and currency already are, and
   which survives ad blockers and a tab closed on the Stripe return.

## Docs impact (preliminary)

Likely none. STA-317 already lists TikTok and `_ttp` in privacy policy §5.3 and
already promises in §5.1 that no request reaches TikTok before acceptance —
both already true of this implementation. No new setting, no copy change, no
tier gating. **Unless enhanced data postback stays ON**, in which case §5.3
understates what is collected and the policy needs an edit — which is a reason
to turn it off, not a reason to edit the policy. Re-answered against the real
diff at Phase 7.
