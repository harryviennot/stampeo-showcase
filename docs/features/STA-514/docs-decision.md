# Docs decision: STA-514

No help-center change. Against the diff:

- User-visible behaviour changed? Only on the public landing (marketing copy, a new section of screenshots, the feature grid's "Soon" pill). Nothing in the dashboard, scanner or customer card changes.
- New setting or option? No.
- Error message or copy changed? Landing copy only (`variant.dashboard.*`, `variant.metrics`, the barbershop sector line, the Geolocation tile); no product copy.
- Pricing or tier gating changed? No. The section's plan line restates the existing gating (Analytics charts on Growth and Pro), guarded by `lib/landing-dashboard-copy.test.ts`.

For anyone reading the landing funnel in PostHog: from the release date, `landing_section_viewed` with `section = dashboard_preview` comes from the second section (it was the fifth), and `trust_strip` moves one place down, after it. Same ids, new positions.

The internal doc for re-shooting the captures is the `landing-shots` row in promo-videos `PLAYBOOK.md`, and LD-14 in `docs/qa/landing.md`.
