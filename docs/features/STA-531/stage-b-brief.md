# Stage B brief: comparison routes, components, metadata (STA-534)

Repo: showcase. Worktree: `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-531`, branch `feat/sta-531-comparisons`. Stage A is already committed on this branch: the data layer in `lib/compare/` (types, facts index and validation, `stampeo.ts`, content loader, `checkedDate`, structured-data helper), plus sitemap and llms.txt entries. Build on its exported API; don't re-implement it. Never touch the main showcase checkout, never push, never open a PR.

Read first:
- `docs/features/STA-531/plan.md`: Decisions, **UX decisions**, AC1–AC16.
- `docs/features/STA-531/ux-brief.md`: placement, mobile shape, reuse list. This is binding for layout.
- The `stampeo-ux-ui` skill (`/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-ux-ui/SKILL.md` + `references/showcase.md`).
- The comparison skill's `references/page-anatomy.md`: sections, order, components.
- `node_modules/next/dist/docs/` before touching Next APIs (AGENTS.md: this Next differs from your training data).

## Notes from Stage A (read before coding)

- `lib/compare/types.ts` exports `Market = "us" | "fr"`, which collides with `Market` in `lib/markets.ts`. Import one under an alias.
- `checkedDate(page, competitor)` takes the page's `CompetitorFacts`: call `findCompetitor(page.competitor)` first.
- `getStampeoColumn(market)` fetches the catalog (async); `buildStampeoColumn` is the pure variant for tests.
- Drafts are excluded only from the sitemap, llms.txt and `comparisonsForMarket`. Noindex on a draft opened by URL is yours, driven by `page.draft`.
- The FR row label for `locations.multiple` is "Plusieurs établissements" (the product's word), not "points de vente".
- FAQ answers can't contain prices: the loader's typed-price check covers frontmatter too, and that's intended.

## Write the tests first

`bun:test`, colocated. Server components can be tested via their pure helpers and, where the repo already does it, rendered output (look at how existing `components/**/*.test.tsx` and DOM tests are set up; mirror them). Use the Stage A fixtures in `lib/compare/__fixtures__/`. Commit the failing tests first, then implement. Run: `bun test lib scripts` (plus any DOM test command the repo defines in package.json).

## What to build

1. **Routes**
   - `app/[locale]/us/vs/[competitor]/page.tsx`. Served at `/us/vs/<slug>`: `proxy.ts` rewrites `/us/*` to `/en/us/*`; check `isPilotPath`/market handling so `/us/vs/*` is treated like the other `/us` pages. Only the `en` locale serves it; other locales 404.
   - `app/[locale]/comparatif/[competitor]/page.tsx`. FR only (the default locale, so unprefixed `/comparatif/<slug>`); other locales 404.
   - `generateStaticParams` from the loader.
   - Drafts render, with robots `noindex,nofollow` (AC2).
   - Unknown slug → 404.
   - Add `comparatif` to `RESERVED_TOP_SEGMENTS` (`lib/locale-negotiation.ts:90`) and satisfy its test against `app/` (AC7).
   - Make `/us/vs/*` indexable where the `/us` market decides robots (`lib/markets.ts` `marketRobots` / `indexablePilotPaths`): published pages index, drafts don't.
2. **Metadata**
   - Title and description from frontmatter.
   - Self-canonical with absolute URL.
   - NO hreflang alternates to other locales: one-market pages (AC1).
   - OpenGraph via `lib/og/metadata.ts` like the blog.
   - JSON-LD from Stage A's helper, rendered server-side with `components/JsonLd.tsx` (AC5).
3. **`components/compare/`** (server components unless interaction requires otherwise):
   - **`ComparisonPage`:** the shared layout, modelled on the blog post shell:
     - `--blog-bg`, `pt-32`, inside `<Container>`;
     - `Header`/`Footer` with `market="us"` on US pages;
     - desktop-only `TableOfContents`, `blog-prose` article;
     - no cover, tags, reading time, share buttons or back link.
     - Order: H1 (`text-h1`) → verdict (first MDX paragraph, `text-lead` styling) → "Checked <date>" line (muted `text-sm`, date from `checkedDate`, locale-formatted; NO author byline, AC10) → MDX body → FAQ (`components/ui/FAQList.tsx` from frontmatter `faqs`) → Sources → other comparisons → closing CTA.
   - **`ComparisonTable`:**
     - one semantic `<table>`: rows = standard fact ids present for this market, columns = competitor | Stampeo;
     - Stampeo always on the right with the light orange tint the pricing page gives Growth;
     - yes/no cells as icon + word;
     - price rows with period and tax basis (FR: Stampeo "TVA non applicable"; competitor HT plus its TTC equivalent when the source is HT; AC16).
     - At 390px: one card per criterion, label on top and the two values below, each with a small vendor name. No horizontal page scroll (AC8). No winner marks, no red/green.
   - **`ChooseIf side="competitor|stampeo"`:** two equal cards, side by side on desktop, stacked on phones with the competitor first. InfoBox-like surface without the hover lift.
   - **`Fact id`:** renders a fact's value inline (competitor fact for the page's market, or `stampeo.*`), no visual.
   - **`SourcesList`:**
     - every competitor fact the page uses, deduplicated by source: title + domain (never a raw URL) + the date read;
     - then the correction contact (`components/ui/ContactLink.tsx`, mailto) and the disclaimer from page-anatomy.md (EN or FR).
     - Rendered by the layout, not by MDX, so every page has it (AC6).
   - **`ComparisonLinks`:** published pages of the same market minus the current one (AC15), as full-width rows ≥ 44px.
   - The mid-page CTA after the `ChooseIf` pair (AC11): reuse `components/blog/mdx/CallToAction.tsx`; add the closing CTA via `components/features/FeatureCTA.tsx`. Both go to that market's sign-up (`marketLink`).
   - Register the comparison MDX components in the comparison loader/renderer only, not the blog's.
