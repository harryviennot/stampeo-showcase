# Fix stage brief: review findings (STA-534 / STA-535)

Repo: showcase. Worktree: `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-531`, branch `feat/sta-531-comparisons` (Stages A and B, the six drafts and the polish are committed). The coverage audit and the quality review of 2026-11-04 found the items below. Each one is a decided fix: implement them all.

Rules:
- Tests first for every behaviour change: failing test, then fix.
- Never change what a page claims: no edits to competitor values, quotes, sources or dates in `lib/compare/facts/*.ts`, and none to MDX prose, except the typed Stampeo numbers in B7.
- Never touch `docs/`.
- A dev server for this worktree runs on port 3001: never stop it or any other process, and don't run `bun run build` (the coordinator builds after stopping it).
- Stage files by explicit path. Commit in small logical commits with `test(STA-534): …` / `fix(STA-534): …` / `refactor(STA-534): …` subjects and **no Co-Authored-By trailer**.

## A. Bugs (tests first)

1. **AC7: bare `/comparatif` can reach a merchant.**
   - Today `RESERVED_TOP_SEGMENTS` is only read for locale negotiation (`lib/locale-negotiation.ts:139`), and `app/[locale]/[slug]/page.tsx` calls `getBusinessBySlug(slug)` with no reserved check.
   - Make that page `notFound()` for any reserved top segment, before any business lookup, through one small pure helper (e.g. `isReservedTopSegment(slug)`), and test the helper.
2. **The sitemap ignores `MARKETS.us.indexable`.**
   - `lib/seo/sitemap.ts` lists published US comparisons even when the US market is noindex, while their robots tag follows it (`lib/compare/page/metadata.ts`).
   - Skip US comparisons when the US market isn't indexable. Test both states. `lib/markets.ts:138-142` documents this exact past bug.
