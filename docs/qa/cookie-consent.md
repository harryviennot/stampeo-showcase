BRANCH: `harryviennot2/sta-317-implement-cookie-consent-banner-prerequisite-for-ga4-tiktok` (showcase)
SCOPES: showcase
ENVIRONMENT: **dev only.** No migration, no backend change, no Stripe write. Every case is an anonymous page view plus devtools. The production-shaped risk is legal, not operational: what this pass protects is that nothing is stored on a visitor's device before they agree.

# Cookie consent test pass

Covers the consent banner, the US notice, the preferences dialog, the footer
entry, and the cookie section of the privacy policy. Work top to bottom: CN
first, because if a cookie is set before a choice is made, nothing else in this
runbook matters and the release is blocked.

Three ideas are being protected throughout.

**First: absence of consent is not consent.** No cookie, a corrupt cookie, a
country we cannot place, a browser we cannot read: every one of those must land
on "denied". A case where an unknown state produces tracking is a real failure
even when the page looks perfect.

**Second: refusing must be exactly as easy as accepting.** One click, same
button size, same position in the flow. A Refuse button that is smaller, paler,
one layer deeper, or reachable only after a scroll is a blocker, not a polish
item, and it is the single most-fined mistake in this area.

**Third: the site must work identically either way.** Refusing is not allowed
to degrade a page, hide content, or re-ask on the next navigation.

Note on what is NOT here: GA4 (STA-318) and the TikTok pixel (STA-320) still do
not exist, so accepting loads neither and that is correct. **The Meta pixel
(STA-319) now DOES exist** — see the MP section, which is its flip-on
verification and which inherits CN-01 and CN-02 as its negative half.

---

## SETUP: Before you start

Everything runs against dev. Nothing here touches production.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app` | `dev.stampeo.app` is the API, not the showcase. ISR caches 300s: hard-reload twice before calling a string stale. |
| Showcase (local) | `http://localhost:3001` | `bun run dev` from `showcase/`. **Do not run `bun run build` while this is up**, it clobbers `.next` out from under the dev server. |
| Cookie jar | devtools > Application > Cookies | The primary instrument for this whole runbook. Keep it open. |
| Network filter | devtools > Network, filter `googletagmanager|facebook|tiktok` | Must stay empty until consent is granted. After consent, `connect.facebook.net` (STA-319) and `googletagmanager.com` (STA-318) are now EXPECTED on marketing routes; `analytics.tiktok.com` must still stay empty. |
| GA4 measurement id | `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ZFZ6JLPFXN` | **Set this before running any GA case.** Unset by default and the loader no-ops without it, so every GA case would fail for the wrong reason. Build-time: restart the dev server after setting it. |
| Meta pixel id | `NEXT_PUBLIC_META_PIXEL_ID=1088158323750710` | **Set this before running any MP case.** It is unset by default, and the loader no-ops without it — so every MP case would fail for the wrong reason. It is build-time: restart the dev server after setting it. |
| Market switcher | bottom-left pill, **local dev only** | `VariantDevToggle`. It sits over the bottom of the banner on a phone-width window, which is now the Refuse/Accept row. That overlap is local-only (`NODE_ENV=development`) and is NOT a bug to report, but it does mean **CN-03 and LY-01 must be run on `showcase.dev.stampeo.app`**, where the toggle is absent, and not locally. |

### Accounts

**None.** Every case is an anonymous page view. If a case seems to need a
login, it is the wrong runbook.

### Reset recipes

| ID | Recipe |
|---|---|
| R1 | Back to "never answered": devtools > Application > Cookies > delete `stampeo_consent`, then reload. Do this before any case that expects the banner. |
| R2 | Become European: set the OS timezone to Paris (macOS: System Settings > General > Date & Time > uncheck Set automatically > Europe/Paris), then **fully quit and reopen the browser**. A tab open across the change keeps the old zone. |
| R3 | Become American: same as R2 with `America/New_York`. |
| R4 | Corrupt the choice: in the console, `document.cookie = "stampeo_consent=%7Bnope; path=/"`, then reload. |
| R5 | Unload the pixel: a hard **page reload** (not a client-side navigation). `fbq` lives in the page's JS and cannot be removed once injected, so any case that must start with "pixel not loaded" begins here. Confirm with `typeof window.fbq === "undefined"` in the console. |
| R5 | Turn on Global Privacy Control: use Brave (Settings > Shields > "Tell sites not to sell my data"), or DuckDuckGo's browser. Chrome has no built-in GPC. Verify with `navigator.globalPrivacyControl` in the console before running the case. |
| R6 | Fake a granted state without the pixels existing: console, `document.cookie = 'stampeo_consent=' + encodeURIComponent(JSON.stringify({v:1,a:1,m:1,t:Math.floor(Date.now()/1000),r:"opt-in"})) + '; path=/'`, then reload. |
| R7 | Unload the GA4 tag: a hard **page reload** (not a client-side navigation). `gtag` lives in the page's JS and cannot be removed once injected, so any GA case that must start with "tag not loaded" begins here. Confirm with `typeof window.gtag === "undefined"` in the console. The GA counterpart of the pixel-unload recipe. |

