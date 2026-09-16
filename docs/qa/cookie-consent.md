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

Note on what is NOT here: GA4, the Meta pixel and the TikTok pixel do not exist
yet (STA-318, STA-319, STA-320). Accepting therefore loads nothing today, and
that is correct. The cases below verify the GATE, and the pixel issues inherit
CN-01 and CN-02 as their flip-on verification.

---

## SETUP: Before you start

Everything runs against dev. Nothing here touches production.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app` | `dev.stampeo.app` is the API, not the showcase. ISR caches 300s: hard-reload twice before calling a string stale. |
| Showcase (local) | `http://localhost:3001` | `bun run dev` from `showcase/`. **Do not run `bun run build` while this is up**, it clobbers `.next` out from under the dev server. |
| Cookie jar | devtools > Application > Cookies | The primary instrument for this whole runbook. Keep it open. |
| Network filter | devtools > Network, filter `googletagmanager|facebook|tiktok` | Must stay empty until consent is granted, and stays empty even then until the pixel issues land. |
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
| R5 | Turn on Global Privacy Control: use Brave (Settings > Shields > "Tell sites not to sell my data"), or DuckDuckGo's browser. Chrome has no built-in GPC. Verify with `navigator.globalPrivacyControl` in the console before running the case. |
| R6 | Fake a granted state without the pixels existing: console, `document.cookie = 'stampeo_consent=' + encodeURIComponent(JSON.stringify({v:1,a:1,m:1,t:Math.floor(Date.now()/1000),r:"opt-in"})) + '; path=/'`, then reload. |

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
