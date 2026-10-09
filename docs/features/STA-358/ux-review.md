# UX Review: STA-358
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 1440x900). Local dev server on :3114 (branch worktree). The signed-in header was checked with a fake `sb-<ref>-auth-token` cookie.
VERDICT: FIXED WITH FINDINGS

## Fixed
- components/blog/BlogHeader.tsx:34-58 - At 390px the byline row (avatar, author, ·, date, ·, "Updated on …") was one non-wrapping flex row. In en and fr posts that have `updatedAt`, it collapsed into three narrow columns: "Harry / Viennot", "June 7, / 2026", "Updated on August / 3, 2026".
  - Fix: below `md`, the name, the published date and the updated date now stack beside the avatar, like `AuthorCard` already does. From `md` up it is the same single row as before.
  - Also: the avatar gets `shrink-0`, and the separator dots are `aria-hidden` and hidden below `md`.
  - Verified on /blog/carte-fidelite-cafe and /en/blog/coffee-shop-loyalty-card at 390 and 1440. /es/blog/tarjeta-fidelidad-sin-app (no `updatedAt`) shows author and date on two lines.

## Mobile findings
- components/sections/Header.tsx:21-66, 472-506 - On a phone the auth links only render inside the burger menu, so nothing swaps on first paint.
  - Desktop swap measured with a PerformanceObserver: CLS 0.0001 (`.hidden lg:flex` auth cluster, about 8px narrower).
  - The nav is absolutely centred and does not move.
  - Mobile menu rows ("Log in" / "Sign out" are px-4 py-3, 44px) and the h-12 primary button are the same in both states.
  - Fine.
- Pricing price slots, RegionText spans (PricingTierCard, PricingPageContent, ROICalculator, PricingSection, Variant* via RegionText) - Measured no layout shift on /us/pricing and /us at 390. That browser was in a France timezone, so the price and trial length swapped $ to € and 14 to 30 after hydration.
  - Every `suppressHydrationWarning` span sits inline inside a `<p>`, `<th>` div or button span, never as a flex child, so typography and wrapping are unchanged.
  - The only hydration warnings in the console are Playwright's injected `caret-color` on the consent switches. None come from these components.
  - Fine.
- components/landing-variant/SectorCarousel.tsx:70-75 - The FR "Salon de beauté" reward pill ("1 € dépensé = 1 point, manucure offerte à 80 pts") wraps "pts" onto a second line inside a `rounded-full` pill at 390.
  - This string is the same length as before the money tokens, so it predates this diff.
  - Everything else fits: en/us "$1 spent = 1 point, $10 off at 150 pts" fits on one line, and the FR "-10 €" wallet field fits.
  - Left alone (line not touched).
- components/features/broadcasts/BroadcastsPage.tsx:186-233 - At 390 the SMS/email/wallet table stays a 4-column table inside `overflow-x-auto`. The "Wallet (Stampeo)" column, the one the section exists to show, is entirely off-screen with no scroll cue.
  - This breaks the checklist rule "comparison grids reflow to stacked cards".
  - It predates this diff, which only removed a row and the caption.
  - Left alone.
- components/features/broadcasts/BroadcastsPage.tsx:139-166 (stat band) - At 390 the three cards stack, and each caption is 3-4 lines with the source inline in parentheses. Readable. At 1440 the cards are equal height (`h-full`), and the shorter €0 caption does not unbalance the row. Fine.
- components/features/scanner-mobile/ScannerMobilePage.tsx - The section backgrounds now run hero, tint (Problem), plain (Two ways), tint (Employee), plain (Security), CTA band, Related.
  - This matches the notifications, geofencing and broadcasts pages, where a plain section also sits directly above the dark CTA card band.
  - Employee cards (`bg-white blog-card-3d` on `--blog-bg`) match the Problem card. Security cards (`bg-white border shadow-sm` on paper) match RelatedFeatures.
  - Fine.