---

## CN: nothing is stored before a choice

### CN-01 A first visit stores no tracking cookie — BLOCKER

WHY: The entire legal basis of the release. Every other case is cosmetic next
to this one.

1. R2, then R1.
2. Open `/` in a fresh private window with the Network tab filtered.
3. Read the cookie jar.

EXPECT:
- Exactly these cookies, and nothing else: `NEXT_LOCALE`. (`stampeo_market`
  appears only if you reached the page via `/us` or `/uk`.)
- NO `stampeo_consent` yet: not answering must not count as answering.
- NO `_ga`, `_ga_*`, `_gid`, `_fbp`, `_fbc`, `_ttp`.
- Network: zero requests to `googletagmanager.com`, `connect.facebook.net`,
  `analytics.tiktok.com`.
- The banner is visible.

### CN-02 Refusing leaves nothing behind — BLOCKER
DEPENDS: CN-01

WHY: Refusal is the state a regulator inspects first, and the one nobody tests.

1. From CN-01, click **Refuse all**.
2. Read the cookie jar, then reload and read it again.

EXPECT:
- The banner disappears immediately.
- `stampeo_consent` now exists. Decode it (console:
  `decodeURIComponent(document.cookie.match(/stampeo_consent=([^;]*)/)[1])`);
  it reads `"a":0,"m":0`.
- Still no `_ga*`, `_fbp`, `_fbc`, `_ttp`, and still no requests to the three
  hosts.
- After the reload the banner does **NOT** return.
- The page is fully usable: navigate to `/pricing` and back. Nothing is hidden,
  greyed, or blocked, and the banner does not reappear.

### CN-03 Refuse and Accept have equal prominence — BLOCKER
DEPENDS: CN-01

WHY: "As easy to refuse as to accept" is a measurable requirement, not a
feeling. Measure it.

1. R1, reload.
2. In the console: `[...document.querySelectorAll('section[aria-label] button')].map(b => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.width), Math.round(r.height)] })`

EXPECT:
- Refuse and Accept report **identical** width and height.
- They sit side by side on one row, both fully visible without scrolling, at
  390px wide and at 320px wide.
- Neither is styled as the quiet one: same fill, same text colour, same weight.
- There is **NO** `×`, close button, or any other way to make the banner go
  away without choosing. Pressing Escape must not dismiss it. Scrolling must
  not dismiss it.

### CN-04 A corrupt cookie re-asks rather than breaking — CORE
DEPENDS: CN-02

WHY: A thrown error here would be a blank page, and treating garbage as consent
would be worse.

1. R4.

EXPECT:
- The banner returns.
- No error in the console.
- The page renders normally.

---

## RG: the right visitor gets the right regime

### RG-01 A European visitor is asked first — BLOCKER
DEPENDS: CN-01

WHY: The opt-in half of the geo split.

1. R2, R1, reload.

EXPECT:
- The two-button banner, not the slim notice.
- No tracking cookie until a button is clicked.

### RG-02 A US visitor is told, not asked — CORE
DEPENDS: RG-01

WHY: The opt-out half. US state law requires notice and an opt-out, not prior
consent, and a blocking banner there costs the ad measurement this epic exists
to produce.

1. R3, R1, reload.

EXPECT:
- The slim **notice**, not the two-button banner: one line of text, "Your
  privacy choices", and "Got it".
- No Refuse/Accept pair.
- The footer still offers **Cookie preferences**.

### RG-03 Dismissing the US notice makes it stay dismissed — CORE
DEPENDS: RG-02

WHY: This regressed once as component-only state, which brought the notice back
on every navigation. That reads as a broken site, and it also means no record
exists of what the visitor was shown.

1. From RG-02, click **Got it**.
2. Navigate to `/pricing`, then reload.

EXPECT:
- The notice does not reappear, on either the navigation or the reload.
- `stampeo_consent` exists and reads `"a":1,"m":1,"r":"opt-out"`.

