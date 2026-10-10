# STA-358 — Indexing metadata and legacy redirects

## Why

Two problems the STA-355 crawl surfaced that are about what pages SAY, not where
links point.

**The canonical leak.** `app/[locale]/layout.tsx:84` sets `alternates.canonical`
and `alternates.languages` on the locale LAYOUT. Next merges metadata down the
segment chain, so every page that does not define its own `alternates` inherits
`canonical → the locale homepage` plus the country-pilot hreflang cluster. Today
that is `/login`, `/reset-password`, `/email-preferences`,
`/demo/wallet-select/[token]`, `/onboarding`, both founding-partner routes for
their non-owning locale, the loyalty siblings for non-canonical locales,
`/pl/blog*`, and **every merchant enrollment page**. A café's QR landing page
currently tells Google it is the Stampeo homepage.

It also means every blog post advertises `en-US → /us`, because
`blog/[slug]/page.tsx` sets `canonical` but no `languages` and inherits
`PILOT_HREFLANG`.

**Legacy 404s.** Search Console reports 24 distinct 404s; 12 have a real
destination and none currently redirects. `next.config.ts` has no `redirects()`
at all.

## Verified before planning

`showcase/AGENTS.md` warns this Next diverges from training data, so the two
load-bearing assumptions were checked in `node_modules/next/dist/docs/` rather
than assumed:

1. **`redirects` runs before Proxy.** The documented order is `headers` (1),
   `redirects` from `next.config` (2), **Proxy** (3), `beforeFiles` (4),
   filesystem (5). So a config redirect fires before next-intl's locale
   negotiation and produces one clean hop. The design depends on this.
2. **`middleware.ts` is deprecated in Next 16**, renamed `proxy.ts`. This repo
   still uses the old name. **In scope** (section 6): this issue already rewires
   the routing pipeline and reasons in terms of "Proxy", so leaving the file
   called `middleware.ts` would ship an incoherent codebase.

## Acceptance criteria

**AC1 — No page inherits a canonical it did not declare.**
Given any route that does not set `alternates.canonical`, when its HTML is
rendered, then it emits no canonical at all, and never one pointing at the
locale homepage.

**AC2 — Private routes are noindex.**
Given `/login`, `/reset-password`, `/email-preferences`, `/onboarding` or
`/demo/wallet-select/{token}` in any locale, when the page is rendered, then it
emits `noindex, nofollow` and no canonical pointing elsewhere.

**AC3 — Merchant enrollment pages are noindex, follow, self-canonical.**
Given `/{businessSlug}` or `/{businessSlug}/l/{location}`, when rendered, then
it emits `robots: noindex, follow` and a canonical to its own URL.

**AC4 — Every supplied legacy URL redirects once, permanently.**
Given any of the 21 legacy paths, when requested, then the response is a single
308 to the stated destination, and that destination returns 200 with no further
hop.

**AC5 — Derived legacy blog redirects work in both directions.**
Given `/blog/{en-or-es-slug}` (locale-less), when requested, then it 308s to the
prefixed URL. Given `/en/blog/{fr-slug}` or `/es/blog/{fr-slug}`, then it 308s to
the unprefixed French URL. Today the first case is a hard 404: Googlebot sends no
usable `Accept-Language`, next-intl resolves `fr`, rewrites to
`/fr/blog/{en-slug}`, finds no French post, and 404s.

**AC6 — Junk stays 404.**
Given `/month`, `/mo`, `/mois`, `/mes`, or an obsolete fingerprinted `.woff2`,
when requested, then the response is 404 and the path appears in no redirect rule.

**AC7 — The founding routes resolve in one permanent hop.**
Given `/programme-fondateur`, `/founding-partner`, `/en/programme-fondateur` or
`/en/founding-partner`, when requested, then the response is a single 308 to that
locale's `/pricing`. Today `/founding-partner` takes three hops, two of them
temporary.

**AC8 — Private routes never enter the sitemap.**
Given the generated sitemap, when each URL is checked, then none is a private
segment, none is a redirect source, and each is self-canonical and indexable.

**AC9 — The routing entry point uses the current file convention.**
Given the repo, when the routing pipeline is inspected, then it is `proxy.ts`
exporting `proxy`, no `middleware.ts` remains, and every behaviour the old file
had still holds: the www 301, the `/us` + `/uk` pilot rewrites with the market
cookie, `text/markdown` negotiation, and the acquisition-slug rewrite.

## Approach

### 1. Move `alternates` off the layout
Out of `app/[locale]/layout.tsx:83-93`, into `app/[locale]/page.tsx`, where the
homepage canonical and `PILOT_HREFLANG` belong. One change, and AC1 falls out.
Regression risk is the pages that already set their own `alternates` — pricing,
about, privacy, terms, contact, changelog, blog index, blog post, features, the
four loyalty siblings, us/uk, both founding routes. AC8's self-canonical
assertion is what catches one silently losing its canonical.

