# Plan: Feature pages in the Platform style (previews)

ISSUE: STA-552 (https://linear.app/stampeo/issue/STA-552)
BRANCH: `feat/sta-552-feature-previews` (worktree `showcase/.claude/worktrees/sta-552`, off STA-546)
REPOS: showcase only
MIGRATION: no
STATUS: APPROVED (12 Nov 2026, by Harry's request: "send out a few agents to refresh our other feature pages
so they feel more in sync with this … add them after the platform URL so I can compare")

## Problem

Harry loves the STA-546 Platform landing page and wants the feature pages to feel in sync with it. He wants
refreshed versions he can compare side by side with today's pages before anything replaces them.

## Scope

Five previews, English, US market, noindex, absent from sitemap/llms/menus. Today's pages stay untouched.

| Feature | Today | Preview | Variant |
|---|---|---|---|
| Card design | `/en/features/card-design` | `/us/landing-pages/platform/card-design` | `lp_platform_card_design` |
| Mobile scanner | `/en/features/mobile-scanner` | `/us/landing-pages/platform/mobile-scanner` | `lp_platform_mobile_scanner` |
| Push notifications | `/en/features/push-notifications` | `/us/landing-pages/platform/push-notifications` | `lp_platform_push_notifications` |
| Analytics | `/en/features/analytics` | `/us/landing-pages/platform/analytics` | `lp_platform_analytics` |
| Promotional campaigns | `/en/features/promotional-campaigns` | `/us/landing-pages/platform/promotional-campaigns` | `lp_platform_promotional_campaigns` |

Geolocation is out (not live).

## Design

`ux-brief.md` (ux-designer, MODE: DESIGN, verdict READY) is the spec: section lists (7-10 per page), the
Platform patterns each section uses, reuse of `components/features/<slug>/*` and the Platform pieces, draft
copy, 390 and desktop layouts, the build split.

## Decisions (defaults from the brief's open questions, Harry may veto)

- Platform's language: eyebrow + centred h2 + lead; CTA pair; glass cards; iPhone + Android with Apple and
  Google Wallet; hover rows; toggle cards; handwritten figures; the Scanner loop video; the cream final card.
- No pricing, sectors or blog on these previews; each closes with the cream card and links to the sibling
  previews (not the live feature pages).
- No "Every plan" chips, no "Sample data" captions (Harry's v2.1 call for Platform-style pages).
- Broadcast plan labels: the campaigns preview states Growth and Pro as today's page does; the other four show
  no badge (STA-549 opens broadcasts to every plan right after shipping).
- The campaigns figures 88% (wallet add rate) and 95% (still installed at 90 days) are kept with their source
  line "Stampeo data, 86 businesses, February to October 2026" (today's approved catalog).
- Dropped from today's pages: unsourced figures (the 20/30/45/85% channel bars), the SMS/email/wallet table, the
  security grid not backed by STAMPEO.md, "5 minutes", "coming soon" AI, the 15-card style carousel on card design.
- Generalised from Platform (Platform must render exactly as now): `HowTable` → `StepsTable`, `ProgramTypeRows`
  → `HoverRows`, `PlatformToggleCard` → `ToggleCard`.
- Preview-only code in `components/landing-pages/feature-previews/` (shared/ is at 29 files); copy in
  `lib/landing-pages/copy/previews/`, covered by the existing claim tests.
- Promoting a winner to the live feature pages in all four locales is a separate issue.

## Acceptance criteria

- AC1: each of the five URLs renders in English with the US header and footer, its registry sections in order,
  noindex, absent from sitemap and llms.txt, tracked with its own variant.
- AC2: the Platform page renders exactly as before (its pins stay green; generalised components keep its output).
- AC3: every claim is live (STAMPEO.md §6-§8); every % figure carries a source; no "Every plan" chip, no
  "Sample data"; broadcast mentions follow the label decision above; the copy guards pass on the new modules.
- AC4: every "Start my free trial" is a tracked `CTAButton` to onboarding; the demo link is the plain `#demo`
  anchor where a demo section exists.
- AC5: no horizontal scroll at 390; tap targets ≥ 44px; reduced motion gives calm static states.
- AC6: today's five feature pages are unchanged (no edits under their routes or `messages/` beyond STA-546's).

## Polish additions (Stages Q0, polish, Q1; accepted by the coordinator, Harry may veto)

Each is an optional prop whose default keeps today's markup byte-identical.

- `LpFaq` takes an `eyebrow` on its `faq`; with it, a centred Platform header and `ui/FAQList`'s `table` look (one white table, hairline rows ≥ 56px). Used by the card design and campaigns FAQs.
- `NotificationSequenceDemo stillWhenReduced`: no auto-advance under reduced motion (push-notifications moments).
- 44px toggles on the card design preview: `AnnotatedWalletCard toggleSize`, `CompactPlayground touchTargets` (playground toggles and sliders, Program and Points panels).
- `HoverRows stackOnPhone`: below `lg`, the row's picture sits full width under its words so its smallest label prints ≥ 11px (analytics questions, scanner counter, campaigns ideas).
- `LiveActivityFeed soft`: the previews' frame (no heavy border) with room under the fifth row. The live pages keep their frame and the fifth-row clip (follow-up).

- AC7: with each prop above left out, its component renders exactly as before (snapshot or byte compare), and every live caller passes none of them.
- AC8: with each prop given, the visitor-visible effect holds: FAQ header centred with the eyebrow and rows ≥ 56px; no auto-advance when still; toggles ≥ 44px including after switching the playground to Points; stacked pictures print their smallest label ≥ 11px; the soft feed's fifth row has padding under it.

## Build stages

1. Foundation: tests, registry entries, routes, copy modules (from the brief's draft copy, reviewed by the
   coordinator), the three generalised components, every new optional prop.
2. Three builders in parallel (disjoint files): card design; notifications + campaigns; scanner + analytics.
3. Merge, UX polish on pixels, coverage + quality reviews, fixes, runbook section, shots for Harry.

## Docs impact

None (previews, no product change).
