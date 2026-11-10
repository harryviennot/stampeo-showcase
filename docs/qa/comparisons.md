BRANCH: feat/sta-531-comparisons
SCOPES: showcase
ENVIRONMENT: local only (dev server or `bun run publicdev`). No backend, no database, no migration.

# Comparison pages Test Pass

Every behaviour of the competitor comparison pages: `/us/vs/<slug>` (English, US market) and `/comparatif/<slug>` (French). Wave 1 has six pages, all `draft: true` until the STA-531 publish gate holds. Work top to bottom. CP-01 gates everything.

---

## SETUP: Before you start

Everything below runs locally against the showcase worktree. Nothing touches production, and the pages are public (no account needed).

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase dev server | `cd showcase && bun run dev` → `http://localhost:3001` | The dev script always uses port 3001. |
| Public tunnel (phone checks) | `bun run publicdev` | Use for a real phone at 390px. |
| US pages | `/us/vs/loopy-loyalty`, `/us/vs/stamp-me`, `/us/vs/winstamp` | The proxy rewrites `/us/*` to `/en/us/*`. |
| FR pages | `/comparatif/fidelatoo`, `/comparatif/zerosix`, `/comparatif/heypongo` | French is the default locale (no prefix). |
| Content tests | `bun test lib/compare` | Facts, loader, table, sources, metadata. |
| SEO smoke | `bun run build && bun run start` then `bun scripts/seo-smoke.ts http://localhost:3000` | Comparison checks run on every page in the sitemap. |

### Accounts

None. These are public marketing pages.

### Reset recipes

**R1: publish one page locally** (for CP-05 and CP-14 only)
In `content/compare/en/loopy-loyalty.mdx`, set `draft: false`, then restart the dev server. Put it back to `draft: true` afterwards. Never commit the change before the publish gate.

### Known state before you start

- **All six pages are drafts.** By design they are noindex and absent from the sitemap, llms.txt and the "Other comparisons" lists. CP-05 needs R1.
- **Prices come from Stripe through the plan catalog.** Locally, without Stripe keys, the fallback prices in `lib/pricing.ts` show; that's expected.

---

## CP: Comparison pages

### CP-01: A US page renders [BLOCKER]

| Field | Content |
|---|---|
| WHY | If the route or loader is broken, nothing else is testable. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Open `/us/vs/loopy-loyalty`. |
| EXPECT | 200. In this order: H1 "Loopy Loyalty vs Stampeo", the two-sentence verdict, "Checked <date>", the two "Choose … if" cards, a sign-up CTA, the comparison table, the prose sections, the FAQ, Sources, the closing CTA. Header and footer are the US ones. You do NOT see an author byline, cover image, tags, reading time or share buttons. |
| RESET | None. |

### CP-02: A French page renders, French only [CORE]

| Field | Content |
|---|---|
| WHY | FR pages exist in one locale; another locale must never serve them. |
| DEPENDS | CP-01 |
| ACCOUNT | None. |
| STEPS | 1. Open `/comparatif/fidelatoo`. 2. Open `/en/comparatif/fidelatoo` and `/es/comparatif/fidelatoo`. 3. Open `/comparatif/does-not-exist`. |
| EXPECT | Step 1: 200, French throughout, H1 "Fidelatoo ou Stampeo : lequel choisir pour votre commerce ?". Steps 2 and 3: 404. You do NOT see an English version of the page anywhere. |
| RESET | None. |

### CP-03: Canonical and hreflang [CORE]

| Field | Content |
|---|---|
| WHY | One-market pages must not point search engines to other locales (AC1). |
| DEPENDS | CP-01, CP-02 |
| ACCOUNT | None. |
| STEPS | 1. View source of `/us/vs/stamp-me` and `/comparatif/zerosix`. |
| EXPECT | One `<link rel="canonical">` with the page's own absolute URL. You do NOT see any `hreflang` alternate link. |
| RESET | None. |

### CP-04: Drafts stay out of search [BLOCKER]

