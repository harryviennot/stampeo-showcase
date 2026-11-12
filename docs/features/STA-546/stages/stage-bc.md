# STA-546 Stages B and C: the Features page (B) and the Outcomes page (C)

Two stages run in parallel, one page each, in separate worktrees branched from Stage A's last commit. Your
first prompt line says which stage you are and gives your worktree and branch. Work only there.
Never push, merge or open a PR.

## Read first, fully

1. `docs/features/STA-546/plan.md` (AC1-AC17) and `docs/features/STA-546/ux-brief.md`: §B Features or
   §C Outcomes, plus the shared sections (Rhythm, Hero, Mobile shape, Claims check, Components).
2. `docs/features/STA-546/stages/stage-a.md`: the rules there all still apply (CTAs, tokens, provider,
   tests, verification, commits, no Co-Authored-By trailer, AGENTS.md restore).
3. What Stage A built: `components/landing-pages/shared/*`, `components/landing-pages/how-it-works/*`,
   `app/[locale]/us/landing-pages/how-it-works/page.tsx`, `lib/landing-pages/*`. **Use the shared
   components; don't fork them.** If one needs a new optional prop, add it additively and say so in your
   report (the other stage may add one too, which is fine as long as both are optional).
4. Your page's copy: `lib/landing-pages/copy/features.ts` (B) or `outcomes.ts` (C), plus `shared.ts`.
   Don't reword strings. Report anything that can't be placed as written.

## Stage B: Features `/us/landing-pages/features` (8 sections)

Replace the minimal page Stage A left (`TODO(STA-546 stage B/C)`) with:
1. hero: `FeaturesHeroVisual` (new, `components/landing-pages/features/`) = `HeroCardStack` +
   one `NotificationBanner` (`REWARD_BANNER` or `STAMP_BANNER`, sender = Aurevo) overlapping the card's
   top edge. On phones, one 300px card; peeking cards from `lg`. Secondary `#demo` link, as How-to.
2. demo: the shared demo block (as on How-to).
3. spotlight_messages: `LpSpotlight` with `FEATURES.messages`; the visual is `NotificationPhoneDemo`
   with the two `banners` stacked (use Stage A's `notifications` prop), cropped to its top ~420px on
   phones; the `broadcast` line printed WITH the `SHARED.broadcastPlans` label on the same line
   (e.g. a small pill "Growth and Pro" before it). Visual on the right on desktop.
4. spotlight_design: `FEATURES.design` heading + `CardStyleGallery` with `showCta={false}`, full width.
5. spotlight_analytics: `LpSpotlight` with `FEATURES.analytics`; `PhoneScreenshot` with
   `landingShot("en", "phone")`, cropped on phones, captioned `SHARED.sampleData`. Visual left on desktop.
6-8. pricing, faq, final_cta (`FEATURES.finalCta`), the shared blocks.

## Stage C: Outcomes `/us/landing-pages/outcomes` (8 sections)

1. hero: visual = `NotificationPhoneDemo` (statusBar "lock") showing `STAMP_BANNER` at first paint
   (`animate={false}`, `eager`). NO secondary demo link on this page. Keep the U+2011 in the H1.
2. problem: `RegularsFigure` (new, `components/landing-pages/outcomes/`): `OUTCOMES.problem.title` as
   h2, the `figure.value` "6×" in the `ink-figure` class, `figure.text` as one line, `figure.source` in
   small print. Centred, tinted band (`--blog-bg-alt`), about half a phone screen.
3. outcome_return: `LpSpotlight` with `OUTCOMES.comeBack`; visual = Aurevo `WalletCard` part-filled
   (e.g. 5/8). Under the lead, the `headStart` text with its `source` in small print. Visual right.
4. outcome_slow_days: `LpSpotlight` with `OUTCOMES.slowDays`; the `SHARED.broadcastPlans` label and
   `noFees` on one line under the lead; visual = `NotificationPhoneDemo` with `slowDays.banner`,
   cropped on phones. Visual left.
5. outcome_regulars: `LpSpotlight` with `OUTCOMES.regulars`; `PhoneScreenshot` + `landingShot("en",
   "phone")` captioned `SHARED.sampleData`; then the example as one line: `example.label` (small caps or
   a small pill) + `example.text`. Visual right.
6-8. pricing, faq, final_cta (`OUTCOMES.finalCta`).

## Tests (extend Stage A's files; your stage's lines only)

- Turn your page's `test.todo` in `pages.test.ts` (section order and `data-landing-section` coverage)
  into a real test, and make it pass.
- B: a source scan that the messages spotlight renders `broadcastPlans` in the same component as
  `messages.broadcast`. C: the same for `slowDays`; and that `RegularsFigure` and the return spotlight
  render `.source` (AC12).
- Both: AC9 (`sampleData` with `PhoneScreenshot`) is already pinned by Stage A's test; make sure it
  covers your files.
- Conflicts: both stages edit `lib/landing-pages/pages.test.ts`. Keep your edits to your own `describe`
  block / your own lines so the merge is mechanical.

## Verify and report

As Stage A: `bun test lib scripts`, `bun run type-check`, `bun run lint`; dev server (a port of your
own: B uses `bunx next dev -p 3012`, C uses `bunx next dev -p 3013`; never 3001 if another stage might
hold it), screenshots of YOUR page at 390x844 and 1440x900 under `docs/features/STA-546/shots/stage-b/`
or `stage-c/`, LOOKED AT and fixed; also screenshot `/features/notifications-push` and
`/features/card-design` once at 390 to confirm the extended components still render as before (AC15).
Build once at the end with dev stopped. Restore `AGENTS.md`. Commit on your branch, no trailer. Report:
files and diff stat, tests, checks, shots and what you fixed, deviations, any new optional prop.

## Conventions Stage A set (follow them)

- Every section is `<LpSection section="<id>">` or a component forwarding a literal `section="<id>"`
  (e.g. `<LpSpotlight section="spotlight_messages">`); pricing is `<LpSection section="pricing" bare>`.
  The order test follows the page's JSX and its imported `components/landing-pages/**` files in
  document order, so new section components must use this pattern or the test can't see them.
- Delete your page's entry from the `STAGED` map in `pages.test.ts` to arm its section-order test.
- Cards: `AurevoCard` (`components/landing-pages/shared/AurevoCard.tsx`, any `width`, laid out at 300
  and scaled, QR included). Banners: always `<NotificationBanner {...lpBanner(banner)} />` with
  `lpBanner` from `components/landing-pages/shared/banner.tsx` (sender name + Aurevo cup icon), and
  `NotificationPhoneDemo notifications={banners.map(lpBanner)}`.
- `tinted` on `LpSection` is the `--blog-bg` band; at most one per page.
- Headings come from `LpHeading` (balanced h2, pretty lead). Don't hand-roll an h2.
- The How-to desktop hero shows the phone with a lot of empty Wallet screen under the card: known,
  left for the polish pass. Don't copy that composition for your hero; follow the brief's visual.
