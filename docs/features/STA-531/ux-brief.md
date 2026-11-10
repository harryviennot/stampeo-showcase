# UX Brief: STA-531
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

## Already shipped
No `/us/vs` or `/comparatif` routes exist, and there is no competitor table component. Two nearby things:
- `/pricing` has a table comparing our own tiers (`FeatureComparisonTable` in `components/pricing/PricingPageContent.tsx`).
- The EN post `best-loyalty-card-system-small-business.mdx` (lines ~104–108) quotes Loopy and Stamp Me prices typed by hand ("as of May 2026") next to "Stampeo €20/month". Once the new pages are live, those numbers will contradict them.

## Placement
- Use the two routes in the plan. Both render one shared `components/compare/ComparisonPage.tsx`, the same way `MarketPricingPage` serves all three pricing routes.
- Not `/blog/<slug>`: blog posts are linked across languages, exist in every locale and quote EUR. These pages belong to one market each.
- Build it as a copy of the blog post shell in `app/[locale]/blog/[slug]/page.tsx`: `--blog-bg` background, `pt-32`, the table of contents on desktop only, the `blog-prose` article, and `Header`/`Footer` with `market="us"` on US pages.
- Go through `<Container>` rather than the raw `max-w-[1360px]` the blog page uses.
- Leave out the cover image, tags, reading time, share buttons and back link.

## Entry points
- Search and AI answers (the main way in).
- EN post: links on the Loopy and Stamp Me paragraphs.
- FR post: one new sentence in "Papier ou digital : comment choisir" (stampeo-copywriting writes it).
- Each comparison page lists the other published pages of its market.
- `/pricing` (fr) and `/us/pricing`: one line of links under the tier table. It answers "is this cheaper than what I'm looking at?". Can be struck.

## Proposed additions
- A line under the verdict: "By <author>, founder of Stampeo · Checked <date>", plain muted `text-sm` like `LegalPageLayout`'s "last updated", not a badge. The date is computed as the oldest `checkedAt` among the facts on the page. JUSTIFICATION: answers a question (is this still true?) and prevents a mistake (claiming the page is fresher than it is, or passing as independent).
- A CTA right after "Choose <X> if / Choose Stampeo if", repeated at the bottom. JUSTIFICATION: removes a step. A reader who matches "Choose Stampeo if" can act right there.
- Stampeo's prices fixed to the page's market currency, with no `RegionPricingProvider` swap. JUSTIFICATION: prevents a mistake: euros shown next to a competitor's dollars.
- Hide `LanguageSwitcher` and `FloatingLanguageSwitcher` on these routes by extending their existing `/blog/` regex. JUSTIFICATION: prevents a mistake: switching language lands on a 404.

## Rejected additions
- Sticky verdict or sticky CTA bar: takes vertical space a phone doesn't have, and the verdict is two sentences.
- Jump-link row on phones: the table and prices are already sections 3 and 4.
- Marking a winner per row, or red/green cells: editorialises facts and reads as an attack ad.
- Footnote numbers on each fact: tap targets under 44px in every row. The Sources section and checked date already answer it.
- Footer links: would show three rivals on every page and add a row to the phone footer grid. Revisit when the hub exists.
- Header nav item: too much nav weight for three pages.
- Banner for facts older than 90 days: the checked date already shows the age.
- Collapsible table sections (the pricing page pattern): here the table is the content.
- `ScrollReveal` on article sections: blog posts don't animate.

## Mobile shape
At 390px, top to bottom:
- **Header:** H1 (`text-h1`, not `text-hero`), verdict (`text-lead`), the checked line. "Choose if" starts above the fold.
- **Choose if:** two identical cards, stacked, competitor first. Then the CTA.
- **Table:** one card per criterion, max 12 rows:
  - label on top, two value columns below, each with a small vendor name;
  - Stampeo always on the right, with the light orange tint pricing gives Growth;
  - yes/no cells show an icon plus a word;
  - price rows show their tax basis and "per month".
- **Prices:** short text plus a table of price rows only. Full-width links of at least 44px to their pricing page and to our market's pricing page.
- **Rest of the page:** FAQ, Sources (page title and domain, never a raw URL; a date under each; correction contact last), AuthorCard, closing CTA, other comparisons as full-width rows of at least 44px.
- **Rules:** no dialogs or tooltips, every explanation is inline text. No markdown tables in comparison MDX (blog styles don't reflow them); the content test should enforce this.

Desktop: table of contents on the left, a real three-column `<table>`, the two "Choose if" cards side by side.

## Components to reuse
- `components/sections/Header.tsx`, `Footer.tsx`: their `market` prop.
- `components/blog/TableOfContents.tsx`: desktop table of contents.
- `components/blog/mdx/index.ts` and `lib/blog/mdx-options.ts`: the MDX pipeline. Add the comparison components in the comparison loader only, not the blog's.
- `components/ui/FAQList.tsx`: built from the frontmatter array that also feeds `faqPageJsonLd`, so the visible FAQ and the structured data can't drift apart (the blog keeps two copies).
- `components/blog/mdx/CallToAction.tsx` (mid-page CTA) and `components/features/FeatureCTA.tsx` (closing CTA): add an optional `trackAs` prop to each, with defaults unchanged, plus new `CTALocation` values in `lib/analytics.ts` and `lib/cta/taxonomy.ts`. Without this, clicks log as `blog_cta`/`feature_cta` and the ~10% conversion premise can't be measured.
- `components/blog/AuthorCard.tsx`, `components/ui/ContactLink.tsx` (correction mailto), `components/market/MarketLink.tsx`, `components/icons/index.tsx`.

## New components required
All in `components/compare/`, which is feature-specific like `components/pricing/`. Promote to `ui/` only if a second feature needs one.
- `ComparisonTable`: `FeatureComparisonTable` is tied to `FEATURE_CATEGORIES`, three tiers and client state, so reshaping it would change `/pricing`. Server component, one semantic `<table>` (AI answers read tables).
- `ChooseIf`: `InfoBox` is a single card with an info icon and French default titles. Reuse its surface for two equal cards, without the hover lift (that signals a link). It also gives AC6 something to test for.
- `Fact`: data only, no visual.
- `SourcesList`: nothing in the kit lists dated sources.
- `ComparisonLinks`: reads the registry (published pages of the same market, minus the current one), so a draft is never linked. `BlogCard` needs `/blog/` metadata. Used on each page and on pricing.
- `ComparisonPage`: the layout both routes render.

## Open questions (resolved by the coordinator on defaults, 2026-11-04; Harry can overrule)
- EN post's typed competitor and Stampeo prices: replaced by links to the comparison pages in the publish PR, so no two pages quote different numbers.
- Blog links: added in the publish PR, not the drafts PR, so posts never link to noindex pages.
- Rival names on the pricing page: left out of wave 1 (the pricing page stays about our plans); revisit with the hub page.