| Field | Content |
|---|---|
| WHY | Drafts must never reach Google or AI answers before Harry publishes them (AC2). |
| DEPENDS | CP-01 |
| ACCOUNT | None. |
| STEPS | 1. View source of any of the six pages. 2. Open `/sitemap.xml`. 3. Open `/llms.txt`. |
| EXPECT | Step 1: `<meta name="robots" content="noindex, nofollow">`. Steps 2 and 3: you do NOT see any `/us/vs/` or `/comparatif/` URL, and llms.txt has no "Comparisons" section. |
| RESET | None. |

### CP-05: A published page is listed [CORE]

| Field | Content |
|---|---|
| WHY | Publishing must flip indexing, the sitemap and llms.txt in one move (AC1, AC2). |
| DEPENDS | CP-04 |
| ACCOUNT | None. |
| STEPS | 1. Apply R1. 2. Reload `/us/vs/loopy-loyalty`, `/sitemap.xml` and `/llms.txt`. |
| EXPECT | The page has no `noindex`. The sitemap lists `https://stampeo.app/us/vs/loopy-loyalty`. llms.txt has a "Comparisons" section with it. You do NOT see the five other pages in either. |
| RESET | R1 (back to draft). |

### CP-06: The checked date is the oldest fact [CORE]

| Field | Content |
|---|---|
| WHY | The page must never look fresher than its oldest fact (AC10). |
| DEPENDS | CP-01 |
| ACCOUNT | None. |
| STEPS | 1. On `/us/vs/winstamp`, note the "Checked" date. 2. Compare it with the oldest `checkedAt` in `lib/compare/facts/winstamp.ts`. |
| EXPECT | The two match (all wave-1 facts were read on 2026-11-04, so the page reads "Checked November 4, 2026"; the FR pages read « Vérifié le 4 novembre 2026 »). You do NOT see a date later than the oldest fact. |
| RESET | None. |

### CP-07: Prices, currency and tax [BLOCKER]

| Field | Content |
|---|---|
| WHY | A like-for-like price comparison is the legal heart of the page (AC4, AC16). |
| DEPENDS | CP-01, CP-02 |
| ACCOUNT | None. |
| STEPS | 1. On each US page, read the price rows of the table and the prices section. 2. On each FR page, do the same. |
| EXPECT | US: Stampeo prices are in $, monthly. FR: Stampeo's prices are in € and read "TVA non applicable"; a competitor price quoted HT shows its TTC equivalent ("soit X € TTC, TVA à 20 %"); Hey Pongo reads "Sur devis". You do NOT see € on a US page or $ on a FR page, and no Stampeo price typed into the prose that differs from the table. |
| RESET | None. |

### CP-08: The table on a phone [CORE]

| Field | Content |
|---|---|
| WHY | 90% of visitors are on phones; a wide table that scrolls sideways breaks the page (AC8). |
| DEPENDS | CP-01 |
| ACCOUNT | None. |
| STEPS | 1. Open `/comparatif/fidelatoo` at 390px wide (or on a phone through `publicdev`). 2. Scroll the whole page. |
| EXPECT | Each criterion is a card: the label on top, the two values below with their vendor name, Stampeo on the right. Yes/no cells show an icon and a word. You do NOT see horizontal page scroll, red or green cells, or a "winner" mark. |
| RESET | None. |

### CP-09: Choose-if, then a CTA [CORE]

| Field | Content |
|---|---|
| WHY | A reader who fits "Choose Stampeo if" should be able to act right there (AC6, AC11). |
| DEPENDS | CP-01 |
| ACCOUNT | None. |
| STEPS | 1. On `/us/vs/loopy-loyalty`, look at the Choose-if section at desktop width and at 390px. 2. Tap the CTA under it. |
| EXPECT | Desktop: two equal cards side by side, the competitor's first. Phone: stacked, the competitor's first. A sign-up CTA sits right under the pair and leads to `/onboarding`. You do NOT see a hover lift on the cards. |
| RESET | None. |

### CP-10: Sources, correction contact and disclaimer [BLOCKER]

| Field | Content |
|---|---|
| WHY | Proof on request and a correction channel are what keeps the page lawful (AC6, legal.md). |
| DEPENDS | CP-01, CP-02 |
| ACCOUNT | None. |
| STEPS | 1. Scroll to Sources on one US and one FR page. |
| EXPECT | Every source shows its page title, its domain and the date read. Then a correction email link (contact@stampeo.app) and the disclaimer starting "Written by Stampeo." / « Comparatif rédigé par Stampeo. ». You do NOT see raw URLs or a source without a date. |
| RESET | None. |

