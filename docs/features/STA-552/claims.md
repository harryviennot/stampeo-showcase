# STA-552: where each product claim of the previews comes from

The six previews' copy (`lib/landing-pages/copy/previews/*.ts`) as of v3 (16 Nov 2026). STAMPEO.md = `stampeo-seo/stampeo seo en/STAMPEO.md` (line numbers as of 16 Nov 2026), web = the dashboard repo's `messages/en`, scanner = the Scanner app's catalogs. STAMPEO.md is stale on campaigns: lines 254 and 402 to 404 still say Starter has none. STA-549 shipped on 16 Nov (`PLAN_FACTS.starter.broadcastsPerMonth = 8`, Growth and Pro unlimited), which is why the campaigns page may say campaigns come with the subscription.

The sample numbers in drawn dashboards and cards (Platform's `ANALYTICS`, the habits and progress charts, the wallet cards' stamps and balances) and the words on the drawn Scanner screens (scanner `stamp.json` and `points.json`) are the pages' fixtures, not claims. `lib/landing-pages/claims-doc.test.ts` reads this file: each row marked FLAGGED must be one that test lists with its reason.

## What the pages claim

| Claim | Pages | Source |
|---|---|---|
| Every stamp and reward sends an automatic lock-screen notification, through the wallet card, on Apple Wallet and Google Wallet | push, related | L60, L228-234, L244, L246, L483 |
| The default messages ("Stamp collected! You have 5 of 8 stamps.", reward unlocked, reward redeemed, "You've reached Silver!") | push | L54, L213; backend `notification_defaults.py` via `copy/shared.ts` |
| Switch any message off, or rewrite it in your words with the customer's name | push | L238-242 (described without its plan); web `notifications.json` `triggers.*.name` and `editor.variables.customer_first_name` / `stamps_left` |
| Your own notification icon, uploaded or made from your logo | push | L242 |
| Customers download no app and create no account | push, campaigns, geolocation | L19, L362 |
| A campaign is one message to every installed card; no email or phone number needed | campaigns | L250, L366 |
| No fee per message; no limit on how many customers a campaign reaches | campaigns | L366 (no SMS), L398-400 (no usage caps); Harry, 16 Nov |
| Campaigns come with your subscription; your plan sets how many campaigns you can send each month | campaigns FAQ | STA-549; `PLAN_FACTS.*.broadcastsPerMonth` (every plan sends some, tested in `promotional-campaigns.test.tsx`) |
| Delivery split by Apple Wallet and Google Wallet; send it again anytime | campaigns | L260; web `notifications.json` `detail.sendAgain` |
| Google shows up to three notifications per card a day | campaigns | L246; web `notifications.json` `howItWorks.googleNote` |
| A translation in English, Spanish, French or Polish, matched to the customer's phone | campaigns | L33, L37-38 |
| Geolocation: coming soon, no date; your card will appear on the lock screen near your shop | geolocation | L11, L353; "Coming soon" rows below |
| The Scanner app is free on the App Store and Google Play, for iPhone and Android; one-tap Google or Apple sign-in | scanner | L122, L124-125, L131 |
| The web scanner at scan.stampeo.app does the same job, nothing to install, on a phone or a tablet | scanner | L122, L482 |
| Several stamps at once, type the amount spent, redeem now or save for the next visit, see the level and its perks | scanner | L133-136 |
| The card updates within seconds and the customer gets a notification | scanner | L137 |
| Visits, new customers, return rate (within a month), tracked spend on points, visits over time | analytics | L270-271 |
| Busiest times, how often they come, reward progress | analytics | L272 |
| Monthly cohorts; one location at a time | analytics | L273-274 (described without their plan) |
| Customers per level and moves up per month | analytics | L216 |
| Live activity on the dashboard, no refresh | analytics | L264 |
| The customer segments New, Regular, VIP, Reward ready, Close to reward, At risk, Ghost | analytics | L220 |
| Customer list download as a CSV file | analytics | L224; STAMPEO.md §6 (owner-only export, STA-249) |
| Logo, colors, stamp icons from the library or uploaded, background removed automatically, a different icon per stamp, a reward stamp, arrangement | card design | L172, L174 |
| 98 ready-made icons | card design | `stampIcons.length` (tested) |
| No logo: initials in the accent color | card design | L175 |
| Live preview of both wallets while you design | card design | L172 |
| We design the card for you, free | card design | L179 |
| Stamps or points, up to five levels with their own card look, switch without customers losing their card | card design | L183-193, L202, L208-211, L479-480; `PLAN_FACTS.*.levels` (tested) |
| 95% of cards still in the wallet three months later | Platform | `retention-study-2026-11-16.md` (95.5% at day 90, 2,786 cards, 73 businesses, rounded down; tested in `copy.test.ts`) |
| The six one-liners in the phone menu (`common.nav.featuresItems.*.description`, four locales) | menu | Each restates its feature's claim above. Geolocation's line, "Your card when they're nearby", sits under the "Soon" label |

