# Plan: Help center at stampeo.app/help

ISSUE: STA-524 (https://linear.app/stampeo/issue/STA-524)
BRANCH: `feat/sta-524-help-center` (showcase, from `dev`)
REPOS: showcase (route, content, components, tests). The help-docs skill lives in the workspace's `.claude/skills/stampeo-help-docs/` (not a repo). web and scanner-app: in-app links are designed here and shipped with launch, not in this branch.
MIGRATION: no
STATUS: APPROVED (2026-10-27, by Harry, with three amendments: GA4 + PostHog only on /help, guides product-led, in-app link budget)

## Problem

Help pages for owners, admins and scanners exist as MDX (16 pages across `dev`, `feat/sta-189-locations-page` and HEAD) but nothing serves them, the skill that writes them targets a `/docs/<category>/<slug>` scheme we've dropped, and two pages are 1,800 to 2,350 words long and answer seven to twelve questions each. We want a help center at `stampeo.app/help` that customers can reach from the screen they're stuck on, that we can build in the open without it being indexed, and that can later bring in new customers through search.

## Decisions

- **Subfolder, not subdomain**: authority stays on stampeo.app; a subdomain doesn't give a second ranking slot (Google treats it as the same site for result diversity).
- **English at `/help`**: the default locale is French and unprefixed, so `/help` is rewritten to the `en` locale like `/us` is; `/en|es|pl/help/*` redirect to `/help/*`. Future translations get their own slugs (`/aide`, `/es/ayuda`, `/pl/pomoc`).
- **Flat URLs `/help/<slug>`**: categories are nav only, so moving a page never breaks a link. Slugs are permanent once an app links to them.
- **Noindex through one switch**: `HELP_INDEXABLE = false` in `lib/help/config.ts` drives the robots meta and an `X-Robots-Tag` header. No `/help` in sitemap, llms.txt or IndexNow. Never disallowed in robots.txt (it would hide the noindex).
- **In-app links ship at launch, not before**: linking the live dashboard to `/help` would publish the help center to every customer. This branch designs the registry and the page-to-screen map (the inventory's "Linked from" column).
- **Content folder `content/help/en/<category>/<slug>.mdx`, images `public/help/<slug>-NN.png`**: moved from `content/docs` and `public/docs`.
- **Search is client-side**: a static index built from frontmatter and headings, no service. Library choice in implementation (MiniSearch is the default: small, prefix and fuzzy matching, field boosts).
- **Consent: `/help` runs GA4 and PostHog, never advertising** (Harry, 27 Oct). A third route class next to marketing and private: `ANALYTICS_ONLY_SEGMENTS = {"help"}` in `lib/consent-routes.ts`. GA4 loads there with the visitor's analytics consent and with ad features off (no Google signals, no ad personalization, `ad_storage` denied); the Meta pixel, Meta and Google Ads conversion events never fire. The banner is the site-wide one (consent is shared across pages); it shows on `/help` because a tag can run there.
- **In-app link budget** (Harry, 27 Oct): one help link per screen; a screen touching several pages links the topic page; error and blocked states may carry their own. The inventory's slot table is the budget. Topic slugs are permanent once linked.
- **Guides stay product-led**; generic strategy content stays on the blog.
- **`draft: true` pages 404 in production builds** and stay out of every listing, so pages for unmerged features (locations) can live on `dev`.
- **Long pages are split in this branch**: `add-a-team-member` into five pages, `understanding-your-analytics` into three, per the inventory.

## UX decisions

From `ux-brief.md` (ux-designer, MODE: DESIGN, verdict READY).

- PLACEMENT: `app/[locale]/help/page.tsx` (home), `help/topics/[category]/page.tsx`, `help/[slug]/page.tsx`, on the blog/`LegalPageLayout` skeleton (Header, `Container`, `--blog-bg`, `prose`), with a `.help-prose` modifier that reuses `.legal-prose`'s `scroll-margin-top` and `:target` flash so `#anchor` links land below the fixed header. `share` pages render from the same `[slug]` route through `ShareLayout`, chosen by `type`.
- ENTRY: before launch, none from the public site. At launch: a "Help center" row first in the dashboard `HelpMenu`, contextual links through `web/src/lib/help-links.ts` and one `HelpLink` component (`icon` variant in a section header, `inline` variant in an error box or under an empty state's action), and one "Help" link in the scanner lobby next to "How scanning works".
- ADDED: search dialog whose empty state shows the top tasks - removes a step. AC14.
- ADDED: Share button on `share` pages (Web Share, copy-link fallback) - removes a step for an owner on a phone. AC15.
- ADDED: `Symptom` titles carry their own ids - lets an app link land on one troubleshooting entry. AC16.
- DECIDED (stage 1 review): in-site links to help are plain anchors to `/help/...`, never the localized `Link` (it would render `/en/help` and cost a 308).
- DECIDED (stage 1 review): a help landing keeps the GA and source attribution carriers but never the ad carrier, so help-first sign-ups stay attributed in GA4.
- ADDED: `help` as an ANALYTICS-ONLY consent segment (Harry chose this over private and marketing) - prevents a mistake: shops' customers read the `share` pages, so no advertising tag may run there. AC12.
- REJECTED: "Was this helpful?" in v1 (noise at our traffic; log no-result searches instead), a nav tree or drawer, a results page or Cmd+K, a phone TOC on how-to and troubleshooting pages, a sticky "Open in dashboard" bar, phone bezels, captions or a lightbox on shots, category icons, a print button (the print stylesheet is enough), a help link on scanner error screens (staff are mid-queue).
- MOBILE: home = search field, three stacked doors, 6 to 8 top-task rows, compact category cards, "Still stuck?". Article = breadcrumb + Search pill, H1, badges, 16px body, full-width Open in dashboard, Related, "Still stuck?". Share = slim logo bar with Share, 3 to 5 steps, no site header or footer.
- REUSES: `Header`, `Footer`, `Container`, `TableOfContents` (new optional `selector` prop, help passes `"h2"`), blog `Heading`, `lib/blog/mdx-options.ts`, the native `<dialog>` pattern from `ConsentPreferences`, `ContactLink`, `CTAButton` class maps, `FAQList`'s native `details`. NEW: `components/help/mdx/{Details,Callout,Symptom,OpenInDashboard,Screenshot}` (blog equivalents crop images, carry French titles, or log signup-funnel events), `components/help/{HelpSearch,HelpBreadcrumb,StillStuck,ShareLayout}`.

## UI decisions from the benchmark (28 Oct)

`ui-spec.md` (7 help centers benchmarked at 390 and 1280) overrides parts of `ux-brief.md`: "On this page" in a right rail (help only), topic pages on the article grid, badges as one labelled line ("Who can do this"), near-black links with an orange underline in `.help-prose` (the orange-on-cream links measured 2.51:1), larger `##` headings, troubleshooting as a divided list, and a slim `HelpFooter` with the cookie-preferences control, privacy and a few site links on every help page instead of the full site footer (Harry can restore the full footer at launch if it matters for search). Must-haves and S-effort nice-to-haves are built in stage 3; L-effort nice-to-haves are listed in the stage 3 report.

## Non-goals

- Translating pages (English only).
- Lifting noindex (the `HELP_INDEXABLE` switch, which the Markdown exclusion, the seo-smoke entry and the tests pinning it at false all follow), sitemap entries, footer link, `/features/*` links, Search Console: the launch PR, a separate decision.
- Adding help links inside web or scanner-app (designed here, shipped at launch).
- Writing the P0 and P1 pages beyond migrating and splitting the existing ones: each writing wave runs through the skill after this branch merges.
- Fixing the product bugs found during research (listed in the hand-back, each to its own issue).
- Feedback widget and search analytics (designed here, decided at launch with consent rules).

## Edge cases considered

- A business with the slug `help` (or `aide`, `ayuda`, `pomoc`): today its enrollment page would answer at `/help`. Check dev and prod before merging; `help` joins `RESERVED_TOP_SEGMENTS`. The backend has no reserved-slug list at all (pre-existing, separate issue).
- `/fr/help` or `/help` requested with a French `NEXT_LOCALE` cookie: still English (no French help yet), no redirect loop.
- `Accept: text/markdown` on `/help/*`: the markdown variant also carries noindex (or `/help` is excluded from markdown eligibility).
- A page linking to a slug that doesn't exist: the build's content test fails.
- Two pages with the same slug in different categories: the loader throws at build.
- A `draft: true` page: served in development, 404 in production, absent from search, nav and listings.
- Old `/docs/...` links inside migrated pages: rewritten to `/help/<slug>`; a test forbids `/docs/` links in help content.
- The dead `/docs/scanner-app/install-the-scanner-app` link: becomes `/help/install-the-scanner-app`, a P0 page that doesn't exist yet. Until it does, the link test catches it, so the migrated page drops the link or the page ships first.
- Language switchers on help pages: hidden (no other language exists), like blog posts.

## Stages

1. **Routing and safety** (AC1 to AC4, AC7, AC12): proxy rewrite and redirects, reserved segment, the analytics-only consent class, `HELP_INDEXABLE`, `X-Robots-Tag`, the markdown leak, switchers hidden, internal-links and seo-smoke aware of `/help`, placeholder routes.
2. **Content engine and articles** (AC5, AC6, AC10 mechanical part, AC11, AC16, AC17): loader, frontmatter validation, MDX components, article layout, `help.json` chrome, and the 9 pages from `dev` moved to `content/help/en/` with new frontmatter and `/help/` links (no rewriting or splitting yet).
3. **Finding things** (AC8, AC9, AC14, AC15): help home, topic pages, search, share layout.
4. **Screenshots and splits** (AC13, AC10 splits): capture script, the two long pages split through the skill, the locations drafts once STA-189 merges.

**Verification (Harry, 28 Oct, for speed):** from the stage 1 fix pass on, each stage runs only the tests it touches plus type-check, and UI is checked by screenshots as we go. The full test suites, lint, build, served-build and seo-smoke checks, and ONE coverage + code-quality review of the whole branch run once at the end, replacing the per-stage reviews (stage 1 was reviewed on its own before this change).

## Acceptance criteria

- AC1: Given the showcase, when `/help` and `/help/<slug>` are requested, then English content renders with `lang="en"`, and the URL stays `/help/...`.
- AC2: Given `/en/help/x`, `/es/help/x`, `/pl/help/x` (and `/fr/help/x`), when requested, then they redirect (308) to `/help/x`.
- AC3: Given `HELP_INDEXABLE` is false, when any `/help` page renders, then its robots meta is `noindex` and the response has `X-Robots-Tag: noindex`, and NOT a canonical or `hreflang` alternates.
- AC4: Given `HELP_INDEXABLE` is false, then `buildSitemap()`, `buildLlmsTxt()` and the IndexNow list contain no `/help` URL, and robots.txt does NOT disallow `/help`.
- AC5: Given the help content, then every page has `title` (at most 65 characters), `description` (at most 155 characters), `type` (one of six), `audience`, `updated`; every slug is unique; every internal `/help/` link and every `related` slug resolves to an existing page; every image reference exists under `public/help/`; no content links to `/docs/`.
- AC6: Given a page with `draft: true`, when a production build renders `/help/<slug>`, then it 404s, and it is absent from the help home, category pages and the search index.
- AC7: Given `help` in `RESERVED_TOP_SEGMENTS`, when `/help` is requested, then it never resolves to a business enrollment page.
- AC8: Given the help home, then it shows search, the three "I'm…" doors, top tasks, categories and the contact block (exact layout per UX decisions).
- AC9: Given a search for a word only in a page's `keywords` (e.g. "employee"), then that page is in the results; given a query with no match, then the empty state offers the contact options.
- AC10: Given the migrated content, then the 9 pages from `dev` exist under `content/help/en/` with the new frontmatter, `add-a-team-member` and `understanding-your-analytics` are split per the inventory, and the 7 locations pages are `draft: true`.
- AC11: Given the help MDX components (`Details`, `Callout`, `Symptom`, `OpenInDashboard`, `Screenshot`) and the layout's badges, Related and "Still stuck?" blocks (from frontmatter `audience`, `plans`, `related`), then each renders at 390px without horizontal scroll, `Screenshot` keeps the image's aspect ratio, and `OpenInDashboard` links to `NEXT_PUBLIC_APP_URL` + path.
- AC12: Given `/help` and `/help/<slug>` (including `share` pages), then the route classifier says analytics may run and advertising may not: GA4 can load with analytics consent, with Google signals and ad personalization off; the Meta pixel and every Meta or Google Ads event do NOT fire, whatever the visitor consented to. The consent banner is the site-wide one (consent is shared across pages), shown on `/help` because a tag can run there. Every other path keeps its current classification (marketing and private tables unchanged), and the folder-pinning test covers `help`.
- AC14: Given the search dialog on a phone, when it opens with an empty query, then it shows the top tasks; when a query matches nothing, then it echoes the query and shows the email and WhatsApp rows.
- AC15: Given a `share` page, then it renders without the site header and the full footer, with a slim footer carrying the cookie-preferences control and the privacy link (the consent footer test requires the control wherever a cookie can be set), with a Share button that uses Web Share and falls back to copying the link, and a print stylesheet that hides the bar and keeps each step on one page.
- AC16: Given a `<Symptom title="…">`, then its heading has a stable id derived from the title, and `/help/<slug>#<id>` scrolls it into view below the header.
- AC17: Given an article with fewer than three `##` headings, then no "On this page" list renders; given three or more, then it renders in a right rail on desktop, and folded at the top on phones for concept, reference and guide pages only, and NOT with Symptom titles in it.
- AC13: Given the capture script `scripts/help-shots/`, when run with a local env file, then it signs in as a fixture account, overlays the English profile, and writes a named shot to `public/help/`, and NOT with any credential in the repo.

## File layout

- `lib/help/config.ts` (no fs): `HELP_INDEXABLE`, `HELP_LOCALES`, `helpRobots()`, modelled on `marketRobots()` in `lib/markets.ts`.
- `lib/help/index.ts`: loader (walks `content/help/en/*/`, `.mdx` only, so sidecars are skipped), `getHelpPage`, `getAllHelpPages`, `getCategories`, duplicate-slug and draft handling. `lib/content/frontmatter.ts`: the gray-matter/js-yaml options and reading time, extracted from `lib/blog/index.ts` instead of copied.
- `lib/help/mdx.ts`: `compileMDX` with `blogMdxOptions` and the help component map.
- `lib/help/search-index.ts`: builds the static index.
- `components/help/`: `HelpLayout` (badges, Related, "Still stuck?"), `HelpSearch`, and `mdx/` for the five components plus `a` and `img` overrides.
- `app/[locale]/help/page.tsx`, `app/[locale]/help/[slug]/page.tsx`, category route per UX decisions.
- `messages/{fr,en,es,pl}/help.json` for chrome strings (catalog parity test), imported in `i18n/request.ts`.
- Touches: `proxy.ts` (rewrite), `lib/seo/legacy-redirects.ts` (redirects), `lib/locale-negotiation.ts` (`RESERVED_TOP_SEGMENTS`), `lib/consent-routes.ts`, `lib/internal-links.ts`, `next.config.ts` (header), `lib/markdown/eligibility.ts`, both language switchers, `scripts/seo-smoke.ts`.
- `components/sections/Header.tsx` is 512 lines: not touched (no nav link before launch).
- `scripts/help-shots/`: the capture script, from the `promo-videos/tools/screens/dash_shot.cjs` pattern.

## Touched areas and risks

- `proxy.ts` ordering: the rewrite must come before `acquisitionSlug`, or `/help` resolves as a shop.
- Consent classification and the Footer requirement (tests enforce both).
- `internal-links.test.ts` assumptions about locale-prefixed paths.
- The `sitemap.test.ts` count formula stays as is (nothing added before launch).
- Content migration needs `dev`'s 9 pages and the STA-189 branch's 7: merge order matters.

## Docs impact (preliminary)

This issue is the help center itself. The skill and the inventory are its documentation; no other page changes.