4. **Analytics (AC13):**
   - Add an optional `trackAs` prop to `CallToAction` and `FeatureCTA` (defaults unchanged).
   - Add comparison `CTALocation` values in `lib/analytics.ts` and `lib/cta/taxonomy.ts` (follow their existing tests).
5. **Language switchers (AC12):** hide `LanguageSwitcher` and `FloatingLanguageSwitcher` on `/us/vs/*` and `/comparatif/*` by extending their existing `/blog/` path check.
6. **Prices fixed to market currency (AC4):** Stampeo prices on these pages use the page's market currency, never the `RegionPricingProvider` client swap.
7. **SEO smoke:** add checks in `scripts/seo-smoke/checks.ts` (+ its test) for a comparison URL:
   - 200, self-canonical, robots per draft state;
   - ld+json in the server HTML with no Review/AggregateRating;
   - no hreflang to other locales.
   - Skip gracefully when no published comparison exists.
8. **Pages:** none ship in this stage. For your own check, render a fixture page in tests. Don't add files under `content/compare/` (STA-535 writes them).

## Non-goals

- No real competitor content or facts.
- No blog post edits.
- No `/pricing` comparison links.
- No hub page.
- No dashboard or backend changes.
- Never stage, edit or delete anything under `docs/`.

## Done means

- `bun test lib scripts`, `bun run type-check`, `bun run lint` and `bun run build` pass in the worktree. Build only with no dev server running in this worktree; if one is running, stop it by its port, never with `pkill -f next`.
- Commits:
  - small and logical: tests first, then implementation;
  - subjects like `test(STA-534): …` / `feat(STA-534): …`;
  - files staged by explicit path, no `git add -A`;
  - **no Co-Authored-By trailer**.
- Report back with the five-part report and `git diff --stat origin/dev...HEAD`.
