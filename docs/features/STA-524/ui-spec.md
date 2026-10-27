# UI spec: help center (STA-524)

MODE: DESIGN (UI only)   DOMAIN: showcase   DATE: 2026-10-28

What this covers: how the help center looks and reads, from a benchmark of 7 help centers. Placement, routes, consent and content rules stay as decided in `plan.md` and `ux-brief.md`. Changes to those decisions are listed in §7.

Screenshots (390x844 at 2x and 1280x900, `*-full.png` for full pages, `sheets/` for side-by-side contact sheets):
`/private/tmp/claude-501/-Users-harryviennot-LocalDocuments-fidelity/c6687389-dbf2-4aaa-a0f7-614692350f37/scratchpad/sta524-ui-benchmark/`
Our own pages come from Harry's checkout on `localhost:3001` (`stampeo-*`). Shopify served the headless browser a Cloudflare challenge, so it was skipped, not worked around.

## 1. Benchmark

| Site | Copy | Leave out | Shots |
|---|---|---|---|
| **Square**, the closest reader (shop owner, staff, phone) | Slim help header and footer. "Who is this article for?" box. "In this article" folded on phone. The two paths as accordions. Topic page as grouped rows. | "Sign in for expedited support" above the topics. Autocomplete that suggests phrases instead of pages. The chat launcher sitting on the text. | `square-*` |
| **Stripe** | Results replace the list under the field as you type. Numbered step circles. No results: query echoed, popular topics, Contact support. | Link-blue everywhere. "Helped 93%" (we have no data). Paginated topics. | `stripe-*` |
| **Calendly** | "Available to: Owners and Admins · Plans: …" under the title. Phone search as a full-height sheet whose empty state is popular pages. Rows: title, one-line snippet, highlighted match. Slim footer with Cookie Settings. | Promo banner. A bottom tab bar that costs 64px on every screen. A video hero inside articles. 36px H2s. Fuzzy false positives ("qzxwvk" finds "Glossary"). | `calendly-*` |
| **Notion** | A question as the title, search as the hero. Popular-search chips. | Illustrated topic cards (the category page runs 6,300px on a phone). Sidebar tree. 14px body text. | `notion-*` |
| **Loopy Loyalty** (competitor) | A collection page as one surface of rows: title, description, chevron. | An Intercom greeting covering ~40% of the phone screen on every page, search included. Author avatars and counts. Purple full-bleed header. A dead-end no-result. | `loopy-*` |
| **Smile.io** (loyalty, Mintlify) | Plan availability as an inline callout. Results with the category and a highlighted match. | Tree + article + TOC in three columns at 1280. Blank no-result. | `smile-*` |
| **Mailchimp** | Nothing. It's the cautionary example. | Hero illustration pushes search to y≈790 on a phone. Search jumped to French results. 18,000px article. | `mailchimp-*` |

Each `<site>-*` set has `home`, `category` (not Smile), `article`, `search`, `search-empty`, `search-noresult`, each at `-390` and `-1280`. Best overviews: `sheets/homefull-A.png`, `homefull-B.png`, `articlefull-A.png`, `category-390-full.png`, `search-390-A.png`, `search-390-B.png`, `noresult-390.png`, `noresult-390-B.png`, `article-1280-A.png`, `article-1280-B.png`, `search-1280.png`.

**Measured article type** (computed styles):

| | H1 phone / desktop | H2 phone / desktop | Body |
|---|---|---|---|
| Square | 32 / 48 | 25 / 25 | 16, near-black |
| Calendly | 28 / 50 | 24 / 36 | 14 / 18 |
| Smile | 30 / 36 | 24 / 24 | – |
| **Stampeo now** | **34 / 52** | **18 / 19** | 16 / 18, cool grey `#364153` |

The others' H1-to-H2 ratio on desktop runs from 1.4 to 1.9. Ours is 2.7, and on a phone our section heading is only 2px bigger than the body text.

## 2. Patterns we adopt

