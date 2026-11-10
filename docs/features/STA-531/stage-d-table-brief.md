# Stage D brief: rebuild the comparison table UI from the site's design language (STA-534)

Repo: showcase. Worktree: `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-531`, branch `feat/sta-531-comparisons`.

## Why

Harry, 2026-11-07, on the current comparison table: "the table component just seems really vibe coded. I don't mind the layout, it's really the UI. Could we build a table UI from scratch with our design code?"

The current table (`components/compare/ComparisonTableView.tsx`, `ComparisonGrid.tsx`, `ComparisonRows.tsx`, `TableParts.tsx`) invented its own visual language: soft grey and peach rounded boxes around every value, icon chips per theme, small grey labels. None of it comes from Stampeo's design system.

## The reference: the site's own comparison table

The showcase already has a designed comparison table: "Compare all features" on `/pricing`, built by `FeatureComparisonTable` and its phone variant in `components/pricing/PricingPageContent.tsx`.
- Live: http://localhost:3001/pricing (FR) and http://localhost:3001/en/pricing (EN).
- Reference screenshot: `/Users/harryviennot/LocalDocuments/fidelity/showcase/ds-bundle/_screenshots/pricing__PricingPageContent.png`.

Its language:
- one ink-outlined card with the hard bottom edge (the site's `card-stamp` idiom, as on the FAQ cards);
- plain bold category rows;
- quiet alternating row tint;
- plain values with no pill or box;
- the highlighted column in a soft peach tint under an orange header label.

The design system's rules and tokens: `/Users/harryviennot/LocalDocuments/fidelity/showcase/ds-bundle/README.md` and `ds-bundle/styles.css` (with `_ds_bundle.css`). Use the tokens only, no new colours. Also read the stampeo-ux-ui skill (`/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-ux-ui/SKILL.md` + `references/showcase.md`).

## Goal

Rebuild the comparison table's UI from scratch so it reads like a sibling of the pricing table, made by the same designer: same container, category rows, row rhythm, type sizes, header treatment, and Stampeo's column treated like the highlighted plan. Read `FeatureComparisonTable`'s markup and classes first and reuse its exact choices wherever the content allows. Extract a shared primitive from it only if that leaves `/pricing` pixel-identical.

**Keep (behaviour, tested):**
- the 4 themes and their order, as category rows;
- each row's label plus the two short values;
- a row opens on both full sourced sentences and the competitor's "Source ↗" link (`target="_blank" rel="noopener nofollow"`);
- one control above the table that opens or closes every row;
- the French price row's tax line under the short value, visible while closed;
- a real `<table>` from md up, with the existing role attributes;
- a phone layout with no horizontal scroll;
- all existing behavioural tests (`lib/compare/page/table.test.tsx`, `rows.test.ts`, `article.test.tsx`, `real-pages.test.tsx`).

**Drop:**
- the rounded value boxes and pills;
- the theme icon chips;
- the repeated vendor-name row inside each theme on desktop;
- anything else that isn't in the site's vocabulary.

**Decide, in the pricing table's spirit:**
- **Value alignment.** Pricing centres short values; ours are short phrases, so left-align them if that reads better. Show it in screenshots.
- **How the "open" affordance looks.** A subtle chevron, or the site's text-link style. It must stay ≥44px tall and keyboard reachable.
- **How the opened detail row looks.** Muted text in the same columns, no new card.
- **The phone version.** Mirror the pricing page's own phone pattern for its comparison table.

**Hard constraints:**
- No ✓/✗ icons. The pricing table uses green ticks for our own plans, but a competitor comparison must not (legal.md; no green/red, no winner marks).
- No competitor visuals.
- Stampeo's column is distinguished the way the highlighted plan is (tint + header colour), never as "winning".

## Process

1. Screenshot `/en/pricing`'s comparison table and the current comparison table on `/us/vs/loopy-loyalty` and `/comparatif/zerosix`, at 1440 and 390. Read them.
2. Rebuild. Tests first for any behaviour change. Class-name assertions are not tests: assert roles, text and behaviour.
3. Screenshot again at 1440 and 390, the pricing table next to the new table. Iterate until they read as one design system, not two.
4. Check `scrollWidth` equals the viewport at 390, 768, 1024 and 1440 on all six pages. Tap targets ≥44px.

Use Chromium from `/Users/harryviennot/LocalDocuments/fidelity/promo-videos/node_modules/playwright`, with scripts in `/private/tmp/claude-501/-Users-harryviennot-LocalDocuments-fidelity/1b99a432-b7b9-4a63-bd2a-f06b5b4f8282/scratchpad/`. A dev server for this worktree runs at http://localhost:3001 (hot reload): never stop it or any other process, and don't run `bun run build`.

## Scope

- Touch only the comparison table's components and `lib/compare/page/` table helpers, plus `COPY` strings if a label must change (EN + FR, following the stampeo-copywriting skill).
- Don't change data (`tableGroups`, facts, Stampeo values), MDX content, docs/, or `/pricing` (unless a shared extraction leaves it identical: prove it with before/after screenshots).
- Stage by explicit path. Commit small, with `test(STA-534): …` / `feat(STA-534): …` / `style(STA-534): …` subjects and **no Co-Authored-By trailer**.

## Done means

- `bun test lib scripts`, `bun run type-check` and `bun run lint` (0 errors) pass.
- Report:
  - what you took from the pricing table and what you decided differently, and why;
  - paths of the side-by-side screenshots: pricing table vs new table, at 1440 and 390, for one US and one FR page;
  - files changed, with commits.
