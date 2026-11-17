# Gap Report: STA-546
AUDITED: 2026-11-12  DIFF: origin/dev...HEAD (docs excluded)
VERDICT: DRIFT FOUND

## Criteria without tests
- AC1 (partial): no test that /us/landing-pages/<slug> is a pilot path (isPilotPath -> /en rewrite, marketFromPath -> "us" cookie, isTrackablePath). Closest: lib/market-paths.test.ts:59-62 and lib/consent-routes.test.ts:74 (/us/vs only).
- AC2 (partial): market="us" on PricingSection is unpinned in the three page files; PricingSection defaults to "int".
- AC5 (partial): locations are not pinned per component (LpHero hero, LpFaq faq_contact, LpFinalCta final_cta). HeroDemo's demo_*_claim links and the Header CTAs are reused sign-up links outside AC5's list.
- AC6 (partial): the rendered sentence "Used by 120+ businesses in 25+ countries" is never asserted.
- AC10 (partial): lpBanner's sender -> appName mapping is untested; How-to's banner is outside the Outcomes-only lpBanner check; the SHARED.proof template is never read by the claim guards (functions are skipped).
- AC13 (partial): nothing checks that {trialDays} strings render through RegionText (LpHero, LpFinalCta, LpFaq).
- AC15 (partial): CardStyleGallery sectionClassName and NotificationPhoneDemo fallback banner defaults unpinned.
- AC16: NotificationPhoneDemo's container gained "flex flex-col gap-2", so /features/notifications-push HTML is not byte-for-byte the same; HeroCardStack peekFrom default unpinned.
- Plan decision "no levels": PricingSection prints "Stamps, points or levels" on every plan card. Escalate.
- Plan "quoted exactly": the Square definition wording differs between plan and copy.

## Untested diff behavior
- LandingPageShell defaultCurrency="usd" / defaultTrialDays={MARKETS.us.trialDays}: untested (pre-hydration and JS-off visitors).
- LpHero demo link renders only when hasDemoSection(slug): untested.
- HeroCardStack peekFrom default "lg": untested.
- STAMP_BANNER "5 of 8" vs the cards' stamp count: nothing keeps them consistent.
- AurevoCard -> WalletCard renders a real QR whenever qrUrl is passed; AC14 scan covers components/landing-pages only. Low.

## Drift (in diff, not in plan.md)
- HeroCardStack peekFrom; CardStyleGallery heading + sectionClassName; NotificationBanner icon + optional body; language switcher hidden on /us/landing-pages/*; FAQ answers rewritten (Q3 new, Q5 narrowed); "who's slipping away" in Outcomes.

## Suspect tests
- pages.test.ts "all you need" check passes on the destructuring line alone.
- copy.test.ts AC12 finds figures by their `source` key, so an unsourced figure is invisible.
- copy.test.ts AC10 allowlist includes OUTCOMES.slowDays.lead, which is not on the PlanLine.
- copy.test.ts AC13 allows `$` in the Example, which AC13 forbids.
- pages.test.ts AC5 checks only set membership of locations.
- pages.test.ts AC15 pins default-parameter text, not output.

## Unrealistic or missing workflow tests
- Missing: an ad click on /us/landing-pages/<slug>?gclid=… gets the /en rewrite, the us market cookie and is trackable.
- Missing: a US visitor before hydration sees $ and 14 days.
- Missing: an Outcomes visitor sees no demo link.
- CSS-class pins (only PhoneCrop has max-h, justify-center, sides, py-16, scroll-mt) are unobservable by users.

## Waivers
(filled by the main agent only if the user explicitly waives a gap)

## Main agent's routing (12 Nov 2026)
- Fixed in the plan (drift / AC wording, no code): extended props listed; language switcher; FAQ rewrite; "who's slipping away" (customer segments At risk / Ghost show on every plan); AC10 reworded to "on the line with, or the line directly under"; AC13 exempts the labelled Example; AC16 reads "renders the same" with the NotificationPhoneDemo default made byte-identical in code; the Square definition matches the press release ("visits a business at least four times per year").
- "No levels" vs the shared pricing block: the pricing block is reused unchanged by plan decision and is the same block as /us and /us/pricing; its "levels" line is a site-wide claim Harry chose to ship (Nov 2026). Out of this issue's scope, flagged to Harry in the hand-off.
- Everything else goes to the fix stage (stage E).
