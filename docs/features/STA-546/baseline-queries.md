# STA-546: baseline funnel queries (PostHog, not run yet)

Not run on 12 Nov 2026: the PostHog connector is signed in to another organisation and cannot reach
Stampeo's EU project 141822. Run these once it is reconnected, for the current `/us` page (baseline)
and later for `lp_howto`, `lp_features`, `lp_outcomes` (filter on `properties.landing_variant`).

Event names that matter (from the showcase code):
- `landing_viewed {locale}`, `landing_section_viewed {locale, section}`, super-property `landing_variant`.
- Sign-up click in PostHog is `landing_cta_clicked {cta_location, href}`. `sign_up_cta_click` is GA4 only.
- `landing_demo_cta_clicked` is a CONTACT click (`/contact`), not the live demo.
- Live demo: `demo_started`, `demo_step_reached {step: pass_downloaded | pass_installed}`.
- Onboarding (same site): `onboarding_wizard_started`, `onboarding_step_completed {step_name}`.

Caveats: `persistence: "memory"` makes every full reload a new person and session, so funnels are
same-session only and the `authentication` step is undercounted (mail-app round trips, OAuth). Exclude
bots with `NOT isLikelyBot(properties.$raw_user_agent)`.

The trustworthy end point for comparing pages is NOT PostHog: it is `businesses.landing_variant` in
the DB (stored signup attribution), counted against trial starts.

## Q1. Funnel per landing session, split by US / ad / device

```sql
SELECT is_us, is_ad, device,
  countIf(v) AS views, countIf(v AND cta) AS cta_click, countIf(v AND wiz) AS wizard,
  countIf(v AND auth) AS auth_done, countIf(v AND demo) AS demo_started, countIf(v AND pass) AS pass_installed
FROM (
  SELECT properties.$session_id AS sid,
    anyIf(properties.$geoip_country_code, event='landing_viewed')='US' AS is_us,
    maxIf(properties.$current_url ILIKE '%gclid=%', event='landing_viewed') AS is_ad,
    anyIf(properties.$device_type, event='landing_viewed') AS device,
    countIf(event='landing_viewed')>0 AS v,
    countIf(event='landing_cta_clicked')>0 AS cta,
    countIf(event='onboarding_wizard_started')>0 AS wiz,
    countIf(event='onboarding_step_completed' AND properties.step_name='authentication')>0 AS auth,
    countIf(event='demo_started')>0 AS demo,
    countIf(event='demo_step_reached' AND properties.step='pass_installed')>0 AS pass
  FROM events
  WHERE timestamp >= now()-INTERVAL 30 DAY AND NOT isLikelyBot(properties.$raw_user_agent)
    AND event IN ('landing_viewed','landing_cta_clicked','onboarding_wizard_started',
                  'onboarding_step_completed','demo_started','demo_step_reached')
  GROUP BY sid)
GROUP BY is_us, is_ad, device ORDER BY views DESC
```

## Q2. Where visitors stop (sections reached)

```sql
SELECT properties.landing_variant AS variant, properties.section AS section,
  uniq(properties.$session_id) AS sessions
FROM events
WHERE event='landing_section_viewed' AND timestamp >= now()-INTERVAL 30 DAY
  AND properties.$geoip_country_code='US' AND NOT isLikelyBot(properties.$raw_user_agent)
GROUP BY variant, section ORDER BY variant, sessions DESC
```

Divide by `landing_viewed` sessions for the same variant to get the share reaching each section.

## Q3. Which CTA gets clicked

```sql
SELECT properties.landing_variant AS variant, properties.cta_location AS cta, count() AS clicks
FROM events
WHERE event='landing_cta_clicked' AND timestamp >= now()-INTERVAL 30 DAY
  AND properties.$geoip_country_code='US'
GROUP BY variant, cta ORDER BY variant, clicks DESC
```
