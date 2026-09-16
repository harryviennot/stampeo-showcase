# Plan: TikTok pixel on showcase (inert until consent exists)

ISSUE: STA-320 (https://linear.app/stampeo/issue/STA-320/install-tiktok-pixel-on-showcase)
BRANCH: feat/sta-320-tiktok-pixel
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

TikTok ad campaigns for Stampeo have no pixel on the marketing site, so there
is no conversion signal to optimize against and no retargeting audience. The
issue is blocked by STA-317 (cookie consent banner), which is still in
Backlog: under GDPR/CNIL the pixel may not fire before explicit opt-in, and
showcase today has no consent mechanism at all — PostHog is deliberately
cookieless (`instrumentation-client.ts`, `persistence: "memory"`) precisely so
no banner was needed.

The user's call (2026-09-16) is to build STA-320 alone and ship it **inert**:
the full pixel integration lands now behind a consent gate that denies until
STA-317 replaces it, so no tag fires in production until the banner exists.

## Decisions

- Ship inert, not ungated: the consent reader is a stub that returns `denied`,
  so the composed gate is `false` for every input in production today. The
  legal posture is unchanged by this PR.
- STA-320 defines neither: STA-317 shipped the contract and the storage. This
  issue calls `hasMarketingConsent()` and subscribes to `CONSENT_CHANGED_EVENT`.
  (Superseded: a `readMarketingConsent()` seam with a `TODO(STA-317)` body.)
- The pixel ID comes from `NEXT_PUBLIC_TIKTOK_PIXEL_ID` and the tag stays inert
  when unset — the same shape as the existing PostHog and Sentry guards. The
  real ID is unavailable until STA-271 grants Ads Manager access.
- Page eligibility is an **allowlist**, and it already exists:
  `isTrackablePath()` in `lib/consent-routes.ts`, built by STA-317 for exactly
  this reason and covered by a drift guard that fails when a new route folder is
  added without classifying it. Do not write a second one. (The reasoning is
  unchanged and now lives in that file: any unknown segment under a locale is a
  business slug, and `lib/robots.ts` documents the same `/authentic-cafe` versus
  `/auth` collision.)
- All decision logic lives in pure functions under `lib/` so `bun test lib`
  covers it; the React component is a thin mount with no branching of its own.
- Conversion events map to TikTok standard events, not custom ones, so the
  campaign objective can target them directly.

## Non-goals

- **The consent banner itself** — that is STA-317's entire scope (accept/refuse
  parity, persistence, revisit link, EN/FR/ES copy, policy page updates). If
  meeting an AC here requires building banner UI, stop: scope has escaped.
- GA4 (STA-318) and the Meta pixel (STA-319), and any shared multi-tag consent
  manager abstraction. One tag, one seam; generalize when the second lands.
- **Checkout-complete conversion.** Checkout runs on `web/` (app.stampeo.app),
  a different app and origin the showcase pixel cannot observe. Showcase can
  only see checkout *intent* (a pricing CTA click). A true `Purchase` event
  needs the pixel on `web/` plus a TikTok Events API call from the Stripe
  webhook — a separate issue I will raise rather than fake here.
- Firing on the acquisition pages (`/[locale]/[slug]`, `/[locale]/[slug]/l/…`)
  or `/join` — those visitors are our customers' customers, not ad prospects.
- Server-side deduplication / Events API, advanced matching, and any PII
  hashing. Browser pixel only.
- Verification with TikTok Pixel Helper (issue checkbox 3) — impossible while
  the tag is inert and the ID is unset. Deferred to the STA-317 follow-up and
  recorded as such in the runbook.

## Edge cases considered

- Consent granted but `NEXT_PUBLIC_TIKTOK_PIXEL_ID` unset → no load. Prevents a
  broken `ttq` bootstrap on any environment without the ID (all of them today).
- Pixel ID set but consent denied/unknown → no load. Unknown is treated as
  denied; there is no implicit consent.
