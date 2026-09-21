BRANCH: feat/sta-330-region-detected-pricing
SCOPES: showcase
ENVIRONMENT: dev only (showcase.dev.stampeo.app or localhost:3001) — no migration, nothing touches prod

# Region-Detected Pricing Test Pass (STA-330)

Every price and trial-day number on the showcase must follow the visitor's
detected region, not the URL: a US-detected browser sees $ and "14 days" on
every page (even `/fr`, `/pl`, `/uk`); any other detected country sees € and
"30 days" everywhere (even on `/us`); an undetectable region falls back to the
page's own market default. Detection is timezone-first, so you spoof regions by
overriding the browser timezone (recipe R1). Work top to bottom: SETUP, then
RP (BLOCKER cases first), then AN (analytics non-regression), then EDGE.

---

## SETUP: Before you start

Everything below runs against dev. Nothing here touches production and no
migration ships with this branch. All pages under test are public marketing
pages — no login is required anywhere in this book.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app` | ISR pages cache 300s: after a deploy, force-refresh or expect up to 5 min staleness |
| Showcase (local) | `http://localhost:3001` | needed only for RP-15 (backend-down); never run `bun run build` while this dev server runs |
| Raw HTML check | `curl -s <url>` | for JSON-LD assertions — curl sees the server render, no JS |
| Pages under test | `/`, `/fr`, `/en`, `/es`, `/pl`, `/pricing`, `/us`, `/us/pricing`, `/uk`, `/programme-fondateur`, `/llms.txt` | `/fr` is the default locale and lives at `/` |

### Accounts

None. Every case runs logged-out ("No session at all"). Do not log in: an
authenticated session changes the Header auth slot and can confuse the
skeleton observations in RP-08.

### Reset recipes

Referenced by ID from the cases below.

**R1: Region spoof** (before every case that names a region)

