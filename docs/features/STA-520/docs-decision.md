# Docs decision: STA-520

No help-center change. Against the diff:

- User-visible behaviour changed? Only the marketing site's device illustrations (the phone frame and its status bar on nine phones) and the geolocation hero, whose map now shows. Nothing in the dashboard, scanner or customer card changes.
- New setting or option? No.
- Error message or copy changed? No.
- Pricing or tier gating changed? No.

Re-capturing the status bars: promo-videos `bun tools/sim/status-bar.ts` (PLAYBOOK row). The bezel is Apple's file, copied byte for byte; `lib/devices/iphone.test.ts` checks its hash.
