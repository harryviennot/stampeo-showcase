# UX Brief v2: STA-531 comparison pages redesign (table + page)
MODE: DESIGN   DOMAIN: showcase   VERDICT: READY
Why: Harry, 2026-11-07, after reading the drafts: "I don't like the comparison table, and the pages look pretty bland." Supersedes the layout parts of `ux-brief.md`; its constraints still hold.

## Already shipped
- **Diagnosis, measured:** the phone table is about 3,100px on Loopy (EN) and about 4,000px on Zerosix (FR). It's 14 boxed rows of full sentences, with the vendor name repeated 28 times.
- **Bug in the current table:**
  - `lib/compare/page/rows.ts` `cellOf` puts the minus ("gap") icon on "None: cancel any time" and on « Aucun : » in the commitment row.
  - On Zerosix, "Sans engagement" doesn't match the regex, so the icon shows only on Stampeo's side: a lopsided icon on two equivalent facts.
- **Patterns already on the site:**
  - `components/pricing/PricingPageContent.tsx:101`: a desktop `<table>` plus a phone `<details>` list.
  - `components/features/design-de-carte/HeroCardStack.tsx`: a real `WalletCard` stack.
  - `globals.css:596`: `.card-stamp` is for real cards only.

## Placement
Same routes. Restructure `components/compare/ComparisonArticle.tsx` and rewrite `ComparisonTable.tsx`.
- Drop the blog shell (`bg-[var(--blog-bg)]`) and the `TableOfContents` sidebar. The H2 ids stay, so anchors still work.
- The page sits on `paper-grain bg-[var(--cream)]`, like the landing.
- Sections use `py-16 lg:py-24` in `<Container>`, with left-aligned `text-h2` titles. Prose is capped at `max-w-[46rem]` and stays on the Container's left edge.

## Proposed additions
- **Real card stack in the hero** (our product only). It answers "what does Stampeo look like?".
- **The 14 rows grouped into 4 themes, each with an icon chip:**
  - "Your customer's side": card.where, customer.app_required, languages (`DevicePhoneMobileIcon`)
  - "The program": program.types, designer, push.automatic, push.broadcasts (`Gift`)
  - "At the counter": staff.scanning, pos.integration, locations.multiple, export (`QRCodeIcon`)
  - "Price and commitment": price.entry, trial, commitment (new alias `Tag as PriceTagIcon`)
- **A "Source" link inside each competitor detail** (`sourceUrl`). It answers "says who?" (CEPC: tell readers how to check).
- **The sign-up button at the foot of the "Choose Stampeo if" card.** It replaces the separate CTA box.
- **A neutral pick pill on each "By type of shop" row,** the same style for both products.

## Rejected additions
- An icon per row. The 4 theme chips do the wayfinding.
- The ✓/– icons. Remove `YES`/`NO`/`cellOf`: the regex is wrong (bug above), CEPC warns against ✓/✗ grids, and the short value says the answer in words.
- Merging "same on both" cells. It hides nuance.
- A sticky vendor header. The site header and the PromoBanner make the offset unreliable.
- A price/trial stat strip in the hero. It invites a like-for-like misread.
- The live wallet demo (`sections/HeroDemo`). It needs `RegionPricingProvider`, which breaks the fixed page currency.
- Price-scenario cards, shop-type icons, a CTA in the hero.
- Any competitor visual or colour, scores, winner badges (legal.md).

## Mobile shape (390px)
1. **Hero:**
   - H1 (`text-h1`), verdict (`text-lead`).
   - The Checked line as a pill: `CalendarCheckIcon`, `rounded-full border bg-white h-8 px-3 text-sm`.
   - `HeroCardStack` in a `w-[200px] mx-auto` box (about 256px tall).
   - No ScrollReveal in the hero.
