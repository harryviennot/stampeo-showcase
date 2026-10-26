BRANCH: `feat/sta-519-analytics-feature-page` (showcase, stacked on `feat/sta-514-landing-refresh`) · `feat/sta-519-capture-views` (promo-videos, AF-12 only)
SCOPES: showcase, promo-videos
ENVIRONMENT: **dev only.** Public pages: no migration, no backend change. AF-12 signs in to the dev dashboard as a seeded fixture and only reads.

# Feature pages test pass

The `/features/*` pages. This round covers the Analytics page (`/features/analytiques`, `/en/features/analytics`, `/es/features/estadisticas`, `/pl/features/statystyki`): its new hero, the "When they come" row, the activity feed, the chart grid's plan pills, and the search snippet. Work top to bottom; AF-01 gates the rest.

---

## SETUP: Before you start

Everything below is read-only.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app/<locale>/features/<slug>` (`bun run publicdev`) | Layout checks. |
| Showcase (production build) | `bun run build && npx next start -p <port>`, with `.env.local` then `.env.public` exported | AF-08 only: dev-mode React is slow and its numbers mean nothing. |
| Capture tool | `bun --env-file=.env.tools tools/screens/landing-shots.ts` in `promo-videos/` | AF-12 only. |

### Accounts

No session for AF-01 to AF-11. AF-12 uses the dev fixture `camille@aurevo.seed.stampeo.app` (Aurevo, café, Growth, stamp card; password convention `StampeoSeed!2026`, already in `promo-videos/.env.tools`).

### Reset recipes

**R1: forget the language and cookie choices** (before any case that names a locale or the cookie banner)

Clear site data for the showcase origin (DevTools → Application → Storage → Clear site data).

### Known state before you start

- **New this round (STA-519):** the hero (real capture, new headline, plan line), "When they come" (real Busiest times capture, replaces the "Starter Plan" mock), the activity feed matched to the dashboard's Activity page, the chart grid's pills, the search title/description, llms.txt.
- **The chart grid stays illustrative** (Harry's call): its cards are drawings, not captures, and three of them ("Avg time to complete card", "Completion rate", "Post-reward return") are charts the product does not have yet. Their pill says "Growth" by Harry's explicit decision; AF-07 checks the pills match that decision, not that the charts exist.
- **The captures** come from the Aurevo fixture at 90 days, through web at `origin/main` (what customers see).
- **At 390 the busiest image loads with the page** although it is lazy: it sits within Chrome's own lazy-load distance. Expected.

---

## AF: Analytics feature page

### AF-01: The hero shows the real product [BLOCKER]

| Field | Content |
|---|---|
| WHY | The page sold Analytics with a text-only hero and invented mocks; the hero is now the real page. If the capture is missing or another locale's, the page lies in a new way. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R1. 2. Open the four URLs at 390 and 1440. |
| EXPECT | A phone frame showing the locale's Analytics page scrolled to "How often they come" over "Reward progress" (FR "À quel rythme ils viennent" / "Progression des cartes", ES "Cada cuánto vienen", PL "Jak często przychodzą"), cropped at the bottom with a soft fade, and under it the line naming the Growth plan and that charts come with Growth and Pro. You do NOT see an English capture on fr/es/pl, a "app.stampeo.app" mock, or invented customer rows. |
| RESET | None. |

### AF-02: Headline first on a phone [CORE]

| Field | Content |
|---|---|
| WHY | Phone visitors from ads must read the promise and reach the button before the cookie banner covers the bottom of the screen. |
| DEPENDS | AF-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R1. 2. Each locale at 390×844, first load, cookie banner showing. |
| EXPECT | Headline (3 lines at most), subtitle, then the "Start free" button fully visible above the banner, then the phone starting below it. The page does not scroll sideways. You do NOT see the phone before the headline, or the button under the banner. |
| RESET | None. |

### AF-03: Split hero on desktop [CORE]

| Field | Content |
|---|---|
| WHY | The sibling feature pages' layout; the whole picture and its plan line must be visible without scrolling. |
| DEPENDS | AF-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Each locale at 1440×900 and 1024×768. |
| EXPECT | Text left (headline, subtitle, button), phone right with the plan line under it, all inside the first screen. The headline is 2 lines at 1440. You do NOT see the plan line cut by the fold, or the phone overlapping the text. |
| RESET | None. |

### AF-04: The copy says what Analytics shows [CORE]

| Field | Content |
|---|---|
| WHY | Analytics shows totals and refreshes every ten minutes. A per-customer promise, a prediction, money, or "live" beside it is a claim the product does not keep. |
| DEPENDS | AF-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Read the hero, the "When they come" row, the problem cards, and the image alt texts in each locale. 2. In each locale, view source and read `<title>` and the meta description. |
| EXPECT | The headline is about customers as a group (how often they come back); the problem cards ask "How many stopped coming" (and translations), not who. The title reads like "Loyalty Analytics: How Often Customers Come Back" (FR "Statistiques fidélité : fréquence et retours"), and the description starts "Fed by every scan" (FR "Nourri par chaque scan"). You do NOT see "Know your regulars", "who comes back", "who drifts" / "qui décroche" / "quién se aleja" / "kto nie", "real-time" / "en direct" / "en tiempo real" / "na żywo" about Analytics, money, or a prediction. |
| RESET | None. |

### AF-05: "When they come" is the real Busiest times [CORE]

| Field | Content |
|---|---|
| WHY | It answers the problem section's "Which day is quietest" with the real section, and says honestly what Starter gets. |
| DEPENDS | AF-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Each locale at 390 and 1440, scroll past the problem cards. |
| EXPECT | A heading, a lead naming the day × hour grid, the busiest slot and the quietest open hour, ending with Starter getting the busiest hour in a sentence and Growth and Pro the grid; a phone with the locale's real Busiest times card. Stacked on a phone (text, then phone), side by side from 1024. You do NOT see the old "Starter Plan / The essentials to get started" mock anywhere on the page. |
| RESET | None. |

### AF-06: The activity feed matches the dashboard [EDGE]

| Field | Content |
|---|---|
| WHY | The dashboard's Activity page really is live; the illustration must use its words, not invent a seconds counter or sign-ups. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Each locale, watch the feed for 15 seconds. |
| EXPECT | Header "Activity" with an accent-coloured dot and "Live" (FR "Activité" / "En direct", ES "Actividad" / "En directo", PL "Aktywność" / "Na żywo"); rows read "received a stamp", "redeemed a reward", "added their card" (and translations), each labelled "Just now". You do NOT see a counter in seconds ("3s ago"), "signed up", or a green dot. |
| RESET | None. |

### AF-07: The chart grid's pills [CORE]

| Field | Content |
|---|---|
| WHY | The pills said "Pro" on charts Growth has, under an "Every plan" badge. They now follow the plan facts and Harry's call. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Each locale at 390 (three cards show) and 1440 (nine cards). |
| EXPECT | "30d retention" says "Every plan" (the locale's wording); every other card says "Growth", including "Avg time to complete card", "Completion rate" and "Post-reward return". You do NOT see "Pro" on any card, or a pill colliding with or wrapping into the card's title. |
| RESET | None. |

### AF-08: The hero loads first [EDGE]

| Field | Content |
|---|---|
| WHY | The hero image is above the fold here; it must be fetched first and never wait for scroll animations. |
| DEPENDS | AF-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Production build. 2. Lighthouse mobile and desktop on `/en/features/analytics` and `/features/analytiques`. 3. In the Elements panel, inspect the hero `<img>`. |
| EXPECT | LCP ≤ 2.5 s (mobile), the LCP element being the hero image or the headline; CLS ≤ 0.1 with no shift from the hero. The hero `<img>` has `loading="eager"` and `fetchpriority="high"` and is the only one with it. You do NOT see the hero fade or slide in. |
| RESET | None. |

### AF-09: No raw keys anywhere [BLOCKER]

| Field | Content |
|---|---|
| WHY | The page dropped strings (the old mock, the unused sections list); a component still reading one would show its key path in prod. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Each locale: Cmd+F for `features.analytiques`. |
| EXPECT | No match on any of the four pages. |
| RESET | None. |

### AF-10: The landing's phone is unchanged [EDGE]

| Field | Content |
|---|---|
| WHY | The landing's dashboard section now uses the same `PhoneScreenshot`; it must look exactly as it did (verified pixel-identical at 390/768/1440 on 2026-10-26). |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `/en` at 390 and 1440: the dashboard section's phone. |
| EXPECT | The phone capture, warm status-bar background running into it, soft fade at its bottom. You do NOT see a grey stripe under the status bar or a hard cut at the bottom. |
| RESET | None. |

### AF-11: Reduced motion [EDGE]

| Field | Content |
|---|---|
| WHY | Body sections use scroll reveals; with reduced motion they must simply be there. The hero has none. |
| DEPENDS | AF-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. DevTools → Rendering → prefers-reduced-motion: reduce. 2. Scroll the page at 390 and 1440. |
| EXPECT | Every section and both phones are fully visible at once. You do NOT see an empty gap where a section should be. |
| RESET | None. |

### AF-12: The two views re-shoot with one command [EDGE]

| Field | Content |
|---|---|
| WHY | The captures go stale when the Analytics page changes. |
| DEPENDS | none |
| ACCOUNT | `camille@aurevo.seed.stampeo.app` (read via `.env.tools`). |
| STEPS | 1. Showcase on `bun run publicdev` and web dev up (or `SHOWCASE_ORIGIN` / `APP_ORIGIN` pointing at local `next start` builds). 2. In `promo-videos/`: `bun --env-file=.env.tools tools/screens/landing-shots.ts --out=/tmp/shots --locales=es --views=habits,busiest`. 3. `... --views=habits --sizes=desktop`. 4. In `showcase/`: `bun test lib/landing/dashboard-shots.test.ts`. |
| EXPECT | Step 2 writes `es-phone-habits.png` and `es-phone-busiest.png` (1206×2622), the Spanish page scrolled to "Cada cuánto vienen" + "Progreso hacia la recompensa" and to "Horas punta", nothing tapped, no banner or dialog. Step 3 refuses (the views are phone captures). The test passes on the committed files. You do NOT see the login page in an image. |
| RESET | None. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first. Then top to bottom; BLOCKER cases first unless DEPENDS forces otherwise.
2. **On BLOCKER failure:** stop. AF-01 and AF-09 gate the release.
3. **On CORE failure:** write a failure report, skip only its dependents, continue the run.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS with what you saw, so the runbook gets fixed.
6. **After any failure:** run the case's RESET before retrying or moving on.
7. **Reporting:** one failure report per failed case (failure-report-template.md). Reference cases only by ID.
8. **Re-runs after fixes:** the failed case, its dependents, and anything in "Known state" marked for re-verification. Nothing else.