Chrome DevTools → ⋮ → More tools → Sensors → Location. Pick or add a location
whose **timezone** matches the region (the timezone is what matters, not the
coordinates — detection is timezone-first):
- US spoof: timezone `America/New_York` (or `America/Chicago`, `America/Phoenix`)
- FR spoof: timezone `Europe/Paris`
- Unknown spoof: timezone override `Etc/UTC` AND browser language without a
  region subtag (chrome://settings/languages → move plain "English" to top), so
  the `navigator.language` fallback also yields nothing.

After changing the override, **hard reload** (Cmd+Shift+R) — detection runs at
hydration. Keep DevTools open for the whole case or the override drops.

**R2: Clean visitor** (between cases that assert first-visit behavior)

DevTools → Application → Storage → "Clear site data" (clears cookies incl.
`stampeo_market`, `stampeo_consent`, `stampeo_attribution`, `NEXT_LOCALE`, and
localStorage incl. the MarketSuggestion dismissal). Then hard reload.

**R3: Raw-HTML fetch** (JSON-LD cases)

`curl -s https://showcase.dev.stampeo.app/<path> | grep -o 'application/ld+json.\{0,2000\}'`
— or save the page and read the `<script type="application/ld+json">` blocks.

### Known state before you start

- **This runbook was written at plan time (2026-09-21), before implementation.**
  Run it only against a build of `feat/sta-330-region-detected-pricing` (or
  later). On current `dev`, RP-01..RP-08 will fail by design — that is the bug
  being fixed, not a finding.
- **Price surfaces to check in every currency case** (the list "all price
  surfaces" refers to): landing → hero reassurance line, differentiator items,
  try-it demo label, pricing cards (big price, billed-yearly sub-label, CTA
  subtext), final CTA subtitle + reassurance, FAQ answers; pricing page → tier
  cards, desktop comparison-table column headers, mobile tier dropdown prices,
  ROI calculator figures, pricing FAQ answers.
- **Trial-day expectations:** US region = 14, everything else = 30.
- **A dismissed MarketSuggestion banner persists in localStorage** — use R2 if a
  case expects the banner and it does not appear.
- **Untested until the next promo:** `PricingTierCard`'s held state suppresses
  the strikethrough discount pair (both numbers would be chips). No discount is
  active today (founding program closed 2026-08-04), so no case exercises it.
  When a promo next activates a discount, add a case: held card shows a single
  chip, resolved card shows the strikethrough pair in the region's currency.
- **HeroDemo and ROICalculator hold with "…" instead of chips** (their figures
  live inside strings that cannot hold an element — sanctioned by the plan's
  2026-09-21 amendment). A one-frame ellipsis there is expected, not a failure.

---

## RP: Region-driven pricing display

If RP-01 or RP-05 fails, the feature is not working; stop the section and file,
then continue with AN (analytics must hold regardless).

### RP-01: US visitor sees USD everywhere on the landing [BLOCKER]

| Field | Content |
|---|---|
| WHY | The core promise of STA-330: a US resident never sees EUR pricing, whatever page they are on. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R2, then R1 (US spoof). 2. Open `/`. 3. Read every price surface (see Known state list). 4. Repeat on `/en`, `/es`, `/pl`. |
| EXPECT | Every amount renders with `$` and every trial mention says 14. You do NOT see `€`, `zł`, or "30" as a trial length anywhere on the page. Copy language still matches the page locale (Polish text on `/pl` — only numbers changed). |
| RESET | None. |

### RP-02: US visitor sees USD on the pricing page [BLOCKER]

| Field | Content |
|---|---|
| WHY | The pricing page has four extra price surfaces (table headers, mobile dropdown, ROI, pricing FAQ) that each resolve independently — any one still on EUR is a mixed-currency page. |
| DEPENDS | RP-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R1 (US spoof). 2. Open `/pricing`. 3. Check tier cards, then the desktop comparison table headers (≥1024px window). 4. Resize to 390px: check the mobile tier dropdown prices. 5. Use the ROI calculator. 6. Expand pricing FAQ items. 7. Toggle monthly/yearly. |
| EXPECT | All amounts `$`, trial mentions 14, on both cadences and both viewports. You do NOT see any `€` amount anywhere, including inside FAQ answer sentences and ROI results. |
| RESET | None. |

### RP-03: Language switch keeps the region currency [BLOCKER]

| Field | Content |
|---|---|
| WHY | The reported bug: switching language (or clicking the logo from `/us`) used to drop a US visitor onto EUR pricing. |
| DEPENDS | RP-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R1 (US spoof). 2. Open `/us`. 3. Click the Stampeo logo in the header (lands on the international landing). 4. Use the language switcher: fr → en → pl. 5. Navigate to Pricing from the header on the last locale. |
| EXPECT | After every navigation, prices stay `$` and trial mentions stay 14. You do NOT see a EUR flash after the page settles (one skeleton frame is allowed, a `€` amount is not). |
| RESET | None. |

### RP-04: US visitor on /uk sees USD [CORE]

| Field | Content |
|---|---|
| WHY | `/uk` is a EUR/30 market page; resolution must key on the detected country, not the page market. |
| DEPENDS | RP-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R1 (US spoof). 2. Open `/uk`, then `/uk/pricing`. |
| EXPECT | `$` and 14 throughout. You do NOT see `€` or 30. |
| RESET | None. |

### RP-05: French visitor sees EUR on /us [BLOCKER]

| Field | Content |
|---|---|
| WHY | The symmetric half of the promise: region wins over the page in both directions — a French visitor browsing the US landing must get the terms they would actually be billed. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R2, then R1 (FR spoof). 2. Open `/us`, read all price surfaces. 3. Open `/us/pricing`, same. |
| EXPECT | Every amount `€`, every trial mention 30. US English copy remains (only numbers differ). You do NOT see `$` or 14 anywhere. |
| RESET | None. |

### RP-06: French visitor baseline unchanged [CORE]

| Field | Content |
|---|---|
| WHY | Regression guard: the majority path (EU visitor on EU pages) must look exactly as before the change. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R1 (FR spoof). 2. Open `/` and `/pricing`, read all price surfaces. |
| EXPECT | `€` and 30 throughout, amounts identical to production today (Starter 20/mo ladder). You do NOT see `$`, 14, or any skeleton chip that never resolves. |
| RESET | None. |

### RP-07: Undetectable region falls back to the page market [CORE]

| Field | Content |
|---|---|
| WHY | The null-detection branch: an unmapped timezone plus a regionless language must degrade to today's per-page behavior, never to a blank or a wrong guess. |
| DEPENDS | RP-01, RP-05 |
| ACCOUNT | No session at all. |
| STEPS | 1. R2, then R1 (Unknown spoof — `Etc/UTC` + regionless language). 2. Open `/` and read the pricing section. 3. Open `/us` and read the pricing section. |
| EXPECT | `/` shows `€` + 30; `/us` shows `$` + 14 (each page's own market default). You do NOT see indefinitely-pulsing skeletons — every chip resolves to a number. |
| RESET | Restore your real language settings (chrome://settings/languages). |

### RP-08: Skeleton hold, no wrong-currency flash, no layout jump [CORE]

| Field | Content |
|---|---|
| WHY | The user chose hold-until-detected over a flash of the page-default currency; the chips must also not shift layout (CLS) when they resolve. |
| DEPENDS | RP-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R1 (US spoof). 2. DevTools → Performance → CPU: 6x slowdown. 3. Hard-reload `/pricing` and watch the tier cards during load. 4. Watch card heights as chips resolve. 5. Disable JS (DevTools → Cmd+Shift+P → "Disable JavaScript"), reload once, observe; re-enable JS. |
| EXPECT | During load, price slots show small pulsing chips inline with the text; the rest of each card (name, features, CTA) is fully rendered. Chips resolve to `$` amounts. Card heights do NOT change when chips resolve, and at no point does a `€` amount appear before the `$` one. With JS disabled, chips remain (accepted trade-off — this is not a failure, note it only if actual amounts render wrong instead). |
| RESET | CPU throttle off, JS re-enabled. |

### RP-09: JSON-LD keeps the market default [CORE]

| Field | Content |
|---|---|
| WHY | Crawler-facing structured data deliberately stays per-URL; region detection must never leak into it, and FAQ JSON-LD must stay interpolated (a literal `{starterPrice}` shipped to Google once before). |
| DEPENDS | none |
| ACCOUNT | No session at all (curl). |
| STEPS | 1. R3 on `/`. 2. R3 on `/us`. 3. In each, read the SoftwareApplication offers and the FAQPage answers. |
| EXPECT | `/` JSON-LD quotes EUR amounts; `/us` JSON-LD quotes USD amounts. FAQ JSON-LD answers contain real numbers and do NOT contain the literal text `{starterPrice}`, `{trialDays}`, or any other `{...}` token. The visible-HTML price slots in the curl output contain skeleton markup, not amounts — that is expected. |
| RESET | None. |

### RP-10: MarketSuggestion banner still offered [CORE]

| Field | Content |
|---|---|
| WHY | The banner is the only remaining navigation affordance to `/us` copy; the region-pricing change must not have broken or hidden it. |
| DEPENDS | RP-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R2 (the banner dismissal lives in localStorage), then R1 (US spoof). 2. Open `/` and scroll to the pricing section. |
| EXPECT | The suggestion banner appears above the price cards offering the US page. You do NOT get the banner on `/us` itself. |
| RESET | None. |

---

## AN: Analytics & consent non-regression

Run all of these regardless of RP outcomes. They protect GA4/Meta identity,
consent, and attribution — the explicitly stated user concern. You need the
Meta Pixel Helper extension and access to GA4 DebugView on the dev property.

### AN-01: Locale switch does not mint a new tracked user [BLOCKER]

| Field | Content |
|---|---|
| WHY | The direct user fear: changing language (or the region swap itself) must not re-identify the visitor in GA or Meta. Identity lives in `_ga`/`_fbp` cookies; a re-init or cookie change here means every locale switch inflates user counts. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R2, then R1 (US spoof — this also exercises the price swap). 2. Open `/`, accept analytics+marketing in the consent banner if prompted. 3. DevTools → Application → Cookies: note the exact values of `_ga` and `_fbp`. 4. Switch locale fr → en → pl, then navigate to `/pricing`. 5. Re-read `_ga` and `_fbp`. 6. In GA4 DebugView and Meta Pixel Helper, review the event stream for the session. |
| EXPECT | `_ga` and `_fbp` values are byte-identical before and after. Exactly one `page_view`/`PageView` per navigation. You do NOT see a second `gtag config`/pixel init, a `PageView` with no navigation (the price swap fires nothing), or a new client-id/`_fbp` value. |
| RESET | R2. |

### AN-02: Consent behavior unchanged by region detection [BLOCKER]

| Field | Content |
|---|---|
| WHY | The consent regime is derived from the same timezone table the pricing detection reads. If the feature leaked into consent, an EU visitor could get trackers without opting in (compliance breach) or a US visitor could get a surprise banner. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R2, then R1 (FR spoof). 2. Open `/` — observe the consent banner and check no gtag/fbevents script is loaded (DevTools → Network, filter `gtag`/`fbevents`) before answering. 3. Do not answer the banner; read the pricing section (prices resolve to €). 4. R2, then R1 (US spoof). 5. Open `/` — observe banner behavior and script loading. |
| EXPECT | FR spoof: banner shows, and no gtag/fbevents request fires before consent — even after the price chips resolve. US spoof: the opt-out regime behaves exactly as on current dev (no banner, trackers load). You do NOT see the banner appear or disappear as a result of the price swap, at any point mid-session. |
| RESET | R2. |

### AN-03: Attribution still captures the landing variant [CORE]

| Field | Content |
|---|---|
| WHY | AttributionCapture snapshots the landing variant stamped by LandingTracker in the same render commit; if the provider delays the landing subtree, `variant: null` is frozen into a 182-day first-touch cookie and ad-spend attribution silently dies. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R2, then R1 (US spoof). 2. Open `/?utm_source=qa&utm_medium=runbook&utm_campaign=sta330`. 3. Accept consent if prompted. 4. DevTools → Application → Cookies → `stampeo_attribution`: decode the value (URL-decoded JSON). |
| EXPECT | The cookie exists and its payload contains the utm fields AND a non-null landing variant (`wallet`). You do NOT see `variant: null` or an absent variant field. |
| RESET | R2. |

---

## EDGE: Frozen surfaces & failure modes

### ED-01: Founder program stays frozen EUR [EDGE]

| Field | Content |
|---|---|
| WHY | Founding prices are frozen history, always EUR by design; region detection must not reach them. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. R1 (US spoof). 2. Open `/programme-fondateur` (and its price reveal). 3. `curl -s /llms.txt` and search for "€". |
| EXPECT | Founder page amounts remain `€` even for the US-spoofed browser; `/llms.txt` prose still quotes EUR. You do NOT see `$` on either surface. |
| RESET | None. |

### ED-02: Backend down → baked USD ladder, not EUR [EDGE — local only]

| Field | Content |
|---|---|
| WHY | The USD fallback ladder is new; before it existed, a backend outage silently showed EUR amounts to a detected-US visitor. |
| DEPENDS | RP-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. Run the showcase locally with `NEXT_PUBLIC_API_URL` pointing at an unreachable host (ask the developer for the exact env override; do not touch dev infra). 2. R1 (US spoof). 3. Open `http://localhost:3001/` pricing section. |
| EXPECT | Prices resolve to `$` amounts (the baked fallback ladder). You do NOT see `€` amounts or unresolved skeletons. (JSON-LD omitting offers in this state is existing, correct behavior.) |
| RESET | Restore the env and restart the local server. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first, then RP (BLOCKER first), then AN, then EDGE.
2. **On BLOCKER failure:** stop the section, mark dependents SKIPPED, file a
   failure report, continue with independent sections. AN always runs.
3. **On CORE failure:** file a report, skip only its dependents, continue.
4. **On EDGE failure:** file a report, continue. ED-02 requires local access —
   if you cannot run it, mark SKIPPED with the reason, never PASSED.
5. **On ambiguity:** consult WHY. Still ambiguous → report AMBIGUOUS with what
   you saw; that is a runbook bug, not necessarily a product bug.
6. **After any failure:** run the case's RESET before retrying or moving on.
7. **Reporting:** one failure report per failed case
   (`docs/features/STA-330/failure-reports/`, template
   `failure-report-template.md`), referencing cases by ID, with the spoofed
   region, page, expected vs observed, and a screenshot.
8. **Re-runs after fixes:** the failed case, its DEPENDS chain, and anything
   listed in Known state as needing re-verification. Nothing else.
