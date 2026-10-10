# Plan: STA-358 (extended): Showcase SEO/GEO hardening + US market fixes

ISSUE: STA-358, extended and retitled. It is the implementation ticket and sits under a new **parent ticket**, "stampeo.app SEO/GEO programme (audit 2026-10-09)". Every future ticket below is also a sub-issue of that parent.
LINEAR STRUCTURE: create the parent → re-parent STA-358 under it → create future tickets 1–9 as sub-issues → link related existing issues (STA-359 Spanish sector guides, STA-66/65 Lighthouse, STA-369 merchant-page CTA) as "related" (not re-parented) → comment on STA-379. The parent's description links `docs/audits/2026-10-09-seo-geo/`.
BRANCH: `feat/sta-358-seo-geo-hardening`, off `dev` in `showcase/`. Stage branches are worktrees off it.
REPOS: showcase only. Backend and prod are read-only, for checking plan facts and re-running benchmark figures.
MIGRATION: no
STATUS: APPROVED (2026-10-09, by Harry)

## Context

The 2026-10-09 audit (`docs/audits/2026-10-09-seo-geo/report.md` + `us-first-addendum.md`) found that stampeo.app hides its best content from crawlers and AI assistants, and that `/us` (the Meta-ads landing page, now the #1 SEO target) has specific problems. Verified on production:

- **French URLs 404 for other browser languages.** A French blog URL requested with an `en`/`es`/`pl` browser language gets a 307 to `/{locale}/blog/<fr-slug>`, which is a 404.
- **No prices or trial length in the HTML.** Every price and trial slot is a skeleton until the page loads.
- **Structured data only appears after JavaScript runs** (`next/script afterInteractive`), so it is absent from the server HTML.
- **The logo and default images 404:** `/icon-512.png`, `/icon-192.png` and `/og-image.png`.
- **Homepage metadata leaks into other pages:** merchant pages declare the homepage as their canonical.
- **Plan facts disagree** between llms.txt, the structured data, the meta descriptions and the pricing page.
- **Blog posts have no hreflang**, and the breadcrumb structured data points at 404 URLs.
- **Titles repeat the brand:** "| Stampeo | Stampeo".
- **`/us` has problems of its own:**
  - Its title and description are copied from `/en`.
  - The demo cards say "€10 off" to US visitors; the strings are hardcoded and region-independent (verified with a New York browser).
  - The Header and Footer link to `/en/us/pricing`, which returns a 200 duplicate.
  - It has no "punch card" vocabulary.
- **The site ships ~674 KB of gzipped JS**, including supabase-js on every page, and a 514 KB strip image.

STA-358 already planned the canonical leak, noindex, legacy redirects and the `proxy.ts` rename. This plan absorbs its acceptance criteria unchanged (renumbered as R-AC1…R-AC9 below) and adds the rest. **Outcome:**
- Every indexable page states its real prices, structured data, canonical and hreflang in the server HTML.
- Product facts come from one source.
- `/us` is a credible US page.
- Marketing pages load less JS.

## Decisions (from discussion, 2026-10-09)

- **Single ticket:** extend STA-358 rather than create a new one. Future work gets separate tickets.
- **Pricing render:** the server renders the URL market's prices and trial length (EUR/30 on `/`, `/en`, `/es`, `/pl`, `/uk`; USD/14 on `/us`). After load, the visitor still sees their own region's prices, exactly as today. A cross-region visitor sees a brief swap; that is accepted.
- **Language detection runs only when the path is exactly `/`.** Use two next-intl middleware instances:
  - `intlRoot`, the current routing, for `/`.
  - `intlDeep` (`localeDetection:false, localeCookie:false`) for every other path.

  `/` with an en-US browser still goes to `/en`. Deep unprefixed URLs are served in French with no redirect and no cookie write. `NEXT_LOCALE` is then written only by the LanguageSwitcher. A global `localeDetection:false` is rejected: it would rewrite the cookie to `fr` and flip merchant QR pages to French.
- **Side effect accepted:** a reader with an English browser on a French deep page who clicks the logo lands on `/en`.
- **x-default → English everywhere**, because 68% of organic traffic is English. Today it is `/en` on the homepage and French elsewhere.
- **"Punch card":** used on SEO surfaces only: `/us` and `/us/pricing` titles and meta descriptions, one H2 line and one FAQ entry. Product copy keeps "stamps". Add a one-line exception to the `stampeo-copywriting` skill.
- **US spelling in English copy** ("program", not "programme"); the copywriting skill already uses "program". Don't change URL slugs like `/programme-fidelite`.
- **E-E-A-T:** normalise every post author to "Harry Viennot". The Person structured data's `url` becomes `/about`. The Organization gets `founder` and `sameAs` with existing URLs only (nothing invented). The About founder section is a future ticket.
- **Extras in scope:** performance quick wins, IndexNow, and replacing the unsourced statistics.
- **Not in scope:** merging duplicate French posts.
- **Unsourced statistics:** replaced by Stampeo production figures (re-run read-only at implementation time, all markets combined) with an inline source line, or by a real cited source, or removed. Nothing is invented.
- **Merchant pages:** `noindex, follow`, with a self-canonical on the unprefixed `/{slug}` (`/{slug}/l/{loc}` for locations). The not-found branch is noindex too.
- **lastmod:** only where it is true (blog posts). No invented dates on static pages.
- **The layout keeps OpenGraph `{type, siteName, locale}` and the Twitter `card`.** Only `title` and `description` leave the layout (Next fills them from each page). `alternates` move to the homepage. Pages that set their own `openGraph` spread a shared base that includes the image.

## UX decisions

- **The DESIGN pass is skipped.** Reason: no new page, placement or affordance. Every change edits metadata, data, copy or rendering of existing surfaces. The POLISH pass still runs in Phase 3.
- **PLACEMENT:** unchanged. Prices fill the existing slots. The sector demo cards keep their layout, with the currency formatted by the page's market.
- **Header:** the server HTML shows "Log in" and "Get started" instead of the pulse skeleton, which is better for CLS and gives crawlable calls to action. A visitor with a session cookie sees Dashboard and Sign out after hydration.
- **MOBILE:** no layout change. Images get lighter, and the price slots stop flashing skeletons on first paint.
- **REJECTED:**
  - a "View in English" banner on French pages (`FloatingLanguageSwitcher` already exists)
  - markdown `<link rel=alternate>` tags (no evidence of effect)
  - city or programmatic pages

## Non-goals

These are future tickets (see the end of this plan):
- new US trade, pillar or comparison pages
- the data report
- About founder section and author page
- lazy-loading PostHog and Sentry
- trimming the `NextIntlClientProvider` messages payload
- merging duplicate French posts
- an ROI calculator page
- off-site work (directories, reviews, list outreach, YouTube)
- review stars

Also not in this ticket: any backend change, and any change to billing currency or trial length.

## Acceptance criteria

### Carried over from STA-358 (text unchanged; see docs/features/STA-358/plan-2026-09-24.md)
- R-AC1 No page inherits a canonical it did not declare.
- R-AC2 Private routes (`/login`, `/reset-password`, `/email-preferences`, `/onboarding`, `/demo/wallet-select/{token}`) are `noindex, nofollow`.
- R-AC3 Merchant enrolment pages are `noindex, follow`, with a self-canonical.
- R-AC4 Every supplied legacy URL redirects once, permanently (308), and its destination returns 200.
- R-AC5 Derived legacy blog redirects work in both directions (`/blog/{en|es-slug}` → prefixed, `/{en|es}/blog/{fr-slug}` → unprefixed).
- R-AC6 Junk stays 404.
- R-AC7 The founding routes resolve in one 308.
- R-AC8 Private routes and redirect sources never appear in the sitemap; every sitemap URL is self-canonical and indexable.
- R-AC9 `proxy.ts` replaces `middleware.ts` with every behaviour preserved.

### Language routing
- AC1: Given `/blog/{fr-slug}` (or any other unprefixed deep URL) with `Accept-Language: en-US`, `es` or `pl`, when requested, then it rewrites to `/fr/…` with 200 and no redirect, and the response has NO `Set-Cookie: NEXT_LOCALE`.
- AC2: Given `/` with `en-US`, `pl-PL` or `fr`, when requested, then the behaviour is unchanged (`card-qr.test.ts` still passes). Both the 307 and the rewrite carry `Vary: Accept-Language, Cookie`, and the 307 carries `Cache-Control: no-store`.
- AC3: Given `/{en|es|pl}/us…` or `/{en|es|pl}/uk…`, when requested, then a single 308 goes to `/us…` or `/uk…`. Given the Header or Footer on `/us`, when rendered, then the pricing link is `/us/pricing` and NOT `/en/us/pricing`.
- AC4: For every `redirects()` entry (via `unstable_getResponseFromNextConfig`) and its destination run through the proxy with `en-US` and no cookie, there is no further redirect. No chains and no loops.
- AC4b: `auth/callback`'s locale fallback uses `deviceLanguage(accept-language)` before French, because `NEXT_LOCALE` is no longer written on `/en/*` visits.

### Server HTML (what a non-JS crawler sees)
- AC5: Given `/`, `/pricing`, `/en/pricing`, `/us`, `/us/pricing`, when the raw HTML is fetched, then every plan price and trial length is present as numbers in the market currency (€ on int/uk, $ and 14 on `/us`). `TextSkeleton`, `splitPricingParts` and the `ready` skeleton branches are deleted.
- AC6: Given a visitor whose region differs from the URL market, or a browser whose Intl separators differ from Node's (fr U+202F, es/pl grouping), when the page hydrates, then the prices switch to their region exactly as today. NO hydration error is logged and the trackers do not remount: price token spans carry `suppressHydrationWarning`.
- AC7: Given any page that emits structured data, when the raw HTML is fetched, then it contains `<script type="application/ld+json">` with valid JSON, and `<` is escaped.
- AC8: Given the Organization, Article and manifest data, when the referenced images are requested, then they return 200 (`/icon-192.png`, `/icon-512.png`). An Article image is the per-post OG image URL.
- AC9: Given `/pricing` (every locale) and `/us/pricing`, when rendered, then they emit SoftwareApplication with Offers in the market currency (suppressed on the fallback ladder, as today) plus a FAQPage.
- AC10: The WebSite structured data has no `SearchAction` and no `speakable`.

### Product facts (one source)
- AC11: `lib/plan-facts.ts` is the only place plan facts are stated. These all read from it or are asserted against it by a test:
  - llms.txt plan bullets
  - the Offer descriptions
  - the feature meta descriptions that mention plans
  - the pricing feature lists

  Covered facts: loyalty types per plan, broadcasts per month, locations, analytics level, scheduling, geofencing status. Where today's copy disagrees with `backend/app/core/features.py`, the backend wins.
- AC12: llms.txt includes a US block (USD prices, 14-day trial, `/us`, `/us/pricing`). Prices come from the plan catalog, falling back to `FALLBACK_PRICING`.
- AC13: llms.txt and the blog contain no statistic without a source. Stampeo figures carry "Stampeo data: n businesses, period". `lib/benchmark.ts` holds the values, with n, period and method.

### hreflang, sitemap, blog
- AC14: x-default points to the English version in every cluster (homepage, locale pages, loyalty, features, blog).
- AC15: `/pricing` (every locale) and `/us/pricing` share one reciprocal cluster that includes `en-US → /us/pricing`. Each sitemap entry carries its own page's cluster, never the homepage's.
- AC16: Blog posts that have translations emit reciprocal hreflang, both in the page and in the sitemap, from one pair map (`lib/blog/translations.ts`). A test asserts both slugs exist and every pair is bidirectional.
- AC17: The blog breadcrumb uses locale-prefixed URLs and localised labels, and every item URL returns 200. "Updated on" and the reading time are localised; there is no French text on English or Spanish posts.
- AC18: `/feed-pl.xml` is not served empty (404 while Polish has no posts). Each locale page declares its RSS `<link rel="alternate">`. `/feed.xml` → `/feed-fr.xml` is a 308.
- AC19: `/us`, `/uk`, `/us/pricing`, `/contact` and the pricing pages emit a full openGraph block (title, description, siteName, type, locale, image). Nothing drops the image.

### Copy and metadata
- AC20: No rendered title contains "Stampeo" twice. Every title, suffix included, is ≤ 60 characters, and every meta description is ≤ 160, in all 4 locales. Enforced by a catalog test in `lib/`. Rewritten keys are removed from `LEGACY_EM_DASH`, and there are no new em dashes.
- AC21: The FR and EN homepage titles name the category (FR "carte de fidélité digitale" plus Apple/Google Wallet; EN "digital loyalty card"). The pricing titles state the starting price as a token interpolated server-side from the market ladder. No hardcoded currency glyph goes into `metadata.json`, which is in `PRICED_FILES`.
- AC22: `/us` has its own title and description under `variant.us.*` (with `MARKET_ONLY_KEYS` entries, or `MARKET_SCOPED`/`baseIdOf` widened together), using `{trialDays}`. "Digital punch card" appears in the `/us` and `/us/pricing` metadata, one H2 line and one FAQ entry, and nowhere else in the product copy.
- AC23: The sector demo cards format money with the page's market currency (€ on int, $ on `/us`). The money tokens are present in all 4 locales, and the `landing.sectorCards` exemption is removed from `no-currency-glyph.test.ts`.
- AC24: All 33 posts have author "Harry Viennot". English titles and descriptions use "program", while slugs and URLs are unchanged.

### Performance
- AC25: Given no Supabase auth cookie (`sb-<ref>-auth-token` or its `.N` chunks, excluding `-code-verifier`), when any marketing page loads, then supabase-js is NOT downloaded. Given a session cookie, the Header shows Dashboard and Sign out; Sign out lazy-imports the client, signs out, and the Header updates. `AuthProvider` wraps only `login`, `reset-password` and `onboarding`, through per-route `layout.tsx` files (no route group). Login, reset-password, onboarding and the OAuth flows still work.
- AC26: Caveat and Geist Mono are not preloaded. The restaurant strip image is ≤ 80 KB. The gelo cone images are ≤ 60 KB each.
- AC27: robots.txt no longer disallows `/*opengraph-image*`.
- AC28: The hidden `aria-hidden` link block is removed from the Header. The Footer's links still cover every page it listed (asserted by `seo-links.test.ts`).

### IndexNow
- AC29: An IndexNow key file is served at `/<key>.txt`. `scripts/indexnow.ts` builds a valid payload from the sitemap (unit-tested). A GitHub workflow runs it after a push to `main`. It fails soft: a failed ping never fails the deploy.

### Guard
- AC30: `scripts/seo-smoke.ts` runs against a built server (locally, and in CI after `bun run build`) and asserts:
  - ld+json is in the raw HTML
  - price numbers are present (fallback ladder tolerated)
  - no double brand in titles
  - the canonical and hreflang on 6 representative URLs
  - the AC1/AC3/R-AC4 redirects
  - icons return 200

## Edge cases considered

- **Redirect loops** between R-AC5 and language detection: removed by the root-only detection and pinned by AC4.
- **The `proxy.ts` rename moves the code from Edge to the Node runtime.** Keep `export default`; the two tests importing it only change their path. Check that the Sentry server config covers the proxy (the edge config no longer applies). Prove the file is registered against a built server.
- **`lib/legacy-redirects.ts` is imported by `next.config.ts`** (compiled to CommonJS). It must not import `next-intl` or `@/i18n/routing`; use `lib/blog/locales.ts`.
- **Supabase `detectSessionInUrl`** currently handles `?code=` on any page. Confirm the Supabase redirect allowlist and Site URL never land on a marketing page without `AuthProvider`. If they can, keep a minimal handler on `/`.
- **Stale session cookie** (expired but present): the Header shows Dashboard; the dashboard middleware clears it. Accepted.
- **Plan catalog fallback** (backend down at build): prices render from `FALLBACK_PRICING` and the Offer is suppressed, as today. The smoke test tolerates this.
- **Cloudflare (STA-379)** ignores `Vary` on HTML, so `/` must bypass its cache. This goes in the STA-379 comment.
- **Tests only run from `lib/` and `scripts/`** (`package.json`). A test placed under `components/` is silently skipped.

## Stages and subagents (after approval)

The coordinator is me, on Opus. Its jobs:
- Linear: retitle STA-358, update its description, create the future tickets.
- Write `docs/features/STA-358/plan.md`.
- Create the branch and worktrees.
- Write each stage brief and merge the stages.
- Run the reviews and the verification.
- Re-run the benchmark SQL read-only on prod.
- Check plan facts against `backend/app/core/features.py`.

Each stage is a `stage-implementer` working in its own worktree (`isolation: "worktree"`, with `bun install` first). It writes tests first in `lib/` or `scripts/` and commits on its stage branch. A stage sweeps "middleware" comments only in files it owns; the coordinator sweeps the rest after merging.

**Wave 1 (parallel):**

| Stage | Model | Owns, exclusively |
|---|---|---|
| **S1 Routing & indexing** | Sonnet | `middleware.ts`→`proxy.ts` (+ the imports in `lib/routing/card-qr.test.ts` and `middleware-matcher.test.ts`); the `intlRoot`/`intlDeep` split + Vary; `next.config.ts` `redirects()` + `lib/legacy-redirects.ts` (+ a loop test, with a read-only import of the sitemap for "no redirect source"); the pilot de-prefix 308s; `lib/page-robots.ts` + per-route `robots` (no new copy keys); `AcquisitionPageView.tsx` (`locationSlug`, not-found noindex); founding pages; `app/[locale]/layout.tsx` + `app/[locale]/page.tsx` metadata move; raw market links in `Header.tsx:313` and `Footer.tsx:147`; the `auth/callback` fallback. ACs: R-AC1–7, R-AC9, AC1–4b, part of AC3 |
| **S2 Structured data + facts + llms.txt** | Sonnet | `components/JsonLd.tsx`; `lib/structured-data.ts` (backward-compatible signatures); new `lib/plan-facts.ts` + `lib/benchmark.ts`; `lib/llms-txt.ts` + route; `MarketPricingPage.tsx` structured data; icons through file conventions (`public/icon-192.png`, `icon-512.png`) + `app/manifest.ts`; `lib/robots.ts` + its test; `t()` call-site arguments for plan facts (no copy edits). ACs: AC7–13, AC27 |
| **S3 Pricing SSR + sector money** | Sonnet | `components/market/*` (server snapshot = market ladder, delete `ready`, `TextSkeleton`, `splitPricingParts` + their tests, `suppressHydrationWarning` on the price spans); the price slots in `PricingTierCard`, `PricingSection`, `PricingPageContent`, `ROICalculator`, `HeroDemo`, `Variant*`; `VariantSectorCards` + `SectorCarousel` (market prop, money tokens in `messages/*/landing.json` `sectorCards`, all 4 locales); the glyph test exemption; rewriting runbook cases RP-03, RP-08 and RP-09. ACs: AC5, AC6, AC23 |
| **S5 hreflang, sitemap, blog, OG** | Sonnet | `lib/hreflang.ts` (x-default EN), `PILOT_HREFLANG` + the pricing cluster in `lib/markets.ts`; `us`/`uk`/`us/pricing`/`uk/pricing`/`pricing`/`contact` page metadata (shared OG base with the image); `app/sitemap.ts` + `lib/sitemap.test.ts`; `lib/blog/translations.ts`; the blog `[slug]` page metadata and its breadcrumb call site; `BlogHeader` + `messages/*/blog.json`; feeds. ACs: R-AC8, AC14–19 |

**Merge order:** S1 and S5 together (between them, `/us/pricing` has no hreflang), then S2, then S3. The coordinator resolves conflicts, runs the full test suite, type-check, lint and build after each merge, and sweeps the remaining comments.

**Wave 2 (after wave 1 merges):**

| Stage | Model | Owns |
|---|---|---|
| **S4 Copy & metadata** | Sonnet + `stampeo-copywriting` skill | Every title and description in `metadata.json`/`pricing.json`/`about.json` in all locales; `/us` keys under `variant.us.*`; the punch-card SEO surfaces (meta, one H2, one FAQ); the skill exception line; `LEGACY_EM_DASH` cleanup; the title-length/double-brand catalog test; replacing the unsourced statistics in posts and in `lib/benchmark.ts` references. ACs: AC20–22, part of AC13 |
| **S4b Mechanical content** | Haiku | Author → "Harry Viennot" in 33 frontmatters; "programme(s)" → "program(s)" in English post titles, descriptions and body text, never inside URLs or slugs (explicit grep checklist). AC: AC24 |
| **S6 Performance + Header session** | Sonnet | The `useHasSession` hook (`useSyncExternalStore` on the sb cookie); `Header.tsx` auth buttons + lazy sign-out; `AuthProvider` moved to the `login`/`reset-password`/`onboarding` `layout.tsx` files; removing the hidden nav; font `preload:false`. ACs: AC25, AC26 (fonts), AC28 |
| **S6b Images** | Haiku | Resize `public/themes/restaurant/strip.jpg` (~750 px wide) and `gelo/cone*.png` (256²) with `sips`, and verify the sizes and rendering. AC: AC26 (images) |
| **S7 IndexNow** | Haiku | `public/<key>.txt`, `scripts/indexnow.ts` + `scripts/indexnow.test.ts`, `.github/workflows/indexnow.yml` (soft-fail). AC: AC29 |

**Wave 3:**

| Step | Who | Model |
|---|---|---|
| `scripts/seo-smoke.ts` + CI step after build (AC30) | `stage-implementer` | Sonnet |
| Runbooks: amend `public-urls.md` (SU-*), `us-market-landing.md` (MK/SE), `region-pricing.md`, `seo-internal-links.md`; new `docs/qa/seo-indexing.md` (crawler-view cases: curl HTML, redirects, robots, hreflang, ld+json, llms.txt) | `stage-implementer` | Sonnet |
| UX polish pass on the diff | `ux-designer` (MODE: POLISH) | its own model |
| Coverage audit | `coverage-auditor` | Opus |
| Hygiene review (diff > 150 lines) | `code-quality-reviewer` | Opus |
| Security review, because S6 touches auth and session handling | `security-reviewer` | Opus |

## Verification

1. In `showcase/`: `bun run test && bun run type-check && bun run lint && bun run build`. Never build while the dev server runs.
2. `bun start` on the build, then `bun scripts/seo-smoke.ts http://localhost:3000`.
3. Hand curl checks:
   - `/blog/carte-fidelite-wallet` with `en-US` → 200, no Set-Cookie
   - `/` with `en-US` → 307 `/en` + Vary
   - `/en/us/pricing` → 308 `/us/pricing`
   - `/us` contains `$` and 14, and no € in the sector cards
   - ld+json is present on `/`, a blog post and `/pricing`
   - a merchant slug is noindex and self-canonical
   - `/icon-512.png` → 200
4. Playwright, New York vs Paris browser contexts on `/us`, `/pricing` and `/es/pricing`: the swap works, there are no hydration errors in the console, and the Header session works (log in, then Dashboard, then Sign out).
5. After deploy: the smoke test against https://stampeo.app.
6. Search Console: URL Inspection on `/us` (Google-selected canonical) and resubmit the sitemap.
7. Bing Webmaster Tools: import from Search Console and enable the AI Performance report. **This is a manual step for Harry.**

## Docs impact (preliminary)

Probably none: marketing site only, with no dashboard behaviour change. A one-line `docs-decision.md` is expected.

## Future tickets (created after approval, all sub-issues of the parent)

1. **US trade pages under `/us`:** digital-punch-card pillar, coffee shop, salon, barbershop; then bakery, restaurant, food truck.
2. **US comparison pages:** vs Square Loyalty, Loopy Loyalty, Stamp Me, paper punch cards.
3. **Wallet Loyalty Report 2026** (target January 2027), plus product data-quality fixes: `businesses.timezone` is UTC for every business, and 212 businesses have no `country`.
4. **Off-site presence:** Capterra/GetApp/G2, review drive, list outreach, Product Hunt, YouTube Shorts, monthly AI prompt panel.
5. **About page founder section + author page.**
6. **Performance phase 2:** lazy-load PostHog and Sentry, trim the client i18n payload, CSS instead of framer-motion in the Header.
7. **French content consolidation:** merge the duplicate posts.
8. **Standalone ROI calculator page.**
9. **First-party review stars:**
   - A merchant rating prompt in the dashboard (`web/` + `backend/`).
   - Reviews shown visibly on stampeo.app.
   - `SoftwareApplication.aggregateRating` / `review` markup, never on `Organization`.

   Capterra and Trustpilot numbers must never be copied into the markup: Google's guidelines say "Don't aggregate reviews or ratings from other websites", which is what Passtastic does.
10. **A comment on STA-379** (not a ticket): check Cloudflare's "Block AI bots" and managed robots.txt settings, and make `/` bypass the HTML cache because it varies by Accept-Language.


## Scope additions during implementation (2026-10-09/10, coordinator; APPROVED by Harry 2026-10-10: "site promises, leave them that way")

Each addition came out of AC11/AC13 work, where the copy turned out to contradict the product. They are recorded here so the plan matches the diff (gap-report drift).

**False claims removed:**

| Addition | Why | Pinned by |
|---|---|---|
| **Scheduled card designs are "coming soon"** (`PLAN_FACTS.pro.scheduledDesigns = "coming_soon"`), not "yes" as in Reference B | The backend gate is on, but the dashboard has no UI and lists `designs.scheduled` in `HIDDEN_FEATURES`. A gate is not a shipped feature, the same reasoning as geofencing. Reference B is corrected below. | `lib/product-claims.test.ts`, `lib/plan-facts.test.ts` |
| **Offline scanning withdrawn everywhere** (scanner page section, `OfflineToggleDemo`, posts, llms.txt) | The scanner app has no offline queue, and the pricing table already said "soon" | `lib/product-claims.test.ts` (offlineScan) |
| **"No card required" claims replaced** with "we ask for a card to start the free trial; nothing is charged before it ends" | New signups are card-required (`requires_card_upfront`) | `lib/product-claims.test.ts` (noCard) |
| **Unsourced broadcast figures removed** from the broadcasts page and the landing page: ~85% open rate, €0.04–0.10 per SMS, +78% uplift, "read 5–10× more than email". The stat band now uses sourced `lib/benchmark.ts` figures. | No source | The product-claims guard |

**Related changes:**
- **llms.txt PRODUCT section reshaped:** the plan bullets now come from plan-facts. The hand-written "Team & multi-location" block, which had wrong template counts, was folded into the plan lines.
- **The proxy serves `/fr/**/opengraph-image` and `twitter-image` as is.** Next writes those URLs into og:image on French pages, and the as-needed prefix redirect cost every unfurler a hop. Pinned by `lib/routing/share-image-paths.test.ts`.
- **`/llms.txt` uses `revalidate = 300`,** the same as the plan catalog it reads, instead of a 1-day Cache-Control.
- **Blog posts render `title: { absolute }` when the title plus " | Stampeo" exceeds 60 characters,** and rendered titles are ≤ 70. AC20's 60-character rule applies to catalog (page) titles. Post titles are article headlines, and Google truncates them on its own.

**Reference B correction:** scheduled card designs on Pro = "coming soon" (gate on, no UI).

**Known deviation (AC2):** on the French 200 at `/`, Next 16 overwrites the proxy's `Vary` (`app-page-runtime.js` sets its own). The 307 carries `Vary` and `no-store` as specified. No CDN sits in front today. The STA-379 Cloudflare cutover must bypass the HTML cache for `/` (comment posted on STA-379). Runbook case SX-04 is marked known-failing.

---

## Reference A: the legacy redirect table (supplied by Harry, 2026-09-24)

All are permanent (308) and one hop. All 12 Search Console destinations were verified 200 on 2026-09-24.

**Search Console 404s with a real destination:**

| Legacy path | Destination |
|---|---|
| `/en/en/onboarding` | `/en/onboarding` |
| `/blog/apple-wallet-loyalty-card` | `/en/blog/apple-wallet-loyalty-card` |
| `/blog/paper-vs-digital-loyalty-card` | `/en/blog/paper-vs-digital-loyalty-card` |
| `/blog/como-crear-tarjeta-fidelidad-digital` | `/es/blog/como-crear-tarjeta-fidelidad-digital` |
| `/blog/mejor-app-fidelizacion-comercios` | `/es/blog/mejor-app-fidelizacion-comercios` |
| `/blog/coffee-shop-loyalty-card` | `/en/blog/coffee-shop-loyalty-card` |
| `/features/notificaciones` | `/es/features/notificaciones-push` |
| `/blog/best-loyalty-card-system-small-business` | `/en/blog/best-loyalty-card-system-small-business` |
| `/en/blog/carte-fidelite-dematerialisee` | `/blog/carte-fidelite-dematerialisee` |
| `/en/blog/carte-fidelite-sans-application` | `/blog/carte-fidelite-sans-application` |
| `/en/blog/carte-fidelite-cafe` | `/blog/carte-fidelite-cafe` |
| `/en/blog/carte-fidelite-papier-vs-digitale` | `/blog/carte-fidelite-papier-vs-digitale` |

**Paths from git history:**

| Historical path | Destination |
|---|---|
| `/en/blog/apple-wallet-loyalty-cards-setup` | `/en/blog/apple-wallet-loyalty-card` |
| `/en/blog/why-digital-loyalty-cards` | `/en/blog/digital-loyalty-card-small-business` |
| `/en/blog/founding-partner-program` | `/en/pricing` |
| `/blog/configurer-cartes-fidelite-apple-wallet` | `/blog/apple-wallet-carte-fidelite` |
| `/blog/pourquoi-cartes-fidelite-digitales` | `/blog/carte-fidelite-dematerialisee` |
| `/blog/programme-partenaire-fondateur` | `/pricing` |
| `/signup` | `/onboarding` |
| `/en/signup` | `/en/onboarding` |
| `/fr/signup` | `/onboarding` |

**Founding routes:**

| Path | Destination |
|---|---|
| `/programme-fondateur` | `/pricing` |
| `/founding-partner` | `/pricing` |
| `/en/programme-fondateur` | `/en/pricing` |
| `/en/founding-partner` | `/en/pricing` |

**New in this extension:** `/{en,es,pl}/us`, `/{en,es,pl}/us/:path*`, `/{en,es,pl}/uk` and `/{en,es,pl}/uk/:path*` redirect to `/us…` and `/uk…`.

**These stay 404** (asserted absent from the table):
- `/month`, `/mo`, `/mois`, `/mes`
- `/_next/static/media/797e433ab948586e-s.p.08e28id.o-okb.woff2`, `/_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2`

**Not redirected:**
- `/es/blog/tarjeta-fidelidad-sin-app` returns 200 (the Search Console report is stale).
- `/es/blog/tarjeta-sellos-digital`, `/es/blog/tarjeta-fidelidad-cafeteria`, `/blog/tarjeta-fidelidad-restaurante` and `/blog/tarjeta-fidelidad-panaderia` were intended articles that never existed. They stay 404 until STA-359 writes them; never send them to the homepage.

**Out of scope:** `https://dev.stampeo.app/` (handled at DNS level).

## Reference B: plan facts (backend truth, `backend/app/core/features.py`, read 2026-10-09)

| Fact | Starter | Growth | Pro |
|---|---|---|---|
| Loyalty types (`programs.type`) | stamps + points | stamps + points | stamps + points |
| Team members (`team.max_members`) | 2 (owner + 1) | unlimited | unlimited |
| Employee scan tracking | no | yes | yes |
| Broadcasts / month | 0 (none) | 8 | unlimited |
| Scheduled broadcasts | no | no | yes |
| Milestone notifications | 0 | 3 | unlimited |
| Multiple locations | no | no | yes |
| Location analytics | no | no | yes |
| Analytics | basic | basic | basic + advanced |
| Scheduled card designs | no | no | yes |
| Geofencing | no | no | gate is on, but **disabled in the pass generator since 2026-05-29** (`pass_generator.py:31`), so it reads "coming soon" |

**Copy that is currently wrong against this table:**
- `llms-txt.ts` says "Starter is stamps-only".
- The meta descriptions say "3 free/month on Growth" (it is 8), and "scheduling included" (it is Pro only).
- `OFFER_DESCRIPTIONS` gives Growth "advanced analytics, scheduled campaigns, multi-location"; all three are Pro only.
- llms.txt says "geofencing (Pro)"; it is coming soon.

## Reference C: benchmark figures (prod, read-only, 2026-10-09)

Source: `docs/audits/2026-10-09-seo-geo/evidence/barometer-data.md` (workspace), which has the SQL and cohort rules. All markets are combined. A business qualifies with at least 10 real customers and at least 10 scans; founder-owned and test businesses and staff cards are excluded. **Always round down. Quote "Stampeo data, 86 businesses, Feb–Oct 2026".**

| Key | Value | n |
|---|---|---|
| `walletAddRate` | 88% of customers who join add the card to their wallet | 6,816 customers since 1 Jul, 79 businesses |
| `appleShare` | 82% Apple Wallet / 18% Google Wallet | 6,020 adds |
| `installedDay30` | 98% still in the wallet after 30 days | 4,406 installs |
| `installedDay90` | 95% after 90 days | 856 installs |
| `return30` | 32% (about 1 in 3) come back within 30 days | 3,213 customers, 86 businesses |
| `medianDaysToSecondVisit` | 11 days | 1,693 returning customers |
| `redeemedShare` | 92% of full cards are redeemed | 223 cards, 40 businesses |
| `medianStampsPerCard` | 9 | |

**Do NOT publish:**
- any broadcast-uplift claim
- France-only or US-only figures
- stamps-vs-points comparisons

**Unsourced claims to replace or remove:**
- "~45% of paper-card holders don't present them"
- "95% of users abandon a new app within a month" (cite a real study, or remove)
- "retention on wallet passes is above 90%" (use `installedDay30`)
- the blog title "90 % de rétention" (`carte-fidelite-sans-application`, which ranks second on Bing FR): keep the query wording and make the number sourced
