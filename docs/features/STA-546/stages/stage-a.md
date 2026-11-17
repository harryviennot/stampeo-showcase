# STA-546 Stage A: tests, foundation, How-to page

You implement one stage of STA-546 in the showcase repo.

- Worktree: `/Users/harryviennot/LocalDocuments/fidelity/showcase/.claude/worktrees/sta-546`
- Branch: `feat/sta-546-landing-variants`, already checked out there.
- Work only in that worktree. Never `cd` to the main checkout. Never push, merge or open a PR.

## Read first, fully

1. `docs/features/STA-546/plan.md`: the approved plan. The acceptance criteria are AC1 to AC17.
2. `docs/features/STA-546/ux-brief.md`: layout, rhythm, hero geometry, components to reuse and extend, and the claims check.
3. `/Users/harryviennot/LocalDocuments/fidelity/.claude/skills/stampeo-ux-ui/SKILL.md` and its `references/showcase.md`.
4. `AGENTS.md`: this is Next 16. Read the relevant guide in `node_modules/next/dist/docs/` before writing route or metadata code.
5. The copy, ALREADY WRITTEN, in `lib/landing-pages/copy/{types,shared,how-it-works,features,outcomes}.ts`.
   - Do not reword any string.
   - If a string cannot be placed as written, stop and report it.
   - You may add fields to the copy only for accessibility text (alt, aria-label), and must say so in your report.

## Scope of this stage

1. **Tests first.** Write the tests below, commit them failing, and check they fail for the right reason before writing the code.
2. **The foundation:**
   - registry, routes, shell and shared components;
   - the three optional props on existing components.
3. **The How-to page, complete:** `/us/landing-pages/how-it-works`.
4. **Features and Outcomes are NOT in this stage.** Two parallel stages build them on top of yours.
   - Make the registry list all three pages anyway (the tests need it).
   - Create their `page.tsx` files only as minimal pages, so the routes exist. Each renders the shell, `LpHero` with its copy, and the shared `pricing` / `faq` / `final_cta`, with `data-landing-section` on each.
   - Mark those two with a `TODO(STA-546 stage B/C)` comment where the middle sections go.
   - Leave their registry entries listing the FULL section ids from the plan.
   - The section-order test for those two pages is expected to fail until stages B and C land, so mark it `test.todo` or skip it with a clear reason. Never weaken it.

## Files

```
app/[locale]/us/landing-pages/how-it-works/page.tsx
app/[locale]/us/landing-pages/features/page.tsx      (minimal, see above)
app/[locale]/us/landing-pages/outcomes/page.tsx      (minimal, see above)
components/landing-pages/shared/LandingPageShell.tsx
components/landing-pages/shared/LpSection.tsx
components/landing-pages/shared/LpHero.tsx
components/landing-pages/shared/LpSpotlight.tsx
components/landing-pages/shared/LpDemo.tsx
components/landing-pages/shared/LpFaq.tsx
components/landing-pages/shared/LpFinalCta.tsx
components/landing-pages/how-it-works/HowSteps.tsx
lib/landing-pages/pages.ts                  # slug → variant, ordered section ids, copy, metadata builder
lib/landing-pages/pages.test.ts
lib/landing-pages/copy.test.ts
```

You may also add a small `lib/landing-pages/*.ts` helper if a test needs a pure function.

## Rules that are easy to miss

**Routing**
- Pages live under `app/[locale]/us/`. The proxy serves `/us/...` as `/en/us/...`. Look at `app/[locale]/us/page.tsx` and `app/[locale]/us/vs/` for the pattern: `setRequestLocale`, the `generateStaticParams` / `dynamicParams` handling, and metadata.

**Metadata**
- `robots: NOINDEX` from `lib/seo/page-robots.ts`, plus title and description from the copy `meta`.
- Do not add these pages to `lib/seo/sitemap.ts`, `lib/llms-txt.ts`, the header or the footer.
- English only: extend `SINGLE_LANGUAGE_PAGES` in `lib/routing/language-switcher.ts`, following how `us/vs` was done. Check what that list does first.

**Shell** (`LandingPageShell`)
- Follow `components/landing-variant/VariantLanding.tsx` for the order and the reasons:
  1. `LandingTracker locale="en" variant={…}` stays OUTSIDE `RegionPricingProvider`.
  2. `RegionPricingProvider` (both ladders fetched with `getPlanCatalog`, US defaults) wraps `Header market="us"`, `<main>` and `Footer market="us"`.
- Use the same page background: `paper-grain bg-[var(--cream)]`.
- No JSON-LD on these pages: they are noindex drafts.
- `Footer` must be rendered by the page's import tree. `lib/consent-routes.test.ts` follows imports, so check that it passes.