## Claims with no confirmed source (FLAGGED)

Each is kept on purpose, with the reason; `claims-doc.test.ts` fails if a row here is not listed there, or if the copy stops saying it.

| Claim (copy path) | Source |
|---|---|
| FLAGGED: Send only to customers who joined in the last month (`PROMOTIONAL_CAMPAIGNS_PREVIEW.ideas.rows[3].body`) | Join-date targeting on every plan is STA-549 and the live campaigns hero ("basic segmentation"); the pricing page's segmentation row says "Basic (date-based)" for Starter and Growth and "Advanced" for Pro. STAMPEO.md still says Starter has no campaigns |
| FLAGGED: Removed the card, counted apart (`delivery.metrics[3]`, `delivery.tab.facts[1]`) | Web `notifications.json` `detail.passRemoved`, not STAMPEO.md |
| FLAGGED: Their phone will check the distance itself (`GEOLOCATION_PREVIEW.privacy.facts[0]`) | The live geolocation page's privacy points and `pass_generator.py:27-31` (iOS evaluates `locations[]` on the device); not STAMPEO.md |
| FLAGGED: We will never receive their location (`privacy.facts[1]`) | The live geolocation page (`messages/en/features.json` `geolocalisation.privacy.points[0]`, "Stampeo collects no location data from your customers"); not STAMPEO.md |
| FLAGGED: They will be able to turn it off in their phone's settings (`privacy.facts[2]`) | The live geolocation page (`geolocalisation.privacy.points[2]`); not STAMPEO.md |
| FLAGGED: The card already in their wallet will pick it up with its next update (`faq.items[1]`) | `pass_generator.py:39-41`: a card already in a wallet takes new `pass.json` content at its next fetch (a stamp, a campaign or a manual refresh). That the launch design uses this path is not confirmed, so the answer stays until it is |
| FLAGGED: A laptop runs the web scanner (`MOBILE_SCANNER_PREVIEW.ways.cells[1].devices[2]`, `hero.alt`) | Harry's statement, 16 Nov 2026. STAMPEO.md says a phone or a tablet |
| FLAGGED: Visits split into first visits and returning customers (`ANALYTICS_PREVIEW.charts.rows[0]`) | Web `analytics.json` `visits.legend`, not STAMPEO.md |
| FLAGGED: Your busiest slot and quietest open hour (`charts.rows[3]`) | Web `analytics.json` `busiest.rows`, not STAMPEO.md |
| FLAGGED: Every week, every two weeks, about once a month, or came once (`charts.rows[4]`) | Web `analytics.json` `frequency.buckets`, not STAMPEO.md |
| FLAGGED: What each customer group means, such as "joined in the last two weeks" (`customers.segments[*].definition`) | Web `customers.json` `segmentsHelp`; STAMPEO.md names the segments only |
| FLAGGED: Stamp icons searchable by name (`CARD_DESIGN_PREVIEW.icons.facts[0]`) | The live card design page's `iconLibrary` line; 98 = `stampIcons.length`. STAMPEO.md does not say searchable |
| FLAGGED: Change your card and every card already in a wallet updates (`wallets.cells[2]`, `faq.items[4]`) | The live card design page's FAQ, not STAMPEO.md |

## Coming soon (not live)

Geolocation is not live (STAMPEO.md §8: "Geofencing / 'you're nearby' notifications: coming soon. Switched off since May 2026"). Every line is written in the future tense or sits under a "coming soon" label, names no date, no plan and no wallet. The `WALLET_LOCATIONS_ENABLED = False` switch in `backend/app/services/pass_generator.py` is the proof it is off; `PLAN_FACTS.pro.geofencing` is `"coming_soon"` and `copy.test.ts` fails if it ever changes.

| Claim, as the page says it (`GEOLOCATION_PREVIEW` path) | Source |
|---|---|
| Your card will be ready when geolocation launches; start now (`band.sub`) | Showcase `messages/en/features.json` `geolocalisation.cta` ("your card is ready when it launches") |
| Your card will appear on their lock screen when they are near your shop (`hero.sub`, `how.cells[2]`) | `pass_generator.py:20-31`: Apple Wallet's `locations[]` shows the pass on the lock screen within about 100 m. The hero banner's title and body are an illustrative example, not a promised message |
| You will add your shop's address from your dashboard (`how.cells[0]`) | `messages/en/features.json` `geolocalisation.howItWorks.steps[0]` ("add your business address in your dashboard") |
| The card will carry your shop's address, never their whereabouts (`privacy.lead`, `how.cells[1]`) | `pass_generator.py:20-31` (the pass holds the shop's coordinates); `geolocalisation.howItWorks.steps[1]` |
| Nothing for your customers to set up (`faq.items[2]`) | `geolocalisation.howItWorks.subtitle` ("no app, no Bluetooth, no extra setup") |
| We have no launch date; we will announce it on What's new (`faq.items[0]`) | The coordinator's decision (no date). "What's new" is the changelog's name in the menus (`common.nav.changelog`) |
