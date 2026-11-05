# Plan: Comparison pages, wave 1 (FR + US)

ISSUE: STA-531 (https://linear.app/stampeo/issue/STA-531). Sub-issues: STA-532 skill + STAMPEO.md, STA-533 research, STA-534 build, STA-535 writing, STA-536 refresh agent (follow-up)
BRANCH: `feat/sta-531-comparisons` (showcase, from `origin/dev`)
REPOS: showcase. Docs outside it: `fidelity/.claude/skills/stampeo-comparisons/`, `stampeo-seo/stampeo seo {en,es,fr}/STAMPEO.md`
MIGRATION: no
STATUS: APPROVED (2026-11-04, Harry). UX decisions approved the same day, minus the author byline. Stampeo charges no VAT (Harry), so FR prices read "TVA non applicable" (AC16).

## Problem

Shop owners already search for competitor names next to "alternative" ("loopy loyalty alternative" at position 24, "stamp me alternative" at 28). We have no page to answer them, and Stampeo appears in none of the ~22 "best loyalty app" lists checked in October. PostHog reports that honest head-to-head pages convert at ~10%, against ~2.5% for the rest of their blog. STA-400 (US only) is cancelled; this restarts from scratch with a skill, sourced research, and FR + US.

## Decisions

- Wave 1 = 6 pages. US: Loopy Loyalty, Stamp Me, WinStamp. FR: Fidelatoo, Zerosix, Hey Pongo. Square, Boomerangme, Kangaroo, Captain Wallet, Stampioo and WinStamp FR are wave 2. Why: brand-search likelihood plus the same buyer; WinStamp is Harry's pick over Square.
- A competitor gets a page only if owners search its name AND it sells to our buyer. Why: pages nobody searches for earn nothing.
- No lawyer. A sourced FR/EU + US checklist sits in the skill, and a separate checker applies it. Why: Harry, 4 Nov.
- Stampeo's side comes from STAMPEO.md (brought up to date first). Prices and trial length render from the live plan catalog and are never typed. Why: one source of truth, and prices change.
- Built but unreleased features (loyalty levels STA-525, the next scanner release) are written as live. Publishing waits for both to be on prod and in the stores. Why: Harry, 4 Nov: they ship first.
- One writer per market, not per competitor; fact-checkers separate from researchers. Why: one voice per language, and nobody checks their own work.
- Pages are honest by construction:
  - every page has a "Choose <X> if" section, our gaps from STAMPEO.md §8, and sources with dates;
  - no logos, no screenshots of competitor products, no Review/Rating schema about them.
  - Why: EU comparative-advertising law, and AI answers cite balanced sources.
- FR URLs are `/comparatif/<slug>` and US URLs are `/us/vs/<slug>`. A page exists in one market only. Why: FR-only rivals have no EN searchers, and the US pages sit with the rest of `/us`.
- No hub page until a market has 6+ pages; pages link to each other instead.

## UX decisions

From `ux-brief.md` (DESIGN, 2026-11-04):

- **PLACEMENT:** the two routes render one shared `components/compare/ComparisonPage.tsx`.
  - Modelled on the blog post shell: `--blog-bg`, `pt-32`, table of contents on desktop only, `blog-prose`, `Header`/`Footer` with `market="us"` on US pages, inside `<Container>`.
  - No cover image, tags, reading time, share buttons or back link.
  - Not under `/blog`: blog posts are cross-locale and quote EUR.
- **ENTRY:**
  - Search and AI answers.
  - Links from the EN post `best-loyalty-card-system-small-business` (Loopy and Stamp Me paragraphs) and from one new sentence in the FR post `carte-fidelite-papier-vs-digitale`. Both added in the publish PR, never pointing at drafts.
  - An "other comparisons" list on each page (published pages of the same market only).
- **ADDED:**
  - "Checked <date>" under the verdict, with the date computed as the oldest `checkedAt` on the page. No byline (Harry, 4 Nov). Answers "is this still true?". (AC10)
  - A CTA right after "Choose <X> if", repeated at the bottom. Removes a step. (AC11)
  - Stampeo prices fixed to the page's market currency, with no region swap. Prevents euros beside dollars. (AC4)
  - Language switchers hidden on these routes. Prevents a 404 on switch. (AC12)
  - CTA clicks tracked as their own location. Lets us measure the ~10% premise. (AC13)
- **REJECTED:** sticky verdict or CTA, a jump-link row on phones, a winner per row or red/green cells, footnote numbers, footer links, a header nav item, a stale-fact banner, collapsible table sections, `ScrollReveal`, rival links on `/pricing` (wave 1).
- **MOBILE:**
  - H1 `text-h1` + verdict `text-lead` + checked line, with "Choose if" starting above the fold.
  - The table becomes one card per criterion: label on top, two values below, Stampeo always on the right with the Growth tint, icon + word for yes/no.
  - Sources show title + domain + date.
  - All links ≥ 44px. No dialogs or tooltips. No markdown tables in comparison MDX.
- **REUSES:** `Header`, `Footer`, `TableOfContents`, the blog MDX pipeline (comparison components registered in the comparison loader only), `FAQList` (from the same frontmatter as `faqPageJsonLd`), `CallToAction` + `FeatureCTA` (with a new optional `trackAs`), `AuthorCard`, `ContactLink`, `MarketLink`, `icons`.
- **NEW** (in `components/compare/`): `ComparisonPage`, `ComparisonTable` (server, semantic `<table>`; `FeatureComparisonTable` is tied to tiers and client state), `ChooseIf`, `Fact` (data only), `SourcesList`, `ComparisonLinks`.

## Non-goals

- ES and PL pages.
- "X alternatives" pages and any "best loyalty apps" listicle.
- A comparisons hub page.
- Competitor logos or screenshots.
- The automated monthly drift agent (STA-536).
- Any change to the dashboard or backend.
- Reusing STA-400 code.

## Edge cases considered

- **Quote-only pricing** (Hey Pongo): the table shows "On request" / "Sur devis" with its source. No guessed number.
- **Tax basis differs** (FR rivals quote HT): every price shows its basis. _Open: confirm whether Stampeo's EUR prices are HT or TTC from Stripe `tax_behavior` before the FR pages are written._
- **Live Stripe catalog unavailable at build:** prices fall back to `lib/pricing.ts`, exactly as `/pricing` does.
- **A fact older than 90 days:** the page still renders. The refresh check (skill `refresh.md`, later STA-536) flags it, and tests never go red because time passed.
- **A competitor changes its price after publication:** fix one facts file and every page showing it updates on the next deploy.
- **A merchant whose slug is `comparatif`:** none exists on prod (`/comparatif` returned 404 on 2026-11-04). It is reserved from now on.
- **A draft page opened by URL:** renders with noindex,nofollow, and is absent from the sitemap and llms.txt.
- **A US visitor on a FR page, or the reverse:** no redirect. Each page is single-market, and the CTA goes to that market's sign-up and pricing.
- **A competitor asks for a correction:** the contact link is on the page; fix within a week (skill rule 9).

## Acceptance criteria

- AC1: Given a published comparison, when `/us/vs/<slug>` (EN) or `/comparatif/<slug>` (FR) is requested, then it returns 200, is self-canonical and listed in the sitemap, and is NOT served or hreflang-linked in any other locale.
- AC2: Given a comparison with `draft: true`, then the page carries noindex,nofollow, and is NOT in the sitemap or llms.txt.
- AC3: Given a competitor fact missing `sourceUrl`, `quote` or `checkedAt`, or with `checkedAt` after today, then `bun test` fails.
- AC4: Given any comparison page, then Stampeo's prices come from the plan catalog in that market's currency (EUR on FR, USD on US). A currency amount typed into comparison MDX fails a test.
- AC5: Given any comparison page, then its server HTML has Article (or WebPage) + BreadcrumbList + FAQPage JSON-LD, and NEVER Product, Review or AggregateRating naming a competitor.
- AC6: Given any registered comparison, then its content has a "choose <competitor> if" section, a sources list with dates, and a correction contact.
- AC7: Given a merchant slug `comparatif`, then the route resolves to the comparisons section, never the merchant page (`RESERVED_TOP_SEGMENTS`).
- AC8: Given a 390px viewport, then the comparison table renders as stacked cards with no horizontal page scroll.
- AC9: Given the pricing comparison on `/pricing`, then Pro basket boosters read "up to 6", not "Unlimited" (code caps them at 6).
- AC10: Given a page whose facts were read on different days, then the "Checked" date shown is the OLDEST `checkedAt` among the facts it uses (no author byline).
- AC16: Given a FR page, then Stampeo's price reads "TVA non applicable", and each competitor price shows its tax basis as published (HT, and the TTC equivalent when the source is HT).
- AC11: Given any comparison page, then a sign-up CTA follows the "Choose if" section and another closes the page, both to that market's sign-up.
- AC12: Given a comparison route, then neither `LanguageSwitcher` nor `FloatingLanguageSwitcher` renders.
- AC13: Given a click on a comparison CTA, then the analytics event carries a comparison-specific `CTALocation`, NOT `blog_cta` or `feature_cta`.
- AC14: Given comparison MDX containing a markdown table, then the content test fails (tables come from `ComparisonTable` only).
- AC15: Given a draft comparison, then `ComparisonLinks` on other pages does NOT link to it.

## File layout

New domain folders, so nothing grows an existing file much:
- `lib/compare/`:
  - `types.ts`
  - no `registry.ts`: the page list comes from the MDX files, and competitor and draft from their frontmatter; competitors are listed per market in `facts/us.ts` and `facts/fr.ts`
  - `facts/<competitor>.ts`, one per competitor
  - `stampeo.ts` (our side, from `lib/plans/plan-facts.ts` + `getPlanCatalog`)
  - `content.ts` (MDX loader for `content/compare/{en,fr}/`)
  - tests beside each
- `components/compare/`: `ComparisonTable`, `Fact`, `ChooseIf`, `SourcesList`.
- `content/compare/{en,fr}/<slug>.mdx`.
- Routes:
  - `app/[locale]/us/vs/[competitor]/page.tsx`
  - `app/[locale]/comparatif/[competitor]/page.tsx` (FR only; other locales 404)
- Touches:
  - `lib/locale-negotiation.ts` (`RESERVED_TOP_SEGMENTS`)
  - `lib/seo/sitemap.ts`
  - `lib/markets.ts` is read, not changed: US robots come from `marketRobots("us")`, and the sitemap follows `MARKETS.us.indexable` too
  - `lib/consent-routes.ts` (`comparatif` joins MARKETING_SEGMENTS, so FR comparison pages get the same consent-gated analytics as the other marketing pages; needed for AC13 on FR)
  - `app/[locale]/[slug]/page.tsx` (a reserved top segment never resolves to a merchant, AC7)
  - `lib/llms-txt.ts`
  - `scripts/seo-smoke/checks.ts`
  - the pricing comparison's basket-booster row
  - links from `content/blog/en/best-loyalty-card-system-small-business.mdx` and `content/blog/fr/carte-fidelite-papier-vs-digitale.mdx`
- Research: `docs/compare/dossiers/<competitor>.md`.

No flag: drafts are the gate.

## How it runs

1. **STAMPEO.md update** (STA-532).
   - Base: the FR copy (2 Nov).
   - Add every prod change since 9 Oct (Analytics page, card themes, export, locations from the 2nd, team activity, languages served, saved icons, test broadcast, Settings), plus levels and the scanner release.
   - Copy it verbatim to EN and ES.
2. **Skill** `stampeo-comparisons` (STA-532).
3. **Research workflow** (STA-533): 6 researchers (Sonnet 5.5), then 2 fact-checkers, one per market (Opus). **Gate: Harry reads the six verdicts.**
4. **Build** (STA-534), in parallel with research: tests first, then `stage-implementer`.
5. **Writing workflow** (STA-535):
   - 2 writers, one per market;
   - 2 checkers (claims, legal, copy);
   - `ux-designer` POLISH;
   - `coverage-auditor` + `code-quality-reviewer`.
6. **Ship:**
   - runbook `docs/qa/comparisons.md`;
   - verification;
   - Harry reads the pages;
   - PR to `dev` as drafts;
   - publish + PR to `main` once the publish gate holds.
   - Then point the SEO engine's `config.md` competitor section at the skill inventory.