## Brief drift
- No ux-brief.md (the DESIGN pass was skipped). Against plan.md:
  - The header and pricing behave as described in plan.md lines 60-61 and AC5/AC6.
  - A signed-in visitor sees "Log in / Get started" in the server HTML, then "Sign out / Dashboard" after hydration. That is the trade-off the plan accepted.

## Copy flagged
- messages/en/features.json:842 (`campagnes-promotionnelles.hero.subtitle`, same shape in fr/es) - "…with no per-message fee. 8 a month on Growth with basic segmentation…"
  - The sentence opens with a numeral.
  - "8 a month" does not say 8 of what (broadcasts).
  - At 1440 the "8" also lands at the end of a line, cut off from "a month".
- messages/en/landing.json:405 (fr/pl equivalents) - The "Three reasons" card still says broadcasts "get read 5 to 10× more than email".
  - This diff removed every open-rate claim from the broadcasts page and the feature grid as unsourced.
  - This read-rate claim sits on the landing (/, /en, /us).
- messages/en/landing.json:483 (`variant.us.differentiator.title`) - "Why businesses choose our digital punch card." At 1440 it wraps inside `max-w-3xl`, leaving the widow "punch card." on line 2. The other landing H2s are one line on desktop. At 390 it is two lines, the same as its neighbours.
  - Shortening the title would fix it. So would the layout fix under Left alone.
- messages/fr/features.json:853,858 and messages/es/features.json:853,858 - The source sits mid-sentence as "(Données Stampeo, …)" / "(Datos de Stampeo, …)" with a capital D. The en caption has "(Stampeo data, …)". The €0 card has no source line, which is fine for a product fact.
- messages/fr/features.json:906,922 - "Un seul envoi, local-aware" and "Bannière lock-screen, pas d'inbox" are franglais in the table this diff edited. These strings predate the diff.
- messages/en/pricing.json:267 - "…you're not charged until they are up": "they" has no referent. This string predates the diff.

## Left alone
- components/landing-variant/VariantDifferentiator.tsx:25 - Adding `text-balance` to the H2 would turn the /us desktop widow into "Why businesses choose / our digital punch card." This file is not in the diff. It is a one-class change if the caller approves it; otherwise copy can shorten the title.
- components/features/broadcasts/BroadcastsPage.tsx:186-233 - The comparison table needs a phone layout. Either stacked cards per row with the wallet value emphasised, or a two-column SMS-vs-Wallet view.
  - Outside this diff's change, and bigger than a polish edit. Needs a follow-up for the showcase owner.
- components/landing-variant/SectorCarousel.tsx:81 - The quote is wrapped in hard-coded French guillemets `« … »` in every locale, including en/es/pl. The FR beauty-salon pill (line 70-75) could take `text-balance` or `rounded-2xl` to read better when it wraps.
  - Both lines predate this diff and it did not touch them.
- lib/seo-links.ts:50-58 (rendered sr-only in Footer.tsx:245) - Now that the Header copy is gone, this is the only hidden crawl nav. Its anchor text is hard-coded English ("Home", "Pricing", …) on every locale, and raw French slugs ("campagnes-promotionnelles", "scanner-mobile") on /en, /es and /pl pages.
  - Not visible, but it is the SEO surface this ticket is about.
  - Logic and copy, not presentation. For the implementer or stampeo-copywriting.
- components/landing-variant/VariantDifferentiator.tsx:23 - Sets its own `max-w-[1360px] mx-auto px-*` instead of `<Container>`. It predates this diff and the file is outside it.

## Verification
- type-check: pass   lint: pass. `bun run lint` exits 0 with 7 warnings that predate this pass, all in HeroCardFan.tsx, VariantDevToggle.tsx, consent-ledger.test.ts and scripts/indexnow.ts. `bunx eslint components/blog/BlogHeader.tsx` is clean.
- screenshots: viewed inline during the pass (390x844 and 1440x900; Playwright MCP saved them under the workspace-level `.playwright-mcp/`, outside this repo). Not committed.
