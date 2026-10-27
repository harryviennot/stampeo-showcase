# UX Brief: STA-519
MODE: DESIGN   DOMAIN: showcase
VERDICT: READY

(Written against fc94bf9; paths updated by the coordinator to c0ea7fd: `lib/landing-shots.ts` is now `lib/landing/dashboard-shots.ts`, `BrowserFrame` already lives in `components/ui/`, and the seven mock strings already moved from `landing.dashboard` to `features.analytiques.custom.dashboard`.)

## Already shipped
None of the new hero. The material to build it: the STA-514 captures (top of the Analytics page only; that view leads with red ▼37% / ▼5 pts), the capture tool (`--sizes`, `--period`, `--locales`, no scroll), `PhoneMockup` with `screenBackground`, and `VariantDashboardShot`'s phone + next/image + bottom fade.

What the product really has (`web/src/components/analytics/analytics-view.tsx`): KPI row (Visits, New customers, 30-day return rate); Visits over time; Busiest times (day × open-hour grid, busiest and quietest open hour); How often they come (5 buckets); Reward progress (stamps by position, still coming vs not back 30+ days, rewards redeemed, a "See who is close to a reward" link to Customers); monthly cohorts on Pro (a blurred locked example on Growth); Starter: KPI row + one sentence per section, charts locked.

- **Analytics is not real-time**: it refreshes every 10 minutes (`backend/app/workers/analytics_worker.py`, cron `*/10`). The meta description "Real-time dashboard" is wrong.
- **LiveActivityFeed is mostly true**: the dashboard's Activity page is live, shows customer names and logs stamps, rewards and cards added, for owners and admins on every plan. It differs from the mock: "Just now" / "{n}m ago" (not seconds), verbs "received a stamp" / "redeemed a reward" / "added their card" (not "signed up"), accent Live dot (not green).
- **Copy guards exist**: the landing's OFF_PICTURE rules; `lib/plans/plan-facts.test.ts` (cohorts / "as charts" / history must name their plans; "every/all charts" banned).
- **Dead copy**: `features.analytiques.sections` is read by no component.

## Placement
All on `components/features/analytics/AnalyticsPageContent.tsx`. Order, alternating backgrounds:
1. **Hero** (paper): copy left, phone right, showing a NEW capture.
2. **BlindSpotCards** (blog-bg): unchanged code; one string flagged.
3. **"When they come"** (paper, replaces `DashboardSection`): text left, phone with a Busiest times capture right.
4. **LiveActivityFeed** (blog-bg): kept, matched to the product.
5. **Plans** (blog-bg-alt, replaces `ProChartCards`): heading, lead, three `card-stamp` cards Starter / Growth / Pro.
6. **FeatureCTA**, **RelatedFeatures**: unchanged code.

**Hero capture = How often they come + Reward progress ("habits")**, not the top of the page: the top-of-page phone is exactly the landing's picture at 390, and it opens on red deltas. The habits view is the loyalty question, all totals, no deltas, money, names or Pro features.

| | Landing section | This hero |
|---|---|---|
| Capture | Top of the page | How often they come + Reward progress |
| Frame | Browser frame + overlapping phone | Phone only |
| Layout | Full-width figure under an h2, no CTA | The sibling feature pages' split hero, h1 + CTA |
| Extras | Points list, ink note | Neither |

Kept the same on purpose: capture pipeline, phone frame with its fade, plan-line wording.

**BrowserFrame**: no user on this page.

### File layout
- `AnalyticsPageContent.tsx`: hero inline (as siblings do) + section order.
- New: `components/features/analytics/BusiestTimesSection.tsx`, `components/features/analytics/AnalyticsPlans.tsx`, `components/ui/PhoneScreenshot.tsx`.
- Deleted: `DashboardSection.tsx`, `ProChartCards.tsx`.
- `LiveActivityFeed.tsx`: time label and dot colour.
- The captures map gains a view dimension (`top` | `habits` | `busiest`); new `<locale>-phone-habits.png`, `<locale>-phone-busiest.png`.
- `features.json` (4 locales): new `analytiques.hero.{title,subtitle,planLine,alt}`, `analytiques.busiest.{title,lead,alt}`, `analytiques.plans.{title,lead,starter,growth,pro}`; deleted `custom.dashboard`, `custom.proAnalytics`, `custom.proCharts`, `sections`; `custom.activityFeed` aligned with the product.
- `lib/plans/plan-facts.test.ts`: the cohorts/charts guards look for a plan name in the same clause; plan-card items keyed `plans.pro.*` won't contain "Pro", so the guard reads the plan from the key path or each item names its plan.
- promo-videos: `--view`.

