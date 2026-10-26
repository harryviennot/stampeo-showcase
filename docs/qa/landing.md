BRANCH: `feat/sta-514-landing-refresh` (showcase) · `feat/sta-514-landing-shots` (promo-videos, LD-14 only)
SCOPES: showcase, promo-videos
ENVIRONMENT: **dev only.** Public pages: no migration, no backend change, nothing written anywhere. LD-14 signs in to the dev dashboard as a seeded fixture and only reads.

# Landing page test pass

The main landing (`/`, `/en`, `/es`, `/pl`, and the `/uk` and `/us` market pages built on it): the real Analytics captures under the hero, the numbers strip, the feature grid and the sector cards. Work top to bottom. LD-01 and LD-11 gate the release: if either fails, stop.

---

## SETUP: Before you start

Everything below is read-only. The `/us` market specifics (trial line, US copy, SEO directives) have their own runbook, `docs/qa/us-market-landing.md`; this one only checks that the shared sections behave there too.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app/` (`bun run publicdev` in `showcase/`) | Plain `bun run dev` breaks the login hand-off (LD-14) but the landing itself renders either way. |
| Showcase (production build) | `bun run build && npx next start -p 3011`, with `.env.local` then `.env.public` exported | Needed for LD-13: dev-mode React is slow and its numbers mean nothing. |
| Capture tool | `bun --env-file=.env.tools tools/screens/landing-shots.ts` in `promo-videos/` | LD-14 only. |

### Accounts

No session for LD-01 to LD-13: these are public pages. LD-14 uses the dev fixture below (password convention `StampeoSeed!2026`, already in `promo-videos/.env.tools` as `FIXTURE_PASSWORD`).

| Use for | Account | Business / State |
|---|---|---|
| LD-14 | `camille@aurevo.seed.stampeo.app` | Aurevo, café, Growth, stamp card, admin |

### Reset recipes

**R1: forget the language and cookie choices** (before any case that names a locale or the cookie banner)

Clear site data for `showcase.dev.stampeo.app` (DevTools → Application → Storage → Clear site data). This drops the `NEXT_LOCALE` cookie, which would otherwise redirect `/` to the last language visited.

### Known state before you start

- **New this round (STA-514):** the dashboard section right after the hero, the numbers strip refresh, the location-notification copy, the Geolocation "Soon" pill, and the hero cards back to the year-round set.
- **The captures show the 90-day view.** The Aurevo fixture was seeded around 20 Oct 2026, so its last days are empty and the 30-day view led with a red ▼25%. If the fixture is reseeded, re-shoot with LD-14 and look again.
- **Known misses, pending Harry's waiver (they fail LD-04 / LD-13 until waived):**
  - At 1440×900 the browser bar plus ~14px of screenshot show above the fold on `/en`, `/es`, `/pl`; on `/` only the bar (13px of it below the fold), on `/us` (extra trial line) only part of it. The plan says report, not shrink the hero further. A real 1440×900 laptop's own toolbars take ~110px, so the peek is a 1080p-and-up effect.
  - At 1920×1080 the desktop capture, not the hero, is the LCP element. It painted at ~870ms with Fast 4G and 4x CPU slowdown (2026-10-26), earlier than the hero's own LCP at 1440. The plan's remedy (an eager ≥768 `<picture>` source) was not built because of that timing.
- **Hero season:** LD-12 depends on the release date. The year-round cards ship in their own commit, held back if the release goes out before 1 Nov.

---

## LD: Landing

### LD-01: The dashboard is the second section, and appears once [BLOCKER]

| Field | Content |
|---|---|
| WHY | The whole point of the change: the hero shows the customer's card, the next section the business's dashboard. A second copy further down means the old mock came back. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R1. 2. Open `/`, `/en`, `/es`, `/pl`, `/uk`, `/us` at 1440 wide. 3. Scroll from the hero down to "Three reasons" (or its translation). |
| EXPECT | Hero, then the dashboard section (browser frame + phone), then the "Made in Europe · GDPR" strip, then Benefits. On `/us`: hero, dashboard, Benefits, with NO trust strip. You do NOT see a second dashboard picture anywhere further down the page, and you do NOT see the old mock (invented "1,234 customers", "Sophie M.", "Sophie's coming back tomorrow"). |
| RESET | None. |

### LD-02: Each language shows its own dashboard [CORE]

| Field | Content |
|---|---|
| WHY | A French visitor shown an English dashboard reads "this isn't for me". Each locale has its own captures. |
| DEPENDS | LD-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Open `/`, `/en`, `/es`, `/pl` at 1440 wide and at 390 wide. 2. Read the page title inside the screenshot and the phone. |
| EXPECT | `/` shows "Statistiques", `/es` "Estadísticas", `/pl` "Statystyki", `/en` (and `/us`, `/uk`) "Analytics", in both the browser frame and the phone. Numbers are formatted the locale's way inside the capture ("1906" in fr/pl, "1,906" in en). You do NOT see an English dashboard on `/`, `/es` or `/pl`, and you do NOT see any customer name or money amount in either image. |
| RESET | None. |

### LD-03: On a phone, only the phone [CORE]

| Field | Content |
|---|---|
| WHY | 90% of visitors from ads are on a phone. A desktop screenshot shrunk to 358px is unreadable and costs a download for nothing. |
| DEPENDS | LD-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R1. 2. DevTools device mode at 390×844, Network tab filtered on `dashboard`. 3. Open `/en` and scroll through the section. 4. Repeat on `/`, `/es`, `/pl`. |
| EXPECT | Heading, caption (three lines at most), the iPhone with the phone capture below its status bar, the plan line under it, then three check-marked points. The Network tab shows `<locale>-phone.png` only. You do NOT see a browser frame, you do NOT see the handwritten note, the Network tab does NOT show a `-desktop.png`, and no locale's page scrolls sideways. |
| RESET | None. |

### LD-04: The frame peeks above the fold on desktop [EDGE]

| Field | Content |
|---|---|
| WHY | The Linear/Cursor trick: the top of the product shot at the bottom of the first screen pulls the scroll. |
| DEPENDS | LD-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R1. 2. Window at 1920×1080, then 1440×900 (DevTools responsive). 3. Load `/en`, `/es`, `/pl`, `/`, `/us` without scrolling. |
| EXPECT | At 1920×1080 and at 1440×900: the browser bar and the top edge of the screenshot are visible on every page without scrolling. You do NOT see the hero's wallet badges touching or overlapped by the frame. (Known misses at 1440×900 on `/` and `/us`: see Known state.) |
| RESET | None. |

### LD-05: The section says only what the picture shows [CORE]

| Field | Content |
|---|---|
| WHY | Analytics shows totals, on Growth. Copy that predicts one customer's return, mentions money, or sells Pro-only charts beside a Growth screenshot is a promise the product does not keep. |
| DEPENDS | LD-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Read the heading, caption, three points, the line under the image, and the image alt text (inspect the two `<img>`) on all four locales. |
| EXPECT | The points name visits / new customers / 30-day return rate, visits over time with 90 days of history, and busiest times. The line under the image names the Growth plan and says charts come with Growth and Pro. You do NOT see "Starter" in that line, any prediction ("will come back", "revient demain"), any money or spend, "cohorts", "per location", "1 year", or "export". |
| RESET | None. |

### LD-06: The phone never covers a number [EDGE]

| Field | Content |
|---|---|
| WHY | The KPI row is the most legible part of the capture; the overlapping phone must hang below it. |
| DEPENDS | LD-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Open `/en`, `/`, `/es`, `/pl` at 768, 1024 and 1440 wide. 2. Look where the phone's top edge sits against the capture (the es/pl KPI labels are the longest). |
| EXPECT | The phone's top is below the three KPI cards (Visits, New customers, 30-day return rate) at every width; it covers at most the right-hand columns of the "Busiest times" grid. You do NOT see the phone over any KPI figure or its line under it, and it does NOT stick out past the page's right margin. |
| RESET | None. |

### LD-07: The handwritten note points at the phone [EDGE]

| Field | Content |
|---|---|
| WHY | It answers "is the phone a separate app?". It must point at the phone, not into the screenshot. |
| DEPENDS | LD-06 |
| ACCOUNT | No session at all. |
| STEPS | 1. Open `/en`, `/`, `/es`, `/pl` at 768, 1024, 1280 and 1440 wide. 2. Scroll the section into view and wait a second for the arrow to draw. |
| EXPECT | One handwritten note under the browser frame, left of the phone, with a drawn arrow pointing right at it ("same dashboard, in your pocket" and its translations). You do NOT see the note overlapping the phone, the frame, or the plan line, you do NOT see an undrawn (invisible) arrow, and you do NOT see the note at 390. |
| RESET | None. |

### LD-08: The numbers strip is current, and the same everywhere [CORE]

| Field | Content |
|---|---|
| WHY | Hand-maintained social proof: a locale left on old figures, or a figure that wraps, undermines the numbers beside it. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Open each locale at 390 and 1440 and find "Where Stampeo stands today" (and translations). |
| EXPECT | en `120+ · 20,000+ · 25+`; fr `+120 · +20 000 · +25`; es `+120 · +20.000 · +25`; pl `+120 · +20 000 · +25` with the label `krajów`. Each figure sits on one line at 390. You do NOT see 12,500 or 22 anywhere, and you do NOT see `kraje` under 25. |
| RESET | None. |

### LD-09: No location-notification promise [CORE]

| Field | Content |
|---|---|
| WHY | Wallet passes carry no locations today; promising a notification when a customer walks past the shop sells a feature that is off. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. In each locale, open the sector carousel ("Stampeo adapts to your business") on the barbershop slide. 2. Search the page (Cmd+F) for "walk", "passe", "pasa", "przechodz". |
| EXPECT | The barbershop card's check line reads "Card added in one scan, no app to download" (fr "Carte ajoutée en un scan, aucune appli à télécharger", es "Tarjeta guardada con un escaneo, sin aplicación que descargar", pl "Karta dodana jednym skanem, bez aplikacji do pobrania"). You do NOT find "walks past", "walk by", "passe devant", "passent à côté", "pasa por delante", "pasan al lado" or "przechodzi obok" anywhere on the landing. |
| RESET | None. |

### LD-10: The Geolocation tile says "Soon" [CORE]

| Field | Content |
|---|---|
| WHY | The tile stays (all six feature pages are in the grid) but must not read as live. The pill uses the pricing table's word so the site says one thing. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. In each locale at 390 and 1440, find "Everything you need to build loyalty". 2. Tap the Geolocation tile. |
| EXPECT | A grey "Soon" / "Bientôt" / "Pronto" / "Wkrótce" pill top-right of the Geolocation tile, at both widths; at 1440 its description is in the future tense ("Your card will show on their lock screen near your shop."). The tile opens the geolocation feature page. You do NOT see a pill on any other tile, the tile is NOT dimmed, and no tile's icon, title or spacing differs from production (all six share the new icon row). |
| RESET | None. |

### LD-11: /features/analytics still renders its text [BLOCKER]

| Field | Content |
|---|---|
| WHY | That page still reads seven strings from the landing's old dashboard group. A deleted key shows as a raw key path in prod, and no catalog test catches a key deleted in all four languages at once. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Open `/features/analytiques`, `/en/features/analytics`, `/es/features/estadisticas`, `/pl/features/statystyki`. 2. Scroll to its dashboard mock. |
| EXPECT | Stat labels ("Total Customers", "Visits This Week", "Rewards Claimed"), "Recent customers", "Progress", "Visited today", "Almost!" (and translations) render as text. You do NOT see any string starting with `landing.dashboard.`. |
| RESET | None. |

### LD-12: Year-round hero cards after Halloween [CORE]

| Field | Content |
|---|---|
| WHY | The hero's card set is a manual switch that only changes on deploy; Halloween cards in November look abandoned. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. On a build released on or after 1 Nov 2026, open `/` and `/en` at 390 and 1440. |
| EXPECT | The arch shows the year-round brands (Aurevo at the apex, Lustre, Gelo, Marginalia, PACE…). You do NOT see pumpkins, ghosts or the "Smash Club" Halloween card. On a build released before 1 Nov, the Halloween set is expected and this case is N/A. |
| RESET | None. |

### LD-13: The section costs nothing at load [EDGE]

| Field | Content |
|---|---|
| WHY | The section sits at the fold; it must not shift the page or hold up the first paint. |
| DEPENDS | LD-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Production build (see Where things live). 2. Lighthouse (navigation, mobile then desktop) on `/en`, and DevTools Performance at 1920×1080. |
| EXPECT | CLS 0.00 attributed to this section. LCP stays in the hero on mobile, at 1440 and at 1920 (known miss at 1920: see Known state). You do NOT see the section jump when its images arrive. |
| RESET | None. |

### LD-14: The captures re-shoot with one command [EDGE]

| Field | Content |
|---|---|
| WHY | The screenshots go stale whenever the Analytics page changes; re-shooting must not need anyone's memory. |
| DEPENDS | none |
| ACCOUNT | `camille@aurevo.seed.stampeo.app` (read via `.env.tools`). |
| STEPS | 1. Showcase dev server on `bun run publicdev` (or a local `next start` and `SHOWCASE_ORIGIN=http://localhost:<port>`). 2. In `promo-videos/`: `bun --env-file=.env.tools tools/screens/landing-shots.ts --out=/tmp/shots --locales=pl,es`. 3. Open the four files. 4. From a promo-videos worktree, run it again without `--out`. 5. In `showcase/`: `bun test lib/landing/dashboard-shots.test.ts`. |
| EXPECT | `/tmp/shots/{pl,es}-phone.png` (1206×2622) and `-desktop.png` (2560×1600) exist: the Polish and Spanish Analytics page at 90 days, the desktop one showing the KPI row, Visits over time and Busiest times with no Pro cohorts preview in frame. No trial, over-limit or "What's new" banner or dialog over any of them. Step 4 refuses with a message asking for `--out`. The showcase test passes on the committed files. You do NOT see the login page in an image, and nothing is saved to the fixture's profile (its language stays what it was). |
| RESET | None. |

