# STA-552: where each unchipped product claim comes from

Checked by the coordinator on 13 Nov 2026 (gap report, "AC3 every claim is live"). STAMPEO.md = `stampeo-seo/stampeo seo en/STAMPEO.md`.

| Claim (copy path) | Source |
|---|---|
| "Send it again anytime" (promotional-campaigns.ts) | web `messages/en/notifications.json` `sendAgain` ("Send again") |
| "5 color palettes from your logo" (card-design.ts) | STAMPEO.md §6: "5 palettes auto-generated from the logo" |
| "Sign in with Google or Apple in one tap" (mobile-scanner.ts) | STAMPEO.md: "one-tap Google or Apple sign-in" |
| "A recap in your inbox, weekly or monthly" (analytics.ts) | STAMPEO.md: performance digests and recaps; backend `lifecycle/digest/` weekly + monthly |
| "Download your customer list anytime" (analytics.ts) | STAMPEO.md §6 (owner-only export, STA-249) |
| "busiest slot and quietest open hour" (analytics.ts) | web `messages/en/analytics.json` `quietest` ("Quietest open hour"); Growth and Pro chip printed |
| "Switch each message on or off" (push-notifications.ts) | STAMPEO.md notifications table: "switch each message on or off" (every plan) |
| "Upload an icon, or use one made from your logo" (push-notifications.ts) | STAMPEO.md: "On every plan, the business can set its own notification icon — upload one, or pick a suggestion generated from its logo" |
| "in your customer's language" (push-notifications.ts) | STAMPEO.md: "customers see their card in their phone's language"; notifications work in all four languages |
| "save it for their next visit" (mobile-scanner.ts) | STAMPEO.md Scanner: "redeem it now or save it for later; saved rewards appear in a 'Rewards to redeem' list" |
| "in your business hours" (promotional-campaigns.ts FAQ) | today's approved catalog, `messages/en/features.json` promotional campaigns (scheduling, Pro) |
| 6-character team code, scan.stampeo.app, 98 icons, 4 languages | STAMPEO.md (team codes, web scanner); `stampIcons.length`; `routing.locales.length` (tested) |
| 88% / 95% | today's approved catalog with its source line "Stampeo data, 86 businesses, February to October 2026" |

Removed by the coordinator because no source backs them: "up to twelve" icons, "bonus included" on every plan, "0 fees per message" under the data source line.

## v2 additions (16 Nov 2026)

New product claims in the v2 copy (`lib/landing-pages/copy/previews/*.ts`). STAMPEO.md = `stampeo-seo/stampeo seo en/STAMPEO.md`; web = the dashboard repo, `web/messages/en`. The sample numbers in drawn dashboards and emails are the page's fixtures (Platform's `ANALYTICS`, the dashboard's own sentences), not claims.

| Claim (copy path) | Source |
|---|---|
| Analytics blind spots: visits, "came back within a month", new customers (`ANALYTICS_PREVIEW.blindSpots.cards`) | STAMPEO.md §6 Analytics table: key numbers (visits, new customers, 30-day return rate) on every plan |
| "come at least every two weeks", "customers have a reward waiting", "Thursday, 8 to 9 AM" (same) | web `analytics.json` `teaser.frequency.regulars`, `teaser.rewards.ready`, `teaser.busiest.slot`: the Starter sentences, so every answer is true on every plan |
| Ladder rows: Busiest times, How often they come, Reward progress, Monthly cohorts, Filter by location; Starter answers in a sentence; Growth and Pro chart it (`ladder`) | STAMPEO.md §6 Analytics table (one-line summary on Starter; cohorts and location filter Pro only) |
| History 30 days, 90 days, 1 year (`ladder.plans[].history`) | `PLAN_FACTS.*.analyticsHistoryDays` (read, never typed) |
| Performance email: weekly when busy, monthly otherwise, stamps given, new and returning customers, rewards redeemed, "12 customers are close to a reward", unsubscribe (`recap`) | STAMPEO.md §6 "performance emails" (the example nudge is quoted from it) |
| Card design palettes: five, made from the logo (`CARD_DESIGN_PREVIEW.palettes`) | STAMPEO.md §6: "5 palettes auto-generated from the logo" |
| Scanner counter: add one or several, type what they spent, redeem now or on the next visit, their perks on screen (`MOBILE_SCANNER_PREVIEW.counter.options`) | STAMPEO.md §5, "The flow at the counter" (stepper, keypad, "redeem it now or save it for later", level and perks shown) |
| Team: copy the code, they type it in, ready to scan; every scan carries the name of who made it (`teamStrip`) | web `team.json` `invite.codeCopy` ("Copy") and "read it out"; scanner `join.json` "Enter your team code" and `points.json` "Scan Next Customer"; STAMPEO.md §5 team codes and "every scan they make is saved under their name" |
| Notification steps: 5th visit, card full, reward claimed, next level, each with its default message (`PUSH_NOTIFICATIONS_PREVIEW.day`) | backend `notification_defaults.py` (stamp, reward, redeemed, level-up defaults); STAMPEO.md §6 Automatic notifications and levels ("You've reached Silver!") |
| Message editor: the Stamp collected, Reward unlocked and Reward redeemed switches; your own words with the customer's first name and stamps left (`editor`) | web `notifications.json` `triggers.*.name` and `editor.variables.customer_first_name` / `stamps_left`; STAMPEO.md §6: Starter uses default wording and can switch each message on or off, Growth and Pro write custom text |
| Broadcast composer: "Who will receive this?", "All enrolled customers", "Filtered audience", "Schedule for later", "Send now", "Send again", "New broadcast" (`PROMOTIONAL_CAMPAIGNS_PREVIEW.composer`) | web `notifications.json` `broadcasts.wizard.audience.*`, `wizard.schedule.scheduleLater`, `detail.sendNow`, `detail.sendAgain`, `broadcasts.new` |
| Filter chips: joined in the last month (Growth and Pro), inactive for a month (Pro); scheduling is Pro (`composer.card`) | STAMPEO.md §6 broadcasts table (Growth: joined more or less than N days ago; Pro: inactive for N days, scheduled sends) |
| Delivered count under the composer (`composer.card.delivered`) | STAMPEO.md §6: delivery stats split by Apple and Google; the numbers are the page's delivery fixture |

