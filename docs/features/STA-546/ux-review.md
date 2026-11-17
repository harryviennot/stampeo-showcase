# UX Review: STA-546
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 1440x900; heroes also 1024x768 and 1280x800)
VERDICT: FIXED WITH FINDINGS

## Fixed
- `components/landing-pages/how-it-works/HowHeroVisual.tsx:10-16,35-52`: on desktop, the Wallet screen was half empty under the card. It now shows Wallet with a pass open: the Aurevo card at the top, and the customer's other two passes (Vanity, Marginalia: the same pair `HeroCardStack` uses) collapsed at the bottom of the screen, each showing its header row. On phones nothing changes: the hero's 340px crop ends above the stack.
- `components/landing-pages/shared/AurevoCard.tsx:15-31`: the fixed-scale frame is now `PassFrame`. `AurevoCard` and the How-to stack both draw through it, so there is no second copy of the scaling. `AurevoCard`'s props are unchanged.
- `components/landing-pages/features/FeaturesHeroVisual.tsx:16-24`: the banner used to be absolute and covered the card's header (logo and "5 / 8") at every width. The banner and the card are now in the normal flow, and the card overlaps the banner by only 8px (`-mt-2`), so the whole header row shows under the banner. Nothing shifts on first paint.
- `components/card/HeroCardStack.tsx:6-7,17-20,41,54`: new optional prop `peekFrom` (`"lg"` by default, so every current call site renders the same class string). The Features hero passes `"xl"`. At 1024 the right-hand peeking card was being cut by the viewport edge; at `lg` the hero now shows the single card and banner, as on phones.
- `components/landing-pages/outcomes/OutcomesHeroVisual.tsx:5-24`: the hero phone is 280px on phones (unchanged) and is scaled to 320px from `lg`, the same size as the How-to hero phone. Both desktop heroes are now 894px tall, and the visual runs from y=144 to 798 at 1440.
- `components/landing-pages/outcomes/RegularsSpotlight.tsx:16-17`: the "Example" line was dark 16px text with a ringed pill, heavier than the lead above it. It is now `text-sm` muted, with the label as small dark caps and no pill. It still shares one paragraph with the text.
- `components/landing-pages/shared/PlanLine.tsx:12`: the "Growth and Pro" pill is neutral now (`--background-subtle`, `--border` ring, foreground text). On this site orange means the action, and this pill is a qualifier.
- `components/features/design-de-carte/CardStyleGallery.tsx:40-47,144` and `components/landing-pages/features/DesignSpotlight.tsx:18`:
  - The gallery gets a new optional prop `sectionClassName`. Its default is the current classes, so `/features/card-design` is unchanged.
  - On Features the gallery is now the page's one tinted band. It uses `py-16 lg:py-24 bg-[var(--blog-bg)]`, the same colour and beat as `LpSection tinted`. Before, its `--blog-bg-alt` (#faf8f3) was invisible on the cream (#faf9f6), and its padding was `py-20 sm:py-28`.
  - The heading stays centred: see Left alone.

## Mobile findings
- None found. At 390 on all three pages: the H1, sub and CTA sit above the fold (CTA bottom at 329, 372 and 372); `scrollWidth` is 390 (no horizontal scroll); no decoration overlaps text. The new elements are the How-to stack (`aria-hidden`, invisible at 390) and the neutral pill. Neither is interactive.
- The Features hero is still the tallest at 390 (1067px, against 837 and 824). Its card is shown whole: the next section is cream, not a band, so a hard cut there would read as a bug.

## Brief drift
- How-to hero: the brief says "Aurevo card at the top" of the Wallet screen. On desktop it now also shows two stacked passes at the bottom. That is fine: it is Apple Wallet's own open-pass layout, and the phone layout is unchanged.
- Features hero:
  - The banner sits on the card's top edge, overlapping it by 8px, rather than overlapping the header row.
  - The peeking cards appear from `xl`, not `lg`.
  - Both are fine: the header must read, and 1024 clipped the right-hand card.
- Outcomes hero: the phone is 320px on desktop (the brief left it at the 280 default). Fine: it matches the How-to hero.
- The Features gallery band is `--blog-bg` rather than its built-in `--blog-bg-alt`. Fine: that is the band the brief meant ("one tinted band per page"), and the built-in one could not be seen.

## Copy flagged
- `lib/landing-pages/copy/outcomes.ts:27-28`: the big figure prints "6×" (multiplication sign) and the line under it says "6X" (capital X). If "6X" is Square's exact wording, keep it. Otherwise pick one form. For stampeo-copywriting.

## Left alone
- **Item 4, hero crop.** I kept the hero's hard 340px cut on phones.
  - On How-to and Outcomes the cut falls exactly on the edge of the tinted band that follows, so the phone reads as tucked behind the band (`after-*-390-heroedge.png`).
  - A fade would dissolve the phone about 50px above a hard colour edge, which makes two edges.
  - The spotlights fade because their cut sits inside a section.
  - So the rule is consistent: a cut on a section edge is hard, a cut inside a section fades.
  - Moving the hero onto `PhoneCrop` would also need a second crop height in `PhoneCrop` (440 against 340).
- **Item 5, gallery heading alignment.** It stays centred, over a centred, edge-to-edge carousel. That matches the other centred blocks on these pages, which are the Outcomes figure band and the final CTA. Left-aligned headings sit over splits and grids.
- **Item 6, desktop gap between text and device.**
  - The gap is about 240-300px at 1440. It comes from the site's split convention: `lg:grid-cols-2` with the visual centred in its half, as on the GeofencingPage, NotificationsPushPage and AnalyticsPageContent splits.
  - Tightening it means either a section-level `max-w-*`, which breaks the Container edge alignment, or pushing the visual toward the text, which the "spotlight centres its visual" pin forbids.
- **1280 only, Features hero.** The left peeking card (Vanity) ends about 6px from the end of the sub's single line ("…to download."). It does not overlap, and it is the trade-off of `xl:mr-24`, which keeps the right-hand card inside the page.
  - Fix options: a narrower sub at `xl` on all three heroes, or a smaller `xl:mr-*` that clips the right-hand card again.
  - Owner: Harry's call.
- **1024 and 1280.** The phone heroes (How-to and Outcomes) run past the 768 and 800 folds, as they did before. AC17 only pins 1440x900, where the whole visual sits above the fold (bottom at 798).
- **Lines under the lead.** `ReturnSpotlight`'s head-start sentence and `PlanLine`'s text stay dark at 16px: they are claims the section argues, while the Example is an illustration. If Harry wants every under-lead line muted, the change is one class each.
- **Reused blocks below 44px.** The `HeroDemo` Stamps/Points toggle (32px), the pricing interval tabs (36px) and the footer links (20px) are below 44px. They are shared components the brief already left alone. Owner: a site-wide pass.
- **Final CTA background.** `stamp-pattern` is white (`--background`) under a cream page, the same as on `/us`. It is unchanged.

## Verification
- type-check: pass   lint: pass. `bun run lint` shows 0 errors, and its 6 warnings are all in files I did not touch (`landing-variant/*`, `consent-ledger.test.ts`). `bunx eslint` on the changed files is clean.
- tests: `bun test lib/landing-pages` 112 pass; `bun test lib` 4650 pass, 0 fail.
- screenshots: `docs/features/STA-546/shots/polish/` (git-excluded). The `before-*` and `after-*` sets cover every section except pricing and FAQ (shared and unchanged), at 390 and 1440, plus the heroes at 1024 and 1280 and `*-390-heroedge`. `r1-*` and `r2-*` are the intermediate rounds.