### RG-04 Global Privacy Control is honoured without being asked — CORE
DEPENDS: RG-02

WHY: The one US requirement that is a hard requirement, and the only case where
the correct behaviour is to show the visitor nothing at all.

1. R5. Confirm `navigator.globalPrivacyControl === true` in the console.
2. R1, then load `/` with the OS timezone set to New York (R3).
3. Then repeat with the timezone set to Paris (R2).

EXPECT:
- New York: **no notice at all**, and no tracking cookie. They already said no.
- Paris: the banner **is** still shown (they may still choose to opt in), and
  until they do, nothing is set.
- In both: `_ga*`, `_fbp`, `_ttp` absent.
- Then R6 (a stored grant) with GPC still on, and reload: the stored choice
  wins and the categories read as granted. An explicit click outranks the
  signal, and §5 of the privacy policy says so.

---

## PR: the preferences dialog

### PR-01 Both switches start off — BLOCKER
DEPENDS: CN-01

WHY: A pre-ticked box is not consent. This is the other most-fined mistake.

1. R2, R1, reload, click **Choose by purpose**.

EXPECT:
- Two switches, "Audience measurement" and "Advertising", both **off**.
- "Strictly necessary" is shown as always on and has no switch.
- Each row names who receives the data: Google Analytics for the first, Meta
  and TikTok for the second.

### PR-02 The dialog is operable by keyboard alone — CORE
DEPENDS: PR-01

WHY: It is a native `<dialog>` precisely so the focus trap, Escape and
labelling are the browser's rather than ours. This case is what proves that is
actually what shipped. Lighthouse cannot see it, because a closed dialog is not
in the accessibility tree.

1. Open the dialog. Do not touch the mouse again.
2. Tab through every control, past the last one, and keep going.
3. Toggle a switch with Space.
4. Press Escape.

EXPECT:
- Focus cycles **inside** the dialog and never reaches the page behind it.
- Every control shows a visible focus ring.
- Space toggles the focused switch, and the switch visibly changes (the track
  colour changes AND the knob moves; a colour change alone means the knob
  broke).
- Escape closes the dialog and records nothing.

### PR-03 Saving a partial choice records exactly that — CORE
DEPENDS: PR-01

1. Open the dialog, turn **Audience measurement** on, leave Advertising off,
   click **Save my choice**.

EXPECT:
- The banner disappears.
- `stampeo_consent` decodes to `"a":1,"m":0`.
- Reopening from the footer shows the first switch on and the second off, not
  both off and not both on.

### PR-04 Revoking deletes the cookies and reloads — CORE
DEPENDS: PR-03

WHY: A running gtag or fbq cannot be unloaded, so revocation without a reload
would leave the script running while telling the visitor it stopped. Today
there is no pixel to unload, so what this case checks is that the reload
happens at all.

1. R6 (fake a granted state), reload.
2. Footer > **Cookie preferences** > turn **both** switches off > **Save my
   choice**.

EXPECT:
- The page **reloads** by itself.
- `stampeo_consent` now reads `"a":0,"m":0`.
- `NEXT_LOCALE` and `stampeo_market` are untouched: revocation must not clear
  our own cookies along with the trackers.

### PR-05 The footer entry is always reachable — CORE
DEPENDS: CN-02

WHY: Withdrawing consent has to be as easy as giving it, which means it cannot
live only in a banner that is gone the moment someone answers.

1. After CN-02 (banner dismissed by a refusal), scroll to the footer on `/`,
   `/en`, `/es`, `/pl`.
2. Click **Cookie preferences** on each.

EXPECT:
- The entry is present in the Legal column in all four locales, translated.
- It opens the dialog every time.

### PR-06 The footer entry works on the email preferences page — CORE
DEPENDS: PR-05

WHY: `/email-preferences` is a private route (no tag fires there) that
nevertheless renders the footer, so it is the one page where "no tracking here"
and "the withdrawal control is visible here" are both true. It shipped once with
a button that did nothing when clicked.

1. Open `/email-preferences` (any locale). Scroll to the footer.
2. Click **Cookie preferences**.

EXPECT:
- The dialog opens.
- Changing a switch and saving is recorded, same as anywhere else.
- No banner and no notice on the page itself: managing a choice is allowed
  here, being asked for one is not.

### PR-07 A refusal survives a browser that blocks storage — CORE
DEPENDS: CN-02

WHY: With cookies blocked the write fails, and if nothing else remembers the
click the banner never goes away. For a US visitor it is worse than cosmetic: a
refusal that cannot be stored resolves back to granted.

