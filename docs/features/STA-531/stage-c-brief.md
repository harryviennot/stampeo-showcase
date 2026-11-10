# Stage C brief: comparison pages redesign (STA-534)

Repo: showcase. Worktree: `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-531`, branch `feat/sta-531-comparisons` (PR #187 open to dev).

Build `docs/features/STA-531/ux-brief-v2.md` exactly: it's binding for layout and lists every component. Read it, plus `plan.md` (AC17–AC19 are new, the older ACs still hold) and the stampeo-ux-ui skill (`/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-ux-ui/SKILL.md` + `references/showcase.md`). This Next.js differs from your training data: read `node_modules/next/dist/docs/` before touching Next APIs.

## Already done (by the coordinator)

`SourcedFact.short?: string`, and the builder `fact(source, id, value, quote, short?)` in `lib/compare/facts/build.ts`.

## Running in parallel (don't touch their files)

Two writers are adding `short` values to the six competitor facts files (`lib/compare/facts/{loopy-loyalty,stamp-me,winstamp,fidelatoo,zerosix,heypongo}.ts`). Never edit those six files. Until a short value exists, the table falls back to `value`.

## Tests first, then build

1. **Validation** (`lib/compare/facts/validate.ts`): when `short` is present, it must be non-empty, one line and at most 40 characters. Don't make it required yet; the coordinator flips that once the writers are done.
2. **Stampeo's short values:** `rowsShort` in `lib/compare/stampeo.ts`, EN and FR, built like `rows`.
   - Plans, catalog prices and trial days are computed, never typed. At most 40 characters each.
   - Draft them following `/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-copywriting/SKILL.md` (EN and FR sections; FR: vouvoiement, "plan" not "formule", French spacing via the shared `NBSP`, no em dashes).
   - List all 28 in your report for review.
3. **Groups:** `ROW_GROUPS` (the 4 themes and their order in the brief) in `lib/compare/page/rows.ts`, `groupLabels` in `COPY` (EN/FR), and the group icons from the brief (add the `Tag` alias to `components/icons/index.tsx`).
   - Delete `YES`/`NO`/`cellOf`/`PLAIN_ROWS` and the tone concept (AC18). Update or remove their tests.
4. **`ComparisonTable` rewrite:**
   - Phone: a `<details>` per row inside theme cards.
   - md+: a real `<table>` with a `<tbody>` per theme and the detail always visible.
   - The short value is bold, with the full value and, for the competitor, a "Source ↗" link to its `sourceUrl` (`target="_blank" rel="noopener nofollow"`) as detail. Stampeo's detail is the full Stampeo value.
   - The price row's tax line stays in the summary.
   - Follow the brief's classes.
5. **Page restructure** (`ComparisonArticle`, `ComparisonPage`):
   - Drop the blog shell and `TableOfContents`; use `paper-grain bg-[var(--cream)]`.
   - Hero: H1, verdict, the Checked pill, and `HeroCardStack`, moved unchanged to `components/card/` with its import in the design-de-carte page updated.
   - `SideCard` shared by `ChooseIf` / `PriceCard` / `Strengths`.
   - The Stampeo Choose-if card ends with the sign-up `CTAButton` (trackAs `comparison_cta`). `arrangeBody` stops inserting `<CallToAction />`; AC11 still holds, with that button plus the closing `FeatureCTA`.
   - Table band, price cards, strengths band (side by side on lg), `Fit` rows with pick pills, then switching, FAQ, Sources, ComparisonLinks, FeatureCTA. Section rhythm per the brief.
6. **MDX:** register `PriceCard side`, `Strengths side` and `Fit side shop` in `lib/compare/page/mdx.tsx`. Restructure the six pages in `content/compare/{en,fr}/` to use them **without changing a single visible word**.
   - Prove it with a test (or a committed check script plus its output in your report): the pages' visible text, with tags stripped and whitespace normalised, is identical before and after (AC19).
7. **Skill docs are the coordinator's.** Report what `page-anatomy.md` must now say; don't edit the skill.

## Rules

- Never change competitor values, quotes, sources or dates. No copy changes beyond the new Stampeo short values and group labels.
- A dev server for this worktree runs on port 3001 (hot reload). Use it for your own checks; never stop it or any other process, and don't run `bun run build`.
- Check 390px and 1440px yourself with headless Chromium from `/Users/harryviennot/LocalDocuments/fidelity/promo-videos/node_modules/playwright`. Run scripts from `/private/tmp/claude-501/-Users-harryviennot-LocalDocuments-fidelity/1b99a432-b7b9-4a63-bd2a-f06b5b4f8282/scratchpad/`. `scrollWidth` must equal the viewport on all six pages. Read your screenshots.
- Stage by explicit path, never `docs/`. Commit in small logical commits (`test(STA-534): …` / `feat(STA-534): …` / `refactor(STA-534): …`), **no Co-Authored-By trailer**.

## Done means

- `bun test lib scripts`, `bun run type-check` and `bun run lint` (0 errors) pass.
- The real-pages test is green.
- Report the five-part report, with the 28 Stampeo short values, the visible-text proof, your screenshot paths, and what `page-anatomy.md` must say.
