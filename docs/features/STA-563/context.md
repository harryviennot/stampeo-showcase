# STA-563 context: Platform + its previews in fr / en / es / pl

**Goal.** The Platform page (`/us/landing-pages/platform`) and its 7 previews (`/us/landing-pages/platform/<slug>`) also serve at
`/landing-pages/platform[/<slug>]` (fr, unprefixed), `/en/…`, `/es/…`, `/pl/…`, international market (EUR, 30-day trial).
`/us/…` keeps US English, USD, 14 days, "punch card". All stay `noindex`. Lane: sketch (tests at harden).

**Branch / worktree.** `feat/sta-563-platform-i18n` in `showcase/.claude/worktrees/sta-563`, stacked on `feat/sta-552-feature-previews`
(other sessions still work on STA-552 in `worktrees/sta-552`: never touch that worktree). Dev server: `bunx next dev -p 3201` from the worktree.
URLs: http://localhost:3201/landing-pages/platform, /en/…, /es/…, /pl/…, /us/landing-pages/platform.

**Copy model.**
- English source: `lib/landing-pages/copy/{platform,shared,program-types}.ts` + `copy/previews/*.ts` (plus `types.ts`, `widen.ts`).
- `copy/bundle.ts`: `EN` groups the modules; `LandingCopy = Widen<typeof EN>` (every string widened, `key`/`program` stay literal);
  `landingCopy(locale)` and `useLandingCopy()` (next-intl `useLocale()`, works in server components and under the test providers).
- Translations: `copy/{fr,es,pl}/` mirror the English files one to one (same file names, same export names), and
  `copy/<l>/index.ts` exports the bundle (`FR`, `ES`, `PL`) `satisfies LandingCopy`. Brand names (Aurevo, Wrenfold, Gaspard & Gus,
  Vanity, Fournée, Marginalia…) are never translated.
- A component reads `const { PLATFORM } = useLandingCopy().platform;` instead of importing `PLATFORM`. Client components
  (`"use client"`) never import the bundle (it holds every language): their server parent passes the strings as props.

**Rules for the words** (skill `stampeo-copywriting`, read it): native, not translated; FR vous + spaced `: ; ! ?`, ES tú + `¿ ¡`,
PL ty + gender-neutral + four plural forms; no em dashes; locked vocab. Reuse the live catalogs' wording in each language
(`messages/<l>/landing.json`, `features.json`, `loyalty.json`, `pricing.json`). Feature names follow the live feature pages:
FR "Campagnes promotionnelles" (messages are "diffusions"), ES "Difusiones promocionales", PL "Rozsyłki promocyjne".
Notification banners must match `backend/app/services/programs/notification_defaults.py` for that language.
Prices and the trial length are never written: `{trialDays}` and price tokens stay as tokens.

**Reuse.** `PricingSection market=…`, `RegionPricingProvider`, `Header`/`Footer` (`market`, `featureLinks`), `landingShot(locale, …)`,
`ScannerLoop` (per-locale videos), `getAllPosts(locale)`, `lib/landing-pages/preview-nav.ts`, `MarketLink`, `@/i18n/navigation` `Link`.

**Traps.**
- `/us/*` is rewritten to `/en/us/*` (proxy.ts `isPilotPath`): on /us pages `useLocale()` is "en".
- Tests render with `renderEn`/`renderIn` (lib/testing/render-en.tsx) and `mockEnglishServerTranslations`; `bun test -u -t <name>`
  rewrites a snapshot file with ONLY that block: never run it blind, restore from HEAD and splice.
- Copy guards in `lib/landing-pages/copy.test.ts` cap lengths for English (h1 46, titles 44, leads 85, band 36, sub 90) and ban
  "remind", "minutes", stray "%"; "tiers" only in the loyalty preview's meta + one FAQ.
- The site's `next dev` can die on the security-upgrade nudge: just restart it.
- Polish glyphs: fonts load `latin-ext`; check the handwritten numbers and any other font on /pl screenshots.
