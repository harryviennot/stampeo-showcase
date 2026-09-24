# STA-355 — coverage audit

Fresh-context three-way comparison of the failure report, the diff, and the
tests. Run after the fix was green.

**Verdict: gaps found — all in the guard, none in the fix.** Every defect group
(A-E) is fixed on disk and every one has a test. Nothing the failure report
asked for was left undone, and no pre-existing test was weakened to accommodate
the change.

## Resolved in af87461

| # | Finding | Why it mattered | Resolution |
|---|---|---|---|
| 1 | The three walks could pass vacuously | `expect(broken).toEqual([])` is green when the extractor returns nothing. Renaming `CallToAction`, moving `content/blog/`, adding a locale without listing it, or changing the catalog key convention would leave the whole STA-355 class unguarded behind a green check. | Each walk records what it checked per locale and asserts every locale contributed, with a floor tied to the post count on disk. **Mutation-verified**: blinding the extractor now fails 2 tests. |
| 2 | The enrichment assertion was a tautology | `toContain("en")` passed on the fallback message, because it contains `content/blog/es/` and `content` contains `en`. Deleting the whole `elsewhere` computation left it green. | Asserts `"exists in: en"`, which only the enriched branch produces. **Mutation-verified**. |
| 4 | Routes that always redirect were accepted | `/programme-fondateur` and `/founding-partner` resolve but always send visitors to `/pricing`. That is group (E)'s defect class exactly: a valid URL that is still the wrong thing to link to. | New `always-redirects` verdict, with both segments named. |
| 6 | False alarms on correct links | `/go/app` and `/join/{code}` sit outside the `[locale]` tree and were reported `unknown-route`; `![alt](/x.png)` was read as a link. A guard that cries wolf gets switched off. | Non-locale segments resolve (and the prefixed form is flagged instead); image syntax is excluded. |
| 3 | Components unwalked | `Header.tsx` and `Footer.tsx` use both conventions in one file and build raw-anchor hrefs by concatenation, so no parser can read them. A regression there hits every page on the site. | Not fixable by a parser. Added as **IL-09** in `docs/qa/seo-internal-links.md`, checked against rendered HTML. Executed: clean on all four locales. |

## Accepted, and recorded in the guard's header comment

Written into `lib/internal-links.ts` so a green suite is not mistaken for a
clean site:

- **Path depth below the first segment.** `/pricing/plans` resolves here and
  404s in the app. Only the first segment is matched against the route tree.
- **Link shapes.** Only `<CallToAction href="…">` and markdown `[](/…)`. Not
  `href={expr}`, raw `<a>` in JSX, reference-style or relative markdown links.
  All latent: none exists in the repo today.
- **Catalog keys.** Only `link` and `href`. The allowlist is load-bearing — it
  is what keeps `"perMonth": "/mes"` in `pricing.json` out of the walk — so it
  cannot simply be widened.
- **Backend-authored copy.** Changelog bodies arrive from the API and cannot be
  checked from this repo at all.
- **Unwalked markdown surfaces.** `content/pages/` and `content/docs/` contain
  internal links but nothing in the repo reads either directory (dead copy).
  `legal/*.md` compiles through the same component map, so `a` is unoverridden
  there too; it has no internal links today, which means the first one added is
  unguarded.

## Declared drift beyond the report

The fix also rewrote four Spanish `linkLabel` strings and corrected two TODO
comments. Neither is in the failure report's enumeration; both are declared in
`docs-decision.md` and covered by IL-03 and IL-07.

No test pins label-to-destination coherence, and none can: IL-03's "a label
promising a sector guide its destination does not cover is a failure" stays a
human-only judgement.

## Open

**IL-06, the production build.** `next build` was not run (a dev server held
`.next`). The MDX edits are proven to compile under `next dev` — all 33 posts
requested, all 200 — but not under `output: "standalone"`. This is the one item
from the repo's post-feature rule that remains outstanding.