**Sections**
- Every section is wrapped by `LpSection` with `data-landing-section="<registry id>"`, `py-16 lg:py-24`, `Container`, and `scroll-mt` for the anchor.
- The demo section's id is `demo`, and its DOM anchor is `id="demo"`.

**CTAs**
- Sign-up is `CTAButton` (default href `/onboarding`).
  - Hero: `trackAs="hero"`.
  - Demo section: `trackAs="feature_cta"`, `variant="outline"`.
  - Final CTA: `trackAs="final_cta"`.
  - Pricing: inside the reused `PricingSection market="us"`, untouched.
  - FAQ contact link: `ContactLink` or `TrackedLink` with `faq_contact` to `/contact`. Check `lib/cta/taxonomy.ts` and `lib/cta/guard.test.ts`.
- The hero "Try it on your phone" link is a plain `<a href="#demo">`, at least 44px tall.
  - NOT `CTAButton`, NOT `hero_demo`. `hero_demo` counts as a contact click in GA4 and Meta.

**Prices and trial length**
- Only through `RegionText raw=…` (tokens such as `{trialDays}`), inside the provider.

**Proof line**
- Read the numbers from the `variant.metrics.items` catalog entries: `value` of the businesses and countries items.
- Do not type "120+" anywhere.
- A test pins that the items you pick are the businesses and countries ones, by label.

**Type and layout**
- Type tokens only: `text-hero` for the H1 (once), `text-display` once (the final CTA title), `text-h2`, `text-h3`, `text-lead`.
- Never add a weight class to a token.
- The accent words (`copy.hero.accent`) are drawn in `text-[var(--accent)]`. Look at how `VariantHero` renders `<accent>`.
- Icons come from `components/icons/index.tsx` only. Entrance motion is `ScrollReveal`, never on the hero visual.
- Hero visual: `eager`, sized so it does not jump on first paint (see the brief, "No jump on first paint").

**Demo**
- Load `components/sections/HeroDemo.tsx` with a dynamic import, the way `components/landing-variant/VariantTryIt.tsx` does.
- It needs the `landing.hero` and `common` catalogs (already loaded for `en`), and it must sit inside `RegionPricingProvider`.

**Extending existing components (rung 3)**
- Add these optional props:
  - `NotificationPhoneDemo`: `notifications?`, `animate?`, `eager?`, `width?`;
  - `CardStyleGallery`: `showCta?`;
  - `QRCodeSkeleton`: `animated?`.
- Defaults must reproduce today's rendering exactly. Do not change any existing call site.
- Only How-to needs `QRCodeSkeleton` now, but add all three props in this stage so stages B and C don't edit shared files in parallel.

**How-to page** (brief §A)
- Hero visual: `IPhone` (statusBar "light") with the Aurevo `WalletCard` at 4 of 8 stamps (`STAMP_SAMPLES` id "aurevo", `lib/loyalty-samples.ts`).
- Steps, in a tinted band (`--blog-bg-alt`):
  - `NumberStamp` + `text-h3` title + one line each.
  - Visuals: 1 = Aurevo card. 2 = the counter placard (white tile, Aurevo logo, a still `QRCodeSkeleton`, `walletBadges` from `lib/store-badges.ts`). 3 = Aurevo card at 5/8 with a `NotificationBanner` showing `STAMP_BANNER`. The banner's `appName` is the sender; never "Stampeo".
  - The `allYouNeed` line closes the band.
- Then the demo, then pricing, FAQ, final CTA.

**Visual checks**
- No `PhoneScreenshot` on How-to.
- Any page with `PhoneScreenshot` prints `SHARED.sampleData` under it (stage B and C), and a test pins this.

**Don't touch**
- `components/landing-variant/`, `messages/`, `lib/seo/sitemap.ts`, `lib/llms-txt.ts`, `PricingSection`.

## Tests to write (bun:test, pure functions or source scans; there is no component runner)

**`lib/landing-pages/pages.test.ts`**
- AC1:
  - Exactly three slugs: `how-it-works`, `features`, `outcomes`.
  - Section ids are unique, with at most 8 per page. How-to has 6, Features 8, Outcomes 8, in the plan's order.
  - Each `app/[locale]/us/landing-pages/<slug>/page.tsx` exists.
  - Each page's source renders every registry section id as `data-landing-section` exactly once (scan the page and the components it imports; a small import-follower like the one in `consent-routes.test.ts` is fine).
  - Use `test.todo` for the Features and Outcomes middle sections until stages B and C.