1. Safari > Settings > Privacy > **Block all cookies**. (Or any browser with
   site data blocked for this origin.)
2. Load `/`, click **Refuse all**.

EXPECT:
- The banner disappears and stays gone for the rest of the page session,
  including after navigating to `/pricing`.
- `document.cookie` shows no `stampeo_consent`: it genuinely could not be
  written, and that is expected here.
- Reloading asks again, which is correct. Nothing was stored, so nothing can
  be remembered.

---

## PG: where the banner may and may not appear

### PG-01 A business enrollment page shows no banner — BLOCKER

WHY: Those visitors are our customers' customers, arriving from a QR code on a
counter. No tag fires there, so nothing may ask them for anything, and a
consent banner on a merchant's sign-up page costs that merchant conversions.

1. R1. Open a seeded business slug: `/<slug>`, then `/en/<slug>`, then
   `/fr/<slug>/l/<location>`.

EXPECT:
- **No banner and no notice**, in any locale.
- No `stampeo_consent` is written by visiting.
- The enrollment form itself works normally.

### PG-02 The marketing pages do show it — CORE
DEPENDS: PG-01

1. R1 before each: `/`, `/pricing`, `/blog`, `/programme-fidelite`,
   `/es/programa-de-fidelizacion`, `/pl/program-lojalnosciowy`, `/us`.

EXPECT:
- The banner (or, on `/us` with a US timezone, the notice) appears on every
  one.

---

## MP: the Meta pixel (STA-319)

The gate's first real consumer. CN-01 and CN-02 already prove the pixel stays
away before a choice; these cases prove it arrives when it should, stops where
it must, and counts pages correctly.

Set `NEXT_PUBLIC_META_PIXEL_ID` first (see SETUP) or every case here fails for
the wrong reason.

Instrument: the Network tab filtered to `facebook`, plus `window.fbq` in the
console. Meta Pixel Helper works too but lags a second behind.

### MP-01 Accepting loads the pixel, in the same page view — BLOCKER
DEPENDS: CN-01

WHY: The positive path. A gate that never opens would pass every negative case
in this runbook and ship a pixel that has never fired.

1. R2, then R1, then R5. Open `/pricing`.
2. Confirm `typeof window.fbq === "undefined"` and the Network tab is empty.
3. Click **Accept all**.

EXPECT:
- `connect.facebook.net/en_US/fbevents.js` is requested **without a reload**.
- A `PageView` is sent (Network: a `tr/?...&ev=PageView` request, or Pixel
  Helper showing 1 PageView).
- `_fbp` now exists in the cookie jar, with domain `.stampeo.app` (or the local
  equivalent) — not host-only. The dashboard reads the same cookie.
- Exactly ONE PageView, not two. Two means the init and the navigation effect
  both fired; report it.

### MP-02 An accepted visitor is still not tracked on a business page — BLOCKER
DEPENDS: MP-01, PG-01

WHY: The irreversible mistake. Consent given on our marketing site does not
make a café's customers ad prospects, and unlike a missed conversion this
cannot be taken back once sent.

1. From MP-01 (consent accepted, pixel loaded), navigate **client-side** by
   clicking through the site to a seeded business slug `/<slug>`.
2. Watch the Network tab during the navigation.

EXPECT:
- **NO** new `facebook.com/tr` request. Not a PageView, not anything.
- `window.fbq` is still defined — that is correct and not a failure. The script
  cannot be unloaded; what matters is that nothing more is sent.
- Now R5 (hard reload) on the business slug directly. Still no
  `connect.facebook.net` request at all, and no banner.

### MP-03 Client-side navigation counts pages once each — CORE
DEPENDS: MP-01

WHY: Meta only fires PageView at init, so without explicit handling every
session looks like one page; with careless handling every render doubles it.

1. From MP-01, navigate client-side: `/pricing` → `/blog` → `/pricing`.

EXPECT:
- Exactly one `PageView` per navigation, three in total for the three hops.
- No PageView is sent when navigating to a page you are already on.

### MP-04 CTA clicks send Lead and Contact — CORE
DEPENDS: MP-01

WHY: These are the events campaigns optimise against. A CTA sending nothing is
a silent hole in attribution.

1. From MP-01, click the hero CTA. Read the Network tab.
2. Go back, click a **pricing tier** CTA.
3. Go back, click a **demo/contact** CTA (the one pointing at `/contact`).

EXPECT:
- Hero → `ev=Lead`.
- Pricing tier → `ev=Lead`. (Wired separately from the shared button; if this
  one is missing and the hero works, that is the bug.)