1. **Search is the hero** (Square, Notion, Calendly): an `h-14` field under the title, above the fold at 390px.
2. **One list language for every set of pages** (Loopy, Calendly, Square): a paper surface, divider rows, title plus an optional description, a caret. Related, Popular, topic pages and search results all use it, so it's learned once.
3. **A labelled who-and-plan line** (Calendly, Square). Today an owner sees an "Owner" pill and has to guess what it means.
4. **"On this page" on the right, folded on phones for long pages** (Square, Calendly, Smile, Loopy). Empty space on the right reads as margin; on the left it reads as missing navigation.
5. **Phone search is a full-height sheet:** popular pages when it's empty, then rows of title, snippet and highlighted match (Calendly, Smile).
6. **No results: the query echoed, a suggestion, then a person** (Stripe). None of the seven offers WhatsApp. For an owner on a phone, that's the fastest way to a person.
7. **A slim footer under help** (Square, Stripe, Calendly, Loopy), carrying the cookie control (Calendly).
8. **Topic page:** title, one-line intro, every page as a row, a back link (Loopy, Square). Other topics show as chips on a phone (Notion).
9. **Troubleshooting as a divided FAQ list**, not stacked boxes (Square, Stripe).
10. **Numbered step circles on share pages** (Stripe). The reader there has never seen the app, and is often reading it on paper.

Still rejected, now with evidence: the chat bubble (it covers the content on Loopy, Square and Smile), a nav tree, a bottom tab bar, Cmd+K, and "Was this helpful?" in v1.

## 3. The article page: critique and fixes

Shots: `stampeo-article-{roles,set-your-time-zone,manage-a-team-member}-{390,1280}.png`.

