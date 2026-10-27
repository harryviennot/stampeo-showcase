# UX Review: STA-514
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 768x1024, 1024x768, 1440x900; /, /en, /es, /pl, /us), production build on :3011
VERDICT: FIXED WITH FINDINGS

## Fixed
- `VariantDashboardShot.tsx`: the ink arrow never drew (`.ink-draw` needs a `.revealed` ancestor and the note sat outside every ScrollReveal). The note's wrapper is now a `ScrollReveal delay={300}`, as in VariantTryIt and DesignTeaser; the arrow draws at 768, 1024 and 1440 in all four locales.
- `VariantDashboardShot.tsx`: `InkArrow` `w-9` → `w-14` (matches VariantTryIt's `right` arrow). Tip 14–18px from the phone; 31–35px to the frame, 32–43px to the plan line.
- `PhoneMockup.tsx` + section: the 48px `#f2f2f7` band read as a cool stripe over the warm capture (`#f4f2ee`). New optional `screenBackground` prop (inline `backgroundColor`; undefined leaves the three existing call sites unchanged); the section passes `var(--paper-hover)`.
- `VariantDashboardShot.tsx`: points block `max-w-sm md:max-w-md`. At 768 EN point 1 and ES point 2 wrapped onto a second line; now every point fits on one line, 390 and lg unchanged.

## Mobile findings
- 390, every locale: hero → section 64px, heading → caption 16px, caption → phone 40px, phone → plan line 24px, plan line → points 40px, points → trust strip (Benefits on /us) 64px. One-line heading, no ink note, nothing tappable, no overflow, only `*-phone.png` downloads.
- Feature grid "Soon" pill at 390 and 1440 (Bientôt 55px, Soon 43px, Pronto 51px, Wkrótce 61px, 21px tall): top-right, top-aligned with the icon, no wrap; every tile title keeps its line count; tile height unchanged.
- Numbers strip at 390: no figure wraps ("+20 000" 82px in a 109px column). FR/PL use a plain space, so a narrower column could break it: `whitespace-nowrap` on the `dd` (VariantMetricStrip, outside the diff).
- Barbershop advantage line: hidden below md; one line at 1440 in all four locales.
- The phone capture is cut mid-line at the bottom by `object-cover object-top` ("Whole period: …" half clipped).

## Brief drift
- Captures use the 90-day period; plan and brief said 30 days. The KPI row shows red ▼37% (new customers) and ▼5 pts (return rate) in every locale. Needs a decision: accept, or re-shoot.
- Phone ~190px at lg, ~218px at xl (brief: ~240/280): the coordinator's retune that keeps the phone below the KPI row. Confirmed it clears the row at 768, 1024, 1440. Fine.
- The ink note now has its own ScrollReveal (needed for the arrow). The browser frame still has none. Fine.
- AC10 rechecked: frame tops unchanged; `/` shows only part of the bar at 1440x900, `/us` part of it. Reported, not fixed.
- At 1024x768 the frame is below the fold anyway (799–825px). Left as decided.

## Copy flagged
- FR and PL `variant.dashboard.caption`: 4 lines at 390 (slot is ≤3). EN and ES are 3.
- ES heading "Su tarjeta, tus números.": "Su" can read as the formal "your".
- ES barbershop `advantage` (STA-399's wording): 3 lines at 768, 2 at 1024 where other slides take 2 and 1; fine at 1440.
- `landing.featureGrid.features[4].description` ("Know your regulars. Not just by sight." and translations): the per-customer promise the brief banned for this section, two sections below. Predates this diff.

## Left alone
- `VariantMetricStrip.tsx` `dd` `whitespace-nowrap`: outside the diff.
- The phone capture's clipped last line and the red down-trend KPIs: a capture decision.

## Verification
- type-check: pass   lint: pass
- Production build rebuilt twice, only :3011 restarted; coordinator's measurement script re-run after edits: frame tops identical, overflowX 0, section order right, phone-only downloads at 390, ink note hidden at 390 and visible from 768.
