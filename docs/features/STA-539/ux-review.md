# UX review (POLISH): STA-539

Run by the coordinator on 2026-11-07 against the worktree's `next dev` (the
shared Playwright browser was busy; headless Chromium with a `timezoneId` per
context), at 390 and 1440 px.

| Visit | Consent surface | Footer link | Tags requested |
|---|---|---|---|
| New York, `/en/us`, 390 px | none | "Your Privacy Choices" + opt-out icon | GA (googletagmanager, region1.google-analytics) |
| Chicago + GPC, `/en/us` | none | "Your Privacy Choices" | none |
| Los Angeles, `/en/us`, 1440 px | none | "Your Privacy Choices" + icon | GA |
| Paris, `/fr`, 390 and 1440 px | the two-button banner, unchanged | "Cookie preferences" | none |

Notes:
- No Meta pixel request locally because the local `.env.local` has no pixel id;
  the pixel's gate is the same marketing grant GA's ad signals use.
- `stampeo_sid` did not stick on `localhost` because its domain comes from
  `NEXT_PUBLIC_COOKIE_DOMAIN` (the dev domain); unrelated to this change.
- The dev overlay's "1 Issue" on every page is the landing demo failing to
  reach the dev API (backend not running), not consent.

Nothing to fix: the change removes a surface; the footer and the EU banner
are unchanged.