- AC2: every page's section list ends with `pricing`, `faq`, `final_cta`, and every page's source imports the shared `LpFaq`, `LpFinalCta` and `PricingSection`.
- AC3:
  - The metadata builder returns `robots` equal to `NOINDEX` and a non-empty title and description for each slug.
  - `buildSitemap()` and `buildLlmsTxt(…)` output contain no `landing-pages`. Check `buildLlmsTxt`'s signature before calling it.
- AC4:
  - Variants are exactly `lp_howto`, `lp_features`, `lp_outcomes`, unique, each at most `MAX_FIELD` long (import it from where `lib/attribution/source.ts` imports it).
  - Each page's source mounts `LandingTracker` with its registry variant (via the shell's prop).
- AC5:
  - In `components/landing-pages/**` and the three page files, every `trackAs="…"` value is one of `hero`, `feature_cta`, `final_cta`, `faq_contact`.
  - `hero_demo` appears nowhere.
  - The hero contains an `href="#demo"` anchor.
- AC6:
  - The proof is built from `variant.metrics.items`.
  - The two items used have labels matching /business/i and /countr/i.
  - No `120+` or `25+` literal appears in `components/landing-pages/**` or `lib/landing-pages/**`.
- AC9: every file in `components/landing-pages/**` that renders `PhoneScreenshot` also references `sampleData`.
- AC14: no `QRCode` component that renders a real code (check what `HeroDemo` uses, e.g. `qrcode.react`) is imported under `components/landing-pages/**`.
- AC16: run `git diff --name-only origin/dev` in a test helper, or leave this to your report. Don't write a flaky git test; put it in the report.

**`lib/landing-pages/copy.test.ts`**
- Walk every string in the copy modules recursively, keeping each string's path (e.g. `OUTCOMES.regulars.example.text`).
- AC10:
  - Shared guards: no-card claim and worded trial length.
    - Extract `NO_CARD_CLAIM` and `WORDED_TRIAL` from `lib/i18n-catalogs.test.ts` into `lib/copy-claim-guards.ts`, exported, and import them in BOTH tests. The catalog test must keep passing unchanged in behaviour.
  - No em dash (U+2014) and no en dash used as a dash. An en dash between figures may stay; there are none, so simply ban U+2014.
  - No /remind/i, /offline/i, /\bminutes?\b/i, /\blevels?\b/i.
  - "punch" only in "punch card(s)".
  - Every `Banner.sender` is not "Stampeo".
  - Any string matching /broadcast/i sits on an allowlisted path whose component prints `SHARED.broadcastPlans`: `FEATURES.messages.broadcast` and `OUTCOMES.slowDays.lead`. Assert the allowlist exactly, so a new broadcast mention fails until someone decides where its plan label goes.
- AC11: hero `h1` ≤ 46, hero `sub` ≤ 90, every section `title` ≤ 44 (except the final CTA title, ≤ 36), every `lead` ≤ 85, lists ≤ 3 items. `accent` is a substring of its `h1` / `title`.
- AC12: every `SourcedFigure` has non-empty `text` and `source`. The components must render `source`; pin this with a source scan in stages B and C (note it in your report).
- AC13:
  - No `$` anywhere except `OUTCOMES.regulars.example.text`.
  - No digit followed by "day"/"days" (the trial is `{trialDays}`).
  - `{trialDays}` appears in `SHARED.reassurance`.

## Verify before you report

```bash
bun test lib scripts        # all green except the declared todos
bun run type-check
bun run lint
```

- Then run the dev server ONCE in the worktree (`bun run dev`, port 3001). If 3001 is taken, run `bunx next dev -p 3011` and say which.
- Load `/us/landing-pages/how-it-works` and screenshot it at 390x844 and 1440x900. The Playwright MCP may be held by another session; if so, use headless Chromium from `/Users/harryviennot/LocalDocuments/fidelity/promo-videos/node_modules/playwright`.
- Save the PNGs under `docs/features/STA-546/shots/stage-a/` and LOOK at them. Check: H1, sub and CTA above the fold at 390; the whole hero visual above the fold at 1440; no horizontal scroll; nothing overlapping.
- Fix what you see. Then stop the dev server.
- Do NOT run `bun run build` while dev runs. Run it once at the end, after stopping dev.
- `next dev` rewrites `AGENTS.md`: restore it with `git checkout AGENTS.md`. Never commit that change.

## Commit

- Commit on `feat/sta-546-landing-variants`, tests first in their own commit, then the implementation in one or a few commits.
- Messages: `test(STA-546): …` / `feat(STA-546): …`.
- **No Co-Authored-By trailer** (repo owner's rule).

## Report back

- What you built, file list and diff stat.
- Test counts.
- Type-check, lint and build results.
- The screenshot paths and what you saw and fixed.
- Any string you could not place.
- Any deviation from the brief, with the reason.
- The AC16 file-list check.