2. **Choose-if pair:** stacked, competitor first, `card-stamp` (drop the `blog-card-3d` hover overrides). The Stampeo card ends with a full-width `CTAButton size="md"`.
3. **Table:** on a full-bleed `bg-[var(--blog-bg)]` band.
   - One white `rounded-2xl border` card per theme. Header: a 40px accent/10 chip plus `text-h3`. Then a 2-column name row (`text-xs font-semibold`, competitor muted, Stampeo accent).
   - Each row is a native `<details>`. The `<summary>` (min-h-11) holds the label (`text-sm font-medium` muted), a `CaretDown`, then `grid-cols-2 gap-3` short values (`text-[15px] font-semibold leading-snug break-words`). The competitor half is `bg-[var(--muted)]/30`, the Stampeo half `bg-[var(--accent)]/5`.
   - Open: both full sourced sentences (`text-sm` muted) in the same two columns. The competitor's ends with "Source ↗" (min-h-11).
   - The price row's tax line (FR TTC equivalent / "TVA non applicable") stays in the summary.
   - Total about 1,600px.
4. **Prices:** two soft white cards (`rounded-2xl border`), competitor first. One `<Fact>` per line in `text-lg font-semibold`, then that vendor's pricing link. Then the "as of" caption and the scenario prose.
5. **Strengths:** on a second `--blog-bg` band. Each bold-lead paragraph becomes a soft white card, with the lead as its `text-h3` title. Competitor first.
6. **By type of shop:** one white panel with divided rows: profile (semibold), reason (muted), and a pick pill (`rounded-full border bg-[var(--background-subtle)] h-7 px-3 text-sm`). The pill looks the same for both products.
7. **Then, unchanged:** switching (prose), `FAQList`, `SourcesList`, `ComparisonLinks`, `FeatureCTA`.

No horizontal scroll. Every tap target is at least 44px.

## Desktop (lg+)
- **Hero:** `lg:grid-cols-[1.2fr_1fr]`, text left, card stack right.
- **Pairs:** side by side.
- **Strengths:** the two sections side by side, competitor left.
- **Table (md+):**
  - A real `<table>` (keep the role attributes), styled like the pricing table: white, `rounded-3xl border shadow-sm`. Columns 24/38/38, Stampeo tint kept.
  - One `<tbody>` per theme, with a header row (chip + theme name; vendor names repeated, aria-hidden).
  - Each cell: the short value (`text-base font-semibold`) with the detail and source always visible underneath. No toggle.
  - The phone list is `md:hidden`; the table is `hidden md:table`.

## Data needed
1. `short` on `SourcedFact` (added 2026-11-07, optional).
   - Required for the 14 standard ids, at most 40 characters, in the market's language.
   - It keeps every material qualifier (plan, per location, HT, period) and copies "Not published" / « Non communiqué » word for word.
   - The same quote backs it.
2. Stampeo `rowsShort` in `lib/compare/stampeo.ts` (EN/FR), built like `rows`: plans, prices and trial days are computed.
3. `ROW_GROUPS` in `rows.ts` and `groupLabels` in `COPY` (EN/FR).
4. MDX in the six pages: `<PriceCard side>`, `<Strengths side>`, `<Fit side shop>`. Structure only, the words don't change. `arrangeBody` pairs side components and stops inserting `<CallToAction />`.

## Components
- **Reuse:**
  - `components/features/design-de-carte/HeroCardStack.tsx`, promoted to `components/card/` unchanged (translation keys exist in en and fr)
  - `ui/Container`, `ui/CTAButton` (trackAs `comparison_cta`), `ui/FAQList`, `ui/ScrollReveal`
  - `features/FeatureCTA`
  - `compare/SourcesList`, `compare/ComparisonLinks`, `compare/Fact`
  - the `pricing/PricingPageContent` table pattern
  - `icons/index.tsx`
- **New:**
  - `components/compare/SideCard` (shared by ChooseIf, PriceCard, Strengths)
  - `components/compare/Fit`
  - the icon alias `Tag`

## Open questions (coordinator's defaults, 2026-11-07; Harry can overrule)
- **Hero shows only Stampeo's card:** kept. We legally can't show theirs, and the verdict and Choose-if pair carry the balance.
- **Inline "Source" links to competitor sites:** kept (CEPC), with `rel="noopener nofollow"`.
- **Desktop table of contents:** dropped.