### Coming soon (not live)

Geolocation is not live (STAMPEO.md §8: "Geofencing / 'you're nearby' notifications: coming soon. Switched off since May 2026"). Every line below is written in the future tense or sits under a "coming soon" label, names no date, and says Pro. The `WALLET_LOCATIONS_ENABLED = False` switch in `backend/app/services/pass_generator.py` is the proof it is off; `PLAN_FACTS.pro.geofencing` is `"coming_soon"` and `plan-claims.test.ts` fails if it ever changes.

| Claim, as the page will say it (`GEOLOCATION_PREVIEW` path) | Source |
|---|---|
| Geolocation will come with the Pro plan (`faq.items[1]`, `hero.sub`, `heroChip`, `status`, `band.sub`, `meta`) | backend `features.py` `locations.geofencing` (True on Pro only); `PLAN_FACTS.pro.geofencing = "coming_soon"`; showcase `messages/en/features.json` `geolocalisation.cta` ("coming soon to the Pro plan") |
| Your card will be ready the day it launches; make it now (`hero.sub`, `band`) | showcase `messages/en/features.json` `geolocalisation.cta` ("your card is ready when it launches") |
| Your card will appear on their lock screen when they are near your shop (`hero.h1`, `status.soon.facts[0]`, `how.cells[2]`) | `pass_generator.py:20-31`: Apple Wallet's `locations[]` shows the pass on the lock screen within about 100 m. No wallet is named for the feature itself: the backend builds Apple's `locations[]` only |
| You will add your shop's address from your dashboard (`how.cells[0]`) | showcase `messages/en/features.json` `geolocalisation.howItWorks.steps[0]` ("add your business address in your dashboard") |
| You will write one short line for each location (`status.soon.facts[1]`, `how.cells[1]`, `banner`) | FLAGGED: the planned design only. `pass_generator.py:33-36` says to re-enable "once per-location wallet_message UX ships"; no screen exists yet. The banner title and body in the hero phone are an invented example of that line |
| Nothing for your customers to set up (`status.soon.facts[2]`) | showcase `messages/en/features.json` `geolocalisation.howItWorks.subtitle` ("no app, no Bluetooth, no extra setup") |
| The card will carry your shop's address, never their whereabouts (`privacy.lead`) | `pass_generator.py:20-31` (the pass holds the shop's coordinates); showcase `messages/en/features.json` `geolocalisation.howItWorks.steps[1]` |
| Their phone will check the distance itself (`privacy.facts[0]`) | showcase `messages/en/features.json` `geolocalisation.privacy.points[1]`; `pass_generator.py:27-31` (iOS evaluates `locations[]` on the device) |
| We will never receive their location (`privacy.facts[1]`) | showcase `messages/en/features.json` `geolocalisation.privacy.points[0]` ("Stampeo collects no location data from your customers") |
| They will be able to switch it off in their phone's settings (`privacy.facts[2]`) | showcase `messages/en/features.json` `geolocalisation.privacy.points[2]` |
| We have no launch date; we will announce it on What's new (`faq.items[0]`) | The coordinator's decision for v2 (no date). "What's new" is the changelog's name in the menus (`common.nav.changelog`) |
| The card already in their wallet will pick it up with its next update (`faq.items[2]`) | FLAGGED: inferred from `pass_generator.py:39-41` (a pass already in a wallet takes new `pass.json` content at its next fetch: a stamp, a broadcast or a manual refresh). Not confirmed for the launch design |
| Today: your card in Apple Wallet and Google Wallet; a notification on every stamp and reward; broadcasts to every card (Growth and Pro) (`status.today`) | STAMPEO.md §1, §6 (automatic notifications on both wallets, broadcasts table) |
