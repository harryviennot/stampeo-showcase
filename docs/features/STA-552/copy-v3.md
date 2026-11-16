# STA-552 v3: copy for the six feature previews and Platform's new stat

US English for `/us/landing-pages/platform/<feature>` and one figure on `/us/landing-pages/platform`. Written 16 Nov 2026 against the v3 section of `plan.md`, Harry's 16 Nov direction, the `stampeo-copywriting` skill (English) and STAMPEO.md. Builders implement these strings exactly, into `lib/landing-pages/copy/previews/*.ts` and `lib/landing-pages/copy/platform.ts`.

## How to read this

- Each page lists its keywords, then its sections in page order. Each section is a table: the field (the copy module path, relative to the page's module), the text, and the character count against its budget where one applies.
- Budgets (from `copy.test.ts`): H1 46, hero sub 90, title 44, closing band title 36, lead 85, eyebrow 28. Meta titles are kept to 60 and meta descriptions to 160 (search-result widths, not a test).
- `A · B · C` in a cell lists items of one field (chips, labels, list rows). Text in parentheses that names an anchor, a constant or a builder step ("to #demo", "STAMP_BANNER, unchanged", "builder: ...", "fixture", "the demo section is removed") is an instruction, not copy. The one parenthesis that is copy is "(see pricing)" in the campaigns FAQ.
- **[CHECK: why]** marks a line that STAMPEO.md does not back on its own; the reason names where it comes from. It is not printed.
- Every hero: the H1 with its accent words, the sub, the keycap `Start my free trial`, a second action, then the shared reassurance `{trialDays} days free · Cancel anytime`. No eyebrow above the H1 (global rule 4), so the heroes' `eyebrow` field goes.
- The sample businesses stay: Aurevo (café) for every notification, Wrenfold for level cards. Every notification's sender is the business, never Stampeo.

## Coordinator review (16 Nov 2026)

All six decisions below are **accepted**. One change: `ANALYTICS_PREVIEW.devices.lead` no longer claims live updates ("no refresh needed" is not confirmed for the analytics page). Builders: the card design `programs` samples must be fictional brands (never the real barbershop replaced by STA-550; use "Gaspard & Gus" or another fictional sample), and not repeat a shop shown elsewhere on the page. The geolocation FAQ "next update" line stays flagged until Harry confirms.

## Decisions taken while writing (accepted by the coordinator)

1. **"Campaign", not "broadcast", on these pages.** The skill locks "broadcast" and bans "campaign", but Harry's own words (16 Nov) say "campaigns", the page is "Promotional campaigns", and "campaign" is what owners search for. The campaigns page defines the word once, in plain terms ("A campaign is one message you write once."). The dashboard still says "Broadcasts"; no line on these pages promises that word. If you keep the skill's term, swap "campaign" for "broadcast" in the campaigns page, its related card, and the delivery and FAQ lines.
2. **No plan anywhere but one answer.** No Starter/Growth/Pro, no "every plan", no "plan" except the campaigns FAQ answer Harry dictated. Gated features are described plainly, never as available to all (rewriting notifications, cohorts, the location filter). The two campaign ideas that needed advanced targeting ("Gone quiet", "Almost there") are replaced by sends anyone can make, so no idea depends on a plan.
3. **Geolocation says "coming soon" in the H1.** The plan's own example H1 is "Geolocation notifications (coming soon)", and the related tile on other pages must not read as live. The sub then says what it will do, in the future tense. No date, no plan, no wallet named (only Apple's `locations[]` is built).
4. **Related tiles stop repeating the H1s.** The H1s now carry the search phrase; the tile's title already names the feature. Each tile gets its own plain line (last section).
5. **"Design" is a verb only.** The card design page says "Design your digital loyalty card" (the search phrase); the look itself stays "card", and the FAQ title is "Questions about your card".
6. **Second hero actions** where the demo section is gone: campaigns "See how it works", geolocation "See how it will work", scanner "See it at the counter", analytics "See every chart", card design "See every part of the card". Push keeps "Try it on your phone".

## Guard changes this copy needs (for the foundation stage)

- `copy.test.ts` "each sibling link says what its feature is in the words its own preview's headline uses" becomes "each line is set, at most 50 characters, and names no plan".
- The figure list gains `PLATFORM.numbers.figures[3]`; the campaigns `numbers`, `plans` and `composer` tests go with their sections; FAQ counts become 6 (campaigns, card design) and 4 (geolocation).
- The geolocation tests: the H1 no longer starts "Soon,"; `heroChip` is `Coming soon`; the `status` lines and their exemptions go; `STEP_NAMES` becomes the three titles below.
- The 98 icons test reads `CARD_DESIGN_PREVIEW.icons.lead` (and `facts[0]`) for `String(stampIcons.length)`.
- The levels chip test: the previews print no chips, so the new level mentions (push `day.nodes[3]`, scanner `counter.options[3]`, analytics `charts.rows[7]`, card design `programs`) join the no-chip list.

## Push notifications (`/us/landing-pages/platform/push-notifications`, `PUSH_NOTIFICATIONS_PREVIEW`)

**Keywords.** Primary: **loyalty card push notifications**. Secondary: Apple Wallet notifications, Google Wallet notifications, lock screen notifications.
Primary in the meta title, the H1 and the wallets H2 ("Push notifications on iPhone and Android."). Secondaries in the meta description and the wallets lead; "lock screen" in the hero sub, the band and the related line.

### Meta

| Field | Text | Chars |
|---|---|---|
| `meta.title` | Push notifications for your loyalty card \| Stampeo | 50/60 |
| `meta.description` | Every stamp and reward sends a push notification to your customer's lock screen, in Apple Wallet and Google Wallet. No app to download. Free trial. | 147/160 |

### Hero (split: words left, lock-screen phone right; no eyebrow)

