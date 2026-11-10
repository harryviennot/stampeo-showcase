# Stage E brief: Stampeo's column, the languages row, and the footer links (STA-534)

Worktree: `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-531`, branch `feat/sta-531-comparisons`.

Context: `docs/features/STA-531/review-2026-11-08.md`, Harry's review: "you are comparing all of their best features with our mid ones". The "Positioning" section of `/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-comparisons/references/page-anatomy.md` holds the new rules.

Two writer agents are rewriting `content/compare/**` and the `short` values in `lib/compare/facts/<competitor>.ts` at the same time. **Never edit those files, and never `git add -A`.**

## 1. Stampeo's column (`lib/compare/stampeo.ts`, EN + FR; tests first in `stampeo.test.ts`)

Full values and short values (shorts ≤ 40 characters):

| Row | EN | FR |
|---|---|---|
| `pos.integration` | full: "Runs without a till connection: staff scan the card in the Scanner app or in a browser"; short: "Runs without a till connection" | full: « Fonctionne sans caisse connectée : l'équipe scanne la carte dans l'appli Scanner ou dans un navigateur »; short: « Fonctionne sans caisse connectée » |
| `staff.scanning` | full: "The Stampeo Scanner app on iPhone and Android, or any phone or tablet browser at scan.stampeo.app"; drop "(offline scanning isn't available yet)"; short: "Scanner app or any browser" | « L'appli Scanner Stampeo sur iPhone et Android, ou n'importe quel navigateur sur scan.stampeo.app »; short « Appli Scanner ou navigateur » |
| `program.types` | "Stamps, points and levels on every plan" (full: "Stamps, points and loyalty levels (up to 5, each with its own card look), on every plan"). No "optional", no "or". | « Tampons, points et niveaux » (full: « Tampons, points et niveaux de fidélité (jusqu'à 5, chacun avec sa propre apparence de carte), sur tous les plans ») |
| `designer` | full: "Design it yourself in minutes with a live Apple Wallet and Google Wallet preview, or send us your logo and we design it for you, free"; short: "In minutes, or designed for you free" | full: « Créez-la vous-même en quelques minutes avec un aperçu en direct, ou envoyez-nous votre logo et on la crée pour vous, gratuitement »; short: « En quelques minutes, ou créée pour vous » |
| `commitment` | short: "No setup fee, cancel anytime"; full keeps no setup fee + monthly/yearly + cancel anytime | short: « Sans frais ni engagement » |
| `push.automatic` | short: "On every scan, on the lock screen" | short: « À chaque passage, sur l'écran de verrouillage » |

- Keep everything computed (plans, prices, trial days).
- Follow the stampeo-copywriting skill (`/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-copywriting/SKILL.md`): FR vouvoiement, no anglicisms except Apple/Google Wallet, `NBSP` before « : ».
- If a string above breaks the 40-character limit or a rule, adjust it minimally and report it.

## 2. No languages row in the table (`lib/compare/page/rows.ts` `ROW_GROUPS`)

- Remove `languages` from the "customer" group. Keep the id in `STANDARD_FACT_IDS`: facts files may keep it, but the table must not show it.
- `missingShortValues` should then only require shorts for ids the table shows. Derive that list from `ROW_GROUPS`, and test it.
- Update the table, rows, real-pages and article tests (row counts: 13 per page, 11 on heypongo, or whatever the data gives).

## 3. Footer links (tests first)

- **New pure helper `lib/compare/footer.ts`:** `footerComparisons(market: SiteMarket, locale, deps?)`.
  - US footer (`market === "us"`) → published `/us/vs/*`.
  - Int footer in French (`market === "int" && locale === "fr"`) → published `/comparatif/*`.
  - Anything else → `[]` (en-int, es, pl, uk).
  - Items are `{ href: comparisonPath(page), label }`, with the label from `COPY[m].otherLabel(findCompetitor(page.competitor).name)`. Published pages only, through `comparisonsForMarket`.
  - Take `{ root, facts }` like the loader, for tests with `lib/compare/__fixtures__`.
- **`lib/compare/page/copy.ts`:** add `footerTitle`: EN "Compare", FR « Comparatifs ». Keep these strings out of `messages/*`: there is a parity test (`lib/i18n-catalogs.test.ts`).
- **`components/sections/Footer.tsx`:**
  - Add a conditional group inside the existing Resources column: the `footerTitle` label, then the links, styled like the column's other links.
  - Render it only when the list is non-empty. Use `MarketLink market={market}` for each link, so `/us/vs/x` stays unprefixed and `/comparatif/x` goes through next-intl.
  - No fifth column. Don't touch `buildSeoLinks` or the Header.
- **Tests:**
  - helper: published only; US vs FR; empty for en-int, es, pl, uk; labels per market.
  - The footer renders nothing new while every real page is a draft (today).

## Rules

- A dev server runs on port 3001 for this worktree: never stop it or any process. Don't run `bun run build`.
- `bun test lib scripts`, `bun run type-check` and `bun run lint` (0 errors) must pass. If a failure comes only from the writers' in-progress MDX, say so and don't fix their files.
- Stage by explicit path; small commits (`test(STA-534): …` / `feat(STA-534): …` / `refactor(STA-534): …`); **no Co-Authored-By trailer**.
- Report: commits, the final EN and FR strings, test results.
