# Plan: US landing — market-scoped copy, hero trial line, and the /us honesty gaps

ISSUE: STA-315 (https://linear.app/stampeo/issue/STA-315/us-landing-market-scoped-copy-hero-trial-line-and-the-us-honesty-gaps)
BRANCH: `feat/sta-315-us-landing`
REPOS: showcase
MIGRATION: no
STATUS: APPROVED (2026-09-15, by Harry)

> Docs location note: STA-268 and STA-275 kept their artifacts in
> `backend/docs/features/` because they spanned backend, web, admin and
> showcase. STA-315 is showcase-only, so its artifacts live in the repo it
> changes. This is the first `docs/` folder in the showcase repo.

## Problem

Phase C of the US market push, split out of STA-268 (originally "Adapt US market
setup: USD pricing, 14-day trial, landing page rework"). Phase A shipped as
STA-268, Phase B as STA-275. The landing-page rework was never split into its
own issue.

`/us` went live as an indexable market on 2026-09-15 quoting $49 / $79 / $119
with a 14-day trial. The page itself still renders **the same English strings as
`/en`**: copy written in a European register for a market that gets 30 days.
Nothing on it is tailored to an American reader, the hero never mentions the
trial at all, and several pages a `/us` visitor reaches from the shared nav
still promise "a free month".

## Already true, do not rebuild

- `MARKETS.us.europeTrust: false` — the "Made in Europe · GDPR" strip is already
  hidden on `/us` (`components/landing-variant/VariantLanding.tsx:66`).
- `MARKETS.us.trialDays: 14` already reaches the differentiator, pricing section
  and final CTA. It does **not** reach the hero.
- Routes, middleware rewrite, market cookie, hreflang and sitemap are live.

## Decisions

- **Outcome-forward headline, feature proof in the subhead**: US SMB SaaS
  converts on a stated business result with concrete proof beneath it. Pure
  benefits copy is vague and kills differentiation; feature-forward loses cafe
  and salon owners, who do not shop specs.
- **Hero trial line is `{trialDays} days free · Cancel anytime`**: the trial is
  the largest available lever and is currently invisible above the fold.
- **"No credit card required" must never appear**: `requires_card_upfront`
  (migration 86) attaches a card before the dashboard opens. It would be false.
  "Cancel anytime" is the honest reassurance; card-at-signup stays disclosed in
  the pricing FAQ.
- **Market-scoped overrides, not an `en-US` locale**: locale, market and
  currency are three separate axes by design (see the headers of
  `lib/markets.ts` and `backend/app/core/pricing_region.py`). A market is not a
  language, and `/us` renders only in English.
- **No replacement trust strip on `/us`**: leave the gap where the Europe strip
  was. Explicit user call.
- **"No contract" replaces "No commitment"**: the phrase an American owner
  scans for, and it answers the Square/Fivestars annual-agreement objection.

## Non-goals

- Reordering sections for `/us`. Moving pricing higher is plausible but needs an
  A/B read, and there is no variant system to run one: `landing-variant/` is a
  historical directory name and `landing_variant: "wallet"` is a hardcoded
  PostHog super-property, not an experiment.
- A replacement US trust strip.
- The closed founding-partner copy at `messages/en/features.json:1132-1289`
  (stale because the programme ended 2026-08-04, a different problem).
  NARROWED DURING IMPLEMENTATION: the founding subtree's four `metadata.json`
  descriptions had to be touched after all, because AC9 brings `metadata.json`
  into the currency-glyph guard and they quoted "€20/month for life". A
  `{token}` was not an option: metadata never passes through
  `interpolatePricing`, so it would have shipped the literal token into a
  search snippet. The price was removed; the founding *pages* remain untouched
  and out of scope.
- US sales tax. `/v1/tax/registrations` is empty so tax is $0 regardless.
- `/uk`. It stays noindex and on EUR; the mechanism is built to accept a `uk`
  override later but none is written.

## Edge cases considered

- **A `variant.us.*` key that shadows nothing** (typo in the override path):
  falls back silently and ships European copy to `/us` with nothing failing.
  Caught by a new catalog test, not left to review.
- **Catalog parity**: `lib/i18n-catalogs.test.ts` fails on any key present in
  `en` and absent from `fr/es/pl`. Market-scoped keys are excluded by an
  explicit, documented filter rather than by stubbing nonsense Polish.
- **`int` resolving an override**: must never happen, even if a `variant.int.*`
  subtree were ever added. The helper refuses `int` by construction.
- **Array overrides**: the FAQ is an array. An override replaces the whole
  array rather than merging by index, because index-merging an array whose
  length differs is how you ship a half-European FAQ.
- **`{trialDays}` in an overridden string**: overrides flow through the same
  `interpolatePricing` / ICU paths as the base strings, so a token left
  unsubstituted renders literally. `VariantDifferentiator` already carries a
  comment about exactly this having happened on `/us`.
- **fr/es/pl "1 mois gratuit"**: correct, those markets genuinely get 30 days.
  Deliberately unchanged **as rendered output**. CORRECTED DURING
  IMPLEMENTATION: their *source* had to change anyway. Once the English
  `rewarded` / `rewardText` / `rewardTop` take a `{trialDays}` argument, the
  catalog's own token-parity test requires every locale to take it too, so
  fr/es/pl now interpolate a number instead of hardcoding one. They still render
  30. The plan did not anticipate this cascade; it is recorded here rather than
  left as unexplained drift. (Polish takes the four-arm plural, per the
  copywriting rules.)
- **`PromoBanner` is gated off** by `PROMO_BANNER_ENABLED`, so its "30 days
  free" strings are not live today. Fixed anyway: the gate is a runtime flag and
  the string is wrong whenever it flips.

## Corrections made after the coverage audit

- **AC4 was satisfied only in appearance.** The first orphan guard proved "the
  base array exists" for anything inside an array, so `faq.items[0].anwser`
  passed and 24 of the subtree's 31 keys were unchecked. Rewritten to require
  the same field on some element of the base array, and pinned with a planted
  typo.
- **A rule the plan stated and gave no AC:** "no credit card required must
  never appear" is now enforced by a catalog guard in all four locales, and had
  to be anchored to the *payment* sense, since "no card to lose" is the
  product's own true tagline about the loyalty card.
- **AC2 was violated by the first implementation.** The hero CTA wrapper was
  applied to every market to make room for a line only `/us` shows. The wrapper
  is now conditional.
- `messages/en/loyalty.json` swaps "no commitment" for "cancel anytime" on a
  page served in every market. That applies a US wording decision globally; it
  is honest everywhere and reads no worse, and is noted here as a deliberate
  small widening rather than an oversight.

## Acceptance criteria

- **AC1**: Given market `us`, when the landing page renders, then the hero shows
  a reassurance line reading "14 days free · Cancel anytime", and the number
  comes from `MARKETS.us.trialDays`, NOT a literal in the copy.
- **AC2**: Given market `int`, `uk`, or any locale other than the US pilot, when
  the landing page renders, then no hero reassurance line appears and the
  rendered output is unchanged from before this issue.
- **AC3**: Given a `variant.us.<key>` override exists, when market is `us`, then
  the override is rendered; when market is `int`, then the base key is rendered.
- **AC4**: Given a `variant.us.<key>` that shadows no base key, when the catalog
  test runs, then it fails naming the offending key, and does NOT pass by
  silently falling back.
- **AC5**: Given the `en` catalog contains `variant.us.*` keys, when the catalog
  parity test runs, then it passes without those keys existing in `fr/es/pl`,
  and still fails for any non-market-scoped key missing from a locale.
- **AC6**: Given `MARKETS.us.indexable` is `true`, when `/us/pricing` metadata is
  generated, then `robots` is `index: true, follow: true`, matching `/us` and
  matching what `indexablePilotPaths()` puts in the sitemap.
- **AC7**: Given any market, when a page's robots directive is compared to its
  market's `indexable` flag, then they agree, for the landing page AND the
  pricing page.
- **AC8**: Given the English catalogs, when the trial-claim guard runs, then no
  message outside the founding-partner subtree states a trial length in words
  ("free month", "30 days free", "one month free"), and the guard DOES still
  allow `{trialDays}`-parameterised strings.
- **AC9**: Given `messages/*/metadata.json`, when the currency-glyph guard runs,
  then it is in scope and no plan price carries a baked `€`/`$`/`zł` glyph.
- **AC10**: Given market `us`, when the FAQ renders, then no answer claims data
  is hosted in Europe or leads with GDPR, and the FAQ JSON-LD contains the US
  answers rather than the base ones.

## Touched areas and risks

- **i18n catalogs** are the fragile part. next-intl has no per-key fallback: a
  key present in `en` and missing in the visited locale throws in dev and
  renders the raw key path in prod. Every catalog edit is a potential broken
  page served to a stranger. The parity test is the guard and must be loosened
  precisely, not broadly.
- **SEO**: `indexable` drives robots, `PILOT_HREFLANG` and the sitemap from one
  flag on purpose. The `/us/pricing` fix brings a fourth consumer into line;
  getting it wrong in the other direction (indexing something that should not
  be) is worse than the current bug.
- **JSON-LD**: FAQ answers are interpolated before the structured data is built
  (`VariantLanding.tsx:51`), because raw tokens once shipped to Google. The
  override must land before that interpolation, not after.
- **Regression surface**: `/`, `/en`, `/es`, `/pl`, `/uk` must be byte-identical.
  The override layer being inert outside `us` is the main risk in this diff.
- **ISR**: showcase caches 300s. A stale page is not a failed fix; hard-reload
  twice before judging.

## Docs impact (preliminary)

Probably none. This is public marketing copy, not dashboard behaviour: no new
setting, no tier gating, no error message a business owner meets inside the
product. Revisited against the real diff at Phase 6.