### LD-15: The other phones on the site [EDGE]

| Field | Content |
|---|---|
| WHY | `PhoneMockup` was replaced site-wide by the real iPhone (STA-520); the phones on the notification, geolocation and scanner pages must show their content inside it. Full check: AF-10 in `docs/qa/feature-pages.md`. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Open `/en/features/push-notifications` and `/en/features/geolocation` at 390 and 1440. |
| EXPECT | The lock screens and notifications sit inside the orange iPhone, their clocks below a white status bar without a time. You do NOT see a hand-drawn phone frame, a second island, or content cut by the status bar. |
| RESET | None. |

### LD-16: Reduced motion shows everything [EDGE]

| Field | Content |
|---|---|
| WHY | The phone and the handwritten note sit in scroll reveals; with reduced motion they must simply be there. |
| DEPENDS | LD-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce". 2. Open `/en` at 1440 and 390 and scroll to the section. |
| EXPECT | The phone, the note and its arrow (1440) are fully visible at once, with no slide or fade. You do NOT see an empty gap where the phone or note should be. |
| RESET | None. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first. Then top to bottom; BLOCKER cases first unless DEPENDS forces otherwise.
2. **On BLOCKER failure:** stop. LD-01 and LD-11 gate the release.
3. **On CORE failure:** write a failure report, skip only its dependents, continue the run.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS with what you saw, so the runbook gets fixed.
6. **After any failure:** run the case's RESET before retrying or moving on.
7. **Reporting:** one failure report per failed case (failure-report-template.md). Reference cases only by ID.
8. **Re-runs after fixes:** the failed case, its dependents, and anything in "Known state" marked for re-verification. Nothing else.
