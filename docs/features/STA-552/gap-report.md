# Gap Report: STA-552
AUDITED: 2026-11-13  DIFF: sta552-final.diff (feat/sta-552-feature-previews against its STA-546 base; docs, snapshots and public assets excluded)
VERDICT: GAPS FOUND, DRIFT FOUND

## Criteria without tests
- **AC3, "every claim is live (STAMPEO.md §6-§8)":** no test reads STAMPEO.md. `plan-claims.test.ts` CHIPPED only covers chipped objects. Because the previews dropped "Every plan" chips, every-plan claims moved into plain sentences, and none of those sentences is registered in `PLAN_LINES` (plan-claims.test.ts:99-103):
  - `ANALYTICS_PREVIEW.glance.lead` (analytics.ts:20)
  - `ANALYTICS_PREVIEW.band.sub` (:101)
  - `ANALYTICS_PREVIEW.questions.closer` "Starter shows these in a sentence; Growth and Pro chart them." (:65)
  - `MOBILE_SCANNER_PREVIEW.ways.lead` "Both are free on every plan." (mobile-scanner.ts:61)
  - `PUSH_NOTIFICATIONS_PREVIEW.wording.lead` "…Growth and Pro let you rewrite them." (push-notifications.ts:54)
  - `PUSH_NOTIFICATIONS_PREVIEW.band.sub` (:83)
  - `PROMOTIONAL_CAMPAIGNS_PREVIEW.how.cells[1..2]` "Pro adds…", "on Pro…" (promotional-campaigns.ts:70-71)
  - the FAQ targeting answer (:161)

  These unchipped product claims are not checked against any source:
  - "Send it again anytime" (promotional-campaigns.ts:119). Project memory for STA-470..473 records "re-send undecided".
  - "5 color palettes from your logo" (card-design.ts:39). The 98 and the 4 next to it are tested; the 5 is not.
  - "Sign in with Google or Apple in one tap" (mobile-scanner.ts:63). Today's catalog says "Sign in with your account".
  - "A recap in your inbox, weekly or monthly" (analytics.ts:27).
  - "Download your customer list anytime" (analytics.ts:83).
  - "with your busiest slot and quietest open hour" (analytics.ts:53).
  - "Switch each message on or off" (push-notifications.ts:61).
  - "Upload an icon, or use one made from your logo" on every plan (push-notifications.ts:48).
  - "in your customer's language" (push-notifications.ts:35).
  - "save it for their next visit" (mobile-scanner.ts:47).
  - "in your business hours" (promotional-campaigns.ts:156).

  Closest existing: plan-claims.test.ts CHIPPED/PLAN_LINES.
- **AC3, "every % figure carries a source":** this is only enforced on copy modules (copy.test.ts:259-267). The percentages hard-coded in components have no source line and no test decides whether they are exempt: GlanceTiles.tsx:21-24 (▲17%, ▲11%, 61%) and QuestionMinis.tsx:20-22 (61%). Closest: copy.test.ts "a percentage or a multiplier is printed only as a sourced figure".
- **AC5, "no horizontal scroll at 390":** no test. Closest: a manual measurement noted at ux-review.md:18. The `stackZooms` tests check label size, not width.
- **AC5, tap targets ≥ 44px:** only analytics.test.tsx and mobile-scanner.test.tsx sweep every `<a>`. The card-design, push-notifications and campaigns sections have no such sweep. The FAQ table rows' `min-h-14` (FAQList.tsx:20) is never asserted.
- **AC6, "today's five feature pages are unchanged":** no test. The diff edits components those pages render: AnnotatedWalletCard, IconLibrarySection, controls.tsx, CompactPlayground, NotificationSequenceDemo, LiveActivityFeed, ui/FAQList, ui/ScannerLoop.
  - Only LiveActivityFeed, CardDesignPlayground (which covers controls.tsx) and NotificationPhoneDemo have snapshots from before this diff. The others' snapshots are new in it.
  - FAQList's direct callers (CardDesignPageContent.tsx:110, BroadcastsPage.tsx:408) have no render snapshot, and FAQList's new `table` prop is not in the AC15 `EXTENDED` guard (shared-sections.test.ts:548-561).