### Copy slots (written with stampeo-copywriting)
Banned everywhere: "who", names, "know your regulars" as individuals; any prediction; money/spend/revenue; "real time"/"live" (about Analytics); Pro-only things outside the Pro card; "every/all charts", export, prices, trial length.
- **h1** (`text-h1`): one promise about customers as a group (whether they come back, how often, when). ~40 chars EN; ≤3 lines at 390, ≤2 at 1440 (~608px column). Also the "Discover more" card title on sibling pages (h3, 252px): add `hero.navTitle` if it runs past 2 lines there.
- **Subtitle** (`text-lead`, ≤ ~30 words; ≤5 lines at 390 in the longest locale, ≤3 at lg): what the screen shows, as totals; fills itself from every scan; no plan names.
- **planLine** (figcaption, `text-sm` muted, centred; 1 line at lg, ≤2 at 390): a screen from Growth; charts come with Growth and Pro. Own key.
- **Hero alt** (≤ ~20 words).
- **Busiest row**: h2 ≤ ~6 words; lead ≤ ~30 words (grid, busiest slot, quietest open hour, shop's time zone; ends with Starter = the busiest hour as one sentence, the grid on Growth and Pro); alt.
- **Plans**: h2 ≤ ~6 words; lead ≤ ~25 words (Analytics on every plan; what changes is charts and look-back); each card: plan name from `PLAN_NAMES`, a history line with `PLAN_FACTS.analyticsHistoryDays` as an ICU argument, 2–3 items ≤ ~6 words (Starter: KPIs + one highlight per section; Growth: the four charts by name; Pro: Growth + monthly cohorts + statistics for each location).

### Copy flagged (for stampeo-copywriting)
- `custom.blindSpotCards.questions[2]` "Who stopped coming" (per-customer): phrase as a count.
- `custom.activityFeed.*`: title "Activity" + Live marker; product verbs; "Just now"; may say live about Activity only.
- `cta.subtitle` repeats the plan list (176px at 390), now right under the plans section.
- `metadata.json` `features.analytiques`: title "…Who Comes Back, Who Drifts" (per-customer), description "Real-time dashboard" (wrong).
- `lib/llms-txt.ts:79` "top customers".
- Landing `featureGrid.features[4].description` "Know your regulars…": STA-514's follow-up.

## Entry points
Existing: header Product → Analytics, footer, landing FeatureGrid tile, "Discover more" cards, llms.txt, sitemap. CTA `trackAs="feature_hero"` in the hero and FeatureCTA.

## Proposed additions
- Plan line under the hero phone — prevents a mistake (Starter gets highlights, not charts).
- Plan section (three cards) replacing ProChartCards — prevents a mistake and answers "which plan shows what?".
- "When they come" row with the real Busiest times — answers "Which day is quietest" from the problem section; replaces the fake heatmap, "Most active days", "Scans / week".
- LiveActivityFeed matched to the product — prevents a false claim: "Just now", `--accent` dot, product verbs and title, never team-member names.

## Rejected additions
Desktop capture in a BrowserFrame (0.47 scale, repeats the landing, red deltas); top-of-page phone as hero; KPI + Visits phone capture in the body; ink note in the hero; eyebrow/badge above the h1; wallet badges; Pro cohorts capture; Starter teaser capture (no Starter fixture with an admin); HowItWorks steps; FeaturePrivacy (legal; follow-up); answers on the BlindSpotCards / rebuilding them as buttons (their div onClick isn't keyboard-accessible: separate fix); "Compare plans" link, "shown above" pill, prices in cards; a real Activity capture; lightbox, carousel, animated numbers, hover tilt.

## Mobile shape
**390×844, text first, one phone** (like card-design; the headline above the fold): `pt-24`, left-aligned h1 (≤3 lines), subtitle (≤5), 52px CTA (bottom ~430–460px, clear of the cookie banner 603–844), 40px gap, PhoneMockup 280px centred (~583px tall, top ~470px), plan line centred. Hero ~1,150px. Then BlindSpotCards, busiest row (h2, lead, lazy phone, ~1,000px), activity feed, plans (stacked cards), FeatureCTA, Discover more. Main ~4,900px vs 5,379 today. Only new tap target: the CTA. Nothing hover-only, no sheets/dialogs, plans stack, no overflow.

**768**: single column, text `max-w-xl` left-aligned, phones centred, plan cards stacked.

**≥1024**: sibling hero shell from `GeofencingPage.tsx:41-48` (`relative min-h-[85vh] flex items-center pt-24 pb-16 overflow-hidden`, two blurred blobs, `grid lg:grid-cols-2 gap-12 lg:gap-20 items-center`); hero text left, `<figure>` right (phone + plan line). At 1440×900 phone bottom ~700px, caption ~730px; at 1024×768 caption ~720px. Busiest row: text left, phone right. Plans `lg:grid-cols-3`.

### Capture spec (`--view`)
`top` (existing, desktop + phone), `habits` (phone), `busiest` (phone). Same as STA-514: 402×874 @3x, Aurevo, 90 days, reducedMotion, dev badge/toasts hidden, What's-new closed. habits: after `settled()`, scroll the pair containing `#reward-progress` so its top sits 16px below the viewport top (`scrollIntoView`; `SidebarInset` scrolls). busiest: the same with the card titled by web's `analytics.busiest.title` in the current locale (no id). Nothing tapped. The "See who is close to a reward" link may be in frame; copy must not lean on it.

### Loading
- Hero image: next/image `fill`, `sizes="260px"`, `loading="eager"`, `fetchPriority="high"` (not `preload`, not the deprecated `priority`). Likely LCP at 390 and 1440.
- No ScrollReveal anywhere in the hero (it holds opacity 0 until hydration); body sections keep it.
- No layout shift: `bg-[var(--muted)]` placeholder, `screenBackground="var(--paper-hover)"`, fixed 9/19.5 aspect.
- Busiest image lazy (~1,900px down at 390).
- Measure: Lighthouse mobile + desktop on `next start`.

## Components to reuse
Container, CTAButton, PhoneMockup (via PhoneScreenshot), ScrollReveal (body only), CheckIcon, `.card-stamp` (not `.blog-card-3d`, which lifts and promises a click), PLAN_FACTS / PLAN_NAMES / `planMessageArgs`, the captures map + its test, the landing's OFF_PICTURE rules, FeatureCTA, RelatedFeatures, BlindSpotCards, LiveActivityFeed, the promo-videos capture tool.

## New components required
- **`components/ui/PhoneScreenshot.tsx`**: PhoneMockup + full-bleed next/image (`object-cover object-top`) + bottom fade, with fade and status-bar background tied to one token. Props `src`, `alt`, `sizes`, `eager?`. Three sites in two features; it carries an invariant (fade colour = screen background = capture page colour) that drifts silently otherwise. An optional `screenshot` prop on PhoneMockup would leave `children` vs `screenshot` ambiguous. The landing adopts it only if pixel-identical.
- `BusiestTimesSection`, `AnalyticsPlans`: page sections in the feature folder.

## Open questions for the user
1. BrowserFrame and AC4 (no desktop capture on this page).
2. Fix the same claims in `metadata.json` and `lib/llms-txt.ts`? Default yes, copy only.
3. Landing adopts PhoneScreenshot only if pixel-identical? Default yes.
4. FeaturePrivacy ("totals, no profile, no prediction") as a follow-up with legal review?
5. A Starter screenshot later (needs an admin on a Starter fixture).