### 2. `noindex` on private routes
Reuse `PRIVATE_SEGMENTS` from `lib/consent-routes.ts` — already pinned to the
real route tree in both directions by `consent-routes.test.ts`, so a new private
page cannot skip this. Add `lib/page-robots.ts` with one `NOINDEX` constant;
copy the shape at `app/[locale]/onboarding/layout.tsx:12`. `login`,
`reset-password` and `demo/wallet-select/[token]` are client components and need
a sibling `layout.tsx`; `email-preferences` takes `generateMetadata` directly.

### 3. Merchant pages
`buildAcquisitionMetadata` in `components/acquisition/AcquisitionPageView.tsx:17`
gains `robots: { index: false, follow: true }` and a self-canonical. robots.txt
cannot help here by design — see the `/auth` vs `authentic-cafe` note in
`lib/robots.ts`.

### 4. The redirect table
New `lib/legacy-redirects.ts`, consumed by a `redirects()` in `next.config.ts`,
all `permanent: true`. Explicit entries for the 21 supplied paths; derived rules
for the mechanical cases so the table self-maintains as posts are added. The
derived rules must assert FR/EN/ES slug sets are disjoint, so a future French
post named `digital-stamp-card` cannot be hijacked by an English rule.

`next.config.ts` will import a module that reads `content/blog` from disk. Config
runs in Node at build time, so this is fine, but it must not be pulled into the
Proxy bundle — verified by the build, not by a unit test.

### 5. Founding routes
Add the four paths to the table so they resolve in one hop, AND fix the in-page
fallback so both agree: test `!isFoundingProgramOpen()` first, and use
`permanentRedirect(localePath(locale, "/pricing"))`. The hardcoded
`/${locale}/pricing` is what produced the extra `/fr/pricing → /pricing` hop.

Do not delete the route folders: `consent-routes.test.ts` asserts every
`MARKETING_SEGMENTS` name still exists as a folder.

### 6. Rename `middleware.ts` to `proxy.ts`
Deprecated in Next 16. Two mechanical changes: the filename, and
`export default async function middleware` -> `proxy`.

**By hand, not with the codemod.** The published codemod is
`npx @next/codemod@canary middleware-to-proxy .` — `canary` is a moving target,
and running an unpinned canary transform across the repo to save a two-line edit
is a worse trade than doing it deliberately. The matcher config is untouched.

`next-intl/middleware` and `createMiddleware` stay exactly as they are: those are
next-intl's API, not the Next file convention, and renaming them would break the
import.

Roughly fifteen files mention "middleware" in comments and prose (including
`lib/consent-routes.ts`, `lib/markets.ts`, `lib/internal-links.ts` and
`lib/seo-links.ts`). Those get updated too — a comment pointing at a file that no
longer exists is how the next person loses an hour.

This lands as its own commit, before the redirect table, so that if the rename
regresses anything the bisect is one file wide.

## Tests, written first

- `lib/legacy-redirects.test.ts` — AC4, AC5, AC6. Destinations are real routes;
  no source is also a destination (no chains); no rule shadows a live URL; the
  keep-as-404 list is absent; slug sets disjoint.
- `lib/sitemap.test.ts` — AC8. The first test `app/sitemap.ts` has ever had.
- `lib/page-robots.test.ts` — AC2, AC3.
- AC9 has no new unit test: the existing `lib/locale-negotiation.test.ts`,
  `lib/market-paths.test.ts`, `lib/markets.test.ts` and `lib/business-locale.test.ts`
  already cover the logic the file delegates to, and the rename does not touch
  it. What the rename CAN break is whether Next picks the file up at all, which
  no unit test can see — so it is verified by `curl` on a built server: a www
  redirect, `/us/pricing`, and a business slug.

Two things unit tests cannot prove, so they are runbook cases against a built
server, not assertions: that `redirects` actually fires before Proxy (a unit test
cannot see the pipeline), and AC1/AC2/AC3, which are about rendered HTML.

## Risks

- **The whole redirect table rests on order step 2 before step 3.** Documented
  and quoted above, but prove it with `curl` on a built server before believing
  the table works.
- **Moving `alternates` touches every page's metadata.** The sitemap
  self-canonical assertion is the guard.
- **21 explicit redirects is a hand-copied list.** Every destination gets
  asserted to be a real route, so a typo fails the suite rather than shipping.
- **A silently-unregistered `proxy.ts` fails open, not loud.** If Next does not
  pick the file up, every request simply skips it: no error, no failing unit
  test, and pilot URLs and QR enrollment pages quietly break. This is the one
  change in the issue that must be verified against a built server before it is
  believed.