- Demo/contact → `ev=Contact`, NOT `Lead`.
- The PostHog events still fire alongside each one, unchanged.

### MP-05 A US visitor is tracked without clicking anything — CORE
DEPENDS: RG-02

WHY: Intended, and the case most likely to be misfiled as a bug. As of 2026 no
US state law requires prior consent, so the US is notice-and-opt-out.

1. R3 (become American), R1, R5. Open `/us`.

EXPECT:
- The **notice** appears, not the banner.
- `connect.facebook.net` is requested and `_fbp` is set, with **no click**.
- This is CORRECT. Do not file it as a consent failure.
- Then enable Global Privacy Control in the browser and repeat: now NOTHING
  loads, and no notice appears.

### MP-06 Revoking stops the pixel — CORE
DEPENDS: MP-01, PR-04

WHY: An `fbq` already running cannot be unloaded, so revocation depends on the
reload doing it. If the reload regresses, a revoked visitor keeps being tracked.

1. From MP-01, open the preferences dialog from the footer.
2. Turn **marketing** off and save.

EXPECT:
- The page reloads by itself.
- After the reload: `typeof window.fbq === "undefined"`.
- `_fbp` and `_fbc` are gone from the cookie jar.
- No further `facebook.com/tr` requests while navigating.

### MP-07 No pixel id means no pixel — CORE

WHY: The state of CI and of every local checkout. The build must not depend on
the variable existing, and an empty string must not become a live tag.

1. Unset `NEXT_PUBLIC_META_PIXEL_ID` (or set it to empty), restart the dev
   server. R1, R5.
2. Open `/pricing` and click **Accept all**.

EXPECT:
- The banner behaves normally and the choice is recorded.
- **No** `connect.facebook.net` request, no `_fbp`, no console error.
- Re-set the variable afterwards before running any other MP case.

---

## GA: Google Analytics 4 (STA-318)