| # | Problem | Fix (tokens and classes) | File |
|---|---|---|---|
| A | **Section headings are too small.** `##` is `text-h3` (18 to 19px) under a 52px H1, so on a phone it reads as bold body text. | Drop the size and margin classes from `SECTION`; `.help-prose h2` owns them, as `.legal-prose h2` does: `font-size: clamp(1.375rem, 1.2654rem + 0.4494vw, 1.625rem)` (22px @390 → 26px @1280), `font-weight:700; line-height:1.25; letter-spacing:-0.01em; margin:2.5rem 0 0.5rem`. **The H1 stays `text-h1`:** it's the site's page-title token (blog, legal), and Square and Calendly sit at 48 to 50px. | `mdx/index.tsx`, `globals.css` |
| B | **Links fail contrast.** Accent on `--blog-bg` is **2.51:1**. Body text is a cool `#364153` on warm paper. | `.help-prose { --tw-prose-body: var(--near-black); --tw-prose-bold: var(--near-black); }`. Links: `color: var(--near-black); font-weight:500; text-decoration-color: var(--accent); text-decoration-thickness:2px; text-underline-offset:3px`, hover `var(--accent-hover)`. That's 16.5:1, and the brand stays in the underline. The existing selector already outranks `.blog-prose a`. | `globals.css` |
| C | **Lines run 78 to 80 characters** (a 44rem column at 18px). | A 42rem track, about 72 characters (see F). | `HelpLayout.tsx` |
| D | **Badges have no visible label**, and the plan pill is **3.04:1** (`--accent-hover` on `--accent-light`). | One line: `p.mt-3.flex.flex-wrap.items-center.gap-x-3.gap-y-2.text-sm.text-[var(--near-black)]`. Show `badges.rolesLead` visibly (it's already in the catalog), with the roles in `font-semibold`. Plan pill: `h-7 rounded-full bg-[var(--accent-light)] px-3 font-semibold text-[var(--near-black)] ring-1 ring-inset ring-[var(--accent)]/25`, after the visible `badges.planLead`. No new strings. | `HelpBadges.tsx` |
| E | **Breadcrumb:** muted 14px is **4.33:1** on `--blog-bg`, and the category isn't a link. | Links `font-medium text-[var(--near-black)] hover:underline underline-offset-4`, separators stay muted. Category links to `/help/topics/<slug>`. Search pill at the end of the row: `ml-auto inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold`, `MagnifyingGlassIcon h-4 w-4`, label visible. | `HelpBreadcrumb.tsx` |
| F | **The desktop aside sits empty:** 256px on the left, blank on pages with fewer than 3 sections. When it isn't empty, the title starts 304px right of the breadcrumb. | `lg:grid lg:grid-cols-[minmax(0,42rem)_15rem] lg:gap-x-16`. Breadcrumb row `lg:col-span-2`, article column first, then `aside` holding `TableOfContents selector="h2"`, which is already sticky. The rail track stays when there's no TOC, so the column never moves. Breadcrumb, title and body share the logo's edge. Blog and legal keep their left TOC. | `HelpLayout.tsx` |
| G | **Spacing is ad hoc.** | An 8/24/40/56 rhythm: title→meta `mt-3`, meta→lead `mt-6`, `h2` 2.5rem above and 0.5rem below, blocks `my-6`, OpenInDashboard `my-8`. End of article: `mt-14 border-t border-[var(--border)] pt-10` before Related (as Square and Stripe mark it), StillStuck `mt-10`, `main pb-16`. | `HelpLayout.tsx`, `mdx/*` |
| H | **Screenshot frames are right.** The migrated desktop captures are unreadable at 358px. | No frame change. Recapture at phone size per `screenshots.md`. | content |
| I | **Plain Markdown quotes get double padding** (time-zone page). | `.help-prose blockquote > :first-child{margin-top:0}` and `> :last-child{margin-bottom:0}`. Drop `text-[0.95em]` from `Callout`. | `globals.css`, `Callout.tsx` |
| J | **Troubleshooting is a wall of up to five boxed cards**, each costing 32px of line on a phone. | `Symptom` → `className="help-symptom my-6"`, title `text-lg! font-semibold!`, no box. `.help-prose .help-symptom + .help-symptom { border-top:1px solid var(--border); padding-top:1.5rem }`. Ids and the `:target` flash stay. | `Symptom.tsx`, `globals.css` |
| K | **Related is good.** | Rebuild it on `HelpPageList` (§4). | `RelatedPages.tsx` |
| L | **"Still stuck?" is 300px tall on a phone**, and still stacked on desktop. | Tiles `h-10 w-10`. From `sm`: `sm:grid sm:grid-cols-3 sm:gap-4 sm:divide-y-0`. Optional `channels` prop (default all three) for search's no-result state (AC14). | `StillStuck.tsx` |
| M | **The footer is 1,157px on a phone**, 34% of the Roles page: a black slab with a newsletter form under a task page. | `HelpFooter` (§4.5), if Harry agrees (§7). | new |

## 4. Stage 3 surfaces

**Shared:** `components/help/HelpPageList.tsx`: `ul.divide-y.divide-[var(--border)].overflow-hidden.rounded-2xl.border.border-[var(--border)].bg-[var(--paper)]`. Each row is `a.flex.min-h-12.items-center.gap-3.px-4.py-3 hover:bg-[var(--paper-hover)]`, holding an optional eyebrow (`text-xs font-medium text-[var(--muted-foreground)]`), a title (`font-medium`, or `font-semibold` with a description), an optional description (`text-sm text-[var(--muted-foreground)] line-clamp-2`) and `CaretRightIcon h-4 w-4`. Add `MagnifyingGlass` and `Export` (as `ShareIcon`) to `components/icons/index.tsx`. Every help page uses `bg-[var(--blog-bg)]`; the placeholder home uses `--background`, which is white. Fields and doors are `bg-white`, like `BlogCard`.

### 4.1 Help home

```
390                                    1280 (Container default)
Header (shared)                        Header
        pt-28                                    Help center   text-h1, centred
   Help center   text-h1 34, centred     [🔍 Search the help center…………]  real input,
        mt-6                              h-14 max-w-[40rem] mx-auto, focused on load;
(🔍 Search the help center      ) h-14    results panel only once typed
        mt-8                                              mt-12
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓      ┏door━━━━━┓ ┏door━━━━━┓ ┏door━━━━━┓  grid-cols-3 gap-4
┃[▣] Setting up my card       › ┃ ≥76                       mt-14
┃    one muted line             ┃      Popular   text-h3
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ gap-3┌list 1-4──────┐ ┌list 5-8──────┐  grid-cols-2 gap-6
┃[▣] Scanning at the counter    ┃                           mt-14
┃[▣] Helping my customers       ┃      Browse by topic   text-h3
        mt-10                          ┌card────┐ ┌card────┐ ┌card────┐  grid-cols-3 gap-6
Popular   text-h3                      title text-h3, desc text-sm, 3-4 links min-h-11,
┌─────────────────────────────┐        "See all N" + ArrowRightIcon
│ Add stamps to a card      › │ 48                        mt-14
│ … 6 to 8 rows               │        Still stuck? (3 columns) · HelpFooter
└─────────────────────────────┘
Browse by topic   text-h3
┌─────────────────────────────┐
│ Your team                 › │ ≥64, title + 1 line
└─────────────────────────────┘
Still stuck? · HelpFooter
```

- Phone search trigger: a button styled as a field: `flex h-14 w-full items-center gap-3 rounded-full border border-[var(--border)] bg-white px-5 text-left text-base text-[var(--muted-foreground)] shadow-sm`, `MagnifyingGlassIcon h-5 w-5`. It opens the dialog (§4.3).
- Doors: `a.blog-card-3d.flex.items-center.gap-4.rounded-2xl.bg-white.p-4`. Tile `h-11 w-11 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]`, with `WalletIcon` (my card), `QRCodeIcon` (counter), `PaperPlaneIcon` (customers: pages you send). Title `text-h3`, line `text-sm` muted. These are the only 3D cards in help.
- Desktop topic cards: `rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-6`, no hover lift. A topic shows only once it has at least 3 live pages.

### 4.2 Topic page `/help/topics/<category>`

```
390                                     1280: the article grid
‹ Help center           [🔍 Search]     ‹ Help center …………………………………… [🔍 Search]
Your team   text-h1                     ┌ 42rem: title, lead, list ┐ ┌ 15rem rail: ─┐
Adding people, roles… text-lead         │                          │ │ Other topics │
┌──────────────────────────────┐ mt-6   └──────────────────────────┘ └ sticky rows ─┘
│ Add a team member          › │ ≥64
│ Add the people who work…     │
└──────────────────────────────┘
Other topics  text-h3   (lg:hidden)
(Get started) (Scanning at the counter) …
Still stuck? · HelpFooter
```

- Back link: `inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--near-black)]` with `CaretLeftIcon`.
- Chips: `inline-flex h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-medium`, in `flex flex-wrap gap-2`. About 200px for eight topics, where rows would take about 380px.

### 4.3 Search

```
Phone: native <dialog>, h-dvh w-full max-w-none m-0, bg-[var(--blog-bg)]
┌──────────────────────────────────────┐
│ 🔍 [team                      ]  [✕] │ h-16 px-4 bg-white border-b; input text-base; ✕ h-11 w-11
├──────────────────────────────────────┤
│ empty:   "Popular" + top tasks       │ HelpPageList, titles only
│ typing:  Your team        (eyebrow)  │ row min-h-14, at most 8 results
│          Add a [team] member         │ match in <mark>
│          Add the people who…         │ description line-clamp-1
│ nothing: No page matches "qzxwvk".   │ query in font-semibold
│          Try another word, like "team"│ text-sm muted
│          StillStuck channels=[email, whatsapp]
└──────────────────────────────────────┘
```

- Highlight: `<mark class="rounded-sm bg-[var(--highlight-yellow)] text-inherit">`, the blog's own token. Keyboard-active row: `bg-[var(--paper-hover)]`. Reuse the dialog pattern from `ConsentPreferences.tsx`, `lib/dom/body-scroll-lock.ts` and `TAP_TARGET` (`lib/privacy/choices-ui.ts`).
- **Desktop home:** a real input. Results go in `absolute inset-x-0 top-full mt-2 max-h-[min(28rem,60vh)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-2 shadow-lg`, **opening on typing only**. The field is focused on load, so opening on focus would cover the doors. Esc clears.
- **Desktop article and topic pages:** the pill opens the same dialog as a top-anchored panel: `lg:mx-auto lg:mt-[12vh] lg:h-auto lg:max-h-[70vh] lg:w-[40rem] lg:rounded-2xl lg:border lg:shadow-xl`, `backdrop:bg-[var(--near-black)]/40`. One `HelpSearchResults` component serves all three.

### 4.4 Share page

```
┌──────────────────────────────────────┐  print: bar and footer hidden, white,
│ ✱ Stampeo                 [⇪ Share]  │  shots 50mm, li break-inside: avoid
├──────────────────────────────────────┤
│ Container narrow · pt-8 pb-12        │
│ Add the loyalty card to your phone   │ text-h1, then the lead
│ (1) Scan the QR code at the counter. │ step circle 28px
│        [ phone shot ≤260px ]         │
│ (2) …  3 to 5 steps                  │
│ ▌Ask at the shop if …                │ Callout note
├──────────────────────────────────────┤
│     Privacy  ·  Cookie preferences   │ slim footer, both ≥44px
└──────────────────────────────────────┘
```

- Bar: `sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--blog-bg)]/95 backdrop-blur`. Inside, a `Container` with `flex h-14 items-center justify-between`. Left: `StampeoLogo` (a fixed 32px mark) plus the wordmark `text-lg font-bold tracking-tight`, as the Footer composes it, **not linked**, because the reader is a shop's customer. Right: Share, `inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold` with `ShareIcon`. After a copy it shows `CheckIcon` and "Link copied" for 2s in an `aria-live="polite"` span.
- Steps: `.help-share ol { counter-reset: step; list-style: none; padding-left: 0 }`. Each `li` gets `position:relative; padding-left:2.5rem`, and `li::before` draws a 1.75rem circle on `var(--accent-light)`, `var(--near-black)`, weight 600, `.875rem`. Shots `max-w-[260px]`.
- **Slim footer (hard requirement):** `footer.border-t.border-[var(--border)].py-6` with a centred `flex flex-wrap justify-center gap-x-6 text-sm` row. A plain `<a href="/en/privacy">` (`-my-3 py-3 text-[var(--muted-foreground)] hover:text-[var(--near-black)]`) and `<CookiePreferencesButton tone="page" />`, which already brings its 44px padding and the US label.

### 4.5 `HelpFooter` (every help page, if approved)

The share footer plus one row: the linked logo, Help center, Contact, Terms, `©`. Same classes, on `--blog-bg`. About 140px on a phone, where the current footer is 1,157px. It includes `CookiePreferencesButton`, so the consent test still passes.

## 5. Brand check: Stampeo, but quieter than marketing

- **Orange marks what you can act on, never large areas.** One orange button per article (`OpenInDashboard`), 10%-tint icon tiles, list markers and step circles, the active TOC item, focus rings, link underlines, the warning callout rule. Never heading colour, link text (it fails contrast) or section backgrounds.
- **Warm paper:** `--blog-bg` page, `--paper` surfaces, `--border` rules, white only for fields and the doors. No dark sections.
- **Type:** the showcase loads **Geist only**. Plus Jakarta is the dashboard's heading font; here it's an unloaded fallback name in the `body` stack. Help uses the showcase ladder: `text-h1` titles, `text-h3` for chrome titles (Related, Still stuck, Popular), the scoped `.help-prose h2`, `text-base` body (18px from `lg` via `prose-lg`). Never `text-display` or `text-hero`.
- **Icons:** Phosphor through `components/icons`, regular weight; `bold` only inside buttons.
- **Quieter:** no `ScrollReveal`, no ink doodles or annotations, no illustrations, no hover lifts except the doors, no CTA inside content (a guide gets one, at its end). The shared Header's "Get started" pill is the only sales element on the page.

## 6. Ranked changes

**Must have before launch**

| # | Change | Effort |
|---|---|---|
| 1 | Share layout: bar, Share, step circles, print, slim footer with the cookie control (AC15) | M |
| 2 | Home: search hero, doors, Popular, topics, Still stuck (AC8) | M |
| 3 | Search: phone dialog, desktop inline and top panels, one results list, empty and no-result (AC9, AC14) | L |
| 4 | `.help-prose h2` at 22→26px (A) | S |
| 5 | Near-black body, near-black links with an accent underline (B) | S |
| 6 | Labelled who-and-plan line, readable plan pill (D) | S |
| 7 | Article grid: 42rem column, right TOC rail, breadcrumb row with Search (C, E, F) | S |
| 8 | Topic pages on the article grid; chips on phone, rail on desktop | S |
| 9 | `HelpPageList`, shared by Related, Popular, topics and search | S |
| 10 | Symptoms as divided entries, quote margins, spacing rhythm (G, I, J) | S |

**Nice to have**

| # | Change | Effort |
|---|---|---|
| 11 | `HelpFooter` on every help page (M) | S after #1 |
| 12 | Folded phone "On this page" (native `<details>`) on concept, reference and guide pages with 3+ sections. `understanding-your-analytics` runs 12,000px on a phone | S |
| 13 | "Still stuck?" in 3 columns from `sm`, 40px tiles (L) | S |
| 14 | Step circles on how-to procedures too | S |
| 15 | `--muted-foreground` on `--blog-bg` is 4.33:1. It's a site-wide token, so Harry decides | S, every page |

## 7. Decisions changed

1. **The TOC moves to a right rail, in help only** (was a left `aside w-64`), because of the blank left column and the misaligned title.
2. **Topic pages use the article grid**, not `Container narrow`, so the column stays put between a topic and its pages.
3. **`HelpFooter` replaces the full `Footer` on help pages.** Recommended, but Harry's call: once help is indexed, the full footer's `/features` links matter for search. The Header still carries them.
4. **AC17 widens** to a folded phone TOC for concept, reference and guide pages. The first brief planned one for guides and references; AC17 dropped it.
5. **Badges become a labelled line.** AC11 still holds.
6. **The desktop home results panel opens on typing**, not on focus.

## 8. For stampeo-copywriting

New strings: search placeholder, "Popular", "Browse by topic", "Other topics", "See all {count}", "Help center" (back link), the no-result lines, "Share" and "Link copied", door titles and their lines, and the home H1 ("Help center", or a question like Square's and Notion's). The same phone number appears as `06 49 37 04 70` in the Footer and `+33 6 49 37 04 70` in "Still stuck?" on the same page.
