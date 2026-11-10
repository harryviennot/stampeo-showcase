# Stage A brief: comparison data layer, content loader, SEO helpers (STA-534)

Repo: showcase. Worktree: `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-531`. Work and commit ONLY there, on branch `feat/sta-531-comparisons` (already checked out). Never touch the main showcase checkout, never push, never open a PR.

Read first: `docs/features/STA-531/plan.md` (Decisions, AC list, File layout) and `docs/features/STA-531/ux-brief.md`. Then the skill at `/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-comparisons/` (SKILL.md, `references/page-anatomy.md`: the standard fact ids, frontmatter and price/tax rules). This repo's Next.js differs from your training data: read `node_modules/next/dist/docs/` before touching Next APIs (see AGENTS.md).

## Goal of this stage

Everything a comparison page needs EXCEPT routes and UI: types, per-competitor facts files (structure only), Stampeo's side, the MDX content loader and its validation, the "checked" date, sitemap and llms.txt entries, JSON-LD helpers, and the basket-booster copy fix. Stage B (later, separate brief) adds routes, components, metadata wiring and the reserved `comparatif` segment.

## Write the tests first

Pure-function tests with `bun:test`, colocated (`lib/compare/*.test.ts`), using fixtures under `lib/compare/__fixtures__/` (a fake competitor `acme-loyalty` with US facts and a fake FR one, plus fixture MDX). Loader functions take the content root / facts as parameters so tests never read real content. Commit the failing tests first, confirm they fail for the right reason, then implement. Run: `bun test lib scripts`.

## What to build

1. **`lib/compare/types.ts`**
   - `Market = "us" | "fr"`.
   - `SourcedFact { id; value; sourceUrl; sourceTitle; quote; checkedAt }`. `value` is written in the market's language. `checkedAt` is `YYYY-MM-DD`.
   - `CompetitorFacts { id; name; website; markets: Partial<Record<Market, { pricingUrl; facts: SourcedFact[] }>> }`.
   - Standard fact ids as a const list, in the order given in page-anatomy.md "The standard table rows".
2. **`lib/compare/facts/index.ts`**: the registry of competitor facts files. One file per competitor (`facts/<id>.ts`) gets added in STA-535, so ship the index with an empty list plus the fixture in tests. Validation (AC3):
   - every fact has an https `sourceUrl`, a non-empty `quote` and `sourceTitle`, and a valid `checkedAt` that is not after today;
   - fact ids are unique per market.
   - The test runs the validation over the real index too (so a future bad facts file fails `bun test`).
3. **`lib/compare/stampeo.ts`**: Stampeo's column per market.
   - Rows for the standard fact ids, with values in the market's language (EN for us, FR for fr), written from STAMPEO.md (`/Users/harryviennot/LocalDocuments/stampeo-seo/stampeo seo fr/STAMPEO.md`). Plain factual values; the STA-535 writers will polish the wording.
   - Plan limits from `PLAN_FACTS` (`lib/plans/plan-facts.ts`).
   - Prices from `getPlanCatalog(currency)` (`lib/plan-catalog.ts`): USD for us, EUR for fr. The same fallback as /pricing applies when Stripe is unavailable.
   - Trial from `MARKETS[...].trialDays` (`lib/markets.ts`): us = 14, fr = the int market.
   - Expose ids `stampeo.price.<tier>` (monthly) and `stampeo.trial`. On fr, the price carries "TVA non applicable" (AC16: Stampeo charges no VAT).
   - Stampeo rows are excluded from the checked date.
4. **`lib/compare/content.ts`**: loads `content/compare/{en,fr}/<slug>.mdx` (en = us market at `/us/vs/<slug>`, fr = fr market at `/comparatif/<slug>`), with the same gray-matter approach as `lib/blog/index.ts`.
   - Frontmatter: `competitor`, `title`, `description`, `faqs` (`[{question, answer}]`), `draft`. Unknown keys fail with the file path.
   - `competitor` must exist in the facts index with that market.
   - Every `<Fact id="…"/>` in the body must resolve: a competitor fact for that market, or a `stampeo.*` id.
   - The body must contain both `<ChooseIf side="competitor">` and `<ChooseIf side="stampeo">` (AC6).
   - The body must NOT contain a markdown table (AC14) or a typed currency amount (`$25`, `25 €`, `€25`, `25 EUR`, `USD 25`, etc.; AC4). The error names the file and the line.
   - Export: `comparisonPages()` (published only), `allComparisonPages()` (incl. drafts), `comparisonPath(page)`, `comparisonsForMarket(market, {excludeSlug})` (published only: AC15).
   - The real content dir is empty for now; the loader must handle a missing or empty dir.
5. **`lib/compare/checked.ts`**: `checkedDate(page, facts)`. The OLDEST `checkedAt` among the competitor facts the page uses: every standard-row fact present for that market, plus every `<Fact>` id in the body (AC10). Stampeo ids excluded.
6. **Structured data**: a helper in `lib/compare/structured-data.ts` reusing `lib/structured-data.ts` builders. It returns Article (or WebPage) + BreadcrumbList + FAQPage (from frontmatter `faqs`). Test (AC5) that the output never contains `Product`, `Review` or `AggregateRating`, nor a node naming the competitor as an `Organization` or `Product` with ratings.
7. **Sitemap** (`lib/seo/sitemap.ts`): published comparisons only, absolute URLs `https://stampeo.app/us/vs/<slug>` and `https://stampeo.app/comparatif/<slug>` (follow how the file builds URLs), no alternates (AC1, AC2). Extend `lib/seo/sitemap.test.ts`.
8. **llms.txt** (`lib/llms-txt.ts`): a "Comparisons" section listing published pages (title + URL), absent when there are none, never listing drafts. Extend `lib/llms-txt.test.ts`.
9. **AC9 copy fix**: `messages/{en,fr,es,pl}/pricing.json` → `basketBoost.pro` says "Unlimited" (and its translations), but code caps Pro at 6 levels. Make it the "up to 6" equivalent in each language, matching the style of the `growth` value ("1 level"). Follow the `stampeo-copywriting` skill (FR: "Jusqu'à 6 niveaux"; check how ES/PL phrase "1 level" in their files and mirror it). Add a test (e.g. in `lib/plans/product-claims.test.ts`) that no locale's `basketBoost.pro` claims unlimited.

## Non-goals (respect absolutely)

- No routes, pages, components, metadata wiring, `RESERVED_TOP_SEGMENTS`, language-switcher or CTA changes (Stage B).
- No real competitor facts or MDX content (STA-535).
- No edits to blog posts, the dashboard, the backend, or any file outside this worktree.
- No new dependencies unless unavoidable (say why).

## Done means

`bun test lib scripts`, `bun run type-check` and `bun run lint` all pass in the worktree. Don't run `bun run build` or a dev server. Commit on the branch in small logical commits: tests first, then implementation. Use conventional subjects like `test(STA-534): …` / `feat(STA-534): …`, and **no Co-Authored-By trailer** (repo owner's rule). Report back with the five-part stage-implementer report and `git diff --stat origin/dev...HEAD`.