### CP-11: Structured data [CORE]

| Field | Content |
|---|---|
| WHY | Rating markup about a competitor breaks Google's guidelines and legal.md (AC5). |
| DEPENDS | CP-01 |
| ACCOUNT | None. |
| STEPS | 1. View the server HTML of `/us/vs/stamp-me` (curl or view-source, not the inspector). |
| EXPECT | `application/ld+json` scripts with WebPage, BreadcrumbList and FAQPage, the FAQ matching the visible FAQ. You do NOT see Product, Review, AggregateRating or Rating anywhere. |
| RESET | None. |

### CP-12: No language switcher [EDGE]

| Field | Content |
|---|---|
| WHY | Switching language on a one-language page would land on a 404 (AC12). |
| DEPENDS | CP-01, CP-02 |
| ACCOUNT | None. |
| STEPS | 1. On one US and one FR page, look in the header, the footer and the floating corner. |
| EXPECT | You do NOT see a language switcher. On `/pricing` you still do. |
| RESET | None. |

### CP-13: CTA clicks are tracked as comparison clicks [EDGE]

| Field | Content |
|---|---|
| WHY | Without its own location we can't measure the ~10% conversion premise (AC13). |
| DEPENDS | CP-09 |
| ACCOUNT | None. Accept analytics cookies first. |
| STEPS | 1. Open the network tab. 2. Click the CTA after Choose-if, then the closing CTA. |
| EXPECT | The CTA events carry `comparison_cta` and `comparison_final_cta` as their location. You do NOT see `blog_cta` or `feature_cta` for these clicks. |
| RESET | None. |

### CP-14: Other comparisons only lists published pages [EDGE]

| Field | Content |
|---|---|
| WHY | A draft must never be linked from a published page (AC15). |
| DEPENDS | CP-05 |
| ACCOUNT | None. |
| STEPS | 1. With R1 applied, open `/us/vs/stamp-me` (a draft) and look for "Other comparisons". 2. Undo R1 and reload. |
| EXPECT | Step 1: the list shows Loopy Loyalty only. Step 2: no "Other comparisons" list (every page is a draft). You do NOT see a link to a draft page, nor to a FR page from a US page. |
| RESET | R1. |

### CP-15: `comparatif` can't be a merchant slug [EDGE]

| Field | Content |
|---|---|
| WHY | A business named "comparatif" would otherwise shadow the route (AC7). |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | 1. Run `bun test lib/locale-negotiation.test.ts`. 2. Open `/comparatif`. |
| EXPECT | The test passes. `/comparatif` returns 404. You do NOT see a merchant sign-up page. |
| RESET | None. |

### CP-16: Pro basket boosters on /pricing [EDGE]

| Field | Content |
|---|---|
| WHY | The pricing table claimed "Unlimited" while the product caps Pro at 6 (AC9). |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | 1. Open `/pricing`, `/en/pricing`, `/es/pricing`, `/pl/pricing` and expand the comparison table. |
| EXPECT | The Pro basket-booster cell reads "Jusqu'à 6 paliers" / "Up to 6 levels" / "Hasta 6 niveles" / "Do 6 progów". You do NOT see "Unlimited" or its translations in that row. |
| RESET | None. |

### CP-17: Content rules hold [CORE]

| Field | Content |
|---|---|
| WHY | Typed prices, markdown tables and unsourced facts must fail before they reach a page (AC3, AC14). |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | 1. Run `bun test lib/compare`. |
| EXPECT | All pass. You do NOT see skipped content tests. |
| RESET | None. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first, then CP-01 to CP-17, with BLOCKER cases first unless DEPENDS forces otherwise.
2. **On BLOCKER failure:** stop. Cases that depend on it are SKIPPED, not failed. Write a failure report.
3. **On CORE failure:** write a failure report, skip its dependents, continue.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY; if still unclear, report AMBIGUOUS so the runbook gets fixed.
6. **After any failure:** run the case's RESET before moving on.
7. **Reporting:** one failure report per failed case (`failure-report-template.md`), by case ID.
8. **Re-runs after fixes:** the failed case, its dependents, and anything listed in "Known state". Nothing else.
