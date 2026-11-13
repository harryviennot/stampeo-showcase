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