The analytics-category consumer. CN-01 and CN-02 already prove the tag stays
away before a choice; these cases prove it arrives when it should, stops where
it must, and counts pages correctly.

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` first (see SETUP) or every case here fails
for the wrong reason.

Instrument: the Network tab filtered to `googletagmanager|google-analytics`,
plus `window.gtag` and `window.dataLayer` in the console. GA4 batches its
`/g/collect` beacons, so allow a few seconds before calling an event missing.

GA4 is gated on **analytics**, Meta on **marketing**. A visitor who accepted
only one is the case most likely to be misread — see GA-08.

### GA-01 Accepting loads the tag, in the same page view — BLOCKER
DEPENDS: CN-01

WHY: The positive path. A gate that never opens would pass every negative case
in this runbook and ship a tag that has never fired.

1. R2, then R1, then R7. Open `/pricing`.
2. Confirm `typeof window.gtag === "undefined"` and the Network tab is empty.
3. Click **Accept all**.

EXPECT:
- `googletagmanager.com/gtag/js?id=G-...` is requested **without a reload**.
- One `page_view` follows (Network: a `google-analytics.com/g/collect` request
  carrying `en=page_view`).
- `_ga` and `_ga_ZFZ6JLPFXN` now exist in the cookie jar.
- Exactly ONE `page_view`, not two. Two means `config` and the navigation
  effect both fired; report it.

### GA-02 An accepted visitor is not tracked on /onboarding — BLOCKER
DEPENDS: GA-01

WHY: The whole reason the signup conversion is measured as a CTA click rather
than a completion. `/onboarding` is a PRIVATE_SEGMENT: someone mid-signup is
not an ad audience, and this is the case that proves the route table is
actually consulted rather than decorative.

1. From GA-01 (consent accepted, tag loaded), click a signup CTA to reach
   `/onboarding` **client-side**.
2. Watch the Network tab during the navigation.

EXPECT:
- **NO** `/g/collect` request with `en=page_view` for `/onboarding`.
- `window.gtag` is still defined — correct, not a failure. The script cannot be
  unloaded; what matters is that nothing more is sent.
- Now R7 (hard reload) on `/onboarding` directly. No `googletagmanager.com`
  request at all, and no banner.
- Navigate back to `/pricing`: a `page_view` IS sent again, and its path is
  `/pricing`. `/onboarding` must never appear in any beacon.

### GA-03 An accepted visitor is not tracked on a business page — BLOCKER
DEPENDS: GA-01, PG-01

WHY: The irreversible mistake, identical in kind to MP-02. Consent given on our
marketing site does not make a café's customers an analytics audience.

1. From GA-01, navigate client-side to a seeded business slug `/<slug>`.

EXPECT:
- **NO** new `/g/collect` request.
- R7 on the slug directly: no `googletagmanager.com` request, no banner.

### GA-04 Client-side navigation counts pages once each — CORE
DEPENDS: GA-01

WHY: GA4 only fires `page_view` at config time, so without explicit handling
every campaign landing reads as a one-page session; with careless handling
every render doubles it. Both directions are live failure modes.

1. From GA-01, navigate client-side: `/pricing` → `/blog` → `/pricing`.

EXPECT:
- Exactly one `page_view` per navigation, three in total for the three hops.
- Each carries the correct `dl`/`page_path` for its own page.
- No `page_view` when navigating to the page you are already on.

### GA-05 CTA clicks send sign_up_cta_click and contact_cta_click — CORE
DEPENDS: GA-01

WHY: These are the conversions campaigns optimise against, and the only
showcase-side signal of signup intent that exists. A CTA sending nothing is a
silent hole in attribution.

1. From GA-01, click the hero CTA. Read the Network tab.
2. Go back, click a **pricing tier** CTA.
3. Go back, click a **demo/contact** CTA (the one pointing at `/contact`).

EXPECT:
- Hero → `en=sign_up_cta_click`, carrying `cta_location`, `locale` and `href`.
- Pricing tier → `en=sign_up_cta_click` with `cta_location` naming the tier.
- Demo/contact → `en=contact_cta_click`, NOT `sign_up_cta_click`.
- The PostHog and Meta events still fire alongside each one, unchanged.

### GA-06 A US visitor is tracked without clicking anything — CORE
DEPENDS: RG-02

WHY: Intended, and the case most likely to be misfiled as a bug. Mirrors MP-05.

1. R3 (become American), R1, R7. Open `/us`.

EXPECT:
- The **notice** appears, not the banner.
- `googletagmanager.com` is requested and `_ga` is set, with **no click**.
- This is CORRECT. Do not file it as a consent failure.
- Then enable GPC (the R5 row for Global Privacy Control — note two rows share that id) and repeat: NOTHING loads, and no notice appears.

### GA-07 Revoking stops the tag — CORE
DEPENDS: GA-01, PR-04

WHY: A `gtag` already running cannot be unloaded, so revocation depends on the
reload doing it. If the reload regresses, a revoked visitor keeps being tracked.

1. From GA-01, open the preferences dialog from the footer.
2. Turn **analytics** off and save.

EXPECT:
- The page reloads by itself.
- After the reload: `typeof window.gtag === "undefined"`.
- `_ga` and `_ga_ZFZ6JLPFXN` are gone from the cookie jar.
- No further `/g/collect` requests while navigating.

### GA-08 Analytics and marketing are independent — CORE
DEPENDS: PR-03

WHY: GA4 rides `analytics`, Meta rides `marketing`. If either loader reads the
wrong category, a visitor who accepted one gets both — and the runbook would
otherwise never catch it, because every other case accepts or refuses all.

1. R1, R7. Open `/pricing`, open the preferences dialog.
2. Turn **analytics** ON and **marketing** OFF. Save.

EXPECT:
- `googletagmanager.com` IS requested; `_ga` is set.
- `connect.facebook.net` is NOT requested; no `_fbp`.
- Now R1, R7 and do the inverse (marketing on, analytics off):
  `connect.facebook.net` loads and `googletagmanager.com` does not.

### GA-09 No measurement id means no tag — CORE

WHY: The state of CI and of every local checkout. The build must not depend on
the variable existing, and an empty string must not become a live tag.

1. Unset `NEXT_PUBLIC_GA_MEASUREMENT_ID` (or set it empty), restart the dev
   server. R1, R7.
2. Open `/pricing` and click **Accept all**.

EXPECT:
- The banner behaves normally and the choice is recorded.
- **No** `googletagmanager.com` request, no `_ga`, no console error.
- Re-set the variable afterwards before running any other GA case.

### GA-10 A GTM container id does not become a live tag — CORE

WHY: `GTM-XXXXXXX` is the single most common thing pasted into a GA4 variable
by mistake, and it loads a REAL script that reports to no property — working
tracking that measures nothing. The loader rejects the format instead.

1. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=GTM-ABCDEFG`, restart the dev server.
   R1, R7.
2. Open `/pricing`, click **Accept all**.

EXPECT:
- No `googletagmanager.com` request of any kind. The tag stays dormant exactly
  as in GA-09, rather than loading a container.
- No console error.
- Restore the real id afterwards.

### GA-11 DebugView shows the funnel — CORE
DEPENDS: GA-01, GA-05

