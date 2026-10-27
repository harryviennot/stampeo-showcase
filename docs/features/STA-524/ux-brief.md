# UX Brief: STA-524
MODE: DESIGN   DOMAIN: showcase (+ entry points in web, scanner-app)
VERDICT: READY

## Already shipped
- Nothing renders help. There is no `/help` route, search, help component or help nav, and the footer's "Help Center" points to `/contact`.
- At this checkout: 7 unrouted pages in `content/docs/en/`, plus 15 PNGs in `public/docs/`. They use the old format (`/docs/<cat>/<slug>` links, `> **Note:**` blockquotes, images of any shape, including one 2340x165 strip). The renderer has to show those plain-Markdown fallbacks cleanly.
- `stampeo-help-docs/references/inventory.md` (the source for top tasks, categories and "Linked from") does not exist.
- web: `help-menu.tsx` exists (Contact us, Download apps, review, What's new); there is no `lib/help-links.ts`. scanner: `src/components/external-link.tsx` opens the in-app browser.

## Placement
- `app/[locale]/help/page.tsx`, `help/topics/[category]/page.tsx` and `help/[slug]/page.tsx` follow the blog/`LegalPageLayout` skeleton: Header, `Container`, `bg-[var(--blog-bg)]`, `prose blog-prose`. A new `.help-prose` modifier reuses `.legal-prose`'s `scroll-margin-top` and `:target` flash, so app links to `#anchor` land visibly below the fixed header.
- Categories live at `/help/topics/<category>`. Putting them as anchors on the home would make the phone home ~3,000px long. Apps link to slugs only, never to categories.
- `share` pages come from the same `[slug]` route through `ShareLayout`, chosen by `type`.

## Entry points
- **Dashboard `HelpMenu`:** first row "Help center" (`BookOpen`, plus a trailing `ArrowSquareOut` like "View changelog"), above Contact us. Opens in a new tab.
- **Contextual dashboard links:** go through `web/src/lib/help-links.ts` (key -> slug#anchor) and open in a new tab. One `HelpLink` component, two variants:
  - `icon`: a muted 16px `Question` glyph with the `InfoPopover` trigger's footprint but a 44px hit area. It goes in `SectionHeader`'s `badge` slot or after a `PageHeader` title. `?` leaves for a page, `i` explains in place, and a title never gets both.
  - `inline`: underlined text plus `ArrowSquareOut`, at the end of an `InfoBox` error or under an `EmptyState` `cta`. It never replaces the setup action.
- **Scanner lobby:** a "Help" link on the "How scanning works" row, separated by a middot, in the same 13px style. It opens `/help/scanner` through `ExternalLink`, with each link padded to 44px. It does not go in the banner: a third icon squeezes the shop name and sits next to Sign out.
- **Between help pages:** breadcrumb, Related and search. Nothing in the public nav or footer before launch.

## Proposed additions
- `help` in `PRIVATE_SEGMENTS` - JUSTIFICATION: prevents a mistake - shops' customers read the `share` pages, and they are exactly who `consent-routes.ts` protects. A slug can't tell share pages apart. It also keeps the consent banner off a phone that is mid-task. PostHog is cookieless and still records. **This contradicts plan AC12.** If help stays marketing, share pages keep the full Footer.
- An empty search shows the top tasks - JUSTIFICATION: removes a step.
- A "Share" button on share pages (Web Share, copy-link fallback) - JUSTIFICATION: removes a step - otherwise an owner on a phone copies the URL by hand.

## Rejected additions
- "Was this helpful?" in v1 - it serves us, not the reader, and Yes/No at today's traffic is noise. Log no-result queries instead. If it ships at launch: two h-10 pills above "Still stuck?", and "No" reveals the contact rows.
- Desktop nav tree or phone drawer - there are only two levels, and breadcrumb, category pages and search cover them.
- Search results page, Cmd+K - instant results cover ~75 pages, and a shortcut is invisible to 90% of readers.
- Phone TOC on how-to and troubleshooting pages - scrolling 350 words is faster. Guides and references get one.
- Sticky "Open in dashboard" bar - it costs reading space, and the button already follows the steps.
- `IPhone` bezel, captions or a lightbox on shots - crops have no fixed aspect, the step text carries the meaning, and pinch-zoom exists.
- Category icons, a print button, a plan badge linking to an unwritten plans page.
- Scanner help link on the stamp error `StatusScreen` - it deliberately sends staff back to the camera mid-queue. "Where do I get a code?" - `join.codeHelper` already answers it.

## Mobile shape
**Home (390):**
- Header, centred `text-h1`, and a full-width h-12 rounded-full search field that opens the search dialog.
- Three stacked `blog-card-3d` doors, about 72px each (icon tile, `text-h3`, one muted line):
  - Setting up my card: the setup category.
  - Scanning at the counter: `/help/scanner`.
  - Helping my customers: `for-your-customers`.
- 6 to 8 top-task rows (48px, dividers).
- Compact flat category cards (title, one line, "See all N"). The page links inside each card show from `md` up.
- "Still stuck?", then the Footer.

**Search (390):**
- A native `<dialog>` at `100dvh`, with the input pinned at the top and autofocused, and a 44px Close.
- Result rows are at least 56px: title, one-line description, category.
- No match: the query echoed, a suggestion to try another word, then the email and WhatsApp rows.

**Category (390):**
- "Help" breadcrumb with a Search pill (44px, label visible).
- `text-h1`, lead, then every page as a row (title, 2-line description).
- "Other topics" at the bottom is the category navigation on a phone.

**Article (390):**
- "Help › Category" with the Search pill. The current page is left out because the H1 follows.
- `text-h1`, then frontmatter badges (how-tos only).
- 16px `prose` body, intro as lead.
- Full-width `OpenInDashboard`.
- Related: 2 to 5 rows from `related`.
- "Still stuck?", then the Footer.

**Share (390):**
- No Header or Footer. A slim bar with the logo (not linked) and Share.
- Narrow `Container`, 3 to 5 steps, one phone shot each.
- In place of "Still stuck?": one line telling the reader to ask at the shop, because our support can't answer for a shop's card. Then a muted Privacy link.
- Print: bar hidden, black on white, shots about 50mm wide, `break-inside: avoid` on each step.

**Desktop:**
- Home: the search is a real input, focused on load, with a dropdown under it. Doors in 3 columns, top tasks in 2, categories in 3 with their links.
- Articles: `aside w-64` with `TableOfContents` (only when there are 3+ h2s). The column is capped at 65ch with `lg:prose-lg`, and the H1 and badges sit inside it.
- Search elsewhere opens the dialog as a top-anchored panel.

## Components to reuse
- `components/sections/Header.tsx`, `Footer.tsx` - all help pages except share.
- `components/ui/Container.tsx` - `default` for home and articles, `narrow` for category and share pages.
- `components/blog/TableOfContents.tsx` - new optional `selector` prop (default `"h2, h3"`). Help passes `"h2"`, so Symptom titles stay out of the TOC.
- `components/blog/mdx/Heading.tsx` with a `className` override (`##` -> `text-h3`), and `lib/blog/mdx-options.ts`.
- `components/ui/FAQList.tsx` - the native `details` pattern.
- `components/consent/ConsentPreferences.tsx` - the native `<dialog>` pattern, `TAP_TARGET`, `lib/dom/body-scroll-lock.ts`.
- `components/ui/ContactLink.tsx` - the "Still stuck?" rows, with the contact page's icon tiles.
- `components/ui/CTAButton.tsx` - export its class maps, with call sites unchanged.
- `components/icons/index.tsx` - add the aliases `MagnifyingGlass`, `Warning`, `ArrowSquareOut`, `Envelope`, `WhatsappLogo`.
- web: `adaptive-menu` `MenuRow`, `SectionHeader` `badge`, `EmptyState` `cta`, `InfoBox`. scanner: `ExternalLink`.

## New components required
These go in `components/help/mdx/`, after `components/blog/mdx/`. They are help-only, so not `ui/`.
- **Badges (layout):** h-7 `rounded-full` pills, `border-[var(--border)] bg-[var(--paper)] text-sm font-semibold`. Roles in one pill; "Growth and Pro" on `--accent-light`. No plan pill when the page covers every plan.
- **`Details`:** native `<details>` (no JS, works with find-in-page), `rounded-xl border bg-[var(--paper)]`, summary at least 44px, rotating `CaretDown`. Not `FAQItem` (client JS) and not `blog-card-3d` (too loud).
- **`Callout`:** the blog-prose blockquote shape. `note`: `--border` rule on `--blog-bg-alt`. `warning`: `--accent` rule on `--accent-light`. Not `InfoBox` (French default titles, hover-lift card).
- **`Symptom`:** always open, `rounded-xl border bg-[var(--paper)] p-4`, with an `h3` carrying its own slug id so app anchors can reach it. rehype-slug never sees JSX props.
- **`OpenInDashboard`:** a plain `<a target="_blank">` with CTAButton's `md` primary classes and `ArrowSquareOut`, `w-full sm:w-auto`. Using CTAButton itself would log `landing_cta_clicked` into the signup funnel and add a locale prefix.
- **`Screenshot`:** natural aspect ratio from the file's dimensions, lazy-loaded. Phone: `max-w-[300px] mx-auto rounded-2xl border shadow-sm`. Desktop: column width, `rounded-xl border`. `ImageWithCaption` crops to 16:9, and `PhoneScreenshot` is a full-screen bezel.

Also `components/help/{HelpSearch,HelpBreadcrumb,StillStuck,ShareLayout}`, web `reusables/help-link.tsx` (`InfoPopover` takes two taps to reach a page), and scanner `src/lib/help-links.ts`.

## Open questions for the user
- AC12: private or marketing? The design covers both.
- Support hours: findability.md asks for them and nothing defines them. Leave them out until you give them?
- Phone number as +33 6 49 37 04 70 for English readers?
- The skill's how-to template still puts `<WhoCanDoThis>` and "## Related" in the body, while plan.md moves both to frontmatter. stampeo-help-docs should update the template.
- Outside scope: the `HelpMenu` trigger is 32px, and on phones it sits only inside the sidebar sheet.
