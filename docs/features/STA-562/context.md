# STA-562 context: loyalty programs preview, with levels

Lane: sketch. Branch `feat/sta-552-feature-previews`, worktree `showcase/.claude/worktrees/sta-552` (SHARED with the STA-552
session and its builder: commit with `git commit -m "..." -- <your paths>` only, never `git add -A`/`-a`; never run
`bun test -u`; a failure in a file you don't own may be their WIP, check `git status`).

- URL: http://localhost:3191/us/landing-pages/platform/loyalty-programs (dev server already running from this worktree; it
  hot-reloads). Today's page for comparison: http://localhost:3191/en/loyalty-programs.
- Siblings to match: `/us/landing-pages/platform/{card-design,push-notifications,analytics}` (v3 look) and `/us/landing-pages/platform`.
- Copy: `lib/landing-pages/copy/previews/loyalty-programs.ts` (all words; edit only to fix a line that breaks in pixels, and say so).
- Page: `app/[locale]/us/landing-pages/platform/loyalty-programs/page.tsx`; sections in `components/landing-pages/feature-previews/loyalty-programs/`.
- Registry: `lib/landing-pages/pages.ts` (`platform/loyalty-programs`, sections in render order, related previews).

## v3 rules (Harry, 16 Nov; `docs/features/STA-552/plan.md` "v3")
- Clean Platform look: white cards `rounded-[28px|32px] bg-white ring-1 ring-black/5` + `CARD_SHADOW` (`components/landing-pages/platform/classes.ts`).
  No ink borders, no orange pills, no plan names/badges anywhere. Section label = `LpSection eyebrow` (orange caps text).
- Plain literal H2s from the copy; one h2 per section (`LpSection title`), card titles are h3 (`CARD_TITLE`/`CELL_TITLE`).
- Type scale tokens only (`text-h2`, `text-lead`, ...), `Container` widths, `ScrollReveal` for entrances, icons from `@/components/icons`.
- Show the product: real `WalletCard`s in `PassFrame`, real notification (`LockScreenNotification` + `lpBanner`), real wording.
- Phones first: 390px without horizontal scroll, tap targets >= 44px, reduced motion = calm static states.

## Reuse
- Cards: `components/card/WalletCard` (`headerLabel` prints the level name in the header), `shared/PassFrame`, `ui/ScaledBox`
  (`narrowTo`/`to`/`breakpoint`), samples `shared/samples.ts` (`AUREVO`, `VANITY`, `WRENFOLD` = the levels brand, a dry cleaner),
  `lib/loyalty-samples.ts`, `lib/hero-fan.ts resolveFanCard(id)`, level looks `lib/levels/looks.ts` (`SILVER_LOOK`, `GOLD_LOOK`, ...).
- Existing level fan: `shared/LevelCards.tsx`. Sign-up strip: `components/acquisition/LevelStrip.tsx` (+ `lib/levels/levels.ts PublicLevel`).
- Layout pieces: `shared/LpSection` (`LpHeading`, `EYEBROW`), `shared/FactList`, `shared/IconTile`, `platform/GlassCard`,
  `platform/ToggleCard`, `ui/Segmented`, `ui/CTAButton` (`keycap`, `trackAs`), `platform/LpCtaPair`.
- Scanner wording (scanner-app `src/locales/en/stamp.json` levels): "{level} perk: {perk}", hint "Apply it at the till before
  charging.", amber `#d97706` star on `rgba(245,158,11,0.16)`, border `rgba(245,158,11,0.35)`.

## Claims (STAMPEO.md §6 "Loyalty levels", backend `app/services/programs/levels/core.py`)
Up to 5 levels (2 minimum, new ladder starts with 3); up to 3 perks per level; one-time level gift; move up on EARNED stamps
(full cards, 1 by default) or EARNED points, spending never holds back; never move down on their own (owner can change by hand);
welcome stamps/points count; each level may have its own card look (own, Bronze, Silver, Gold, Platinum, Noir), and on stamps its
own card size and reward, on points its own reward menu. Default banner: "You've reached {level}! Your card has a new look. Your gift: {gift}."

## Screenshots
`node <scratchpad>/shotparts.mjs <outDir> <url> <width> <height> <tag>` (Playwright from promo-videos; reduced motion; chunks of
1600px). Shoot 390x844 and 1440x900, READ every PNG before reporting.