3. **TTC conversion and thousands separators** (`lib/compare/page/rows.ts` HT regex). "1 200 € HT" (normal, no-break or narrow no-break space) must become 1 440 € TTC, not convert "200". Test it.
4. **"Today" in UTC** (`lib/compare/facts/validate.ts`). Compute today as the Europe/Paris calendar date, and test the 00:30 Paris boundary.
5. **Every page needs the table.** The checked date and Sources count every standard row, so a page without `<ComparisonTable />` would cite facts it never shows. Make the loader reject a page whose body has no `<ComparisonTable />` (it's required by page-anatomy), with a test. Update the fixtures that lack it.

## B. Missing tests (and the small code they need)

1. **Route factory + AC1.** The two route files differ only in market and locale.
   - Put a `comparisonRoute(market)` factory in `lib/compare/page/route.tsx` returning `generateStaticParams`, `generateMetadata` and the page component. Each route file becomes three re-export lines.
   - Test the factory: params list every page of that market (drafts included); an unknown slug, the other market's slug and the wrong locale give `notFound`.
2. **ComparisonPage setup.** Extract the pure bit of `components/compare/ComparisonPage.tsx` (header/footer market: us → "us", fr → "int"; catalog currency USD/EUR) into a tested helper.
3. **AC11 hrefs.**
   - Test that on both a US and a FR page both CTAs exist and point to `/onboarding`.
   - The CTAButton stand-in must record the `href` it receives, not fill in its own default.
   - Replace the `CallToAction(...)` children-poking test with a render that asserts the tracked location, like the FeatureCTA test next to it.
4. **AC6 on FR.** Test the FR Sources list: « Lu le » dates, the FR correction copy, the mailto link and the FR disclaimer.
5. **AC16.** In facts validation, a `fr` competitor fact whose id starts with `price.` must state its basis: the value contains `HT` or `TTC`, or reads "Sur devis…" / "Non communiqué". Test it.
6. **OpenGraph.** Test `comparisonOpenGraphPage`: og:url is the page URL, og:locale is `en_US` on US pages and `fr_FR` on FR pages.
7. **Typed Stampeo numbers.**
   - Add `stampeo.*` fact ids derived from `PLAN_FACTS` for the plan numbers the pages state in prose (e.g. `stampeo.broadcasts.growth`, `stampeo.team.starter`).
   - Replace each typed Stampeo plan number in `content/compare/**/*.mdx` with the matching `<Fact>`. Known case: "8 diffusions par mois" in `content/compare/fr/zerosix.mdx:55`; grep for others: 8 broadcasts, 2 team members, 3 milestones, 5 levels, trial days.
   - In `lib/compare/stampeo.ts`, derive "milestones on Growth and Pro" from `PLAN_FACTS` (whichever field holds milestones) and the language list from `routing.locales`. Levels (up to 5) have no showcase source: keep one named constant with a comment pointing at the backend limit.
8. **Comparison links tracking.**
   - The comparison MDX spreads the blog's components, so an `a` or `BlogLink` in a comparison page reports `blog_link`.
   - Give links in comparison pages their own tracked location: a `comparison_link` CTALocation, following how `trackAs` was added to CallToAction. Test it.
9. **US internal links stay in the US market.** The loader rejects, in an `en` page, an internal link (`/...`) that doesn't start with `/us` (allow `/onboarding`). Test it.
10. **Real pages compile.** A test that compiles and renders all six real pages in `content/compare/` through the comparison MDX pipeline and the article (fallback pricing), so MDX errors and unresolved `<Fact>`s fail `bun test`. Real pages only, no fixtures.
11. **Old facts still render.** A test that a fact checked more than 90 days ago passes validation and renders (freshness is a refresh task, not a red build).
12. **Error paths.** Invalid YAML, missing or non-string `competitor`, an empty fact `id`, and a non-https `website` each fail with the file or competitor named. Fold into the existing `it.each` tables.
13. **FR draft robots.** Add a FR draft fixture page and test it is noindex,nofollow.
14. **Realistic fixtures.**
    - `GLOBEX_STAMPS` gets its own facts, quotes and source domain (not a copy of Acme).
    - Add a second real FR fixture page, and use it in `load.test.ts` instead of the made-up slug "autre".

## C. Tests to fix or delete

- `lib/llms-txt.test.ts:205-207` reads the real content and would go red on the publish PR: inject an empty comparisons list instead.
- Delete the Tailwind-class assertions in `lib/compare/page/article.test.tsx`:
  - the phone-width block (~206-236): `block … md:table`, `grid`, `break-words`, `overflow-x-auto`, `text-red-`;
  - the tint test (~220-223);
  - the blog `mdxComponents` key check (~260-264).
  - Layout is covered by the QA runbook (CP-08, CP-12).
- Remove the duplicate FR price-row check (`article.test.tsx` ~192-201) and the duplicate "other comparisons exclude drafts" case in `content.test.ts` (~57-61).
- `rows.test.ts:21`: delete the circular second assertion. Merge the two us/fr `it.each` blocks (~80-101) into one with a market column.
- `facts/validate.test.ts:61-76`: fold the three rejection cases into the `it.each` at 24-40.
- Shared fixture helpers in `lib/compare/__fixtures__/index.ts`:
  - `withUsFacts(competitor, transform)`, replacing the copied spreads in `checked.test.ts`, `validate.test.ts` and `article.test.tsx`;
  - `fixturePage(slug)`, replacing the copied lookup in `metadata.test.ts` and `structured-data.test.ts`.

## D. Code quality

- **Comments:**
  - `LanguageSwitcher.tsx:14`, `FloatingLanguageSwitcher.tsx:134`, `lib/routing/language-switcher.ts:2` and its test (4, 6): "Blog posts (slug differs per language) and comparison pages (one language) would 404 on a switch." Fix the test example, which is a translated post.
  - `lib/compare/stampeo.ts:169`: delete the comment and the `ordered` rebuild (nothing walks `rows`).
  - `lib/compare/types.ts:26` `pricingUrl`: "The competitor's pricing page; validated, not rendered".
  - `ChooseIf.tsx:7-10`: "The competitor's card comes first at every width." Wrap it.
  - `stampeo.ts:8`: give STAMPEO.md's real location (`stampeo-seo/stampeo seo fr/STAMPEO.md`, outside this repo).
  - `ComparisonArticle.tsx:31-32`: delete the list of things the page doesn't have.
  - Cut component docblocks to one line each: `ComparisonTable.tsx:6-12`, `ComparisonArticle.tsx:24-33`, `ChooseIf.tsx:6-11`, `SourcesList.tsx:9-13`. Match `components/blog` density.
- **Shared frontmatter options:** move the gray-matter/js-yaml engine shim (`lib/compare/content.ts:34-45`, a copy of `lib/blog/index.ts:10-21`) into `lib/frontmatter.ts`, and import it from both.
- **Copy tables:**
  - rename the private `COPY` in `stampeo.ts` to `STAMPEO_COPY`;
  - define `NBSP` and the market-to-locale map once, in `lib/compare/page/format.ts`, and import them where they're duplicated (`stampeo.ts`, `copy.ts`, `format.ts`).
- **One fact builder:**
  - add a shared `fact(...)` builder in `lib/compare/facts/` (e.g. `build.ts`) with one signature;
  - refactor the six facts files to use it with no change to any value, quote, URL, title or date.
  - Prove it: before and after the refactor, dump `COMPETITOR_FACTS` to JSON and confirm the two are identical.

## Done means

- `bun test lib scripts`, `bun run type-check` and `bun run lint` (0 errors) all pass.
- Report the five-part report, with the before/after JSON check of the facts refactor and `git diff --stat` of your commits.