- Consent granted mid-session (post-STA-317) → the component reacts and loads
  once; a second grant must not double-init. Guarded by an init flag.
- Consent withdrawn mid-session → out of scope for STA-320 beyond not loading
  on the next mount. Full teardown/cookie-clearing is STA-317's job, noted
  deliberately unhandled.
- Business slug that collides with a marketing route name (a café slugged
  `pricing`) → the allowlist would track it. Accepted: slugs are validated
  elsewhere and the blast radius is one page view, versus the denylist
  alternative which leaks every business page.
- SSR / no `window` → every reader returns the denying default rather than
  throwing.
- Locale prefixes: the allowlist must match `/pricing`, `/fr/pricing` and the
  localized route names (`/programme-fidelite`, `/programa-de-fidelizacion`,
  `/program-lojalnosciowy`) — a locale-stripping normalizer, not raw matching.

## Acceptance criteria

- AC1: Given consent `granted` and a pixel ID set, when the gate is evaluated
  for a marketing path, then it returns `true`.
- AC2: Given consent `denied` or `unknown`, when the gate is evaluated with a
  valid pixel ID and a marketing path, then it returns `false` — and NOT
  `true` on the grounds that the ID is present.
- AC3: Given consent `granted` and no pixel ID (undefined or empty), when the
  gate is evaluated, then it returns `false`.
- AC4: Given consent `granted` and a pixel ID set, when the path is an
  acquisition page (`/some-cafe`, `/fr/some-cafe`, `/fr/some-cafe/l/centre`),
  then the gate returns `false`.
- AC5: Given consent `granted` and a pixel ID set, when the path is any
  allowlisted marketing route under any of the four locales — including the
  localized loyalty-program route names — then the gate returns `true`.
- AC6: *(Dropped by the amendment above. The tag is no longer shipped inert:
  STA-317 exists, so granted consent must actually load it. The deny-by-default
  guarantee is pinned by `lib/consent.test.ts`.)*
- AC7: Given a showcase conversion moment, when it is mapped to a TikTok
  event, then `signup_cta_clicked` → `ClickButton`, `pricing_cta_clicked` →
  `InitiateCheckout`, `registration_completed` → `CompleteRegistration`, and
  NOT a custom event name.
- AC8: Given the pixel has already initialized in this session, when the load
  path runs again, then `ttq.load` is not called a second time.
- AC9: Given no consent, when the site is browsed, then no request to
  `analytics.tiktok.com` is issued and no TikTok cookie (`_ttp`) is set.
  (Runbook case; asserted manually at Phase 5, not unit-testable.)

## Touched areas and risks

- **Legal posture** is the headline risk. The whole value of this PR is that it
  changes nothing observable until STA-317. AC6 exists to pin that.
- `app/[locale]/layout.tsx` — the mount point wraps every locale route,
  including acquisition pages. The allowlist is what keeps it off them; getting
  that predicate wrong is the one way this leaks.
- `components/ui/CTAButton.tsx` and `components/pricing/PricingTierCard.tsx`
  already fire PostHog events. TikTok calls go alongside, never replacing —
  PostHog remains the product-analytics source of truth and must keep working
  with consent denied (it is cookieless and consent-independent).
- `components/onboarding/OnboardingWizard.tsx` is where the account is actually
  created before the redirect to app.stampeo.app; `CompleteRegistration` hangs
  off the existing completion path. Touching that flow risks the funnel, so the
  change is additive and guarded.
- i18n: no new user-facing copy in this issue, so no catalog parity risk. (The
  banner copy is STA-317's.)
- `bun test lib` only tests `lib/`, so anything I put in a component is
  untested by construction — the reason the logic is pure and lives in `lib/`.

## Docs impact (preliminary)

Probably none for the help center: nothing user-visible changes while the tag
is inert, no new setting, no copy, no tier gating. The privacy/cookie policy
does need to list TikTok as a tracker — but that is explicitly STA-317's
checklist item and lands with the banner, not here. Revisit at Phase 6 against
the real diff.