WHY: Closes STA-318's third checkbox. Everything above proves what the browser
sent; this proves the property actually received it.

1. Open `/pricing?debug_mode=1`, accept consent.
2. In GA4: **Admin → DebugView**.
3. Click a hero CTA, then navigate to `/blog`.

EXPECT:
- The device appears in DebugView within ~10s.
- `page_view`, `sign_up_cta_click` and a second `page_view` land in order.
- `sign_up_cta_click` carries `cta_location`, `locale`, `href`.
- Nothing appears for `/onboarding` if you visit it (GA-02, seen from the
  server's side).

---

## AT: ad attribution across the domain (STA-323)

The funnel the tags cannot see. These cases follow one visitor from an ad click
through to a paid invoice, across two domains and three repos.

This section needs a **dev database** and the backend running, unlike every
other section here. Instrument: the cookie jar, plus
`docker exec fidelity-backend-1` psql-style queries against
`business_ad_attribution` and `business_ad_conversion`.

Reset recipe **R8** below clears a test business's attribution rows.

| ID | Recipe |
|---|---|
| R8 | Clear attribution for a test business: `delete from business_ad_conversion where business_id = '<id>'; delete from business_ad_attribution where business_id = '<id>';` then delete the `stampeo_attribution` cookie in devtools and reload. |

### AT-01 An ad click is captured on the landing page — BLOCKER
DEPENDS: GA-01

WHY: The first hop, and the only one showcase can see. If the cookie is not
written here, every case below is moot.

1. R1, R7, R8. Open `/pricing?gclid=qa-test-123&utm_source=google&utm_medium=cpc&utm_campaign=qa`.
2. Click **Accept all**.
3. Wait ~3s (the capture waits for GA to write `_ga`), then read the cookie jar.

EXPECT:
- `stampeo_attribution` exists, with **Domain `.stampeo.app`** (or the local
  equivalent) — NOT host-only. Host-only means `web/` will never see it and the
  whole funnel is dead.
- Decoded, it carries `"ci":"qa-test-123"`, `"vn":"google"`, `"uc":"qa"`, and a
  `"bi"` starting `GA1.`.
- `"cc":"marketing"` — the click id is what the marketing category bought.

### AT-02 No consent captures nothing — BLOCKER
DEPENDS: CN-01

WHY: A click id is an advertising identifier. Writing one before consent is the
same violation as firing the tag, and it would then travel to another domain
and into a database.

1. R1, R7, R8. Open `/pricing?gclid=qa-test-123`.
2. Do NOT touch the banner. Wait 5s.
3. Then click **Refuse**. Wait 5s more.

EXPECT:
- No `stampeo_attribution` cookie at any point, before or after refusing.

### AT-03 Refusing later deletes the carrier — CORE
DEPENDS: AT-01, PR-04

WHY: The cookie is first-party and would survive a revoke that only cleared
`_ga` and `_fbp`, leaving the identifiers to cross to app.stampeo.app after the
refusal.

1. From AT-01 (cookie present), open the preferences dialog from the footer.
2. Turn everything off and save.

EXPECT:
- After the reload, `stampeo_attribution` is **gone**, alongside `_ga` and `_fbp`.

### AT-04 The cookie survives the hand-off to the dashboard — BLOCKER
DEPENDS: AT-01

WHY: The single point the whole design rests on. `sessionStorage` would fail
here, which is why this is a cookie; a scoping regression is invisible until
exactly this step.

1. From AT-01, click a signup CTA and complete signup through to the dashboard.
2. On `app.stampeo.app` (or the dev equivalent), open devtools > Application >
   Cookies.

EXPECT:
- `stampeo_attribution` is readable **on the app subdomain**, unchanged.

### AT-05 Creating a business stores the row and sends sign_up — BLOCKER
DEPENDS: AT-04

WHY: The hand-off from courier to database, and the first conversion.

1. From AT-04, complete the onboarding wizard's identity step.
2. Query `business_ad_attribution` for the new business id.

EXPECT:
- Exactly one row, `vendor='google'`, `click_id='qa-test-123'`,
  `utm_campaign='qa'`, `consent_category='marketing'`, `consent_version` and
  `consent_regime` populated.
- `business_ad_conversion` has one `sign_up` row. With no `ga4_api_secret`
  configured it will not exist at all — that is AT-09, not a failure here.

### AT-06 A business with no attribution still signs up — BLOCKER

WHY: The overwhelmingly common path. Attribution sits on the signup route, and
nothing about it may block a business being created.

1. R1, R7, R8. Refuse consent, or simply open the dashboard directly with no
   `stampeo_attribution` cookie.
2. Complete signup and create a business.

EXPECT:
- The business is created normally, no error, no console noise.
- `business_ad_attribution` has no row for it. Correct, not a failure.

### AT-07 A forged cookie cannot break signup — BLOCKER
DEPENDS: AT-06

WHY: The cookie is attacker-editable and crosses a trust boundary. The failure
being tested for is a CHECK-constraint violation surfacing as a 500 in the
middle of business creation.

1. In the console on the app domain, set:
   `document.cookie = 'stampeo_attribution=' + encodeURIComponent(JSON.stringify({v:1,vn:"'; DROP TABLE businesses; --",cc:"marketing",cv:1,cr:"opt-in",lp:"/"})) + '; path=/'`
2. Create a business.

EXPECT:
- The business is created **successfully**. No 500, no 422.
- No attribution row is written.
- Repeat with `cc:"everything"` and with `v:99` — same result each time.

### AT-08 A paid invoice sends purchase exactly once — BLOCKER
DEPENDS: AT-05

WHY: The conversion campaigns actually optimise against, and the one place a
bug costs money rather than data. Stripe retries webhooks and `invoice.paid`
fires again every renewal.

1. From AT-05, complete Stripe checkout with a test card and let the first
   invoice pay.
2. Query `business_ad_conversion`.
3. In the Stripe dashboard, **resend** the `invoice.paid` event.
4. Query again.

EXPECT:
- After step 2: exactly one `purchase` row, `status='sent'`.
- After step 4: **still exactly one**. The webhook returns 200 both times.
- No `purchase` row appeared at `checkout.session.completed` — a started trial
  is not revenue.

### AT-09 No API secret sends nothing and breaks nothing — CORE

WHY: The state of CI and every local checkout until the secret is provisioned.

1. Leave `ga4_api_secret` unset. Run AT-05 and AT-08.

EXPECT:
- Attribution rows ARE written (capture does not depend on the secret).
- No `business_ad_conversion` rows, no errors, webhooks still 200.

### AT-10 Deleting a business removes its attribution — CORE
DEPENDS: AT-05

WHY: Click ids are personal data. The FK cascade covers a hard delete, but the
real purge path is `_CONTENT_TABLES`, and a table missing from it is silently
skipped rather than erroring.

1. Run the account-deletion purge for the test business.
2. Query both tables.

EXPECT:
- No rows remain in either for that business id.

---

## LY: layout

### LY-01 The phone layout is usable — CORE

WHY: Most of this site's traffic is on a phone, and a bottom sheet is the
element most likely to be cut off by one.

1. Responsive mode, 390x844, then 320x640. Run in `fr` and `pl`: those carry
   the longest button labels.

EXPECT:
- Refuse and Accept on one row, equal width, neither label clipped or wrapped.
- "Choose by purpose" fully visible and tappable.
- No horizontal scrollbar on the page.
- Every button at least 44px tall.
- The dialog fits the screen and scrolls internally rather than pushing the
  Save button off the bottom.

### LY-02 The desktop card does not collide with the language switcher — CORE
DEPENDS: LY-01

WHY: Both are fixed to the bottom of the viewport. They were made to clear each
other by geometry rather than by either component knowing about the other,
which is exactly the kind of arrangement a later style change breaks.

1. 1440x900, `/en`.

EXPECT:
- The consent card is a bottom-**left** card, not a full-width bar.
- The round language switcher sits in the opposite corner, bottom-right, and is
  fully clickable: click it and the language menu opens.
- Neither overlaps the other, at 1440x900 and at 1024x768.

---

## LG: the privacy policy agrees with the banner

### LG-01 The cookie section is reachable and correct — CORE

WHY: CNIL requires the purposes AND the recipients to be disclosed. If the
banner and the policy disagree, the policy is the one that loses.

1. Click **See the details** in the banner, in each of `fr`, `en`, `es`, `pl`.

EXPECT:
- The page scrolls to the Cookies section itself, **not** to the top of the
  policy. (Polish titles the section "Pliki cookie", so a locale landing at the
  top means the stable anchor is missing for it.)
- The section lists `NEXT_LOCALE`, `stampeo_market`, `stampeo_consent` as
  always present, and Google/Meta/TikTok with `_ga`, `_gid`, `_fbp`, `_fbc`,
  `_ttp` as consent-gated.
- It does **NOT** say anywhere that the site requires no cookie banner. That
  sentence was true before this release and is the specific thing that must not
  come back.
- "Last updated" reads 16 September 2026 in all four.