- **AC2, "generalised components keep its output":**
  - `HowTable` (now drawn by StepsTable) and `PlatformHero` have no render or snapshot. Only source regexes cover them (platform-page.test.tsx:94-109, :190-194).
  - Nothing checks that the Platform page itself still mounts `<PlatformHero />` and `<LpAccentBand />` with no props (app/[locale]/us/landing-pages/platform/page.tsx:37, :51).
- **AC1 scope, "absent from … menus" (plan.md:17):** no test. Low risk, since no nav file links to `landing-pages` today.

## Untested diff behavior
- **IconRows.tsx:16, 24-29:** the reduced-motion stop works only because the animated track is the grandchild of the wrapper (`[&>div>div]`). card-design.test.tsx:92-98 checks that the class is present, not where it lands. Risk: if anyone wraps IconMarquee (which today's card-design page shares), the marquee keeps moving for reduced-motion readers and no test notices.
- **NotificationSequenceDemo.tsx:84-90, 193:** the reduced-motion stop is only checked by regexes on the source (extended-components.test.tsx:103-114). Nothing renders it or checks the behaviour. Risk: a harmless refactor fails the test, while a timer started elsewhere would pass.
- **CompactPlayground.tsx:34:** handing `touch` on to PointsControl in points mode is not exercised through CompactPlayground. Risk: if that hand-off is dropped, a phone visitor who switches to Points gets the small tabs and slider again.
- **FAQList.tsx:15-41 (FAQTable):** the 56px row height and `defaultOpenCount` in table mode are not asserted. Risk: low.
- **LockScreenSlice.tsx:16, 28:** the `thumb` branch (no clock, no tray) has no assertion that the ideas rows omit "9:41". Risk: low.
- **OwnIconCard.tsx:13:** a shop without a custom icon falls back to `?? ""`, which renders `<img src="">`. Only Aurevo's icon is asserted (push-notifications.test.tsx:202-210). Risk: low.
- **GlanceTiles.tsx:21-24, QuestionMinis.tsx:20-22:** the figures are literals that duplicate Platform's `ANALYTICS` (DeliverAnalytics.tsx), and tests pin the literals. Risk: the Platform page and the analytics preview can show different numbers for the same sample café.
- **PlatformHero.tsx:31-37:** the eyebrow and sub on the card-design hero are never rendered in a test; a source regex is the only check (kit.test.tsx). Risk: low.
- **CounterSection.tsx (levels row):** LevelCards is zoomed to 288px on a phone but left out of the 11px label check, which reads CounterMinis.tsx only (mobile-scanner.test.tsx:191-197). Risk: unreadable labels on the levels row go unnoticed.

## Drift (in diff, not in plan)
- **components/ui/FAQList.tsx:15-41 and shared/LpFaq.tsx:** a site-wide `ui/` component gained a table rendering mode, and an eyebrow switches LpFaq to a centred header with the contact line centred. plan.md and the brief only name `LpFaq.faq`; the table look comes from ux-review.md:27-33. Either the plan is stale (update it and add tests) or this is scope creep (escalate).
- **components/landing-pages/platform/HoverRows.tsx:16-25, 84:** the `stackOnPhone` layout (CSS `zoom`) is used by three sections. The brief's 390px layouts say "128px minis" beside the words (ux-brief.md:687); stacking comes from ux-review.md:134. The plan is stale.
- **components/features/analytics/LiveActivityFeed.tsx:48, 97-103, 121:** the `soft` prop changes the frame and makes the body 16px taller. It is in neither plan.md nor the brief. Per ux-review.md:135 it fixes a fifth-row clipping bug for the previews only, and the live pages keep the bug. Escalate the scope split.
- **NotificationSequenceDemo `stillWhenReduced`, CompactPlayground `touchTargets`, controls.tsx `touch`/`size`, AnnotatedWalletCard `toggleSize`/`heading`/`sectionClassName`, and the renames MarqueeRow→IconMarquee and Segmented→PlaygroundSegmented:** these are new props and refactors on today's feature-page components that plan.md does not list one by one (it only says "every new optional prop"). The plan is stale.

## Suspect tests
- **extended-components.test.tsx:187** compares `toggleSize="md"` with the default. Both pass "md", and `ui/Segmented` also defaults to "md", so it cannot fail. The test meant to compensate (shared-sections.test.ts:581-586) only checks the default literal.
- **kit.test.tsx:128** compares `stackOnPhone={undefined}` with leaving the prop out. The props are identical, so it cannot fail.
- **previews/registry.test.ts:157-164** loops over pages that still carry the builder marker. None do, so the loop body never runs. The staged branch at :139-155 is dead code.
- **previews/registry.test.ts:105-107** is titled "the four original pages have no sibling links" but only checks Platform.
- **platform-page.test.tsx:107-109 ("has no sub"):** PlatformHero now destructures `sub` and renders `{sub && …}`, so the `\.sub\b` regex matches nothing and cannot catch a sub reaching Platform's hero. kit.test's `not.toHaveProperty("sub")` covers this instead.
- **platform-page.test.tsx:102-105** was edited to keep passing. It now checks only the default parameter, not that the Platform page deals `PLATFORM_FAN_SLOTS`.
- **shared-sections.test.ts:127** was weakened from `toHaveLength(1)` to `toBeGreaterThanOrEqual(1)`.
- **shared-sections.test.ts:114** was weakened: Platform-style files are filtered out, so the analytics preview's LiveActivityFeed (ActivitySection.tsx) is pinned in no list.
- **scanner-loop.test.tsx ("no other file of the four pages draws one")** now excludes every preview file.
- **default-renders.test.tsx (the new AC2/AC6 snapshots)** were added in the same diff as the refactors they guard. Their first run writes the snapshot, so they cannot fail on this change. They only prove "as before" if they were recorded on the tree before the change, which the diff cannot show; ux-review.md:6-10 claims a manual byte-for-byte compare.
- **copy.test.ts:383-388** is titled "…in the words their own heroes use" but only checks the keys and the eyebrow length. It never compares a card line to its hero.
- **lib/testing/stacked-rows.ts:9-13 (`smallestLabelPx`)** ignores named Tailwind sizes (`text-xs`, `text-sm`) and returns Infinity when nothing matches, so the 11px checks pass without checking anything if a mini drops bracketed sizes.
- **copy.test.ts:82-84** adds three exemptions from the levels chip guard justified as "the previews carry no chips". The previews carry 11 Growth and Pro or Pro chips; the plan's rule is only "no Every plan chip".
- **Tests that check the copy against itself and no source:**
  - analytics.test.tsx:183 (`questions.closer` toBe its own string)
  - copy.test.ts:380 ("48 hours")
  - push-notifications.test.tsx:59 (`demo.eyebrow` "Live demo")
  - promotional-campaigns.test.tsx:111-112 ("Pro adds", "on Pro")
  - analytics.test.tsx:140 (asserts no chip is printed, not that the facts are on every plan)

## Unrealistic or missing workflow tests
- **extended-components.test.tsx:158-173** starts from PointsControl rendered on its own with a stub `p`. That skips the real path, so a dropped forward at CompactPlayground.tsx:34 passes. Use: CompactPlayground after a visitor switches it to Points.
- **Missing:** a visitor walking the five previews through the sibling links. No test checks that every preview is linked from at least one other, which is RelatedPreviews' stated purpose.
- **Missing:** a 390px visitor scrolling each preview with no horizontal scroll.
- **Missing:** a reduced-motion visitor on the notifications preview whose moments stay put but still switch on a press. Only source regexes cover this.
- **Missing:** a reduced-motion visitor on card design whose icon rows actually stand still. Only class presence is checked.
- **Missing:** after STA-549 opens broadcasts to every plan, nothing fails for the plain sentences that name plans (`wording.lead`, `questions.closer`, `ways.lead`). Only the module-level `plan` gate on campaigns would fail.
- **Source-text pins a visitor never sees:**
  - extended-components.test.tsx:103-114 (exact NotificationSequenceDemo statements)
  - card-design.test.tsx:206-238 (`PHONE = { full: 280, narrow: 160 }`, `aria-label={phoneAlts.apple}` as text)
  - push-notifications.test.tsx:155-211 (WalletsComposition expression strings, `lg:w-[960px]`)
  - promotional-campaigns.test.tsx:101-125 (`cells={COPY.how.cells}`, `stamps={5}`)
  - previews/registry.test.ts and card-design.test.tsx both pin the literal `secondary={{ label: CARD_DESIGN_PREVIEW.designerLink, href: "#playground" }}`

  These sections are read as source "because they hold async components", but mobile-scanner.test.tsx and analytics.test.tsx already render async sections with `renderToReadableStream`.

## Waivers
(filled by the main agent only if the user explicitly waives a gap)