| Field | Text | Chars |
|---|---|---|
| `hero.h1` | Push notifications for your loyalty card. | 41/46 |
| `hero.accent` | Push notifications |  |
| `hero.sub` | Each stamp and reward sends an automatic notification to your customer's lock screen. | 85/90 |
| `hero.primary` | Start my free trial |  |
| `hero.secondary` | Try it on your phone (to #demo, the default) |  |
| `hero.reassurance` | {trialDays} days free · Cancel anytime |  |
| `hero.banner` | sender Aurevo · "Stamp collected! You have 5 of 8 stamps." (STAMP_BANNER, unchanged) |  |
| `hero.alt` | An iPhone lock screen with a notification from Aurevo: Stamp collected! You have 5 of 8 stamps. |  |

### Timeline: one customer's visits (card on the left, then its notification on the right)

| Field | Text | Chars |
|---|---|---|
| `day.eyebrow` | One customer's visits | 21/28 |
| `day.title` | A notification each time their card changes. | 44/44 |
| `day.lead` | Follow one customer: the card updates first, then the message arrives. | 70/85 |
| `day.nodes[0].label` | Stamp added |  |
| `day.nodes[0].banner` | Stamp collected! You have 5 of 8 stamps. |  |
| `day.nodes[0].cardAlt` | Aurevo's card at 5 of 8 stamps |  |
| `day.nodes[1].label` | Card full |  |
| `day.nodes[1].banner` | You unlocked your reward! Come claim it. |  |
| `day.nodes[1].cardAlt` | Aurevo's card full, at 8 of 8 stamps |  |
| `day.nodes[2].label` | Reward claimed |  |
| `day.nodes[2].banner` | Reward redeemed. Enjoy! |  |
| `day.nodes[2].cardAlt` | Aurevo's card back to 0 of 8 after the reward |  |
| `day.nodes[3].label` | New level |  |
| `day.nodes[3].banner` | You've reached Silver! Your card has a new look. |  |
| `day.nodes[3].cardAlt` | Aurevo's card at Silver, 1 of 8 stamps |  |

### iPhone and Android (clean floating cards, as on Platform)

| Field | Text | Chars |
|---|---|---|
| `wallets.eyebrow` | iPhone and Android | 18/28 |
| `wallets.title` | Push notifications on iPhone and Android. | 41/44 |
| `wallets.lead` | Apple Wallet and Google Wallet both show them. Your customers download nothing. | 79/85 |
| `wallets.iphone` | On iPhone |  |
| `wallets.android` | On Android |  |
| `wallets.icon.title` | Your own icon |  |
| `wallets.icon.line` | Upload an icon, or pick one made from your logo. |  |
| `wallets.phoneAlts.apple` | An iPhone with Aurevo's loyalty card open in Apple Wallet |  |
| `wallets.phoneAlts.google` | An Android phone with the same card open in Google Wallet |  |

### Use our wording or write your own (editor; no plan label, no chip)

| Field | Text | Chars |
|---|---|---|
| `editor.eyebrow` | Your wording | 12/28 |
| `editor.title` | Use our wording or write your own. | 34/44 |
| `editor.lead` | Every message comes ready to send. Switch any off, or rewrite it in your words. | 79/85 |
| `editor.toggle.label` | Message wording |  |
| `editor.toggle.ready` | Ready-made |  |
| `editor.toggle.own` | Your words |  |
| `editor.messageLabel` | Message |  |
| `editor.previewLabel` | Preview |  |
| `editor.ready.text` | Stamp collected! You have 5 of 8 stamps. |  |
| `editor.own.text` | You got stamped, {first name}! {stamps left} more to go. |  |
| `editor.own.preview` | You got stamped, Sophie! 3 more to go. |  |
| `editor.switches` | Stamp collected · Reward unlocked · Reward redeemed |  |

### Live demo

| Field | Text | Chars |
|---|---|---|
| `demo.eyebrow` | Live demo | 9/28 |
| `demo.title` | Try it on your own phone. | 25/44 |
| `demo.lead` | Add a sample card to your wallet, add a stamp, and get the notification yourself. | 81/85 |

### Final band (cream card, keycap)

| Field | Text | Chars |
|---|---|---|
| `band.title` | Every stamp, on their lock screen. | 34/36 |
| `band.accent` | on their lock screen. |  |
| `band.sub` | Notifications start with your first stamp. Your customers install nothing. |  |

### Related

| Field | Text | Chars |
|---|---|---|
| `related.title` | More Stampeo features. | 22/44 |
| `related.cards` | Promotional campaigns · Scanner app · Analytics (lines in the Related cards section) |  |

## Promotional campaigns (`/us/landing-pages/platform/promotional-campaigns`, `PROMOTIONAL_CAMPAIGNS_PREVIEW`)

**Keywords.** Primary: **send promotions to customers**. Secondary: SMS marketing alternative, promotional push notifications, texting fees.
Primary in the meta title, the H1 ("Send a promotion to every customer's phone") and the texting H2 ("Send promotions without paying per text."). "SMS marketing alternative" in the meta description and an FAQ question; "push notification" in the meta description; "texting fees" in the meta title and the hero sub.

### Meta

| Field | Text | Chars |
|---|---|---|
| `meta.title` | Send promotions to customers, no texting fees \| Stampeo | 55/60 |
| `meta.description` | Send a promotion to every customer's phone as a push notification on their loyalty card. An SMS marketing alternative with no fee per message. | 142/160 |

### Hero (split: words left, lock-screen phone right with the shop's real icon tile; no eyebrow)

| Field | Text | Chars |
|---|---|---|
| `hero.h1` | Send a promotion to every customer's phone. | 43/46 |
| `hero.accent` | every customer's phone. |  |
| `hero.sub` | Write one message and it appears on every customer's lock screen. No texting fees. | 82/90 |
| `hero.primary` | Start my free trial |  |
| `hero.secondary` | See how it works (to #how) |  |
| `hero.reassurance` | {trialDays} days free · Cancel anytime |  |
| `heroBanner` | sender Aurevo · "Quiet afternoon? Your second coffee is half price until 5pm." (unchanged) |  |
| `hero.alt` | An iPhone lock screen with a notification from Aurevo: Quiet afternoon? Your second coffee is half price until 5pm. |  |

### How it works (replaces the composer: one message written once, the same notification on several lock screens)

| Field | Text | Chars |
|---|---|---|
| `how.eyebrow` | How it works | 12/28 |
| `how.title` | One message on every customer's lock screen. | 44/44 |
| `how.lead` | A campaign is one message you write once. It lands on every customer's card. | 76/85 |
| `how.steps[0].title` | Write your message |  |
| `how.steps[0].body` | Type it once in your dashboard, in your own words. |  |
| `how.steps[1].title` | Send it |  |
| `how.steps[1].body` | It goes to every customer who has your card in their wallet. |  |
| `how.steps[2].title` | They see it on their lock screen |  |
| `how.steps[2].body` | A notification from your shop, in Apple Wallet or Google Wallet. |  |
| `how.visual.source` | Your message |  |
| `how.visual.phones` | On iPhone · On Android · On iPhone |  |
| `how.alt` | One message written once in the dashboard, and the same notification from Aurevo on three customers' lock screens. |  |

### Instead of texting (new)

| Field | Text | Chars |
|---|---|---|
| `texting.eyebrow` | Instead of texting | 18/28 |
| `texting.title` | Send promotions without paying per text. | 40/44 |
| `texting.lead` | No fee per message, and no limit on how many customers each one reaches. | 72/85 |
| `texting.sms.title` | Text messages |  |
| `texting.sms.facts[0]` | A fee for every text you send |  |
| `texting.sms.facts[1]` | A bigger customer list means a bigger bill |  |
| `texting.sms.facts[2]` | You need every customer's phone number |  |
| `texting.stampeo.title` | Stampeo campaigns |  |
| `texting.stampeo.facts[0]` | No fee per message |  |
| `texting.stampeo.facts[1]` | No limit on how many customers it reaches |  |
| `texting.stampeo.facts[2]` | It goes to the card already in their wallet |  |

### Ideas (four; every idea can be sent to everyone or by join date, so none depends on a plan)

| Field | Text | Chars |
|---|---|---|
| `ideas.eyebrow` | Ideas to send | 13/28 |
| `ideas.title` | Give them a reason to come in today. | 36/44 |
| `ideas.lead` | Four messages a café could send this week. Write your own the same way. | 71/85 |
| `ideas.rows[0].chip` | Slow afternoon |  |
| `ideas.rows[0].banner` | Quiet afternoon? Your second coffee is half price until 5pm. |  |
| `ideas.rows[0].body` | Sent to everyone. |  |
| `ideas.rows[1].chip` | Something new |  |
| `ideas.rows[1].banner` | Pumpkin bread is back today. |  |
| `ideas.rows[1].body` | Sent to everyone. |  |
| `ideas.rows[2].chip` | Tonight only |  |
| `ideas.rows[2].banner` | Live music tonight from 7pm. Come say hi. |  |
| `ideas.rows[2].body` | Sent to everyone. |  |
| `ideas.rows[3].chip` | New customers |  |
| `ideas.rows[3].banner` | Thanks for joining! Your next coffee comes with a free cookie. |  |
| `ideas.rows[3].body` | Sent only to customers who joined in the last month. **[CHECK: join-date targeting on every plan is STA-549 and the live campaigns hero ("basic segmentation"); STAMPEO.md still says Starter has no campaigns]** |  |

### Delivery

| Field | Text | Chars |
|---|---|---|
| `delivery.eyebrow` | After you send | 14/28 |
| `delivery.title` | See how many customers got it. | 30/44 |
| `delivery.lead` | Each campaign shows how many customers got it in Apple Wallet and Google Wallet. | 80/85 |
| `delivery.card.label` | Last campaign |  |
| `delivery.card.total` | 716 customers (fixture) |  |
| `delivery.metrics[0]` | Got it in Apple Wallet · 412 |  |
| `delivery.metrics[1]` | Got it in Google Wallet · 268 |  |
| `delivery.metrics[2]` | Over Google's daily limit · 14 |  |
| `delivery.metrics[3]` | Removed the card · 22 **[CHECK: web notifications.json detail.passRemoved, not STAMPEO.md]** |  |
| `delivery.tab.title` | After every campaign |  |
| `delivery.tab.facts[0]` | How many got it, in Apple Wallet and in Google Wallet |  |
| `delivery.tab.facts[1]` | Customers who removed the card, counted apart **[CHECK: web notifications.json detail.passRemoved, not STAMPEO.md]** |  |
| `delivery.tab.facts[2]` | Send it again anytime |  |

### FAQ (title only, no eyebrow; "see pricing" in answer 2 links to /us/pricing)

| Field | Text | Chars |
|---|---|---|
| `faq.title` | Questions about campaigns | 25/44 |
| `faq.items[0].question` | How much does it cost to send a campaign? |  |
| `faq.items[0].answer` | Nothing per message. Campaigns come with your Stampeo subscription, so you never pay for each message the way you do with texting. |  |
| `faq.items[1].question` | Is there a limit on campaigns? |  |
| `faq.items[1].answer` | No limit on how many customers a campaign reaches: it goes to every customer with your card in their wallet. Your plan sets how many campaigns you can send each month (see pricing). |  |
| `faq.items[2].question` | Do my customers need an app or a phone number? |  |
| `faq.items[2].answer` | No. The message goes to the loyalty card in their Apple Wallet or Google Wallet. They download no app, and you don't need their phone number or email. |  |
| `faq.items[3].question` | Is this an alternative to SMS marketing? |  |
| `faq.items[3].answer` | Yes, for every customer who has your card. The message shows on their lock screen like a text, with no fee per message and no phone numbers to collect. |  |
| `faq.items[4].question` | Does it work on iPhone and Android? |  |
| `faq.items[4].answer` | Yes. Every campaign goes to Apple Wallet and Google Wallet. Google shows up to three notifications per card a day, so a customer who already got three that day won't see this one. |  |
| `faq.items[5].question` | Can I write it in more than one language? |  |
| `faq.items[5].answer` | Yes. Add a translation in English, Spanish, French or Polish, and each customer sees the one that matches their phone. |  |

### Final band

| Field | Text | Chars |
|---|---|---|
| `band.title` | Fill your next slow afternoon. | 30/36 |
| `band.accent` | slow afternoon. |  |
| `band.sub` | Start your free trial and send your first campaign this week. |  |

### Related

| Field | Text | Chars |
|---|---|---|
| `related.title` | More Stampeo features. | 22/44 |
| `related.cards` | Push notifications · Analytics · Card design |  |

## Geolocation (coming soon) (`/us/landing-pages/platform/geolocation`, `GEOLOCATION_PREVIEW`)

**Keywords.** Primary: **geolocation notifications**. Secondary: location-based notifications, loyalty card lock screen.
Primary in the meta title, the H1 and the how-it-works H2. Secondaries in the meta description and the hero sub only: the page must not read as if the feature were live, so no stuffing.

### Meta

| Field | Text | Chars |
|---|---|---|
| `meta.title` | Geolocation notifications, coming soon \| Stampeo | 48/60 |
| `meta.description` | Coming soon: location-based notifications that will put your loyalty card on a customer's lock screen when they walk near your shop. | 132/160 |

### Hero (split: words left, still lock screen with the nearby banner right; no eyebrow, no plan)

| Field | Text | Chars |
|---|---|---|
| `hero.h1` | Geolocation notifications, coming soon. | 39/46 |
| `hero.accent` | coming soon. |  |
| `hero.sub` | When a customer walks near your shop, your loyalty card will appear on their lock screen. | 89/90 |
| `hero.primary` | Start my free trial |  |
| `hero.secondary` | See how it will work (to #how) |  |
| `hero.reassurance` | {trialDays} days free · Cancel anytime |  |
| `heroChip` | Coming soon |  |
| `heroNote` | coming soon |  |
| `banner.sender` | Aurevo |  |
| `banner.title` | Aurevo is around the corner |  |
| `banner.body` | Your 6th coffee is waiting. 2 stamps to a free one. |  |
| `hero.alt` | A lock screen with Aurevo's loyalty card and the line: Aurevo is around the corner. Your 6th coffee is waiting. 2 stamps to a free one. |  |

### How it will work (three steps whose titles read on their own)

| Field | Text | Chars |
|---|---|---|
| `how.eyebrow` | How it will work | 16/28 |
| `how.title` | How geolocation notifications will work. | 40/44 |
| `how.lead` | You'll add your address once. Their phone will do the rest, with no app. | 72/85 |
| `how.cells[0].title` | Add your shop's address |  |
| `how.cells[0].body` | You'll type it once in your dashboard. |  |
| `how.cells[1].title` | A customer walks nearby |  |
| `how.cells[1].body` | Their phone will notice they're close to your shop. |  |
| `how.cells[2].title` | Their card appears on their lock screen |  |
| `how.cells[2].body` | One tap will open it, ready to scan at the counter. |  |

### Privacy

| Field | Text | Chars |
|---|---|---|
| `privacy.eyebrow` | Privacy | 7/28 |
| `privacy.title` | Their location will stay on their phone. | 40/44 |
| `privacy.lead` | The card will carry your shop's address. We will never see where they are. | 74/85 |
| `privacy.facts[0]` | Their phone will check the distance itself **[CHECK: claims.md, live geolocation page and pass_generator.py, not STAMPEO.md]** |  |
| `privacy.facts[1]` | We will never receive their location **[CHECK: claims.md, live geolocation page, not STAMPEO.md]** |  |
| `privacy.facts[2]` | They will be able to turn it off in their phone's settings **[CHECK: claims.md, live geolocation page, not STAMPEO.md]** |  |
| `privacy.alt` | A phone inside a dashed ring around a shop. A line to the cloud is cut: no location will leave the phone. |  |

### FAQ (title only)

| Field | Text | Chars |
|---|---|---|
| `faq.title` | Questions about geolocation | 27/44 |
| `faq.items[0].question` | When will it launch? |  |
| `faq.items[0].answer` | We don't have a date yet. When it's ready, we'll announce it on our What's new page. |  |
| `faq.items[1].question` | Will my customers need a new card? |  |
| `faq.items[1].answer` | No. The card already in their wallet will pick it up with its next update. **[CHECK: flagged in claims.md since v2, not confirmed for the launch design]** |  |
| `faq.items[2].question` | Will my customers have to set anything up? |  |
| `faq.items[2].answer` | No. There will be no app to install. Their phone will handle it, and they will be able to turn it off in their settings. |  |
| `faq.items[3].question` | Can I start before it launches? |  |
| `faq.items[3].answer` | Yes. Your card, stamps, rewards and notifications work today, and geolocation will join them when it's ready. |  |

### Final band

| Field | Text | Chars |
|---|---|---|
| `band.title` | Get your card ready today. | 26/36 |
| `band.accent` | ready today. |  |
| `band.sub` | Start with stamps or points now. Your card will be ready when geolocation launches. |  |

### Related

| Field | Text | Chars |
|---|---|---|
| `related.title` | Ways to bring customers back today. | 35/44 |
| `related.cards` | Push notifications · Promotional campaigns · Analytics |  |

## Mobile scanner (`/us/landing-pages/platform/mobile-scanner`, `MOBILE_SCANNER_PREVIEW`)

**Keywords.** Primary: **loyalty card scanner app**. Secondary: scan loyalty cards with a phone, web scanner, QR code loyalty scanner.
Primary in the meta title, the H1 and the ways H2 ("The scanner app, or just a web browser."). Secondaries in the meta description, the hero sub and the ways cells.

### Meta

| Field | Text | Chars |
|---|---|---|
| `meta.title` | Loyalty card scanner app for iPhone and Android \| Stampeo | 57/60 |
| `meta.description` | Scan loyalty cards with the free Stampeo Scanner app for iPhone and Android, or the web scanner in any browser. No new hardware. Free trial. | 140/160 |

### Hero (split: words left, the app on a phone and the web scanner in a browser right; no eyebrow)

| Field | Text | Chars |
|---|---|---|
| `hero.h1` | A loyalty card scanner app for your staff. | 42/46 |
| `hero.accent` | scanner app |  |
| `hero.sub` | The free app for iPhone and Android, or the web scanner in any browser. No new hardware. | 88/90 |
| `hero.primary` | Start my free trial |  |
| `hero.secondary` | See it at the counter (to #counter; the demo section is removed) |  |
| `hero.reassurance` | {trialDays} days free · Cancel anytime |  |
| `hero.alt` | The Stampeo Scanner app on a phone, and the web scanner open in a laptop browser, both showing a customer's card. **[CHECK: laptop, see the ways section]** |  |

### The counter (interactive)

| Field | Text | Chars |
|---|---|---|
| `counter.eyebrow` | At the counter | 14/28 |
| `counter.title` | Add stamps, points or rewards in one scan. | 42/44 |
| `counter.lead` | Scan the customer's card, then tap once. Their card updates in seconds. | 71/85 |
| `counter.options[0]` | Stamps · Add one, or several at once |  |
| `counter.options[1]` | Points · Type what they spent |  |
| `counter.options[2]` | Rewards · Redeem now, or save for their next visit |  |
| `counter.options[3]` | Levels · See their level and its perks |  |
| `counter.fact` | They get a notification on their lock screen right after. |  |

### App or browser (devices)

| Field | Text | Chars |
|---|---|---|
| `ways.eyebrow` | App or browser | 14/28 |
| `ways.title` | The scanner app, or just a web browser. | 39/44 |
| `ways.lead` | The app gives the smoothest scans. No download? The web scanner works anytime. | 78/85 |
| `ways.cells[0].title` | Stampeo Scanner app |  |
| `ways.cells[0].body` | Free on the App Store and Google Play. Sign in with Google or Apple in one tap. |  |
| `ways.cells[0].devices` | iPhone · Android |  |
| `ways.cells[1].title` | Web scanner |  |
| `ways.cells[1].body` | Open scan.stampeo.app in any browser. Nothing to install. |  |
| `ways.cells[1].devices` | Phone · Tablet · Laptop **[CHECK: STAMPEO.md says phone or tablet; Harry says a laptop works too]** |  |
| `ways.fact` | Both do the same job: scan the card, add stamps or points, redeem rewards. |  |

### Final band

| Field | Text | Chars |
|---|---|---|
| `band.title` | Stamp your first card today. | 28/36 |
| `band.accent` | today. |  |
| `band.sub` | Set up your card, then scan your first customer from any phone. |  |

### Related

| Field | Text | Chars |
|---|---|---|
| `related.title` | More Stampeo features. | 22/44 |
| `related.cards` | Card design · Push notifications · Analytics |  |

## Analytics (`/us/landing-pages/platform/analytics`, `ANALYTICS_PREVIEW`)

**Keywords.** Primary: **loyalty program analytics**. Secondary: customer return rate, repeat customers, busiest hours.
Primary in the meta title, the H1 and the charts H2 ("Loyalty program analytics, chart by chart."). Secondaries in the meta description, the hero sub and the chart lines.

### Meta

| Field | Text | Chars |
|---|---|---|
| `meta.title` | Loyalty program analytics: visits and return rate \| Stampeo | 59/60 |
| `meta.description` | Loyalty program analytics for small businesses: visits, return rate, new customers and your busiest hours, filled in by every scan. Free trial. | 143/160 |

### Hero (split: words left, the key-numbers card right; no eyebrow)

| Field | Text | Chars |
|---|---|---|
| `hero.h1` | Loyalty program analytics for your shop. | 40/46 |
| `hero.accent` | analytics |  |
| `hero.sub` | See visits, return rate, new customers and your busiest hours. Every scan fills it in. | 86/90 |
| `hero.primary` | Start my free trial |  |
| `hero.secondary` | See every chart (to #charts) |  |
| `hero.reassurance` | {trialDays} days free · Cancel anytime |  |
| `numbers.title` | Last three months (coordinator: the sample is a 13-week capture) |  |
| `numbers.visits.label` | Visits |  |
| `numbers.visits.line` | from {customers} customers (the dashboard's own line) |  |
| `numbers.returnRate.label` | Return rate |  |
| `numbers.returnRate.line` | of first-time customers came back within a month |  |
| `numbers.newCustomers.label` | New customers |  |
| `numbers.newCustomers.line` | signed up |  |
| `numbers.chart.label` | Visits over time |  |
| `numbers.chart.legend` | Returning · First visit |  |
| `hero.alt` | A key-numbers card from the Stampeo dashboard: visits, return rate, new customers and a chart of visits over time. |  |

### What you don't know today (production's blind-spot cards, front: the question, back: ???)

| Field | Text | Chars |
|---|---|---|
| `blindSpots.eyebrow` | With paper cards | 16/28 |
| `blindSpots.title` | What you don't know today. | 26/44 |
| `blindSpots.lead` | With paper cards, you run loyalty blind: no data, and no way to improve it. | 75/85 |
| `blindSpots.questions[0]` | How many regular customers? |  |
| `blindSpots.questions[1]` | How often do they come back? |  |
| `blindSpots.questions[2]` | How many stopped coming? |  |
| `blindSpots.questions[3]` | Which day is quietest? |  |
| `blindSpots.questions[4]` | How many rewards this month? |  |
| `blindSpots.questions[5]` | Is your program working? |  |
| `blindSpots.noAnswer` | ??? |  |

### Every chart (one colour family; one line each; no plan label)

| Field | Text | Chars |
|---|---|---|
| `charts.eyebrow` | Every chart | 11/28 |
| `charts.title` | Loyalty program analytics, chart by chart. | 42/44 |
| `charts.lead` | Each chart answers one question about your customers. Every scan fills it in. | 77/85 |
| `charts.rows[0]` | Visits over time · Every visit, week by week, split into first visits and returning customers. **[CHECK: the split is web analytics.json visits.legend, not STAMPEO.md]** |  |
| `charts.rows[1]` | Return rate · How many first-time customers came back within a month. |  |
| `charts.rows[2]` | New customers · How many people joined your card. |  |
| `charts.rows[3]` | Busiest times · Your visits by day and hour, with your busiest slot and quietest open hour. **[CHECK: quietest open hour is web analytics.json busiest.rows, not STAMPEO.md]** |  |
| `charts.rows[4]` | How often they come · Who comes every week, every two weeks, about once a month, or came once. **[CHECK: the buckets are web analytics.json frequency.buckets, not STAMPEO.md]** |  |
| `charts.rows[5]` | Reward progress · How close each customer is to a reward, and who has one ready. |  |
| `charts.rows[6]` | Monthly cohorts · Of each month's new customers, how many came back, and how soon. |  |
| `charts.rows[7]` | Levels · How many customers are on each level, and how many move up each month. |  |
| `charts.rows[8]` | Tracked spend · On a points card: what your team enters at the counter, and your average ticket. |  |
| `charts.rows[9]` | By location · Every chart for one shop at a time, when you have more than one. |  |

### Your customer list (looks like the dashboard's own)

| Field | Text | Chars |
|---|---|---|
| `customers.eyebrow` | Your customers | 14/28 |
| `customers.title` | Your customer list, sorted into groups. | 39/44 |
| `customers.lead` | See who's new, who's a regular, and who hasn't been back in a while. | 68/85 |
| `customers.columns` | Name · Stamps · Segment · Last visit |  |
| `customers.segments[0]` | New · joined in the last two weeks **[CHECK: this and the definitions below are web customers.json segmentsHelp; STAMPEO.md names the segments only]** |  |
| `customers.segments[1]` | Regular · keeps coming back |  |
| `customers.segments[2]` | VIP · has redeemed three rewards or more |  |
| `customers.segments[3]` | Reward ready · has a reward to claim now |  |
| `customers.segments[4]` | Close to reward · two stamps or fewer from it |  |
| `customers.segments[5]` | At risk · hasn't been back in over a month |  |
| `customers.segments[6]` | Ghost · got the card, never came back |  |
| `customers.fact` | Download your customer list anytime, as a CSV file. |  |

### The dashboard on laptop and phone

| Field | Text | Chars |
|---|---|---|
| `devices.eyebrow` | Laptop and phone | 16/28 |
| `devices.title` | Your numbers on your laptop or your phone. | 42/44 |
| `devices.lead` | The same dashboard on both. Check your numbers from anywhere. | 61/85 |
| `devices.laptopAlt` | The Stampeo analytics page open on a laptop |  |
| `devices.phoneAlt` | The same analytics page on a phone |  |

### Final band

| Field | Text | Chars |
|---|---|---|
| `band.title` | Stop guessing. Start knowing. | 29/36 |
| `band.accent` | Start knowing. |  |
| `band.sub` | Your analytics fill in from the first card you scan. |  |

### Related

| Field | Text | Chars |
|---|---|---|
| `related.title` | More Stampeo features. | 22/44 |
| `related.cards` | Promotional campaigns · Push notifications · Card design |  |

## Card design (`/us/landing-pages/platform/card-design`, `CARD_DESIGN_PREVIEW`)

**Keywords.** Primary: **digital loyalty card**. Secondary: loyalty card design, Apple Wallet loyalty card, digital punch card, custom stamp icons.
Primary in the meta title, the H1 ("Design your digital loyalty card") and the wallets H2 ("Your digital loyalty card on any phone."). "Design" in the meta title and H1; "Apple Wallet" with "loyalty card" in the meta description, the hero sub and the wallets lead; "digital punch card" in one FAQ question (allowed on /us landing pages); "stamp icons" in the icons H2.

### Meta

| Field | Text | Chars |
|---|---|---|
| `meta.title` | Design your digital loyalty card \| Stampeo | 42/60 |
| `meta.description` | Design a digital loyalty card with your logo, colors and stamp icons, for Apple Wallet and Google Wallet. Stamps, points or levels. Free trial. | 143/160 |

### Hero (split: words left, the re-skinning card right, clickable and slower; no eyebrow)

| Field | Text | Chars |
|---|---|---|
| `hero.h1` | Design your digital loyalty card. | 33/46 |
| `hero.accent` | digital loyalty card. |  |
| `hero.sub` | Your logo, your colors and your own stamp icons, in Apple Wallet and Google Wallet. | 83/90 |
| `hero.primary` | Start my free trial |  |
| `hero.secondary` | See every part of the card (to #anatomy; the designer is removed) |  |
| `hero.reassurance` | {trialDays} days free · Cancel anytime |  |
| `reskin.captions` | Car wash · Bakery · Wine bar · Lash studio · Bookstore · Pizza truck (unchanged) |  |
| `reskin.prev` | Previous shop |  |
| `reskin.next` | Next shop |  |
| `reskin.dot` | Show the {shop} card |  |
| `reskin.alt` | One loyalty card taking on the look of six shops: a car wash, a bakery, a wine bar, a lash studio, a bookstore and a pizza truck. |  |

### Every part of the card is yours (anatomy; the top-right label is the count, not the business name)

| Field | Text | Chars |
|---|---|---|
| `anatomy.eyebrow` | Every part | 10/28 |
| `anatomy.title` | Every part of the card is yours. | 32/44 |
| `anatomy.lead` | Change the logo, colors, stamps, reward and details. We add the QR code for you. | 80/85 |
| `anatomy.toggle` | Stamps · Points |  |
| `anatomy.labels (stamps, desktop, in ANNOTATIONS order)` | Logo · Stamp count · Stamps · Customer's name · Reward · QR code to scan |  |
| `anatomy.mobileLabels (stamps)` | Logo · Count · Stamps · Name · Reward · QR code |  |
| `anatomy.pointsLabels (points, desktop)` | Logo · Points balance · Points display · Customer's name · Next reward · QR code to scan |  |
| `anatomy.pointsMobileLabels (points)` | Logo · Balance · Points · Name · Reward · QR code |  |

### Stamps, points or levels (three real cards)

| Field | Text | Chars |
|---|---|---|
| `programs.eyebrow` | Stamps, points or levels | 24/28 |
| `programs.title` | A stamp card, a points card or levels. | 38/44 |
| `programs.lead` | Stamps reward visits, points reward spending, and levels reward your regulars. | 78/85 |
| `programs.cards[0].title` | Stamp card |  |
| `programs.cards[0].line` | A stamp for each visit, and a reward when the card is full. |  |
| `programs.cards[1].title` | Points card |  |
| `programs.cards[1].line` | Points on what they spend, and a menu of rewards to pick from. |  |
| `programs.cards[2].title` | Levels |  |
| `programs.cards[2].line` | Up to five levels. Regulars move up, and their card changes look. |  |
| `programs.alts` | A barbershop's stamp card · A gym's points card · A dry cleaner's card at Bronze, Silver and Gold (builder: use real samples not shown elsewhere on the page) |  |

### Your own stamp icons and logo (real cards from different shops)

| Field | Text | Chars |
|---|---|---|
| `icons.eyebrow` | Stamp icons | 11/28 |
| `icons.title` | Use our stamp icons, or upload your own. | 40/44 |
| `icons.lead` | Pick from 98 ready-made icons, or upload your logo. We remove the background. | 77/85 |
| `icons.facts[0]` | 98 ready-made stamp icons, searchable by name **[CHECK: "searchable by name" is the live page's iconLibrary line, not STAMPEO.md; 98 = stampIcons.length]** |  |
| `icons.facts[1]` | Upload any image: the background is removed automatically |  |
| `icons.facts[2]` | A different icon for each stamp, and a special one for the reward |  |
| `icons.facts[3]` | In a row, staggered or overlapping |  |
| `icons.facts[4]` | No logo? The card shows your initials instead |  |
| `icons.cards` | Pulp: its own citrus icons · Gelo: its own cones · A pet groomer: paws from the library (builder: captions name what each card shows) |  |

### iPhone and Android

| Field | Text | Chars |
|---|---|---|
| `wallets.eyebrow` | iPhone and Android | 18/28 |
| `wallets.title` | Your digital loyalty card on any phone. | 39/44 |
| `wallets.lead` | The same card in Apple Wallet and Google Wallet. Customers scan one QR code. | 76/85 |
| `wallets.cells[0]` | One QR code · Customers scan it and get the card for their phone. |  |
| `wallets.cells[1]` | Live preview · See both wallets while you design. |  |
| `wallets.cells[2]` | Always up to date · Change your card, and every card already in a wallet updates. **[CHECK: the live card design FAQ, not STAMPEO.md]** |  |
| `wallets.phoneAlts.apple` | An iPhone with the loyalty card open in Apple Wallet |  |
| `wallets.phoneAlts.google` | An Android phone with the same loyalty card open in Google Wallet |  |

### FAQ (title only)

| Field | Text | Chars |
|---|---|---|
| `faq.title` | Questions about your card | 25/44 |
| `faq.items[0].question` | Can I use my own stamp icons? |  |
| `faq.items[0].answer` | Yes. Upload any image, like your croissant, your mascot or your logo. The background is removed automatically and it becomes a stamp. You can even use a different icon for each stamp. |  |
| `faq.items[1].question` | What if I don't have a logo? |  |
| `faq.items[1].answer` | Your card still works. Without a logo it shows your initials in your accent color, and you can pick from 98 ready-made stamp icons. |  |
| `faq.items[2].question` | Can I make a digital punch card or a points card? |  |
| `faq.items[2].answer` | Both. A stamp card works like a paper punch card, with a stamp for each visit. A points card rewards what they spend. Add levels to either, and switch later without your customers losing their card. |  |
| `faq.items[3].question` | Does the card work on iPhone and Android? |  |
| `faq.items[3].answer` | Yes. The same card goes into Apple Wallet and Google Wallet, and the designer shows both while you work. Customers scan one QR code, whatever their phone. |  |
| `faq.items[4].question` | Can I change the card later? |  |
| `faq.items[4].answer` | Anytime. Edit your card, and the cards already in your customers' wallets update on their own. **[CHECK: the live card design FAQ, not STAMPEO.md]** |  |
| `faq.items[5].question` | Can you design the card for me? |  |
| `faq.items[5].answer` | Yes, for free. Send us your logo and details, and we send back a card ready to use. You can still change it yourself afterwards. |  |

### Final band

| Field | Text | Chars |
|---|---|---|
| `band.title` | Make a card that looks like you. | 32/36 |
| `band.accent` | looks like you. |  |
| `band.sub` | Design it yourself, or send us your logo and we'll make it for you, free. |  |

### Related

| Field | Text | Chars |
|---|---|---|
| `related.title` | More Stampeo features. | 22/44 |
| `related.cards` | Scanner app · Push notifications · Analytics |  |

## Related cards (`PREVIEW_SHARED.related`)

Each card: the feature's name, then one plain line. The lines no longer repeat the H1s (the H1s now carry the search phrase, which the tile's title already names), so the copy test that pins `line === hero.h1` changes to "each line is set and at most 50 characters".

| Card | Title | Line | Chars (line) |
|---|---|---|---|
| `related.cards.cardDesign` | Card design | Your logo, colors and stamp icons on the card. | 46 |
| `related.cards.mobileScanner` | Scanner app | Stamp cards from the app or any web browser. | 44 |
| `related.cards.pushNotifications` | Push notifications | Every stamp and reward on their lock screen. | 44 |
| `related.cards.analytics` | Analytics | Visits, return rate and your busiest hours. | 43 |
| `related.cards.promotionalCampaigns` | Promotional campaigns | One message to every customer's card. | 37 |
| `related.cards.geolocation` | Geolocation | Coming soon: your card when they walk by. | 41 |

Section title over the three tiles: `More Stampeo features.` (22) on every page but geolocation, which keeps its own `Ways to bring customers back today.` (35).

## Platform: one new stat in "By the numbers" (`PLATFORM.numbers`)

A fourth figure after the three `variant.metrics` ones (120+ active businesses, 20,000+ stamps issued, 25+ countries), kept in Platform's copy module only. It is a sourced figure (`value`, `text`, `source`), so the % guard accepts it; the source prints under it.

| Field | Text | Chars |
|---|---|---|
| `numbers.figures[3].value` | 95% | 3 |
| `numbers.figures[3].text` | of cards still in the wallet three months later | 47 |
| `numbers.figures[3].source` | Stampeo data: 2,786 cards from 73 businesses, added June to August 2026 | 71 |

"after 90 days" would trip `DIGIT_DAYS`; the study measured day 90, which "three months later" says without a digit-day count (the campaigns figure already used "three months later" for the same measure).

## Claims and their sources

STAMPEO.md = `stampeo-seo/stampeo seo en/STAMPEO.md` (line numbers as of 16 Nov 2026). STAMPEO.md is stale on campaigns: lines 254 and 402 to 404 still say Starter has none. STA-549 shipped on 16 Nov (`PLAN_FACTS.starter.broadcastsPerMonth = 8`, Growth and Pro unlimited), which is why the campaigns page may say campaigns come with the subscription.

| Claim | Pages | Source |
|---|---|---|
| Every stamp and reward sends an automatic lock-screen notification, through the wallet card, on Apple Wallet and Google Wallet | push, related | L60, L228-234, L244, L246, L483 |
| The default messages ("Stamp collected! You have 5 of 8 stamps.", reward unlocked, reward redeemed, "You've reached Silver!") | push | L54, L213; backend `notification_defaults.py` via `copy/shared.ts` |
| Switch any message off, or rewrite it in your words with the customer's name | push | L238-242 (described without its plan) |
| Your own notification icon, uploaded or made from your logo | push | L242 |
| Customers download no app and create no account | push, campaigns, geolocation | L19, L362 |
| A campaign is one message to every installed card; no email or phone number needed | campaigns | L250, L366 |
| No fee per message; no limit on how many customers a campaign reaches | campaigns | L366 (no SMS), L398-400 (no usage caps); Harry, 16 Nov |
| Your plan sets how many campaigns you can send each month | campaigns FAQ | STA-549, `PLAN_FACTS.*.broadcastsPerMonth` |
| Delivery split by Apple Wallet and Google Wallet; send it again | campaigns | L260; web `notifications.json` `detail.sendAgain` |
| Google shows up to three notifications per card a day | campaigns | L246; web `notifications.json` `howItWorks.googleNote` |
| A translation in English, Spanish, French or Polish, matched to the customer's phone | campaigns | L33, L37-38 |
| Send only to customers who joined recently | campaigns idea 4 | STA-549 and the live campaigns hero ("basic segmentation"); flagged [CHECK] above |
| Geolocation: coming soon, no date; your card will appear on the lock screen near your shop; the address added once in the dashboard | geolocation | L11, L353; `claims.md` "Coming soon" rows |
| Geolocation privacy (distance checked on the phone, no location received, can be turned off) | geolocation | `claims.md` rows 72-74 (live page, `pass_generator.py`); flagged [CHECK] above |
| The card already in their wallet will pick it up | geolocation FAQ | flagged since v2 (`claims.md` row 76) |
| The Scanner app is free on the App Store and Google Play, for iPhone and Android; one-tap Google or Apple sign-in | scanner | L122, L124-125, L131 |
| The web scanner at scan.stampeo.app does the same job, nothing to install | scanner | L122, L482 (phone or tablet; laptop flagged [CHECK]) |
| Several stamps at once, type the amount spent, redeem now or later, see the level and its perks | scanner | L133-136 |
| The card updates within seconds and the customer gets a notification | scanner | L137 |
| Visits, new customers, return rate (within a month), tracked spend on points, visits over time | analytics | L270-271 |
| Busiest times, how often they come, reward progress | analytics | L272 |
| Monthly cohorts; one location at a time | analytics | L273-274 (described without their plan) |
| Customers per level and moves up per month | analytics | L216 |
| Live activity on the dashboard, no refresh | analytics | L264 |
| Segments New, Regular, VIP, Reward ready, Close to reward, At risk, Ghost | analytics | L220 (definitions: web `customers.json`, flagged) |
| Customer list download as a CSV file | analytics | L224 |
| Logo, colors, stamp icons from the library or uploaded, background removed automatically, a different icon per stamp, a reward stamp, arrangement | card design | L172, L174 |
| 98 ready-made icons | card design | `stampIcons.length` (tested) |
| No logo: initials in the accent color | card design | L175 |
| Live preview of both wallets while you design | card design | L172 |
| We design the card for you, free | card design | L179 |
| Stamps or points, up to five levels with their own card look, switch without customers losing their card | card design | L183-193, L202, L208-211, L479-480 |
| Edited cards update in customers' wallets | card design | live card design FAQ; flagged [CHECK] above |
| 95% of cards still in the wallet three months later | Platform | `retention-study-2026-11-16.md` (95.5% at day 90, 2,786 cards, 73 businesses, rounded down) |
