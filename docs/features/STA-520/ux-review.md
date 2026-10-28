# UX Review: STA-520
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844, 768x1024, 1024x768, 1440x900; plus 320/360/375/430/1180/1280/1366/1920 on the geolocation hero), production build on :3013
VERDICT: FIXED WITH FINDINGS

## Fixed (both surfaced by the map fix making the geolocation hero visible)
- `GeofencingHeroAnimation.tsx`: `scale-[0.55]` → `scale-[0.45] sm:scale-[0.55]`. Before: the phone covered the map pin by 5/12/20 px at 390/375/360, and at 320 the map's `overflow-hidden` cropped 40 px off the bezel's top (the bezel is never cropped). After: no crop at any width; the pin is clear from 360 up (at 320 its box sits 12 px under the phone, bezel intact).
- `GeofencingPage.tsx`: the "built into the card" note hung 112 px past a map that now fills the column, so the viewport cut it at 1024/1180/1280/1366 (81/78/53/30 px) and it sat 7 px from the edge at 1440. Now `right-4 bottom-[339px] w-[154px]` on the map, right above the phone, `whitespace-nowrap`, arrow `down` `w-5` landing on the phone's top edge; inside the map in all four locales at every lg width (widest FR at 1024: 807–991, map edge 992). The numbers are tied to the phone's 0.55 scale and `bottom-4 right-4` (commented).

## Mobile findings
- Geolocation hero at 390: the map comes first (`order-1`, which it always had; it was 0×0 before). Headline 560–672 above the fold; CTA bottom 889 (45 px below an 844 fold), like the notifications and scanner heroes that also lead with the phone. Existing layout decision, left alone.
- Lock screens, all four locales and widths: status bar ends 38.7 px, clock from 70.6, date to 166, banner 190–296 (EN/ES) / 190–312 (FR/PL), lock buttons from 472. No overlap. Geolocation banner 226 px wide; title 2 lines FR/EN/PL, 1 ES.
- Scanner hero, get-the-app band, notification sequence: content clears the status bar (card 8 px below it); result card 12 px from the screen's bottom edge, hint 16–20 px.
- Every phone: the simulator glyphs line up with the island and side insets; no seam between screen and bezel at 3× and 1×; the CSS clip tracks Apple's screen opening within 0.24 pt; the shadow matches the body within ~1 pt and never shows as a box.
- Landing md/lg/xl: phone top at 0.52/0.44/0.43 of the desktop capture's height, below the KPI row (~0.33). Ink arrow tip 21/23/26 px left of the body (was ~18/20/22): still reads as pointing at the phone.
- Cosmic Orange next to orange CTAs at 390: doesn't compete (a 3–4 px metallic rim; the CTA stays the one solid orange shape).
- Loading: the four hero phones are eager + fetchpriority=high on bezel, status bar and capture; others lazy; one bezel request per page at w=640 (2×). LCP on /features/analytiques is the bezel: 372–492 ms at 390@3x, 324–392 ms at 1440; CLS 0 (4× CPU, 1.6 Mbps).

## Brief drift
- The geolocation lock screens are light lavender, so the white lock glyphs are barely visible there (they match the design's white clock). Fine to ship; a dark-glyph lock overlay is a follow-up.
- Scanner bottom padding left as is (no home indicator, AC6). Fine.

## Copy flagged
None.

## Left alone
- Capture hairline: the 8 scrolled captures (`{fr,en,es,pl}-phone-{habits,busiest}.png`) start with 1 pt white + 1 pt grey (the previous card's edge), a faint line under the status bar. Fix at the next re-shoot (scroll 2 pt less), not with a CSS crop.
- Ink notes "No phone number needed" (`NotificationsPushPage.tsx:102`) and "your team's app" (`ScannerMobilePage.tsx:109`) are cut by the viewport at 1024. Pre-existing, outside the diff.
- `ScanDemo.tsx` / `GetTheAppBand.tsx` keep `pt-14` rather than the safe-top variable; correct at the fixed 280 width.

## Verification
- type-check: pass   lint: pass
- :3013 rebuilt after the edits; nine-phone pass re-run: all render; Analytics fold unchanged (390: CTA 425 / phone 465; 1440: phone 96–668 / caption 728).
