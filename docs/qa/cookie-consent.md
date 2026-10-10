BRANCH: `feat/sta-377-measurement-privacy` (showcase worktree `.claude/worktrees/sta-377`, plus web and backend; builds on `feat/sta-373-ads-conversion-funnel`)
SCOPES: showcase, web, backend
ENVIRONMENT: **dev only.** Migrations 186 and 189 to 193 are applied on dev only. The SG, AT and MC sections create dev accounts and businesses (and MC uses Stripe test mode); MC also needs `META_TEST_EVENT_CODE` in the dev backend. Everything else is anonymous page views plus devtools and a few `curl` calls to the showcase. The production-shaped risk is legal, not operational: what this pass protects is that nothing is stored on a visitor's device before the rules of their region allow it, that a refusal is kept and honoured everywhere, and that Meta and Google receive only what the privacy policy describes.

# Cookie consent test pass

Covers the consent banner, the US notice, the preferences dialog, the footer
entry, the regional rules (STA-377), the subject and refusal cookies, the
browser events, the sign-up call, and the cookie section of the privacy policy.
Work top to bottom: CN first, because if a cookie is set before a choice is made,
nothing else in this runbook matters and the release is blocked.

Four ideas are being protected throughout.

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

**Fourth: the visitor's timezone decides which rules apply, and nothing else
does.** Europe, the UK, Switzerland and anything we cannot place are asked
first; the US is told, and can opt out; a US territory is not the US. The
`stampeo_region` cookie, the IP address and `navigator.language` are not
signals. A visitor who refused keeps that refusal in every region, and a visitor
who was only told (a US "Got it") is never counted as having agreed once they
are in a stricter one.

Note on what is NOT here: the TikTok pixel (STA-320) does not exist, so
accepting never loads it and that is correct. GA4 (STA-318) and the Meta pixel
(STA-319) exist: see the GA and MP sections, which inherit CN-01 and CN-02 as
their negative half. The Lead conversion is NOT sent from the browser any more
(STA-377): see EV-02 and SG.

---

## SETUP: Before you start

Everything runs against dev. Nothing here touches production.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app` | `dev.stampeo.app` is the API, not the showcase. ISR caches 300s: hard-reload twice before calling a string stale. |
| Showcase (local) | `http://localhost:3001` | `bun run dev` from `showcase/`. **Do not run `bun run build` while this is up**, it clobbers `.next` out from under the dev server. |
| Cookie jar | devtools > Application > Cookies | The primary instrument for this whole runbook. Keep it open. |
| Network filter | devtools > Network, filter `googletagmanager\|google-analytics\|facebook\|tiktok` (a regex; a backslash before each pipe is only the table escape) | Must stay empty until the visitor's row allows it. After consent (or on arrival in the US), `connect.facebook.net` and `googletagmanager.com` are EXPECTED on marketing routes; `analytics.tiktok.com` must always stay empty. Turn **Preserve log** on for every SG, SP and AT case: the sign-up leaves the page. |
| Privacy route | `POST <showcase origin>/api/privacy/cookies` | The same-origin route that sets the consent, subject and carrier cookies as a server response (`lib/privacy/cookie-route.ts`). Read its answer with R15. |
| API | `NEXT_PUBLIC_API_URL` of the showcase build | Receives the consent ledger beacon (`/public/consent`), the sign-up call (`/account/signup-recorded`) and the contact form (`/public/contact`). |
| Region | The browser's **timezone**, nothing else | Emulate it with R13. A VPN changes nothing: the IP address is not read. |
| GA4 measurement id | `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ZFZ6JLPFXN` | **Set this before running any GA case.** Unset by default and the loader no-ops without it, so every GA case would fail for the wrong reason. Build-time: restart the dev server after setting it. |
| Meta pixel id | `NEXT_PUBLIC_META_PIXEL_ID=1088158323750710` | **Set this before running any MP case.** It is unset by default, and the loader no-ops without it — so every MP case would fail for the wrong reason. It is build-time: restart the dev server after setting it. |
| Market switcher | bottom-left pill, **local dev only** | `VariantDevToggle`. It sits over the bottom of the banner on a phone-width window, which is now the Refuse/Accept row. That overlap is local-only (`NODE_ENV=development`) and is NOT a bug to report, but it does mean **CN-03 and LY-01 must be run on `showcase.dev.stampeo.app`**, where the toggle is absent, and not locally. |

### Accounts

**None for every section except SG, AT-04 to AT-10, CL-11, CL-12 and MC**, which
create a dev account through the onboarding wizard. Use a fresh address whose
inbox you can read (the email code arrives there), never an existing person's,
and never the owner of the seeded fixtures. Everything else is an anonymous page
view. If another case seems to need a login, it is the wrong runbook.

### Reset recipes

| ID | Recipe |
|---|---|
| R1 | Back to "never answered": devtools > Application > Cookies > delete `stampeo_consent`, then reload. Do this before any case that expects the banner. |
| R2 | Become European the slow way: set the OS timezone to Paris (macOS: System Settings > General > Date & Time > uncheck Set automatically > Europe/Paris), then **fully quit and reopen the browser**. A tab open across the change keeps the old zone. Prefer R13, which needs no restart. |
| R3 | Become American the slow way: same as R2 with `America/New_York`. Prefer R13. |
| R4 | Corrupt the choice: in the console, `document.cookie = "stampeo_consent=%7Bnope; path=/"`, then reload. |
| R5 | Turn on Global Privacy Control: use Brave (Settings > Shields > "Tell sites not to sell my data"), or DuckDuckGo's browser. Chrome has no built-in GPC. Verify with `navigator.globalPrivacyControl` in the console before running the case. **Fake for a Chromium driven over CDP or Playwright:** an init script `Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true })` (`Page.addScriptToEvaluateOnNewDocument`). It changes what the page sees but sends no `Sec-GPC` request header, so any assertion about that header (SG-03) needs a real GPC browser. |
| R6 | Fake a granted state without the pixels existing: console, `document.cookie = 'stampeo_consent=' + encodeURIComponent(JSON.stringify({v:3,a:1,m:1,t:Math.floor(Date.now()/1000),r:"opt-in",s:crypto.randomUUID()})) + '; path=/'`, then reload. `v` must equal `CONSENT_VERSION` in `lib/consent.ts` (3 since the §5.5 rewrite; a `v:2` grant is asked again, a `v:2` refusal still stands, see R12) and `s` is the subject id the real banner would mint (STA-324). The forged record names no policy row (`g`), so it reads as made under the opt-in row, and a grant never counts in a stricter row than the one it was made in: it stands in every region. |
| R7 | Unload the GA4 tag: a hard **page reload** (not a client-side navigation). `gtag` lives in the page's JS and cannot be removed once injected, so any GA case that must start with "tag not loaded" begins here. Confirm with `typeof window.gtag === "undefined"` in the console. The GA counterpart of the pixel-unload recipe (R9). |
| R9 | Unload the pixel: a hard **page reload** (not a client-side navigation). `fbq` lives in the page's JS and cannot be removed once injected, so any case that must start with "pixel not loaded" begins here. Confirm with `typeof window.fbq === "undefined"` in the console. (Numbered past R8, which the AT section defines below; this row shipped as a second "R5" and was renumbered.) |
| R10 | Forge a LEGACY attribution cookie (a browser that received one before STA-377; showcase no longer writes `stampeo_attribution`, it only forwards it while neither category is refused and deletes it on any refusal): console, `document.cookie = 'stampeo_attribution=' + encodeURIComponent(JSON.stringify({v:1,vn:"meta",bi:null,ci:"qa-legacy-v2",lp:"/pricing",cc:"marketing",cv:2,cr:"opt-in",ca:Math.floor(Date.now()/1000)-60,at:Math.floor(Date.now()/1000)-60})) + '; path=/; domain=.stampeo.app'` (use the local cookie domain off dev). Then sign up. |
| R11 | Age a test business past the 45-day context window: dev SQL `update businesses set created_at = now() - interval '46 days' where id = '<id>';`, then run the purge once: `docker exec fidelity-backend-1 python -c "from app.services.attribution.retention import purge_client_context; print(purge_client_context())"`. Put it back afterwards with the original `created_at`. |
| R12 | Forge a choice made under the previous text (version 2): R1 first, then console, `document.cookie = 'stampeo_consent=' + encodeURIComponent(JSON.stringify({v:2,a:A,m:M,t:Math.floor(Date.now()/1000)-86400,r:"REGIME",s:crypto.randomUUID()})) + '; path=/'` with `A`, `M` (`0` or `1`) and `REGIME` (`opt-in` or `opt-out`) as the case says, then reload. Check it took: `decodeURIComponent(document.cookie.match(/stampeo_consent=([^;]*)/)[1])` shows `"v":2`. |
| R13 | **Emulate a timezone** (the only region signal). Chrome: keep devtools open > ⋮ > More tools > **Sensors** > Location > pick a preset, or Manage > Add location with the **Timezone ID** (and, where a case says so, the **Locale**) filled in. From a CDP or Playwright session: `Emulation.setTimezoneOverride {timezoneId}`. Then **hard reload** and confirm in the console: `Intl.DateTimeFormat().resolvedOptions().timeZone`. The override ends when devtools closes, and a tab open across the change keeps the old zone. Zones used here: EU/UK/CH `Europe/Paris`, `Europe/London`, `Europe/Zurich`, `Atlantic/Reykjavik`, `Europe/Warsaw`; US `America/New_York`, `America/Phoenix`, `America/Anchorage`, `Pacific/Honolulu`; unmapped `Etc/UTC` (Chrome reports `UTC`), `Antarctica/Troll`; US territories `America/Puerto_Rico`, `Pacific/Guam`; mapped to another country `Asia/Tokyo`, `America/Toronto`. |
| R14 | Forge the record the web dashboard restores (a marketing refusal made elsewhere, brought back into this browser): R1, then console, `document.cookie = 'stampeo_consent=' + encodeURIComponent(JSON.stringify({v:3,a:-1,m:0,t:Math.floor(Date.now()/1000)-3600,r:"opt-out",s:crypto.randomUUID(),o:"restore"})) + '; path=/'`, then reload. `-1` is "no choice": neither a refusal nor a grant. |
| R15 | **Read what the server answered.** Network > filter `api/privacy/cookies`, Preserve log on; click the POST > Headers > Response Headers (every `Set-Cookie`, with its `Max-Age`) and Payload (what was posted). Arithmetic: 182 days = 15724800 s, 400 days = 34560000 s. The Application tab and `document.cookie` show only an expiry date, which proves nothing about what the server set: Chrome caps a script-written cookie at 400 days and Safari at 7. |
| R16 | Forget the subject: delete `stampeo_sid` and run R1, so no `s` survives anywhere (a `stampeo_consent` that still carries `s` makes the next subject the same value). |
| R17 | **Wipe the jar.** Console: `document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(Boolean).forEach(n => ['', '; Domain=' + location.hostname, '; Domain=.' + location.hostname.split('.').slice(-2).join('.')].forEach(d => document.cookie = n + '=; Max-Age=0; Path=/' + d))`, then reload and confirm Application > Cookies is empty (a cookie set with another Domain can survive; delete it by hand). Use it wherever a case starts from "a visitor we have never seen". It also removes `NEXT_LOCALE`, which is fine. |
| R18 | Forge three version-2 carriers: the snippet below this table. |
| R19 | **Block a request.** Devtools > ⋮ > More tools > Network request blocking > add the pattern (`*api/privacy/cookies*`, `*signup-recorded*`, `*public/contact*`, `*/icons/privacy-options.svg*`), reload. Remove the pattern afterwards. |
| R20 | Write a `stampeo_region` cookie by hand: console, `document.cookie = 'stampeo_region=' + encodeURIComponent(JSON.stringify({c:"FR",v:1})) + '; path=/'` with `c` as the case says. |

**R18: Forge three version-2 carriers** (a visitor who consented earlier). Console:

```js
const now = Math.floor(Date.now() / 1000);
const ev = { cv: 3, cr: "opt-out", ca: 0, p: 1, g: "US" };
const put = (name, o) => document.cookie = name + "=" + encodeURIComponent(JSON.stringify(o)) + "; path=/";
put("stampeo_src", { v: 2, lp: "/us", at: now, ...ev });
put("stampeo_ga",  { v: 2, cid: "1111111111.1700000000", at: now, ...ev });
put("stampeo_ad",  { v: 2, vn: "meta", ci: "qa-forged", ct: now, ...ev });
```

**Forging a cookie that the site also sets.** Open Application > Cookies first. If
the real cookie has a Domain (on `showcase.dev.stampeo.app` it is `.stampeo.app`),
append `; domain=<that value>` to the forged assignment, otherwise you create a
second cookie of the same name and the page may read either. The recipes above
forge host-only cookies, which is right locally and on a deploy without a cookie
domain.

### Known state before you start

- **STA-409 (2026-10-10) added Trustpilot to §4 and §6 of the four policies**
  and moved "Last updated" to 10 October 2026. LG-04 is new and LG-01's date line
  was edited in place. Root cause: the review-invitation integration (live since
  2026-06-29) sent business-owner data to Trustpilot while no policy named it.
  Verified by `lib/legal/legal.test.ts` on the fix branch; not yet read on a
  deployed page. **Targeted re-run:** LG-01, LG-04.
- **STA-358 (2026-10-09) changed when `NEXT_LOCALE` is written.** Only `/`
  still negotiates the language, and it writes the cookie only for a browser
  language the site does not serve. The language switcher writes it too. No
  other page does, so a first visit usually leaves no `NEXT_LOCALE` at all.
  CN-01 and RG-04 were edited in place for this, and RG-04 now also lists
  `stampeo_market=us`, which `/us` has always set and the case had left out.
  Nothing else in this runbook depends on the cookie. `middleware.ts` is now
  `proxy.ts`, with the same matcher; the consent rules did not change.
  **Targeted re-run:** CN-01, RG-04.
- **STA-377 (this pass) rewrites the rules that decide what loads, so run the
  whole runbook once.** What changed, and where each change is checked:
  - The visitor's row (`EEA_UK_CH`, `US`, `UNKNOWN`) is decided from the
    browser **timezone alone** (`lib/privacy/region.ts`, `lib/timezone-country.ts`,
    `lib/privacy/policy-matrix.v1.json`). `stampeo_region` is NOT read
    (`READ_REGION_COOKIE = false`). RG-08 to RG-13.
  - US footer link **Your Privacy Choices** with the official icon, the notice
    and dialog titled the same, the US dialog, the GPC locks. PR-08 to PR-11.
  - The compliance subject `stampeo_sid` and the server-set, long-lived refusal
    (400 days in the US, sliding). SP section.
  - Carriers are now `stampeo_src`, `stampeo_ga`, `stampeo_ad` (version 2),
    each written only when its category permits. `stampeo_attribution` is legacy:
    never written. AT-01 to AT-12 were rewritten in place; AT-13 to AT-16 are new.
  - The sign-up call `POST /account/signup-recorded`. SG section. The Lead
    conversion is sent from the server after it; the browser sends no Lead. EV-02.
  - Browser events: `ViewContent`, `Contact`, `SignupCTA`, send-time consent,
    cross-tab reload. EV section. MP-04, MP-08 and MP-09 were edited in place.
  - Private routes and the demo wallet page. PG-03 to PG-05.
  - The cookie table of the privacy policy. LG-01, LG-03.
  - Cases rewritten in place because their expected result changed: CN-01, CN-02,
    CN-05, RG-01 to RG-07, PR-01, PR-04 to PR-06, MP-01, MP-03 to MP-05,
    MP-08, MP-09, GA-06, AT-01 to AT-12 and AT-08b, CL-01, CL-07, CL-11, CL-13,
    MC-01, MC-02, MC-04 to MC-08, MC-11 to MC-13, LG-01. Nothing was retired:
    every case still applies, with a new expected result where it changed.
  - **A re-run after a fix covers:** the failed case, its dependents, and RG-04,
    RG-08, RG-12, PR-09, SP-01, SP-04, SG-01 to SG-04, AT-16.
- **The MC cases and AT-05 to AT-10 were edited from
  `backend/docs/measurement/events.md` and `docs/features/STA-377/contracts.md`,
  not from the backend code, and have not been run.** If a table or column named
  there differs on dev, report it as AMBIGUOUS. Where `ad_conversion_outbox_enabled` is
  off, the inline sender reports at business time and the `ad_conversion_outbox`
  rows do not exist.
- **Needs a human:** the Google or Apple half of SG-05 (the return is simulated
  with `?just_authed=oauth`), and SG-03's `Sec-GPC` header (a real GPC browser).
- **`analytics_under_us_opt_out` is `off`** in the shipped matrix, so under US
  GPC Google Analytics is also off, not only Meta. If it is ever flipped to
  `service_provider`, RG-04, RG-07, GA-06, PR-09 and SG-03 change together.
- **Production builds fail without the five analytics ids** (pixel id, GA
  measurement id, showcase URL, API URL, cookie domain): `scripts/analytics-ids.mjs`
  runs before and after `next build`. There is nothing to run for the failure
  itself; BG-01 only confirms the deployed bundle carries the two ids.
- **The privacy policy text is a counsel draft (STA-377).** §5, §6 and §8 of the
  four policies were rewritten for the regional rules (US "Your Privacy
  Choices", 13-month US refusals, the cookies we set, per-purpose withdrawal) and
  must not reach `main` before counsel signs off. LG-01 and LG-02 read that
  draft. The questions for counsel are in
  `docs/features/STA-377/legal-review.md`.
- **GA-02 must be re-verified against the production GA4 stream** once the
  Showcase stream's "Page changes based on browser history events" and "Form
  interactions" are switched off (`docs/features/STA-318/ga4-setup.md`, D7).
  Until then Google can report a client-side hop onto a private route that no
  code of ours sends.
- **MP-08** — fixed, pending re-verification (STA-373). Root cause: Meta's
  script reported client-side hops (PageView) and clicks
  (`SubscribedButtonClick`) on its own, bypassing `isTrackablePath`; it was
  found on production, where `/en/onboarding` and `/en/login` reached Meta.
  Verified by unit tests on `feat/sta-373-ads-conversion-funnel`, and
  by injecting the same settings into production with a Playwright init
  script (the run dropped to the two expected PageViews). Not yet verified on
  a deployed build. Targeted re-run: MP-08, then MP-03, MP-04, MP-01.
- **Consent version is 3** in showcase, web and backend. A consent cookie
  written before this branch (`v:2`) that granted anything is asked again (the
  banner in the EU, the notice in the US); a `v:2` refusal still stands (CN-05,
  RG-05, RG-06). If you had accepted on your own browser, expect the banner
  again before any case.
- **Migrations 186 and 189 to 193** (conversion events, consent subject links,
  per-category refusals, attribution v2, the conversion outbox, coverage) are on
  dev only. The backend code on this branch must not run against a database
  without them.
- **Every MC case needs `META_TEST_EVENT_CODE`** in `backend/.env` (then
  `docker compose up -d --force-recreate backend`). Without it dev refuses to
  send to Meta and the Test Events tab stays empty.
- **The dev backend must run this branch.** The `fidelity-backend-1` container
  mounts the MAIN backend checkout's `app/`, so check out
  `feat/sta-377-measurement-privacy` there before the SG, AT and MC cases (and
  R11); a worktree's fix is not live on dev. Showcase and web likewise run from
  their main checkouts, or from `bun run publicdev` of the branch under test.

---

## CN: nothing is stored before a choice

### CN-01 A first visit stores no tracking cookie — BLOCKER

WHY: The entire legal basis of the release. Every other case is cosmetic next
to this one.

1. R17, then R13 with `Europe/Paris` (R2 also works), then R1.
2. Open `/` in a fresh private window with the Network tab filtered.
3. Read the cookie jar.

EXPECT:
- At most one cookie, `NEXT_LOCALE`, and nothing else. Since STA-358 only `/`
  writes it, and only for a browser language the site does not serve, so a
  first visit usually has no cookie at all. (`stampeo_market` appears only if
  you reached the page via `/us` or `/uk`.)
- NO `stampeo_consent` yet: not answering must not count as answering.
- NO `stampeo_sid`: in this row the subject is minted at the first decision, not
  before (SP-02). The US is the row that mints it on arrival (SP-01).
- NO `stampeo_src`, `stampeo_ga`, `stampeo_ad` (the carriers need a category
  that permits them, AT-15) and no legacy `stampeo_attribution`.
- NO `_ga`, `_ga_*`, `_gid`, `_fbp`, `_fbc`, `_ttp`.
- Network: no request to `/api/privacy/cookies` at all. Nothing has been decided,
  so nothing is written.
- Network: zero requests to `googletagmanager.com`, `connect.facebook.net`,
  `analytics.tiktok.com`.
- The banner is visible.

### CN-02 Refusing leaves nothing behind — BLOCKER
DEPENDS: CN-01

WHY: Refusal is the state a regulator inspects first, and the one nobody tests.

1. From CN-01, click **Refuse all**.
2. Read the cookie jar, then reload and read it again. Read the privacy route's
   answer with R15.

EXPECT:
- The banner disappears immediately.
- `stampeo_consent` now exists. Decode it (console:
  `decodeURIComponent(document.cookie.match(/stampeo_consent=([^;]*)/)[1])`);
  it reads `"v":3,"a":0,"m":0,"r":"opt-in"`, with `"g":"EEA_UK_CH"`, `"p":1` and
  an `"s"` that is a lowercase v4 UUID.
- R15: one POST to `/api/privacy/cookies`, **204**, with a `Set-Cookie` for
  `stampeo_consent` (`Max-Age=15724800`, 182 days: an EU refusal is not renewed
  on each visit) and one for `stampeo_sid` carrying the same value as the `s`
  inside the consent cookie.
- Still no `_ga*`, `_fbp`, `_fbc`, `_ttp`, no carrier, and still no requests to
  the three hosts.
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

### CN-05 A refusal made under the previous text is still a refusal — BLOCKER
DEPENDS: CN-02

WHY: Version 3 widened what Meta receives. Someone who refused the narrower
version-2 processing has refused the wider one too, so the bump must not ask
them again or load anything. Only a version-2 grant is re-asked.

1. R2 (Paris), delete any `stampeo_attribution` cookie, then R12 with `a:0`,
   `m:0`, `r:"opt-in"`.
2. Open `/`, then navigate to `/pricing`, then reload.

EXPECT:
- **No** banner, on the first load, the navigation or the reload.
- Network: zero requests to `googletagmanager.com`, `connect.facebook.net`,
  `analytics.tiktok.com`.
- **No** `_ga`, `_ga_*`, `_gid`, `_fbp`, `_fbc`, `_ttp`, and no
  `stampeo_attribution`.
- `stampeo_consent` still decodes to `"v":2,"a":0,"m":0`: nothing rewrote it.
  Network: no request to `/api/privacy/cookies` (an EU refusal is not renewed,
  SP-05), and no `stampeo_sid` appears.
- Footer > **Cookie preferences** opens with both switches off.

---

## RG: the right visitor gets the right regime

### RG-01 A European visitor is asked first — BLOCKER
DEPENDS: CN-01

WHY: The opt-in half of the geo split.

1. R17, R13 with `Europe/Paris` (R2 also works), R1, reload.

EXPECT:
- The two-button banner, not the slim notice.
- No tracking cookie, and no `stampeo_sid`, until a button is clicked.

### RG-02 A US visitor is told, not asked — CORE
DEPENDS: RG-01

WHY: The opt-out half. US state law requires notice and an opt-out, not prior
consent, and a blocking banner there costs the ad measurement this epic exists
to produce.

1. R17, R13 with `America/New_York` (R3 also works), R1, reload on `/us`.

EXPECT:
- The slim **notice**, not the two-button banner: one line of text, a **Your
  Privacy Choices** button, and "Got it". The notice's accessible name (the
  `aria-label` of `section[aria-label]`) is also "Your Privacy Choices".
- No Refuse/Accept pair.
- The footer offers **Your Privacy Choices** followed by the official opt-out
  icon (PR-10), not **Cookie preferences**, and it opens the same preferences
  dialog as the notice's button.
- The tags load on arrival with no click (MP-05, GA-06), and `stampeo_sid`
  exists before they do (SP-01).
- NO `stampeo_consent` yet: the notice is not a choice until "Got it" (RG-03).
- Note: in Polish (`/pl`) the notice text is two sentences, not one line. That
  is expected, not a layout failure.

### RG-03 Dismissing the US notice makes it stay dismissed — CORE
DEPENDS: RG-02

WHY: This regressed once as component-only state, which brought the notice back
on every navigation. That reads as a broken site, and it also means no record
exists of what the visitor was shown.

1. From RG-02, click **Got it**. Read the privacy route's answer (R15).
2. Navigate to `/pricing`, then reload.

EXPECT:
- The notice does not reappear, on either the navigation or the reload.
- `stampeo_consent` exists and reads `"v":3,"a":1,"m":1,"r":"opt-out"` with
  `"g":"US"` and `"p":1`.
- R15: the POST's `Set-Cookie` for `stampeo_consent` has `Max-Age=15724800`
  (182 days). A grant is not given the 400-day refusal lifetime.
- The page does **not** reload on "Got it": nothing was revoked, so the running
  tags keep running.
- No second POST carrying `consent` on the navigation or the reload: a grant is
  not renewed (SP-05).

### RG-04 Global Privacy Control is honoured without being asked — CORE
DEPENDS: RG-02

WHY: The one US requirement that is a hard requirement, and the only case where
the correct behaviour is to show the visitor nothing at all. While
`analytics_under_us_opt_out` is `off`, the signal also switches Google Analytics
off, not only Meta (`gpcDeniedCategories` in `lib/privacy/policy.ts`).

1. R5. Confirm `navigator.globalPrivacyControl === true` in the console.
2. R17, R13 with `America/New_York`, R7, R9, then load `/us`. Wait 5s. Open the
   footer **Your Privacy Choices** (the dialog itself is PR-09).
3. Then repeat with R13 `Europe/Paris`.

EXPECT:
- New York: **no notice at all**. Network: zero requests to
  `googletagmanager.com`, `google-analytics.com`, `connect.facebook.net`,
  `facebook.com`. `typeof window.fbq === "undefined"` and
  `typeof window.gtag === "undefined"`.
- New York cookies: `stampeo_sid` (the subject is still minted: it is strictly
  necessary and identifies nothing to any tag) and `stampeo_market=us` (set by
  `/us` itself), and nothing else. `NEXT_LOCALE` appears only if this jar
  opened `/` with a browser language the site does not serve, or used the
  language switcher (STA-358).
  NO `_ga*`, `_fbp`, NO `stampeo_src`, `stampeo_ga`, `stampeo_ad`, and NO
  `stampeo_consent`: nobody chose, and the signal overrides without recording a
  choice.
- Paris: the banner **is** still shown (they may still opt in deliberately), and
  until they do, nothing loads and no `stampeo_sid` exists.
- Then, still in Paris, R6 (a stored grant) with GPC still on, and reload: the
  stored choice wins and the tags load. In the EU an explicit click outranks the
  signal. In New York it does not: see RG-07.

### RG-05 A US visitor who opted out under the previous text stays opted out — BLOCKER
DEPENDS: RG-02

WHY: A US opt-out is the one choice the notice regime exists to honour. If the
version bump read the version-2 opt-out as no choice, the opt-out default would
load the pixel and GA again and capture the visitor's ad click, behind a notice
they already answered.

1. R17, R13 with `America/New_York`, R9, then R12 with `a:0`, `m:0`,
   `r:"opt-out"`.
2. Open `/us?fbclid=qa-rg05`, wait 5s, then reload. Read R15.

EXPECT:
- **No** notice, on either load.
- Network: zero requests to `connect.facebook.net` and `googletagmanager.com`;
  `typeof window.fbq === "undefined"`.
- **No** `_fbp`, `_ga`, and **no** `stampeo_src`, `stampeo_ga`, `stampeo_ad` and
  no `stampeo_attribution`: the `qa-rg05` click is not captured.
- `stampeo_consent` still decodes to `"v":2,"a":0,"m":0,"r":"opt-out"`. It is
  re-issued by the server on each trackable load (a US refusal slides): R15
  shows a POST carrying that same version-2 record and a `Set-Cookie` with
  `Max-Age=34560000`. The record is not upgraded to version 3 and not turned
  into a grant.
- `stampeo_sid` now exists (a US visitor gets a subject on arrival, SP-01).

### RG-06 A previous-text marketing refusal survives "Got it" — CORE
DEPENDS: RG-05

WHY: A version-2 `{a:1,m:0}` keeps marketing refused and asks about analytics
again. In the US the notice reappears, and dismissing it records the state in
force; recording the regime default instead would turn the old marketing
refusal into a grant.

1. With the GA measurement id and the Meta pixel id set (Setup): R17, R13 with
   `America/New_York`, R7, R9, then R12 with `a:1`, `m:0`, `r:"opt-out"`. Note
   the `t` R12 wrote.
2. Open `/us?fbclid=qa-rg06`. Wait 5s.
3. Click **Got it**, then reload.

EXPECT:
- The **notice** shows on the first load.
- `googletagmanager.com` is requested and `_ga` is set; `connect.facebook.net`
  is **not** requested and there is no `_fbp`.
- `stampeo_src` and `stampeo_ga` exist; **NO `stampeo_ad`** (marketing is refused,
  so the `qa-rg06` click id is not kept) and no `stampeo_attribution`. Both
  decode with `"cv":2`, `"cr":"opt-out"`, `"ca"` equal to the `t` from step 1,
  `"g":"US"`: the version-2 choice the visitor's state rests on (AT-12). Neither
  holds the click id.
- After **Got it**, `stampeo_consent` decodes to `"v":3,"a":1,"m":0`, **not**
  `"m":1`. The page does not reload (nothing was revoked). After the reload the
  notice is gone, Meta still does not load, and both carriers now read `"cv":3`
  with `"ca"` equal to the new record's `t` (the refusal re-stamps them, AT-16).
- Repeat with R13 `Europe/Paris` instead: the **banner** shows, and nothing loads
  and no carrier is written until it is answered.

### RG-07 Global Privacy Control overrides an earlier "Got it" — CORE
DEPENDS: RG-03, RG-04

WHY: "Got it" records the opt-out default, everything on. The CCPA regulations
(§7025) require GPC to be processed as an opt-out even when it conflicts with
an earlier setting, so a US visitor who acknowledged the notice and later
turned GPC on must stop being tracked, and the carriers written before must not
cross to the dashboard.

1. R17, R13 with `America/New_York`, in the R5 browser with the signal **off**.
   R7, R9, then open `/us`, click **Got it**, and wait 5s. Confirm `_ga`, `_fbp`,
   `stampeo_src`, `stampeo_ga` exist (if the browser blocks the tags itself,
   lower its tracker blocking for the site first).
   - If the browser cannot switch GPC off, forge the same state with GPC on
     instead: console,
     `document.cookie = 'stampeo_consent=' + encodeURIComponent(JSON.stringify({v:3,a:1,m:1,t:Math.floor(Date.now()/1000),r:"opt-out",g:"US",p:1,s:crypto.randomUUID()})) + '; path=/'`,
     then `document.cookie = '_ga=GA1.1.111.222; path=/'`,
     `document.cookie = '_fbp=fb.1.1700000000.1; path=/'` and R18.
2. Turn the signal on (R5) and confirm `navigator.globalPrivacyControl === true`.
3. Reload once, wait 5s, then read the cookie jar and R15.

EXPECT:
- No notice.
- Network: zero requests to `googletagmanager.com` and `connect.facebook.net`;
  `typeof window.fbq === "undefined"` and `typeof window.gtag === "undefined"`.
- `_ga`, `_ga_*`, `_fbp`, `stampeo_src`, `stampeo_ga`, `stampeo_ad` and any
  `stampeo_attribution` are **gone**. A POST to `/api/privacy/cookies` carries
  `"clear"` naming the carriers, so the server-side deletion outlives the page.
- `stampeo_consent` is still there and still decodes to `"a":1,"m":1,"r":"opt-out"`:
  the choice is kept, only overridden. `stampeo_sid` is still there.
- The page loaded once: one document request in Network, no reload loop.

### RG-08 Each row is decided from the timezone alone — BLOCKER
DEPENDS: CN-01

WHY: The row decides what loads before anyone clicks, and there is no IP lookup:
a wrong zone table tracks a European as an American. The code is
`lib/privacy/region.ts` (reads `Intl`), `lib/timezone-country.ts` (the zone
table) and `lib/privacy/policy-matrix.v1.json` (the three rows).

1. For each line of the table: R17, R13 with that zone, hard reload `/` (use
   `/us` for the US zones), wait 5s, and look at what is shown and loaded.
2. Click **Refuse all** (or **Got it** for the notice) and decode
   `stampeo_consent`: its `"g"` names the row the page believed in, and `"r"`
   the regime.

| Timezone | Row (`g`) | Regime | Surface | Before any click |
|---|---|---|---|---|
| `Europe/Paris`, `Europe/London`, `Europe/Zurich`, `Atlantic/Reykjavik`, `Europe/Warsaw` | `EEA_UK_CH` | `opt-in` | banner | Nothing loads. No `stampeo_sid`. |
| `America/New_York`, `America/Phoenix`, `America/Anchorage`, `Pacific/Honolulu` | `US` | `opt-out` | notice | GA and Meta load. `stampeo_sid` exists first. |
| `Etc/UTC`, `Antarctica/Troll`, `Asia/Tokyo`, `America/Toronto` | `UNKNOWN` | `opt-in` | banner | Nothing loads. No `stampeo_sid`. |

EXPECT:
- Each line behaves as its row says, in every one of its zones.
- NEGATIVE: no US zone shows a banner or waits for a click; no EU, UK, Swiss or
  unplaceable zone shows the notice, loads a tag, or mints a subject before a
  decision.
- NEGATIVE: the switch of zone is the only thing that changed between lines. If a
  zone behaves like the wrong row, name the zone: the table is the defect.

### RG-09 A hand-written `stampeo_region` cookie changes nothing — BLOCKER
DEPENDS: RG-08

WHY: Nothing signs or writes `stampeo_region` yet, so any value in it is the
visitor's own. Reading it would let a hand-typed cookie turn tracking on in
Europe. `READ_REGION_COOKIE` is `false` in `lib/privacy/region.ts` until the
Cloudflare middleware exists (STA-379).

1. R17, R13 `Europe/Paris`, R20 with `c:"US"`, hard reload `/`.
2. R17, R13 `America/New_York`, R20 with `c:"FR"`, hard reload `/us`.
3. Repeat step 1 with `c:"ZZ"` and with a malformed value
   (`document.cookie = 'stampeo_region=garbage; path=/'`).

EXPECT:
- Step 1: the **banner**, not the notice. Nothing loads, no `stampeo_sid`.
- Step 2: the **notice**, and the US behaviour (tags load, `stampeo_sid` exists).
- Step 3: identical to step 1, and no console error.
- NEGATIVE: the cookie moves the row in neither direction, and the site does not
  rewrite or delete it. `stampeo_region` appears in no policy table (LG-01).

### RG-10 A visitor we cannot place, or a US territory, is asked first — BLOCKER
DEPENDS: RG-08

WHY: Absence of a signal is not an opt-out country. A US territory is not
covered by the US row: territories stay unmapped, which holds them to the strict
row (`lib/timezone-country.ts`). A browser's language is not a place either.

1. R17, R13 `Etc/UTC` (Chrome reports `UTC`), hard reload `/`.
2. R17, R13 `America/Puerto_Rico`, then `Pacific/Guam`, hard reload `/us`.
3. R17, R13 with a custom location whose Timezone ID is `Europe/Paris` and whose
   Locale is `en-US`, hard reload `/`.

EXPECT:
- Every step shows the **banner**, loads nothing, and mints no `stampeo_sid`.
- Step 2 on `/us`: still the banner. Nothing on the page offers "Your Privacy
  Choices" as the footer label; it reads **Cookie preferences**.
- Step 3: the banner. `navigator.language` saying `en-US` does not make a
  French-timezone visitor American.
- NEGATIVE: no notice, no tag, no GA or Meta request, in any step.

### RG-11 A US "Got it" does not carry into Europe — BLOCKER
DEPENDS: RG-03, RG-08

WHY: "Got it" records the opt-out default, everything on. That is not consent,
and a grant never counts in a row stricter than the one it was made in
(`standingChoice` in `lib/privacy/policy.ts`). A visitor who changes zone must be
asked again, and what the US visit wrote must not be re-stamped with European
evidence.

1. R17, R13 `America/New_York`, R7, R9, open `/us`, wait for `_ga`, `_fbp` and
   the carriers, then click **Got it**. Copy the three carriers' decoded values
   (`stampeo_src`, `stampeo_ga`, `stampeo_ad` if a click id was there) and the
   consent cookie.
2. R13 `Europe/Paris`, hard reload `/`, wait 5s. Read R15.

EXPECT:
- The **banner** shows (undecided, opt-in row). The footer reads **Cookie
  preferences**.
- `typeof window.fbq === "undefined"` and `typeof window.gtag === "undefined"`:
  no request to `googletagmanager.com` or `connect.facebook.net`.
- `_ga`, `_ga_*`, `_fbp`, `_fbc` and all three carriers are **gone**: every
  trackable load clears the cookies of each category the resolved consent denies,
  and a US grant does not count in Paris (`planPageLoad` in
  `lib/privacy/lifecycle.ts`). NEGATIVE: no carrier was re-written with
  `"cr":"opt-in"` or `"g":"EEA_UK_CH"`.
- `stampeo_consent` is untouched: still `"a":1,"m":1,"r":"opt-out","g":"US"`
  (back in New York the grant counts again).
- R15: the POST to `/api/privacy/cookies` carries only `sid` and a `clear` list
  of those names: no `consent`, no `carriers`.

3. Click **Refuse all**. Put a stray `_fbp` back by hand (R18), click **Refuse all**
   again from the footer dialog.

EXPECT:
- After each click the tracker and carrier cookies are gone and
  `stampeo_consent` reads `"a":0,"m":0`: a refusal clears every refused category
  whatever was live before (`categoriesToClearOnChoice`).

### RG-12 A web-restored refusal keeps marketing refused in the US — CORE
DEPENDS: RG-02

WHY: An owner whose business has a marketing refusal signs into the dashboard in
a browser that does not hold it, and the dashboard writes it back as
`{a:-1,m:0,o:"restore"}` (AC2.4). `-1` is "no choice about analytics": it is not
a refusal and not a grant. The refusal must hold, and nothing the restore did
not say may be read as a grant.

1. R17, R13 `America/New_York`, R7, R9, R14. Open `/us?fbclid=qa-rg12`, wait 5s.
   Read R15 and decode `stampeo_consent`.
2. Open footer **Your Privacy Choices**. Without changing anything, **Save**.
3. Reload. Then R5 (GPC on) and reload once more.

EXPECT:
- Step 1: **no notice** (an opt-out row has nothing left to ask,
  `surfaceWithPolicy` in `lib/privacy/policy.ts`). This differs from the UX brief,
  which expected the notice and a "Got it": there is no way to click it here, and
  that is the behaviour of the code.
- Step 1: `googletagmanager.com` is requested and `_ga` is set (analytics takes
  the row default); `connect.facebook.net` is **not** requested, no `_fbp`,
  `typeof window.fbq === "undefined"`, and **no `stampeo_ad`** although the URL
  carried an `fbclid`. `stampeo_src` and `stampeo_ga` carry `"ca":0` (a restore is
  not a click), `"cr":"opt-out"`, `"g":"US"`.
- The cookie still decodes `"a":-1,"m":0,"o":"restore"`, and the sliding refresh
  re-posts exactly that (R15 payload) with `Max-Age=34560000`.
- Step 2: the dialog shows Advertising **off** and Audience measurement **on**.
  After Save the cookie decodes `"a":1,"m":0` with **no** `"o"`: the visitor's own
  action replaced the restore. The page does not reload.
- Step 3: with GPC on, nothing loads and the dialog is all-locked (PR-09).
- NEGATIVE: marketing is never on at any moment of this case, and Meta never
  loads.

### RG-13 A web-restored refusal in Europe asks again and loads nothing — CORE
DEPENDS: RG-01

WHY: In an opt-in row a category with no choice must be asked about; a restore
that settles only marketing must not be read as settling analytics.

1. R17, R13 `Europe/Paris`, R14, reload `/`. Wait 5s.
2. Click **Refuse all**.

EXPECT:
- The **banner** shows. No request to `googletagmanager.com` or
  `connect.facebook.net`, no `_ga`, no `_fbp`, no carrier.
- After **Refuse all**: `stampeo_consent` decodes `"a":0,"m":0` with no `"o"`.
- NEGATIVE: the restore does not load Analytics. No notice, no tag.

---

## PR: the preferences dialog

### PR-01 Both switches start off — BLOCKER
DEPENDS: CN-01

WHY: A pre-ticked box is not consent. This is the other most-fined mistake.

1. R17, R13 with `Europe/Paris`, R1, reload, click **Choose by purpose**.

EXPECT:
- Two switches, "Audience measurement" and "Advertising", both **off**.
- "Strictly necessary" is shown as always on and has no switch.
- Each row names who receives the data: Google Analytics for the first, Meta
  for the second. TikTok is named nowhere.
- Card order is Strictly necessary, Audience measurement, Advertising (the US
  order is different, PR-08).
- The intro says the choice is kept for **6 months** (182 days, interpolated from
  the row) and carries no `{months}` placeholder text.
- No Global Privacy Control status row and no locked label, GPC or not (PR-09).

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
2. Footer > **Cookie preferences** (under a US timezone, R3, the entry reads
   **Your Privacy Choices**) > turn **both** switches off > **Save my choice**.

EXPECT:
- The page **reloads** by itself.
- `stampeo_consent` now reads `"a":0,"m":0`.
- `NEXT_LOCALE`, `stampeo_market` and `stampeo_sid` are untouched: revocation
  must not clear our own cookies along with the trackers.

### PR-05 The footer entry is always reachable — CORE
DEPENDS: CN-02

WHY: Withdrawing consent has to be as easy as giving it, which means it cannot
live only in a banner that is gone the moment someone answers.

1. After CN-02 (banner dismissed by a refusal), scroll to the footer on `/`,
   `/en`, `/es`, `/pl`.
2. Click **Cookie preferences** on each.
3. Repeat with R3 (New York): the same entry now reads **Your Privacy Choices**.

EXPECT:
- The entry is present in the Legal column in all four locales, translated.
- It opens the dialog every time.
- Under R2 it reads **Cookie preferences**; under R3 it reads **Your Privacy
  Choices** followed by the opt-out icon (PR-10), in the language of the page.

### PR-06 The footer entry works on the email preferences page — CORE
DEPENDS: PR-05

WHY: `/email-preferences` is a private route (no tag fires there) that
nevertheless renders the footer, so it is the one page where "no tracking here"
and "the withdrawal control is visible here" are both true. It shipped once with
a button that did nothing when clicked.

1. Open `/email-preferences` (any locale) on a fresh jar (R17). Scroll to the footer.
2. Click **Cookie preferences** (**Your Privacy Choices** with the icon under a US
   timezone, R13, even on a fresh jar: the label follows the row, not the subject).

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

### PR-08 The US dialog is the US version — CORE
DEPENDS: RG-02

WHY: US law frames this as opting out of sale, sharing and targeted advertising,
so the dialog leads with that, is titled like the link that opened it, and says
how long a refusal lasts. The duration is interpolated from the row, never typed
into a string (`lib/privacy/choices-ui.ts`).

1. R17, R13 `America/New_York`, open `/us`. Click the notice's **Your Privacy
   Choices** button, then close, then open the footer entry.
2. Repeat in `/fr`, `/es`, `/pl` (use the `/us` page in each locale's language
   through the language switcher).

EXPECT:
- The dialog title, the footer entry, the notice's button and the notice's
  accessible name are the **same words**: `Your Privacy Choices` / `Vos choix de
  confidentialité` / `Tus opciones de privacidad` / `Twoje ustawienia
  prywatności`.
- Card order: **Advertising** ("Sale, sharing and targeted advertising"), then
  Audience measurement, then Strictly necessary ("Always on") last.
- Both switches start **on**: that is the US default in force, and the dialog
  shows what is in force.
- The intro says a refusal is kept for **13 months**, renews on each visit, and
  names "Your Privacy Choices" in the footer. The EU dialog (PR-01) says 6 months
  and says nothing of renewal.
- No GPC status row (the signal is off). The action row reads Cancel and Save.
- NEGATIVE: no `{months}` or `{choices}` placeholder text, no hard-coded
  duration, and the EU title "Choose by purpose" is not the title.

### PR-09 Global Privacy Control locks the US dialog — BLOCKER
DEPENDS: RG-04

WHY: Before this, a GPC visitor could switch Advertising on and Save a choice
that did nothing, and a Save that changes nothing reads as having done
something. One status row explains every lock, and the only action left is Close.

1. R5 (a real GPC browser for the header checks, the init-script fake is enough
   here). R17, R13 `America/New_York`, open `/us`, open the footer **Your Privacy
   Choices**.
2. Run `document.querySelectorAll('dialog input[role=switch]').length`.
3. Press Close. Then reopen and press Escape.
4. Repeat in `fr` and `es`.
5. R13 `Europe/Paris`, GPC still on, open the footer **Cookie preferences**.

EXPECT:
- A status row with a shield icon: "Your browser's Global Privacy Control signal
  is on, and we honor it: advertising and audience measurement are off." (in `fr`:
  "...la publicité et la mesure d'audience sont désactivées."; in `es`: "...la
  publicidad y la medición de audiencia están desactivadas.").
- Both purposes show a fixed label instead of a switch: `Off` / `Désactivé` /
  `Desactivado`. Step 2 prints `0`. The intro is the all-locked wording: "Your
  browser's signal already keeps both purposes off, so there is nothing to change
  here. You can open “Your Privacy Choices” in the footer any time." (in `fr`:
  "Le signal de votre navigateur désactive déjà les deux finalités : il n'y a rien
  à modifier ici.", in `es`: "La señal de tu navegador ya mantiene desactivadas las
  dos finalidades, así que aquí no hay nada que cambiar."), and it names the
  footer entry by the same title as the link.
- Only **Close** (`Close` / `Fermer` / `Cerrar`): no Cancel, no Save.
- Step 3: Close and Escape record nothing. `stampeo_consent` is still absent, no
  POST to `public/consent` and none to `/api/privacy/cookies`, no reload.
- Step 5 (Europe): NO status row, NO lock, two real switches, both off, and the
  Cancel / Save pair: an explicit EU choice outranks the signal.
- NEGATIVE: Advertising cannot be switched on in the US dialog by any means in
  the UI.

### PR-10 The footer entry follows the row, label and icon — CORE
DEPENDS: PR-05

WHY: The CCPA regulations ask for the link by its statutory name and the opt-out
icon, treated like the other footer links. The slot must never be empty: before
the row is known, or when no subject exists yet, it reads the generic label and
swaps at most once.

1. R17, R13 `America/New_York`, open `/us`, scroll to the footer Legal column, in
   `en`, `fr`, `es`, `pl`.
2. R13 `Europe/Paris`, hard reload, the same four.
3. At 390px wide, in `en` and `pl`.
4. R19 on `*/icons/privacy-options.svg*`, reload in New York.

EXPECT:
- New York: the label ("Your Privacy Choices" / "Vos choix de confidentialité" /
  "Tus opciones de privacidad" / "Twoje ustawienia prywatności") followed by an
  `img[src="/icons/privacy-options.svg"]`: the blue-and-white toggle with a tick
  and a cross, colours unmodified, about 14px tall (30x14 proportions), no alt
  text, `aria-hidden`. It sits in the Legal column, third item after Privacy
  Policy and Terms, in the same grey as its neighbours: not accent coloured, not
  bold.
- Paris: "Cookie preferences" / "Préférences cookies" / "Preferencias de cookies" /
  "Ustawienia plików cookie", and **no** `img[src*="privacy-options"]`.
- Reload New York several times (throttle to Fast 3G once): the slot is never
  blank. It may show "Cookie preferences" first and swap once to the US label.
- 390px: the label wraps to two lines at most, the icon stays with the last word
  and never sits on a line of its own, and the hit area is at least 44px tall.
- Step 4: the label still renders and there is **no broken-image glyph**.
- NEGATIVE: no "Do Not Sell or Share" link and no state picker anywhere.

### PR-11 The dialog's state labels are translated — CORE
DEPENDS: PR-09

WHY: The locked label is the one string a GPC visitor reads where a switch would
be, and the one most likely to be left in English.

1. As PR-09 step 1, in `fr`, `es` and `pl`.

EXPECT:
- The locked label reads `Désactivé`, `Desactivado`, `Wyłączone`; the closing
  action `Fermer`, `Cerrar`, `Zamknij`; the title the same words as the footer
  entry (PR-08).
- NEGATIVE: no English fallback string (`Off`, `Close`, `Your Privacy Choices`)
  anywhere in the dialog.

---

## SP: the subject and the standing refusal (STA-377)

Two strictly necessary cookies carry the compliance state. `stampeo_sid` is a
random v4 UUID that chains one person's decisions and, at sign-up, ties them to
the account. `stampeo_consent` carries the choice, and a refusal in the US must
outlive the browser's own limits, so the server sets it (`POST
/api/privacy/cookies`) and renews it. Instrument: R15 for every case here.

### SP-01 A US visitor has a subject before any tag loads — BLOCKER
DEPENDS: RG-02

WHY: A refusal made later on this site has to reach the account the visitor
creates, and that join needs the subject to exist before GA and Meta can run. It
must never travel to either of them.

1. R17, R13 `America/New_York`, R7, R9. Network open with Preserve log, filter
   empty. Load `/us`, wait 5s.
2. Console: `document.cookie.match(/stampeo_sid=([^;]*)/)[1]`.
3. Reload, then navigate client-side to `/pricing`.

EXPECT:
- `stampeo_sid` exists and matches
  `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` (a
  lowercase v4).
- Ordering: the `POST /api/privacy/cookies` with payload `{"sid":"ensure"}`
  appears **before** the first request to `googletagmanager.com` or
  `connect.facebook.net` in the Network timeline. Its 204 carries `Set-Cookie:
  stampeo_sid=<the same value>; Max-Age=34560000`.
- Network > Search (the value from step 2): it appears in requests to our own
  origin only, and in **no** request to `googletagmanager.com`,
  `google-analytics.com`, `facebook.com` or `facebook.net`.
- The value is the same after the reload and the navigation (not re-minted).
- NEGATIVE: no `stampeo_consent` yet (nobody chose) and no POST to `public/consent`.

### SP-02 A European visitor gets a subject at the first decision, not before — CORE
DEPENDS: CN-02

WHY: In an opt-in row nothing is stored until the visitor decides. The subject
exists to chain decisions, so it appears with the first.

1. R17, R13 `Europe/Paris`, load `/`: no `stampeo_sid`.
2. Click **Refuse all**. Read R15.

EXPECT:
- Step 1: no `stampeo_sid` and no POST to `/api/privacy/cookies`.
- Step 2: the POST's answer sets `stampeo_consent` and `stampeo_sid`; the `s`
  inside the consent cookie equals the sid; both are lowercase v4.
- NEGATIVE: no sid is minted by merely loading a page in this row.

### SP-03 A forged subject is replaced or normalised — CORE
DEPENDS: SP-01

WHY: The id is ours to mint. A value we did not write is whatever a visitor typed
into their own jar, and trusting it would let them write ledger rows under an id
of their choosing or smuggle a non-UUID into a `uuid` column.

1. R17, R13 `America/New_York`. Forge, one at a time (see "Forging a cookie that
   the site also sets"), then load `/us` and read `stampeo_sid`:
   a. `stampeo_sid=not-a-uuid`
   b. `stampeo_sid=11111111-1111-1111-1111-111111111111` (not a version-4 UUID)
   c. `stampeo_sid=AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA` (a v4, upper case)

EXPECT:
- a and b: the value is replaced by a fresh lowercase v4. The forged text appears
  nowhere afterwards (not in the jar, not in any POST).
- c: the same id, lower-cased: `aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa`, set by the
  route's answer (R15). It is normalised, not re-minted.
- NEGATIVE: no step leaves an upper-case or non-v4 sid in the jar.

### SP-04 A US refusal is saved by the server, for 400 days — BLOCKER
DEPENDS: RG-02

WHY: A cookie written by script is capped by some browsers (Safari: 7 days), so a
US visitor's refusal would quietly expire and revert to the opt-out default.
The server sets it, and the response, not `document.cookie`, is the evidence.

1. R17, R13 `America/New_York`, R7, R9, open `/us`, wait for the tags.
2. Footer **Your Privacy Choices** > turn **Advertising** off > **Save**. The page
   reloads (a revocation).
3. Read R15 on both POSTs (the Save, and the one after the reload). Also read
   Application > Cookies > `stampeo_consent` > Expires.

EXPECT:
- The Save's POST payload has `consent` like `{"v":3,"a":1,"m":0,...,"r":"opt-out",
  "g":"US","p":1,"s":"<uuid>"}`, the answer is **204**, and its `Set-Cookie` for
  `stampeo_consent` has `Max-Age=34560000` (400 days), `Path=/`, `SameSite=Lax`
  (plus `Domain=` and `Secure` wherever the build sets them). A `Set-Cookie` for
  `stampeo_sid` has the same Max-Age.
- After the reload, a second POST carries the same consent record with the same
  `"t"` (the renewal does not rewrite the moment) and answers with
  `Max-Age=34560000` again.
- Application > Cookies shows an expiry about 400 days ahead (plus or minus a day).
- `typeof window.fbq === "undefined"`, no `_fbp` / `_fbc` / `stampeo_ad`; GA still
  loads and `_ga` is present: refusing advertising leaves audience measurement
  alone.
- CL: one `consent_records` row, `surface` `preferences`, `region_row` `US`.
- NEGATIVE: neither answer carries `Max-Age=15724800`: a refusal is never given
  the grant lifetime.

### SP-05 Only a refusal is renewed, once per document load — CORE
DEPENDS: SP-04

WHY: A sliding refusal keeps a visitor opted out for as long as they keep coming
back, and costs one request per visit, never one per click. A grant, and any EU
choice, are fixed once made.

1. From SP-04. Clear the Network log. Navigate client-side `/us` > `/pricing` >
   `/blog`.
2. Hard reload `/blog`.
3. Hard load `/login`.
4. R17, R13 `Europe/Paris`, **Refuse all**, then reload twice.
5. R17, R13 `America/New_York`, open `/us`, click **Got it**, then reload twice.

EXPECT:
- Step 1: no POST carrying `consent`.
- Step 2: exactly one POST carrying `consent` and `"sid":"ensure"`, answered with
  `Max-Age=34560000`.
- Step 3: **no** POST at all: a private route does nothing.
- Step 4: any POST has a payload of at most `{"sid":"ensure"}`, never `consent`
  (an EU refusal is fixed at 182 days from when it was made).
- Step 5: the same: no `consent` is re-posted for a grant.
- NEGATIVE: no step produces more than one POST carrying `consent` per document.

### SP-06 A refusal older than six months is still a refusal — CORE
DEPENDS: SP-04

WHY: What ends a refusal is the cookie expiring, not the age written inside it.
Reading it against its own age would revert marketing to the opt-out default and
send the visitor's click to Meta (AC2.2).

1. R17, R13 `America/New_York`, R9. Forge `stampeo_consent` with
   `{v:3,a:1,m:0,t:Math.floor(Date.now()/1000)-183*86400,r:"opt-out",g:"US",p:1,s:crypto.randomUUID()}`
   (the pattern of R6), then open `/us?fbclid=qa-sp06`, wait 5s.

EXPECT:
- No notice, no `connect.facebook.net` request, no `_fbp`, no `stampeo_ad`.
- GA loads (analytics was never refused).
- NEGATIVE: marketing never reverts to the row default, however old `"t"` is.

### SP-07 The choice survives the route being unreachable — CORE
DEPENDS: CN-02

WHY: The route is a second write of the same cookie. If it fails, the
`document.cookie` write has already happened and must carry the choice.

1. R19 on `*api/privacy/cookies*`. R17, R13 `Europe/Paris`, load `/`.
2. Click **Refuse all**. Reload.

EXPECT:
- The banner closes. `stampeo_consent` exists (written by script) and decodes
  `"a":0,"m":0`. After the reload the banner does not return.
- Network shows the blocked request. No error is shown to the visitor, no toast.
- `stampeo_sid` may be absent (only the route sets it in this row): not a failure.
- NEGATIVE: a failed route never costs the visitor their click.

### SP-08 The route accepts only the site, and writes only what it owns — CORE

WHY: Anyone on the internet can call it. Its defences are the origin rule, the
content type, the size cap, and re-validating every value with the client's own
parsers. `SITE` is the showcase origin under test; no browser state is involved.

1. Run each and read the status line and every `Set-Cookie`:
   - a. `curl -si -X POST $SITE/api/privacy/cookies -H 'Content-Type: application/json' -d '{}'`
   - b. the same with `-H 'Origin: https://evil.example'`
   - c. `-H "Origin: $SITE" -H 'Content-Type: text/plain' -d '{}'`
   - d. `-H "Origin: $SITE" -H 'Content-Type: application/json' -d '{}'`
   - e. as d with `-d '{"consent":{"v":3,"a":1,"m":0,"t":1791244000,"r":"opt-out","s":"not-a-uuid"},"sid":"ensure"}'`
   - f. as d with `-d '{"carriers":{"ad":{"v":2,"vn":"meta","ci":"qa-curl","ct":1791244000,"cv":3,"cr":"opt-out","ca":0,"p":1,"g":"US"}}}'`
   - g. as f plus `-H 'Cookie: stampeo_consent=%7B%22v%22%3A3%2C%22a%22%3A1%2C%22m%22%3A0%2C%22t%22%3A1791244000%2C%22r%22%3A%22opt-out%22%7D'`
   - h. as d with `-d '{"carriers":{"ad":{"vn":"not-a-vendor"}}}'`
   - i. as d with `-d '{"clear":["stampeo_consent","stampeo_src"]}'`
   - j. as d with a body larger than 8 KB (for example `-d "{\"x\":\"$(head -c 9000 /dev/zero | tr '\0' a)\"}"`).

EXPECT:
- a and b: **403**, no `Set-Cookie`. c: **415**. d: **204**, no `Set-Cookie`.
- e: **204**; `stampeo_consent` and `stampeo_sid` are both set, carry one fresh
  lowercase v4 as the subject, and the string `not-a-uuid` appears nowhere.
- f: **204** with a `Set-Cookie` for `stampeo_ad` (`Max-Age=15724800`). g: **204**
  and **no** `stampeo_ad`: the request's own record refuses marketing, so the
  carrier is dropped.
- h: **204**, no `Set-Cookie`: an invalid carrier is dropped, silently.
- i: `Set-Cookie: stampeo_src=; Max-Age=0` only. `stampeo_consent` cannot be
  cleared through the route.
- j: **413**.
- NEGATIVE: no response body, no echo of anything posted, on any line.
- RESET: None.

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

### PG-03 Private routes fire no tag and capture nothing — BLOCKER
DEPENDS: PG-01

WHY: Someone mid-signup, resetting a password or arriving from a merchant's QR
code is not an ad audience. The carriers also describe where a visit BEGAN, so a
visit that begins on a private route captures nothing, even after the visitor
clicks on to a marketing page (`planCapture` checks the landing path).

1. A: R17, R13 `Europe/Paris`, open `/`, **Accept all** (tags load). Navigate
   client-side to `/onboarding` through a header CTA. Then, with R7 and R9 before
   each, hard-load `/en/onboarding`, `/en/login`, `/en/reset-password` and
   `/en/email-preferences`.
2. B: R17, R13 `America/New_York`, R7, R9. Hard-load
   `/en/login?gclid=qa-pg03-click&utm_source=google`, then
   `/en/onboarding?fbclid=qa-pg03-click`, then `/en/reset-password`.
3. From the last B page, click the site logo to `/` (client-side).
4. C: R17, R13 `America/New_York`. Hard-load a seeded `/<slug>?fbclid=qa-pg03-click`
   and `/en/demo/wallet-select/qa-token?gclid=qa-pg03-click` (do not click the
   wallet badges).

EXPECT:
- A: after the client-side hop onto `/onboarding`, no `PageView`, `SignupCTA` or
  `page_view` beacon (GA-02, MP-08). Each hard load: zero requests to the tag
  hosts, `fbq` and `gtag` undefined, no banner and no notice.
- B: no notice, zero requests to the tag hosts, **no `stampeo_sid`** (a US visitor
  gets one only on a page where a tag may run), no `stampeo_src`, `stampeo_ga` or
  `stampeo_ad`, no `stampeo_consent`, and no POST to `/api/privacy/cookies`.
- B step 3: on `/` the tags now load (US default) and the sid is minted, but
  **still no carrier is written in this document**: the visit began on a private
  route.
- C: the same as B for the enrollment page and the demo wallet page, and no banner.
- NEGATIVE: `qa-pg03-click` appears in no cookie and in no request to a tag host.

### PG-04 The demo wallet page keeps its privacy control — CORE
DEPENDS: PG-03

WHY: `/demo/wallet-select/<token>` carries a session token in its path, so no tag
runs there, yet it has no footer. The control that withdraws a choice is a
button under the card (`CookiePreferencesButton tone="page"`).

1. R17, R13 `America/New_York`. Visit `/us` once (so the subject exists), then
   hard-load `/en/demo/wallet-select/qa-token`.
2. Find the control under the card, click it, turn Advertising off, **Save**.
3. R13 `Europe/Paris`, hard-load the same page.

EXPECT:
- The control reads **Your Privacy Choices** with the icon (New York) or **Cookie
  preferences** (Paris), centred and muted, under the card.
- It opens the dialog (the US version, or the EU version). Save works as
  anywhere else (a revocation reloads the page).
- No banner or notice on the page itself, and no tag request.
- NEGATIVE: on a fresh US jar (R17) with no subject, opened directly, the label
  still reads **Your Privacy Choices**: it follows the row, not the subject.

### PG-05 Every page where a tag can run offers the control — CORE
DEPENDS: PR-10

WHY: The privacy policy promises the entry on "every page where our measurement
and advertising cookies can be set".

1. R17, R13 `America/New_York`, visit `/us` once. Then open, and scroll to the
   footer of: `/`, `/pricing`, `/blog` and one article, `/about`, `/contact`,
   `/changelog`, `/features/<any slug from the header menu>`,
   `/founding-partner`, `/loyalty-programs`, `/privacy`, `/terms`, `/uk`, `/us`.
2. Click the entry on each.

EXPECT:
- The entry is present on each, reads **Your Privacy Choices** with the icon, and
  opens the dialog.
- NEGATIVE: none of these pages shows the generic label once the subject exists.

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

1. R2, then R1, then R9. Open `/pricing`.
2. Confirm `typeof window.fbq === "undefined"` and the Network tab is empty.
3. Click **Accept all**.

EXPECT:
- `connect.facebook.net/en_US/fbevents.js` is requested **without a reload**.
- A `PageView` is sent (Network: a `tr/?...&ev=PageView` request, or Pixel
  Helper showing 1 PageView).
- `_fbp` now exists in the cookie jar, with domain `.stampeo.app` (or the local
  equivalent) — not host-only. The dashboard reads the same cookie.
- Exactly ONE PageView, not two. Two means the init and the navigation effect
  both fired; report it. A `ViewContent` (`cd[content_category]=pricing`) also
  appears on `/pricing`: that is a different event, not a second PageView (EV-01).

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
- Now R9 (hard reload) on the business slug directly. Still no
  `connect.facebook.net` request at all, and no banner.

### MP-03 Client-side navigation counts pages once each — CORE
DEPENDS: MP-01

WHY: Meta's own history listener is switched off (MP-08), so our code sends the
PageView for each client-side navigation; without it every session looks like
one page, and with careless handling every render doubles it.

1. From MP-01, navigate client-side: `/pricing` → `/blog` → `/pricing`.

EXPECT:
- Exactly one `PageView` per navigation, three in total for the three hops.
- No PageView is sent when navigating to a page you are already on.
- Returning to `/pricing` sends no second `ViewContent` (EV-01).

### MP-04 CTA clicks send SignupCTA, and never Lead — CORE
DEPENDS: MP-01

WHY: These are the events campaigns optimise against, and a CTA sending nothing
is a silent hole in attribution. A click is intent to leave for the app, not a
lead: the Lead is the server's, sent once an account is confirmed (SG, MC-02), so
the two can never be mistaken for each other or counted twice. The browser sends
the custom `SignupCTA` and no `Lead` (STA-377, AC6.1).

1. From MP-01, click the hero CTA. Read the Network tab (`facebook.com/tr`, look
   at `ev=`).
2. Go back, click a **pricing tier** CTA.
3. Go back, click a **demo/contact** CTA (the one pointing at `/contact`).

EXPECT:
- Hero: `ev=SignupCTA`, once.
- Pricing tier: `ev=SignupCTA`, once. (Wired separately from the shared button; if
  this one is missing and the hero works, that is the bug.)
- Demo/contact: **no Meta event at all**: neither `SignupCTA` nor `Contact`. A
  click that only navigates to the contact page is not a Contact; the Contact is
  the form being sent (EV-03) or a phone or mail link being followed (EV-04).
  GA still records `contact_cta_click` (GA-05) and PostHog
  `landing_demo_cta_clicked`.
- NEGATIVE: no request in the whole case carries `ev=Lead` (EV-02).
- The PostHog events still fire alongside each signup click, unchanged.

### MP-05 A US visitor is tracked without clicking anything — CORE
DEPENDS: RG-02

WHY: Intended, and the case most likely to be misfiled as a bug. As of 2026 no
US state law requires prior consent, so the US is notice-and-opt-out.

1. R3 (become American), R1, R9. Open `/us`.

EXPECT:
- The **notice** appears, not the banner.
- `connect.facebook.net` is requested and `_fbp` is set, with **no click**.
- `stampeo_sid` exists before the pixel's first request (SP-01).
- This is CORRECT. Do not file it as a consent failure.
- Then enable Global Privacy Control in the browser and repeat: now NOTHING
  loads, and no notice appears (RG-04).

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
   server. R1, R9.
2. Open `/pricing` and click **Accept all**.

EXPECT:
- The banner behaves normally and the choice is recorded.
- **No** `connect.facebook.net` request, no `_fbp`, no console error.
- Re-set the variable afterwards before running any other MP case.

### MP-08 A client-side hop onto a private route sends Meta nothing — BLOCKER
DEPENDS: MP-05

WHY: The pixel cannot be unloaded, and Meta's script can report on its own: a
PageView on every URL change and a button-click event, with page metadata, on
every click. Our route gate only governs the calls our code makes, so both
must be off from the moment the script loads, or a visitor's signup and login
pages are reported.

1. R3, R1, R9. Open `/en` (the pixel loads with no click, as in MP-05).
   Network filter `facebook.com/tr`, and keep POST requests visible: Meta's
   automatic events are POSTs.
2. Click two buttons on the page that are not links (the Stamps / Points
   toggle).
3. Client-side through the header: **Loyalty programs**, then **Get started**
   (`/en/onboarding`).
4. On the onboarding form, click **Continue** with the fields empty.
5. R9 on `/en`, then click the header **Log in** link (`/en/login`).

EXPECT:
- `PageView` for `/en` (twice: steps 1 and 5) and for `/en/loyalty-programs`.
- A `SignupCTA`, if any, is sent from the page the button is on (`/en` or
  `/en/loyalty-programs`), never from `/en/onboarding` or `/en/login`. There is
  no `Lead` anywhere.
- **NO** request whose `dl` is `/en/onboarding` or `/en/login`: no PageView,
  no `SubscribedButtonClick`, nothing.
- **NO** `SubscribedButtonClick` anywhere, including on `/en`.
- Console on any page: `window.fbq.disablePushState === true` and
  `window.fbq.allowDuplicatePageViews === true`.

### MP-09 Every signup button sends its event, and no contact link sends a signup one — CORE
DEPENDS: MP-05

WHY: Ad platforms optimise on these clicks. Before STA-373 twenty-one of them
(header, blog articles, feature pages, the /pricing plan cards) sent nothing at
all, so the campaigns only saw a fraction of the intent. The destination decides
the funnel: a link to the contact page is a sales touch, and Meta hears only the
signup.

1. R17, R13 `America/New_York`, R1, R9. Open `/en`. Network filter
   `facebook.com/tr`.
2. Click, going back between each: header **Get started** (desktop width), the
   same in the mobile menu (390px width), a feature page's hero button, the
   bottom CTA of any blog article, a plan card on `/en/pricing`, the footer
   **Contact** link, the footer **Help** link.

EXPECT:
- Each signup button sends one `SignupCTA`.
- The footer **Contact** and **Help** links send **no** Meta event: they only
  navigate to `/contact`. (The footer phone number sends a `Contact`, EV-04.)
- PostHog shows `landing_cta_clicked` (or `landing_demo_cta_clicked` for the
  contact links) with a `cta_location` that names the button (`header`,
  `header_mobile`, `feature_hero`, `blog_cta`, `pricing_starter`...).
- NEGATIVE: **no** `SignupCTA` from the **Log in** page's own "create an account"
  link: it is a private route. And no `Lead` from anything.

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
- `googletagmanager.com` is requested and `_ga` is set, with **no click**, after
  `stampeo_sid` exists (SP-01).
- This is CORRECT. Do not file it as a consent failure.
- Then enable GPC (R5) and repeat: NOTHING loads, neither Google nor Meta, and
  no notice appears (RG-04: the shipped matrix turns analytics off under GPC too).

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

## EV: browser events (STA-377)

What the browser tags report, and the two rules every event obeys: the consent
category is read **when the event is sent**, and the page must be a trackable
one. No browser event is named `Lead`. Instrument: Network filtered to
`facebook.com/tr` and `google-analytics.com`, Preserve log on. The list of events
and their gates is `backend/docs/measurement/events.md`.

### EV-01 ViewContent: once per page per load, on pricing and features only — CORE
DEPENDS: MP-01

WHY: A ViewContent on every page, or one per re-render, teaches the bidder that
content views are cheaper than they are. The dedupe is module state, so a
remounted component cannot send a second one.

1. R17, R13 `Europe/Paris`, R1, R9. Open `/pricing`, **Accept all**.
2. Client-side: header > `/blog` > back to `/pricing`.
3. Switch the language to English and back to French with the language switcher
   (the `[locale]` tree remounts, the pixel stays resident).
4. Open a feature page (header menu, `/features/<slug>`), then `/about`.

EXPECT:
- Step 1: one `ev=ViewContent` with `cd[content_category]=pricing`, and one
  `ev=PageView`.
- Step 2: a `PageView` for each hop and **no** second `ViewContent` for
  `/pricing`.
- Step 3: the English pricing path sends one `ViewContent` (a different page),
  and neither switch sends a second one for a path it already reported.
- Step 4: one `ViewContent` with `cd[content_category]=features`, none on `/about`.
- NEGATIVE: no `ViewContent` on `/`, `/blog`, `/about`, `/onboarding`, a business
  enrollment page, or at any time with marketing refused.

### EV-02 The browser never sends Lead — BLOCKER
DEPENDS: MP-05

WHY: The Lead is the server's, sent once an account is confirmed, with its own
`event_id`. A browser Lead on a button click would be counted next to it and
would make every click look like a conversion (AC6.1).

1. R17, R13 `America/New_York`, R9. Open `/us`: the pixel loads with no click.
   Click every kind of CTA: header, hero, each pricing tier, a blog CTA, a feature
   hero, the bottom CTA, the footer links. Open `/contact` and read, without
   sending the form.
2. Network > Search for `ev=Lead`, then for `Lead`.

EXPECT:
- Zero requests with `ev=Lead`, and no `Lead` string in any request to
  `facebook.com`.
- Each signup click shows `ev=SignupCTA` instead.
- NEGATIVE: none of this changes if you click twice, go back, or switch language.

### EV-03 Contact is sent once, after the form was received — CORE
DEPENDS: MP-01

WHY: A Contact means a person got in touch, so it is sent when the API answers
2xx, not on the click. A second submit while one is in flight must not count
twice, and a failed send must count as nothing (`lib/contact/submit.ts`). This
sends a real contact request to the dev API: use the fake text below.

1. R17, R13 `Europe/Paris`, R1, R9. Open `/contact`, **Accept all** (or R3 and
   no click for the US).
2. Fill the form with `QA STA-377`, `qa-sta377@example.com`, and a message
   `STA-377 QA, ignore`. Click **Send** twice, quickly (or press Enter twice).
3. R19 on `*public/contact*`, reload, send again.
4. Remove the block. R1, **Refuse all**, send once more.

EXPECT:
- Step 2: the success state shows. Exactly **one** `POST .../public/contact` and
  exactly one `ev=Contact`, which appears after the response, not before.
- Step 3: the error state shows and there is **no** `ev=Contact`.
- Step 4: the success state shows, and no pixel request at all (marketing refused).
- NEGATIVE: a double submit never produces two requests or two events.

### EV-04 A followed phone link is a Contact; a link to the contact page is not — CORE
DEPENDS: MP-01

WHY: A `tel:`, `mailto:` or WhatsApp link leaves the page without any request of
ours, so the click is the only moment it can be seen. The links to `/contact` are
a sales touch, not a contact.

1. R17, R13 `America/New_York`, R9, open `/us`. Scroll to the footer.
2. Click the phone number `06 49 37 04 70` (cancel the browser's "open app"
   prompt).
3. Click the footer **Contact** and **Help** links.
4. R17, R13 `Europe/Paris`, R1, **Refuse all**, then click the phone number again.

EXPECT:
- Step 2: one `ev=Contact`.
- Step 3: **no** `ev=Contact` and no `ev=SignupCTA`. GA records `contact_cta_click`.
- Step 4: no pixel request at all.
- NEGATIVE: the phone link never sends a `SignupCTA` or a `Lead`.

### EV-05 Every event checks consent when it is sent — BLOCKER
DEPENDS: MP-01, GA-01

WHY: A tag cannot be unloaded, so what keeps a revoked visitor from being
reported is that each call asks again. If the answer were cached at load, a
refusal made in another place would keep reporting until the next reload.

1. R17, R13 `Europe/Paris`, R1, R7, R9. Open `/pricing`, **Accept all**. Confirm
   `typeof fbq` and `typeof gtag` are `"function"`. Clear the Network log.
2. Application > Cookies: delete `stampeo_consent`. Do **not** reload and do
   not switch tabs.
3. Navigate client-side to `/blog`, then click the header **Get started**.

EXPECT:
- No `ev=PageView`, no `ev=SignupCTA`, no `ev=ViewContent` to `facebook.com/tr`,
  and no `page_view` or `sign_up_cta_click` to `google-analytics.com`.
- `fbq` and `gtag` are still functions: the scripts cannot be unloaded, and that
  is correct.
- A request to the PostHog host still fires: PostHog stores nothing on the device
  and is outside this gate.
- NEGATIVE: nothing is queued and replayed later, either: re-accepting does not
  send what was dropped.

### EV-06 A refusal made in another tab reloads this one on return — CORE
DEPENDS: GA-01, MP-01

WHY: A running tag cannot be stopped from outside, so the tab that still has it
loaded reloads when it is shown again and what the visitor allows has changed
(`lib/privacy/stale-tags.ts`).

1. R17, R13 `Europe/Paris`. Tab A: `/pricing`, **Accept all**; in its console run
   `window.__qa = "still here"`.
2. Tab B (same site, same jar): `/`, footer **Cookie preferences**, turn both off,
   **Save** (B reloads itself).
3. Switch to tab A.

EXPECT:
- Tab A reloads by itself on becoming visible: `window.__qa` is `undefined`, and
  `typeof fbq` and `typeof gtag` are `"undefined"`. `_ga`, `_fbp` are gone.
- NEGATIVE: switching away from tab A and back with nothing changed does not
  reload it (the marker survives).

### EV-07 A tab with no tag loaded does not reload — EDGE
DEPENDS: EV-06

WHY: The reload is for a tab that has something to stop. Reloading every tab on
every change would cost the visitor their page for nothing.

1. R17, R13 `Europe/Paris`. Tab A: `/pricing`, **Refuse all**; set
   `window.__qa = "still here"`. Tab B: `/`, footer **Cookie preferences**, turn
   both on, **Save**.
2. Switch to tab A.

EXPECT:
- Tab A does **not** reload: the marker survives.
- NEGATIVE: no tag request starts in tab A as a result of the switch.

---

## AT: ad attribution across the domain (STA-323)

The funnel the tags cannot see. These cases follow one visitor from an ad click
through to a paid invoice, across two domains and three repos.

This section needs a **dev database** and the backend running, unlike every
other section here. Instrument: the cookie jar, plus
`docker exec fidelity-backend-1` psql-style queries against
`account_ad_attribution`, `business_ad_attribution`, `ad_conversion_outbox`,
`business_ad_refusal` and, with `ad_conversion_outbox_enabled` off, the legacy
`business_ad_conversion`.

Since STA-377 a visit is written down as three version-2 carriers, each under its
own consent category, set by the server (`POST /api/privacy/cookies`) and shared
with the dashboard on the parent domain:

| Cookie | Holds | Written when |
|---|---|---|
| `stampeo_src` | UTMs, landing path and variant, referrer host | analytics OR marketing is allowed |
| `stampeo_ga` | GA client id, session id and number | analytics is allowed and `_ga` exists |
| `stampeo_ad` | the paid click (`vn`, `ci`, `ct`) and Meta's `fbp` | marketing is allowed AND the landing carried a click id |

Each also carries the consent evidence it rests on: `cv` consent version, `cr`
regime, `ca` the moment the visitor clicked (0 when nobody did), `p` policy
version, `g` policy row. The legacy `stampeo_attribution` is never written again.
Decode one with
`JSON.parse(decodeURIComponent(document.cookie.match(/stampeo_ad=([^;]*)/)[1]))`.

Reset recipe **R8** below clears a test business's attribution rows.

| ID | Recipe |
|---|---|
| R8 | Clear attribution for a test business and its owner: `delete from ad_conversion_outbox where business_id = '<id>' or user_id = '<user id>'; delete from business_ad_conversion where business_id = '<id>'; delete from business_ad_attribution where business_id = '<id>'; delete from account_ad_attribution where user_id = '<user id>'; delete from business_ad_refusal where business_id = '<id>';` then R17 and reload. |

### AT-01 An ad click is captured on the landing page — BLOCKER
DEPENDS: GA-01

WHY: The first hop, and the only one showcase can see. If the carriers are not
written here, every case below is moot.

1. R17, R13 `Europe/Paris`, R1, R7. Open
   `/pricing?gclid=qa-test-123&utm_source=google&utm_medium=cpc&utm_campaign=qa`.
2. Click **Accept all**.
3. Wait ~3s (the capture waits for GA to write `_ga`), then read the cookie jar
   and decode each carrier. Read R15.

EXPECT:
- `stampeo_src`, `stampeo_ga` and `stampeo_ad` exist, each with **Domain
  `.stampeo.app`** (or the local equivalent) and NOT host-only: host-only means
  `web/` will never see them and the whole funnel is dead. R15 shows each as a
  `Set-Cookie` of the privacy route with `Max-Age=15724800`.
- `stampeo_ad`: `"v":2`, `"vn":"google"`, `"ci":"qa-test-123"`, `"ct"` the landing
  time.
- `stampeo_src`: `"us":"google"`, `"um":"cpc"`, `"uc":"qa"`, `"lp":"/pricing"`. It
  holds no click id.
- `stampeo_ga`: `"cid"` matches `^\d+\.\d+$` and is NOT in the `GA1.1.` form;
  `"sid"` and `"sn"` appear once `_ga_ZFZ6JLPFXN` exists.
- All three carry `"cv":3`, `"cr":"opt-in"`, `"ca"` equal to the time of the
  Accept click, `"p":1`, `"g":"EEA_UK_CH"`.
- NEGATIVE: no `stampeo_attribution` anywhere.

### AT-02 No consent captures nothing — BLOCKER
DEPENDS: CN-01

WHY: A click id is an advertising identifier and the GA ids are analytics ones.
Writing either before consent is the same violation as firing the tag, and it
would then travel to another domain and into a database.

1. R17, R13 `Europe/Paris`, R1, R7. Open `/pricing?gclid=qa-test-123&utm_source=google`.
2. Do NOT touch the banner. Wait 5s.
3. Then click **Refuse all**. Wait 5s more. Read R15.

EXPECT:
- None of `stampeo_src`, `stampeo_ga`, `stampeo_ad` and no `stampeo_attribution`
  at any point, before or after refusing.
- No POST carrying `carriers` to `/api/privacy/cookies`. After the refusal the
  only POST carries `consent` and `sid`.
- NEGATIVE: `qa-test-123` appears in no cookie and in no request body.

### AT-03 Refusing later deletes the carriers — CORE
DEPENDS: AT-01, PR-04

WHY: The carriers are first-party and would survive a revoke that only cleared
`_ga` and `_fbp`, leaving the identifiers to cross to app.stampeo.app after the
refusal.

1. From AT-01 (three carriers present), open the preferences dialog from the
   footer.
2. Turn everything off and save. Read R15.

EXPECT:
- After the reload, `stampeo_src`, `stampeo_ga` and `stampeo_ad` are **gone**,
  alongside `_ga`, `_fbp` and any legacy `stampeo_attribution`.
- R15: a POST whose payload has `"clear"` naming `stampeo_src`, `stampeo_ga`,
  `stampeo_ad` and `stampeo_attribution`, answered with a `Set-Cookie` of
  `Max-Age=0` for each: the deletion is also a server response, so it outlives
  the reload.
- `stampeo_consent` and `stampeo_sid` remain.
- NEGATIVE: after the reload no carrier is re-created, although the landing URL
  carried a `gclid`: consent is off.

### AT-04 The carriers survive the hand-off to the dashboard — BLOCKER
DEPENDS: AT-01

WHY: The single point the whole design rests on. `sessionStorage` would fail
here, which is why these are cookies; a scoping regression is invisible until
exactly this step.

1. From AT-01, click a signup CTA and complete signup through to the dashboard
   (SG-01 describes the wizard; use a fresh address you can read).
2. On `app.stampeo.app` (or the dev equivalent), open devtools > Application >
   Cookies.

EXPECT:
- `stampeo_src`, `stampeo_ga` and `stampeo_ad` are readable **on the app
  subdomain**, unchanged.
- NEGATIVE: no `stampeo_attribution` appears.

### AT-05 Signing up stores the account's attribution; the business inherits it — BLOCKER
DEPENDS: AT-04, SG-04

WHY: The hand-off from courier to database, and the first conversion. Since
STA-377 the sign-up call records the source against the account and queues the
Lead; the business created afterwards inherits it (`contracts.md` C-3a, C-4).

1. From AT-04, complete the onboarding wizard's identity step through to the
   dashboard, then create the business.
2. Query `account_ad_attribution` (by the user's id), `business_ad_attribution`
   (by the business id) and
   `select destination, event_name, status from ad_conversion_outbox where user_id = '<user id>';`.

EXPECT:
- One row in each attribution table, both `vendor='google'`,
  `click_id='qa-test-123'`, `utm_campaign='qa'`, with the consent evidence
  populated (`consent_version`, `consent_regime`, `policy_version` 1 and a
  `region_row`, `EEA_UK_CH` under a Paris timezone).
- The outbox holds one `(account, meta, sign_up)` row and one
  `(account, ga4, sign_up)` row, each subject to its own category. With
  `ad_conversion_outbox_enabled` off they wait, and drain when it is turned on.
- NEGATIVE: no `CompleteRegistration` row or event anywhere, and no `sign_up` row
  or event for the business itself: creating a business never reports a sign-up,
  with the switch on or off.

### AT-06 A business with no attribution still signs up — BLOCKER

WHY: The overwhelmingly common path. Attribution sits on the signup route, and
nothing about it may block a business being created.

1. R17, R1, R7. Refuse consent, or simply open the dashboard directly with no
   carrier cookies.
2. Complete signup and create a business.

EXPECT:
- The business is created normally, no error, no console noise.
- `business_ad_attribution` and `account_ad_attribution` have no row for it.
  Correct, not a failure.

### AT-07 A forged cookie cannot break signup — BLOCKER
DEPENDS: AT-06

WHY: The carriers are attacker-editable and cross a trust boundary. The failure
being tested for is a CHECK-constraint violation surfacing as a 500 in the middle
of business creation, or a forged value riding the sign-up call.

1. R13 `Europe/Paris`, **Accept all** on a marketing page, so consent allows
   everything. Then, on that page, forge one of these (R17 and re-accept between
   them):
   - a. `document.cookie = 'stampeo_ad=' + encodeURIComponent(JSON.stringify({v:2,vn:"'; DROP TABLE businesses; --",ci:"x",ct:1,cv:3,cr:"opt-in",ca:1,p:1,g:"EEA_UK_CH"})) + '; path=/'`
   - b. the same with `vn:"meta"` and `cr:"everything"`
   - c. the same with `vn:"meta"` and `v:99`
   - d. a legacy cookie with `vn:"'; DROP TABLE businesses; --"` (R10 pattern)
2. Sign up and create a business (SG-01 path), reading the sign-up call.

EXPECT:
- The business is created **successfully**. No 500, no 422.
- No attribution row is written from the forged cookie.
- For a, b and c the sign-up call's `ad_attribution_v2` has **no `ad`**: the
  showcase parsers drop an invalid carrier before it is sent.
- NEGATIVE: the forged text appears in no table.

### AT-08 A paid invoice sends purchase exactly once — BLOCKER
DEPENDS: AT-05

WHY: The conversion campaigns actually optimise against, and the one place a
bug costs money rather than data. Stripe retries webhooks and `invoice.paid`
fires again every renewal.

1. From AT-05, complete Stripe checkout with a test card and let the first
   invoice pay.
2. Query `select destination, event_name, status from ad_conversion_outbox where business_id = '<id>';`
   (with `ad_conversion_outbox_enabled` off, read `business_ad_conversion` instead).
3. In the Stripe dashboard, **resend** the `invoice.paid` event.
4. Query again.

EXPECT:
- After step 2: exactly one `purchase` row per destination that applies (Meta
  and GA4), each in a sending or sent state, none duplicated.
- After step 4: **still exactly one per destination**. The webhook returns 200
  both times (the unique key on subject, destination and event is the guard).
- NEGATIVE: no `purchase` row appeared at `checkout.session.completed` or
  `customer.subscription.created`: a started trial is not revenue. A zero-amount
  invoice never claims it either.

### AT-08b Revoking stops conversions server-side — BLOCKER
DEPENDS: AT-05, PR-04

WHY: The gap the security review found. Revoking deletes the cookies in the
browser, but the attribution ROW lives in our database and was still being used
to report a conversion at `invoice.paid` — potentially weeks after the owner
withdrew. Deleting cookies looked like an effective revocation and was not.
Since STA-377 the refusal is stored per category.

1. From AT-05 (a business exists with attribution), confirm
   `select category, source from business_ad_refusal where business_id = '<id>'`
   returns no rows.
2. On the **marketing site**, open **Cookie preferences** from the footer, turn
   **both** categories off, and save.
3. Go to the **dashboard** at `app.stampeo.app` and open any page, signed in as
   the **owner** of that business.
4. Query `business_ad_refusal` again.

EXPECT:
- One row for `analytics` and one for `marketing`, each with `refused_at` set.
- Network tab on the dashboard shows one
  `POST /businesses/<id>/ad-attribution/revoke` returning 200.
- Now trigger `invoice.paid` for that business: its `purchase` rows in
  `ad_conversion_outbox` are `skipped_no_consent` and **no request leaves for
  google-analytics.com or graph.facebook.com**.
- Repeat on a fresh business refusing only **Advertising**: only the `marketing`
  row exists, the Meta rows are skipped, and the GA4 `purchase` still sends
  (AC4.1).

NEGATIVE CHECKS, all of which must hold:
- Repeat step 3 a second time. `refused_at` **does not change**: the first
  withdrawal's timestamp is the evidence and must not move.
- With NO consent cookie at all (R1, reload the dashboard), **no** revoke request
  is sent. An empty jar is not a refusal, and treating it as one would stop
  reporting for businesses that never asked.
- Signed in as an **admin or scanner** rather than the owner, no revoke request
  is sent at all.

### AT-09 No API secret sends nothing and breaks nothing — CORE

WHY: The state of CI and every local checkout until the secret is provisioned.

1. Leave `ga4_api_secret` unset. Run AT-05 and AT-08.

EXPECT:
- Attribution rows ARE written (capture does not depend on the secret).
- The GA4 outbox rows end in a not-sent status (expected `skipped_no_sender`) and
  never `delivered`; no errors, webhooks still 200.
- NEGATIVE: no request to `google-analytics.com/mp/collect` leaves the backend.

### AT-10 Deleting a business removes its attribution — CORE
DEPENDS: AT-05

WHY: Click ids are personal data. The FK cascade covers a hard delete, but the
real purge path is `_CONTENT_TABLES`, and a table missing from it is silently
skipped rather than erroring.

1. Run the account-deletion purge for the test business.
2. Query the attribution, conversion and outbox tables.

EXPECT:
- No rows remain in `business_ad_attribution`, `business_ad_conversion` or
  `ad_conversion_outbox` for that business id.

### AT-11 A later ad click replaces an organic record, never the reverse — CORE
DEPENDS: AT-01

WHY: Retargeting ads reach people who already visited. If their first organic
visit kept the carriers, every retargeted signup would be reported as organic and
Meta would never see the campaign work. The latest paid click wins, the way the
ad platforms attribute.

1. R17, R13 `Europe/Paris`, R1, R9. Open `/en` with no parameters, **Accept all**,
   wait 3s. Decode `stampeo_src` (`"lp":"/en"`, no `"us"`); there is **no**
   `stampeo_ad` (no click id arrived).
2. Open `/en?fbclid=qa-retarget-01&utm_source=meta&utm_campaign=qa-retarget`, wait 4s.
3. Open `/en` again with no parameters.
4. Open `/en?gclid=qa-retarget-02`, then reload it.
5. Open `/en?fbclid=qa-both-f&gclid=qa-both-g`.

EXPECT:
- After step 2: `stampeo_ad` is `"vn":"meta"`, `"ci":"qa-retarget-01"`, with
  `"fbp"` starting `fb.1.`; `stampeo_src` is now `"us":"meta"`,
  `"uc":"qa-retarget"` (the source is replaced together with the click).
- After step 3: **both unchanged**. An organic visit never replaces a paid click.
- After step 4: `"vn":"google"`, `"ci":"qa-retarget-02"`: the newest paid click
  wins. After the reload, `"ct"` is **unchanged**: the same click seen again is
  not a newer one.
- After step 5: `"vn":"google"`, `"ci":"qa-both-g"`: when one landing carries both
  ids, `gclid` takes the carrier, always.
- NEGATIVE: `stampeo_ad` is never created by a visit with no click id.

### AT-12 An older refusal is captured as itself, never as "never chose" — BLOCKER
DEPENDS: RG-06

WHY: A version-2 `{a:1,m:0}` resolves to analytics only. Stamped with the
current version and no consent moment, its carriers would be byte-for-byte a US
visitor who never chose, which the backend reads as the opt-out default: an
advertising grant this visitor refused. The row has to rest on the version-2
choice so the backend applies the version-2 rules.

1. With the GA measurement id set (Setup): R17, R13 `America/New_York`, R7, then
   R12 with `a:1`, `m:0`, `r:"opt-out"`. Note the `t` it wrote:
   `JSON.parse(decodeURIComponent(document.cookie.match(/stampeo_consent=([^;]*)/)[1])).t`.
2. Open `/us` with no parameters. Do not touch the notice. Wait 5s, then decode
   `stampeo_src` and `stampeo_ga`.
3. Delete both carriers, then forge the same choice with no moment: console,
   `document.cookie = 'stampeo_consent=' + encodeURIComponent(JSON.stringify({v:2,a:1,m:0,r:"opt-out",s:crypto.randomUUID()})) + '; path=/'`.
   Reload, wait 5s.

EXPECT:
- After step 2: both carriers decode with `"cv":2`, `"ca"` equal to the `t` from
  step 1, `"cr":"opt-out"`, `"g":"US"`. **Never** `"cv":3` with `"ca":0`. No
  `stampeo_ad`.
- After step 3: `googletagmanager.com` is requested (the analytics default
  stands) but there is **no carrier at all**: an older choice with no moment is
  no evidence to rest a row on. No `_fbp` and no `connect.facebook.net` request:
  the advertising refusal still stands.

### AT-13 Revoking one category clears only its own carrier — CORE
DEPENDS: AT-01, PR-04

WHY: Refusing advertising must not delete the analytics identifiers, and the
campaign source stays while either category stands (AC4.6).

1. R17, R13 `Europe/Paris`, R1, R7, R9. Open
   `/pricing?gclid=qa-test-123&utm_source=google&utm_medium=cpc&utm_campaign=qa`,
   **Accept all**, wait for `_ga` and the three carriers.
2. Footer **Cookie preferences** > turn **Advertising** off, leave **Audience
   measurement** on > **Save**. After the reload, read the jar and R15.
3. Footer > turn **Audience measurement** off too > **Save**.

EXPECT:
- After step 2: `stampeo_ad`, `_fbp` and `_fbc` are gone; `stampeo_ga`,
  `stampeo_src` and `_ga` remain. The POST's `"clear"` names `stampeo_ad` (and the
  legacy `stampeo_attribution`) and **not** `stampeo_ga` or `stampeo_src`.
- After step 3: `stampeo_ga`, `_ga` and now `stampeo_src` are gone as well.
- NEGATIVE: step 2 never deletes `stampeo_ga` or `stampeo_src`.

### AT-14 A campaign landing populates the source and the click — CORE
DEPENDS: RG-02

WHY: The URL convention is what makes the admin Acquisition tab readable
(`backend/docs/measurement/events.md`, "Campaign URL convention"). Under the US
row nothing is clicked, so this also proves capture works from the default.

1. R17, R13 `America/New_York`, R7, R9. Open
   `/us?utm_source=meta&utm_medium=paid_social&utm_campaign=us-cr-broad-2026q4&utm_content=ugc-cafe-15s&utm_term=us-broad&fbclid=qa-meta-click`.
   Wait 5s (the capture waits up to 3s for `_fbp`).
2. Decode the three carriers.

EXPECT:
- `stampeo_src`: `"us":"meta"`, `"um":"paid_social"`, `"uc":"us-cr-broad-2026q4"`,
  `"uo":"ugc-cafe-15s"`, `"ut":"us-broad"`, `"lp":"/us"`.
- `stampeo_ad`: `"vn":"meta"`, `"ci":"qa-meta-click"`, `"ct"` set, `"fbp"` starting
  `fb.1.`.
- `stampeo_ga`: `"cid"` digits and a dot.
- Each carries `"cv":3`, `"cr":"opt-out"`, `"ca":0` (nobody clicked: it is the US
  default), `"p":1`, `"g":"US"`.
- NEGATIVE: no value is longer than 128 characters except the click id and the
  `fbp`, and no carrier holds a field the table above does not list.

### AT-15 A carrier is written only when its category permits — BLOCKER
DEPENDS: AT-01

WHY: Each carrier is the way one category's identifiers reach another domain.
Writing one the visitor did not allow is the violation, whatever the tag did.

1. For each line: R17, R13 `Europe/Paris`, R1, R7, R9. Open
   `/pricing?gclid=qa-at15-click&utm_source=google`, open **Choose by purpose**,
   set the switches as stated, **Save**, wait 5s, read the jar.

| Allowed | `stampeo_src` | `stampeo_ga` | `stampeo_ad` | Tag cookies |
|---|---|---|---|---|
| Audience measurement only | yes | yes | **no** (a click id is advertising) | `_ga` yes, `_fbp` no |
| Advertising only | yes | **no** | yes (`"vn":"google"`) | `_fbp` after the pixel, `_ga` no |
| Both | yes | yes | yes | both |
| Neither | **no** | **no** | **no** | none |

2. For "Advertising only", repeat with `/pricing?utm_source=google` (no click id).

EXPECT:
- Each line writes exactly the carriers of its row.
- Step 2: `stampeo_src` only. `_fbp` alone is never copied into a carrier, and
  `stampeo_ad` is never created without a click id.
- NEGATIVE: `qa-at15-click` is in no cookie on the "Audience measurement only" and
  "Neither" lines.

### AT-16 A refusal re-stamps the carriers that remain, and the source goes only when both are refused — CORE
DEPENDS: AT-14, PR-08

WHY: Each carrier rests on the consent evidence it was written under. One written
under "everything on" and left alone after the visitor refused advertising would
keep a stale basis, which the backend would read as a permission it no longer has.

1. R17, R13 `America/New_York`, R7, R9. Open
   `/us?utm_source=meta&utm_medium=paid_social&utm_campaign=qa-at16&fbclid=qa-at16-click`,
   wait 5s. Note each carrier's `ca`, `cv`, `cr`, `g`.
2. Footer **Your Privacy Choices** > turn **Advertising** off > **Save**. After the
   reload, wait 3s and decode again.
3. Turn **Audience measurement** off too > **Save**.

EXPECT:
- Step 1: `"ca":0`, `"cv":3`, `"cr":"opt-out"`, `"g":"US"` on all three.
- After step 2: `stampeo_ad` is gone; `stampeo_src` and `stampeo_ga` remain with
  `"ca"` now equal to the Save's moment (the `"t"` of `stampeo_consent`), still
  `"cv":3`, `"cr":"opt-out"`, `"g":"US"`. The UTMs inside `stampeo_src` are
  unchanged.
- After step 3: `stampeo_ga` and `stampeo_src` are gone.
- NEGATIVE: once the visitor has clicked, no remaining carrier still says
  `"ca":0`.

---

## SG: the sign-up call (STA-377)

After an account is confirmed in the owner sign-up flow, showcase sends one call
to our API, `POST {NEXT_PUBLIC_API_URL}/account/signup-recorded`, **before** it
sends the visitor on to the dashboard. The backend answers 204 whatever it did, so
the status says nothing: every assertion is on the request. The body is built from
the cookie jar and from what the visitor allows **at the moment of the call**
(`lib/attribution/signup-body.ts`):

- `consent_subject_id`: the `stampeo_sid`, whenever one exists.
- `ad_attribution_v2`: the carriers, each only if its category is allowed.
- `live`: the raw `_ga`, `_ga_<id>`, `_fbp`, `_fbc`, each only if its category is
  allowed.
- `basis`: `{cr, p, g}` (regime, policy version, row), **always** present.
- `refused`: only the categories the stored consent record explicitly refuses (a
  stored `0` of any version, a restored one included), analytics first. No choice
  is never a refusal, and neither is GPC: the backend reads `Sec-GPC` itself.

How to run: Network with **Preserve log** and filter `signup-recorded`. Set the
consent state first on a marketing page, then click a signup CTA (a client-side
hop to `/onboarding` keeps the jar), complete step 1 and then the email code with
a fresh address you can read. The request row must exist before the page leaves
for the dashboard; its status may read cancelled or pending because the page
navigates, and that is not a failure. Its `Authorization` header is a live token:
never paste it into a report.

### SG-01 After an email-code sign-up the call is sent, and says nothing it should not — BLOCKER
DEPENDS: CN-01

WHY: This call is how a refusal made on the marketing site reaches the account,
and a European who has not chosen must not be declared to have refused, nor have
identifiers forwarded.

1. R17, R13 `Europe/Paris`, R1. Open `/` and leave the banner unanswered (or
   answer nothing at all). Click a header **Get started**, complete the wizard
   with a fresh address.
2. Read the request's Payload.

EXPECT:
- A `POST` to `<API>/account/signup-recorded` exists in the log **before** the
  redirect to the dashboard.
- Payload: `"basis":{"cr":"opt-in","p":1,"g":"EEA_UK_CH"}` and `"refused":[]`.
  There is **no** `ad_attribution_v2`, **no** `live`, **no** `ad_attribution`, and
  no `consent_subject_id` (this row mints no subject before a decision).
- NEGATIVE: `refused` does not contain `analytics` or `marketing`. A visitor who
  has not chosen has refused nothing.
- RESET: R8 for the new account if you query it later.

### SG-02 What a European refused is declared, and its identifiers withheld — BLOCKER
DEPENDS: SG-01, SP-02

WHY: `refused` holds only explicit refusals, and the withheld category's values
must not ride along in any other field.

1. For each line: R17, R13 `Europe/Paris`, R1, R7, R9. Open
   `/pricing?gclid=qa-sg02-click&utm_source=google&utm_medium=cpc&utm_campaign=qa-sg02`,
   **Choose by purpose**, set the switches as stated, **Save**, wait for `_ga`
   where analytics is on, then sign up and read the Payload.

| Allowed | `refused` | `ad_attribution_v2` | `live` |
|---|---|---|---|
| Audience measurement only | `["marketing"]` | `src` and `ga`, **no `ad`** | `ga`, `ga_sessions` (key `ZFZ6JLPFXN`), **no `fbp`, no `fbc`** |
| Advertising only | `["analytics"]` | `src` and `ad`, **no `ga`** | `fbp` (and `fbc`) if present, **no `ga`** |
| Neither | `["analytics","marketing"]` | none | none |

EXPECT:
- Each line matches its row. `consent_subject_id` is present in all three and
  equals `stampeo_sid` (a lowercase v4). `basis.g` is `EEA_UK_CH`.
- NEGATIVE: on the "Audience measurement only" line the string `qa-sg02-click`
  appears nowhere in the body. The campaign name `qa-sg02` may appear, in
  `stampeo_src`'s `uc`.

### SG-03 US with Global Privacy Control declares nothing, and forwards nothing — BLOCKER
DEPENDS: RG-04

WHY: GPC is read by the backend from the request itself, so it must not also be
declared in `refused`, which would be permanent. The identifiers it denies must
be withheld at the source. The basis still goes, so the backend knows the opt-out
regime applied (AC6.7).

1. R5 in Brave (the header assertion needs a real GPC browser), R17,
   R13 `America/New_York`, R7, R9. Open `/us?fbclid=qa-sg03-click&utm_source=meta`.
   Wait 5s (there is no notice and no tag).
2. Click a signup CTA, complete the wizard, read the Payload and the request
   headers.

EXPECT:
- `"refused":[]` and `"basis":{"cr":"opt-out","p":1,"g":"US"}`.
- `consent_subject_id` is present (the subject was minted on arrival, SP-01).
- **No** `ad_attribution_v2`, **no** `live`, no `ad_attribution`. The jar holds no
  carrier either (RG-04).
- The request header `Sec-GPC: 1` is present.
- NEGATIVE: `qa-sg03-click` appears nowhere in the request.

### SG-04 In the US, nothing refused forwards everything permitted — CORE
DEPENDS: AT-14

WHY: The default path for most US sign-ups, and the one that proves the body is
exactly the validated carriers and not a copy of whatever the jar holds.

1. R17, R13 `America/New_York`, R7, R9. Open
   `/us?fbclid=qa-sg04-click&utm_source=meta&utm_medium=paid_social&utm_campaign=qa-sg04`,
   wait 5s for `_ga` and `_fbp`. Sign up and read the Payload.

EXPECT:
- `"refused":[]`, `"basis":{"cr":"opt-out","p":1,"g":"US"}`, `consent_subject_id`
  equal to the sid.
- `ad_attribution_v2` has `src` (`us`: `meta`), `ga` (`cid` without `GA1.`) and
  `ad` (`"vn":"meta"`, `"ci":"qa-sg04-click"`, `"fbp"` `fb.1....`). Each decodes
  to the same JSON as the matching cookie, with `"ca":0`.
- `live` has the raw `ga` (`GA1.1.....`), `ga_sessions` and `fbp`.
- NEGATIVE: no `ad_attribution` (the legacy carrier is absent unless R10 forged
  one), and no field outside the list in this section's introduction.

### SG-05 An OAuth return sends the same call — CORE
DEPENDS: SG-04

WHY: The wizard has two ways to confirm an account, and the second returns to
`/onboarding?just_authed=oauth` with a session. If it skipped the call, every
Google or Apple sign-up would lose its source and its refusals.

1. After SG-04's sign-up you hold a dev session in this browser (do not sign
   out, and keep the carrier and consent cookies). Open
   `/en/onboarding?just_authed=oauth` directly.
2. Read the log.
3. Open `/en/onboarding?just_authed=oauth` after signing out (no session).

EXPECT:
- Step 2: one `POST .../account/signup-recorded` before the redirect, with the
  same rules as SG-04 for the state of the jar.
- Step 3: no call: the flag is dropped, `/en/onboarding` renders the wizard, and
  nothing is sent.
- NEGATIVE: the page does not call twice, in step 2 or on a reload.
- NEEDS HUMAN: a real Google or Apple return. The URL above is that return with
  its provider round trip left out; a regression in the provider redirect is not
  covered.

### SG-06 A failing call never blocks the sign-up — CORE
DEPENDS: SG-01

WHY: Losing the call costs one conversion report, which the business step
recovers; blocking the flow costs a signup.

1. R19 on `*signup-recorded*`. R13 `Europe/Paris`, sign up with a fresh address.

EXPECT:
- The wizard completes and the browser leaves for the dashboard within about
  two seconds of the last click. No error is shown.
- NEGATIVE: no error toast, no stuck spinner.

### SG-07 A restored refusal is declared as a refusal — CORE
DEPENDS: RG-12

WHY: A refusal brought back from the dashboard is a stored `0` like any other. It
is declared so that a carrier captured earlier under no-choice evidence cannot
read as permission for it.

1. R17, R13 `America/New_York`, R7, R9, R14. Open `/us`, wait 5s, sign up, read
   the Payload.

EXPECT:
- `"refused":["marketing"]` and nothing else: analytics is `-1` (no choice), which
  is not declared.
- `ad_attribution_v2` has `src` and `ga`, **no `ad`**; `live` has `ga` and no
  `fbp`.
- NEGATIVE: `refused` does not contain `analytics`.

---

## CL: the consent ledger (STA-324)

The server-side proof of each decision. Everything in this area has the same
inversion at its heart: the cookie is what APPLIES a choice, the ledger is what
PROVES it, and the ledger must never be allowed to cost the visitor the choice.

### CL-01 Accepting writes exactly one row — BLOCKER
DEPENDS: CN-01

WHY: Art. 7(1) makes demonstrating consent our burden. If this row is missing,
the banner is decoration.

1. Recipe R1 (clear the consent cookie), reload `/en`.
2. Click **Accept all**.
3. Query: `select * from consent_records order by recorded_at desc limit 1;`

EXPECT:
- Exactly ONE new row.
- `analytics` and `marketing` both true, `regime` `opt-in`, `surface` `banner`,
  `version` matching `CONSENT_VERSION` in `lib/consent.ts`.
- `decided_at` and `recorded_at` are BOTH present and are different values —
  they are two different facts, not a duplicated one.
- `user_id` and `business_id` are NULL: the visitor has no account yet.
- `subject_id` equals the `s` field inside the `stampeo_consent` cookie, and the
  `stampeo_sid` cookie.
- `policy_version` is 1, `region_row` is `EEA_UK_CH` under a Paris timezone, and
  `gpc` is false (true when the signal is on).

### CL-02 Refusing writes a row too — BLOCKER
DEPENDS: CL-01

WHY: A ledger holding only acceptances misrepresents the population and is
worthless as evidence. This is also the case most likely to be quietly dropped,
because refusing is the path where nothing else visibly happens.

1. Recipe R1, reload, click **Refuse all**.
2. Query the newest row.

EXPECT:
- A row exists, with `analytics` and `marketing` both FALSE.
- No tag loads (re-check GA-02): the ledger records the refusal and the refusal
  is still honoured.

### CL-03 A second decision appends, never overwrites — BLOCKER
DEPENDS: CL-01

WHY: Append-only is the whole claim. A ledger that can be edited is not
evidence, and "changed their mind" must remain provable in both directions.

1. Accept (CL-01), note the row id and `subject_id`.
2. Open **Cookie preferences**, turn both categories off, Save.
3. Query all rows for that `subject_id`, oldest first.

EXPECT:
- TWO rows, not one.
- The first row is byte-for-byte unchanged — same id, same booleans, same
  timestamps.
- The second has `surface` `preferences`.
- Both carry the same `subject_id`.

### CL-04 The chain survives a consent-version bump — CORE
DEPENDS: CL-03

WHY: The version bump is exactly when the chain matters most — everyone is
re-asked at once, and proving "the same person answered again" is the point.
`parseConsentCookie` discards a stale CHOICE; it must not discard the IDENTITY.

1. Accept, and note `subject_id`.
2. In devtools, edit the `stampeo_consent` cookie: change `v` to `1`, leave `s`.
3. Reload. The banner returns (the stale choice was correctly discarded).
4. Accept again. Query rows for the ORIGINAL `subject_id`.

EXPECT:
- The new row carries the SAME `subject_id` as step 1.
- Two rows chained to one subject, not two orphans.

### CL-05 The ledger being down never costs the visitor — BLOCKER
DEPENDS: CL-01

WHY: The banner is a compliance surface. A regression that blocks a click is
far worse than a missing row, and this is the failure this design accepts
deliberately.

1. `docker compose stop backend`.
2. Recipe R1, reload, click **Accept all**.

EXPECT:
- The banner closes normally.
- The `stampeo_consent` cookie IS written.
- The tags load (GA-03 still passes).
- NO error is shown to the visitor, and no error toast appears.
- The console may show a failed request. That is acceptable and expected.
3. `docker compose start backend`. No row exists for that decision; the next
   decision records normally.

### CL-06 A revocation still reaches the ledger — BLOCKER
DEPENDS: CL-03

WHY: Revoking RELOADS the page, which cancels an in-flight `fetch`. The report
is sent with `sendBeacon` specifically so the most important decision to be
able to prove is not the one that gets lost.

1. Accept (tags load).
2. Open **Cookie preferences**, turn both off, Save. The page reloads.
3. Query the newest row.

EXPECT:
- A row with both categories false and `surface` `preferences` EXISTS, despite
  the reload.

### CL-07 The US notice records its own surface — CORE
DEPENDS: CL-01

WHY: A US visitor's consent is implied by the opt-out regime and never clicked.
An audit has to tell that apart from an EU visitor who actively accepted.

1. Recipes R3 then R1 (US visitor: opt-out regime, no stored choice).
2. Dismiss the notice.

EXPECT:
- A row with `surface` `notice` and `regime` `opt-out`, `region_row` `US`,
  `policy_version` 1, and `gpc` false (true under the signal).

### CL-08 A forged payload writes nothing — BLOCKER

WHY: The endpoint is public and unauthenticated. Its whole defence is that
everything is allowlisted before it reaches a column.

1. `curl -i -X POST $API/public/consent -H 'Content-Type: text/plain' -d '{"subject_id":"../../etc/passwd","version":2,"analytics":1,"marketing":true,"regime":"opt-in","surface":"popup","user_id":"<a real user uuid>"}'`
2. `curl -i -X POST $API/public/consent -H 'Content-Type: text/plain' -d 'not json'`

EXPECT:
- BOTH return **204**, not 4xx. A malformed payload must be indistinguishable
  from a good one — there is nothing to learn by probing this.
- NEITHER writes a row (`surface: popup` is not allowlisted; `analytics: 1` is
  an int, not a bool).
- In particular, no row anywhere carries the `user_id` that was supplied.

### CL-09 A forged subject id is replaced, not trusted — CORE
DEPENDS: CL-08

WHY: The id is ours to mint. Trusting a supplied one would let a forger write
rows under an id of their choosing.

1. POST a payload that is valid EXCEPT `"subject_id": "not-a-uuid"`.

EXPECT:
- 204, and a row IS written — the decision is real and worth keeping.
- Its `subject_id` is a fresh v4 UUID, NOT the supplied string.

### CL-10 The rate limit holds — CORE

WHY: A ledger that can be inflated for free is a storage-amplification vector.

1. POST 40 valid decisions in under a minute from one IP.

EXPECT:
- The first 30 return 204; the remainder return **429**.
- The 429s write no rows: `select count(*)` increases by 30, not 40.

### CL-11 Signing up links the earlier anonymous rows — CORE
DEPENDS: CL-01, AT-05

WHY: This is what turns "somebody consented" into "this account holder
consented".

1. Accept on the landing page (CL-01). Note `subject_id`.
2. Complete signup and create a business (AT-05).
3. Query rows for that `subject_id`.

EXPECT:
- The existing rows now carry `user_id` and `business_id`.
- `consent_subject_links` holds a link for that subject and user (source
  `account_signup`), and one for the business once it exists.
- The COUNT is unchanged — linking is not a decision and must not append a row.
- `analytics`, `marketing`, `regime`, `surface`, `version` and both timestamps
  are all exactly as before.

### CL-12 Deleting a business keeps the proof — BLOCKER
DEPENDS: CL-11, AT-10

WHY: The inversion of every other business-scoped table, and the one place
this platform deliberately refuses erasure. If this behaves like AT-10, the
Art. 17(3) position in Privacy Policy §5.6 is a promise the schema breaks.

1. Delete the business from CL-11.
2. Query `consent_records` for that `subject_id`, and `business_ad_attribution`
   for that business id.

EXPECT:
- The consent rows STILL EXIST, with `business_id` now NULL.
- The attribution rows are GONE (they cascade — that is correct and is the
  contrast that makes this case meaningful).

### CL-13 Retention prunes the superseded, never the current — CORE
DEPENDS: CL-03

WHY: The clock runs from when a consent ENDED, not when it was recorded. A
plain age filter would delete the decision still in force for anyone who has
not revisited in three years — the one record that still matters.

1. Seed four subjects: (A) decided 5y ago then again 4y ago; (B) decided 5y ago
   and never again; (C) decided 5y ago then again last week; (D) decided two
   days ago and never again.
2. `select prune_consent_records(now() - interval '3 years');`

EXPECT:
- Returns 3.
- A: BOTH rows gone — the first was superseded long ago, and the second is
  itself now an orphan older than the window.
- B: gone. A singleton this old cannot still be in force: the
  `stampeo_consent` cookie carrying it lives six months (13 months for a US
  refusal), so it expired years ago. This is also the shape a flood of forged
  `subject_id`s produces, and before migration 176 it was unprunable forever.
- C: BOTH rows remain — the supersession was last week, so the clock has
  barely started.
- D: remains. The case that matters most: an ordinary live visitor's only
  decision must never be pruned, and it is the one the orphan rule could most
  easily take by accident.

---

## MC: Meta conversions, click to payment (STA-322)

MP proves the pixel fires in the browser. This section proves the funnel
CONTINUES after the visitor leaves showcase — signup and payment happen on
`app.stampeo.app` and are reported from our servers, not from a tag.

The case that matters most is MC-05, the negative one. Until STA-322 the sender
had no vendor branch and posted every row to the GA4 Measurement Protocol, so a
Meta click id arrived at Google labelled `gclid`. It was recorded `sent`, so
nothing surfaced it.

**STA-377 changes what this section reads.** The sign-up is now reported by the
server when the account is confirmed (SG), as `Lead`, and `CompleteRegistration`
is sent by no code path. With `ad_conversion_outbox_enabled` on, the queue is
`ad_conversion_outbox` (statuses `accepted` for Meta and `delivered` for GA4,
`skipped_no_consent` for a refusal) and the worker sends within about a minute;
with it off, the legacy `business_ad_conversion` rows and the inline sender apply
as before. A Meta-click sign-up with analytics allowed also reaches GA4 as its own
`sign_up` (MC-05). These cases were rewritten from
`backend/docs/measurement/events.md`, not from the backend code.

### Setup for this section

| Need | Value |
|---|---|
| Backend env | `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, **and `META_TEST_EVENT_CODE`** |
| Meta Test Events | Events Manager → dataset → **Test Events**, left open throughout |
| GA4 DebugView | Admin → DebugView, open in another tab for MC-05 |

**`META_TEST_EVENT_CODE` is mandatory here, not optional.** One access token
serves every environment, so without the code a dev signup writes into real
campaign reporting. The sender refuses to send at all when it is missing outside
production — so if the Test Events tab stays empty, check this first: the
backend log carries `meta CAPI suppressed outside production`.

### MC-01 A Meta click is captured with its own identifiers — BLOCKER
DEPENDS: MP-01

WHY: Everything downstream reads these cookies, and only a newer paid click
replaces them (AT-11), so a wrong value here survives organic return visits.

1. R17, R13 `Europe/Paris`, R1, R9. Land on `/pricing?fbclid=qa-test-001`, accept
   marketing.
2. Read `stampeo_ad` (Application > Cookies) and decode it.

EXPECT:
- `"vn":"meta"`, `"ci":"qa-test-001"`.
- `"fbp"` starts with `fb.1.`: Meta's `_fbp`, **not** a `GA1.1....` value. A Google
  client id here is the bug this case exists for (it belongs in `stampeo_ga` as
  `cid`).
- Cookie domain is `.stampeo.app`, so the dashboard can read it.

### MC-02 Signup reports a Lead — BLOCKER
DEPENDS: MC-01

WHY: The first conversion. Since STA-377 it is reported once, from the server,
when the account is confirmed (`signup-recorded`), as `Lead`.

1. Follow the CTA to the dashboard and complete signup with a fresh email (the
   SG-04 path, with `?fbclid=qa-test-001`).
2. Watch the **Test Events** tab. With `ad_conversion_outbox_enabled` on, allow up to two
   minutes.

EXPECT:
- A `Lead` arrives. It carries `fbc` (starting `fb.1.`) and `fbp`,
  `client_user_agent`, `client_ip_address` (your public IP, never a `10.` or
  `192.168.` address) and `event_source_url`.
- `em`, `ph`, `fn`, `ln` and `external_id` are each a 64-character hex code. A
  **readable** email, phone number or name anywhere in the event is a blocker.
  (`country`, city and postcode are sent for business steps only.)
- `ad_conversion_outbox` has one `(account, meta, sign_up)` row, `accepted`. With
  the outbox off, `business_ad_conversion` has one row at business creation:
  vendor `meta`, event `sign_up`, status `sent`.
- NEGATIVE: no `CompleteRegistration` in Test Events.

### MC-03 A paid invoice reports Purchase with the real money — CORE
DEPENDS: MC-02

1. Subscribe with a Stripe test card and let `invoice.paid` fire.

EXPECT:
- `Purchase` in Test Events, `value` and `currency` matching the invoice
  exactly — not 0, not the list price if a discount applied.
- A second row in `business_ad_conversion`, event `purchase`.
- Replay the webhook from the Stripe CLI: **no second** `Purchase`. The primary
  key is the guard.

### MC-04 The whole funnel joins up — CORE
DEPENDS: MC-03

WHY: This is the question the epic exists to answer: can we see one human from
ad click to payment, and therefore compute CAC and ROAS?

EXPECT, for one test journey: a `PageView` and a `SignupCTA` in the pixel (MP),
then `Lead`, `InitiateCheckout`, `StartTrial` and `Purchase` in Test Events, all
joined to the same `fbc`. NEGATIVE: no `CompleteRegistration`, and no browser
`Lead`.

### MC-05 A Meta click never reaches Google — BLOCKER
DEPENDS: MC-01

WHY: The regression. A Meta identifier arriving at GA4 pollutes Google's
attribution with a conversion it can never join, and discloses a Meta id to a
recipient the privacy policy does not name for it. Since STA-377 a Meta-click
sign-up with analytics allowed ALSO reaches GA4 as its own `sign_up`, joined by
the GA client id (AC10.3): that is expected, so what is asserted is what the GA4
event carries.

1. With GA4 **DebugView** open and analytics allowed, run MC-01 through MC-03
   using `?fbclid=qa-test-001` and no `gclid`.
2. Repeat with Audience measurement refused and Advertising accepted.

EXPECT:
- No GA4 event carries `qa-test-001` in any parameter, and none has a `gclid`
  parameter.
- A `sign_up` for the journey MAY appear (step 1). It has a `client_id`, a
  `session_id`, and `source` and `medium` from the UTMs, and never an email,
  phone, name, IP address, user agent or user id.
- Step 2: no GA4 event for the journey at all.
- If a Meta click id appears anywhere in a GA4 event, stop: that is the defect
  returning.

### MC-06 A Google click still works exactly as before — BLOCKER
DEPENDS: MC-05

WHY: The fix touches the payload builder Google's live path shares.

1. Fresh journey with `?gclid=qa-test-002` and no `fbclid`.

EXPECT:
- GA4 DebugView shows `sign_up`, then `purchase` with the right value, and the
  `gclid` parameter on them.
- No Meta event carries `qa-test-002`. A Meta `Lead` built from hashed contact
  details alone, with **no `fbc`**, may appear when Advertising was accepted
  (MC-11); that is not this defect.

### MC-07 Revoking between signup and payment stops the Purchase — CORE
DEPENDS: MC-02

1. After signup but before paying, revoke marketing via **Cookie preferences**.
2. Complete the payment.

EXPECT:
- No `Purchase` in Test Events.
- The Meta `purchase` row (`ad_conversion_outbox`, or `business_ad_conversion`
  with the outbox off) has status `skipped_no_consent`; the GA4 row still sends
  while analytics stands.
- The `Lead` already sent is **not** recalled — correct, and what §5.5 of the
  privacy policy says.

### MC-08 Marketing refused means no attribution at all — CORE

1. R17, R13 `Europe/Paris`, R1, R9. Land on `/pricing?fbclid=qa-test-003` and
   **Refuse all**.

EXPECT:
- No `stampeo_ad` and no `stampeo_src` (Refuse all refuses both categories), and
  no legacy `stampeo_attribution`.
- No `_fbp` cookie.
- Signing up produces **no** Meta event: the `(account, meta, sign_up)` row is
  `skipped_no_consent` or absent, and no `meta` row is written to
  `business_ad_attribution`.

### MC-09 Opening checkout three times reports InitiateCheckout once — CORE
DEPENDS: MC-02

WHY: Owners go back and forth on the plan step. Each visit creates a new Stripe
session; Meta must count one checkout, or the bidder learns that checkouts are
three times cheaper than they are.

1. From MC-02, reach the plan step, choose a plan, go to Stripe checkout, come
   back. Repeat twice more, once with a different plan or interval.

EXPECT:
- **One** `InitiateCheckout` in Test Events, with `value` = the first plan's
  price and its `currency`.
- One `business_ad_conversion` row `begin_checkout`, `sent`.
- **NO** second or third `InitiateCheckout`.

### MC-10 Starting the trial reports StartTrial once — BLOCKER
DEPENDS: MC-09

WHY: This is the event campaigns should judge by: it lands within minutes of
the click, inside Meta's 7-day window, unlike Purchase.

1. Complete the Stripe checkout with test card `4242 4242 4242 4242`.
2. Reload the welcome page twice. Replay `customer.subscription.created` from
   the Stripe CLI.

EXPECT:
- **One** `StartTrial`, `value` = the amount the subscription will first
  charge (after any coupon), `currency` = the subscription's currency.
- `business_ad_conversion` row `start_trial`, `sent`.
- **NO** second `StartTrial` after the reloads or the replay.

### MC-11 A signup without a Meta click reaches Meta with hashed details only — CORE

WHY: The cross-device case: a click on a phone, a signup on a laptop. Meta can
only match it through the hashed contact details, so this path must work with
no click id at all.

1. R17, R13 `Europe/Paris`, R1, R9. Open `/en` with no parameters, **Accept all**.
   Sign up with a fresh email.

EXPECT:
- A `Lead` in Test Events with `em`, `ph`, `external_id` (hex codes),
  `client_user_agent`, and **no** `fbc`.
- `ad_conversion_outbox` has a `(account, meta, sign_up)` row, `accepted` (with the
  outbox off, `business_ad_conversion` has a `meta` `sign_up` row, `sent`).
- GA4 DebugView: the GA4 `sign_up` carries no email, phone, name, IP or user
  agent.

### MC-12 A version-2 cookie sends only the two old events, unchanged — CORE

WHY: Someone who accepted the old wording agreed to less. Their signup must be
reported exactly as before this branch, and nothing new.

1. R17, R13 `America/New_York` (both categories are allowed by default, so the
   legacy cookie is forwarded), R10, then sign up with a fresh email and complete
   a test checkout.

EXPECT:
- The `Lead` carries `fbc`/`fbp` only: **no** `em`, `ph`, `client_user_agent` or
  `client_ip_address`.
- **NO** `InitiateCheckout` and **NO** `StartTrial`, and no `begin_checkout` /
  `start_trial` rows at all (not even skipped ones).
- NEGATIVE: no `CompleteRegistration`.

### MC-13 Refusing after signup stops Meta, even with no click — CORE
DEPENDS: MC-11

WHY: A refusal made after signup is recorded on the marketing site, not on the
account; it must still stop every later report.

1. From MC-11 (signed up, no checkout yet), open the marketing site in the same
   browser, **Cookie preferences** → turn **Advertising** off → save.
2. Back in the dashboard, open the plan step and go to checkout.

EXPECT:
- **NO** `InitiateCheckout` in Test Events.
- The `Lead` already sent is not recalled (correct, §5.5).

### MC-14 The browser context is purged 45 days after the business was created — EDGE
DEPENDS: MC-02

WHY: §5.5 and the retention table promise IP address and browser
characteristics are kept 45 days at most.

1. Note the MC-02 business id. Confirm its `business_ad_attribution` row has
   `client_ip` / `client_user_agent` set.
2. R11 on that business.

EXPECT:
- Both columns are now `null`; every other column of the row is unchanged.
- A business created today still has its values after the same purge run.

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

### LY-03 The US notice and dialog fit a phone — CORE
DEPENDS: RG-02, PR-08

WHY: The control a visitor came to flip must be reachable with a thumb, and Save
must never scroll away: a switch flipped while Save is out of view reads as
already applied, and Escape then silently discards the opt-out (AC2.8, AC2.10).

1. R17, R13 `America/New_York`. Responsive mode 390x844, then 320x640. Open `/us`
   in `en`, `fr` and `pl`.
2. Measure the notice's buttons:
   `[...document.querySelectorAll('section[aria-label] button')].map(b => Math.round(b.getBoundingClientRect().height))`.
3. Open the dialog from the notice. Scroll its contents. Repeat for the EU dialog
   (R13 `Europe/Paris`, 390x844) and for the GPC dialog (R5).
4. Look at the footer entry in `en` and `pl`.

EXPECT:
- Both notice buttons are at least 44px tall. No horizontal scrollbar.
- The dialog fits the screen (at most 85% of its height) and scrolls internally.
  The action row (Cancel and Save side by side, or a single Close under GPC) stays
  visible at the bottom while the cards scroll, in **both** regions.
- At 390x844 the Advertising card sits directly under the intro, not below the
  fold.
- A long statutory title wraps to two lines with the switch or "Off" label centred
  beside it.
- The footer entry wraps to at most two lines, the icon stays with the last word,
  and the hit area is at least 44px.
- NEGATIVE: Save is never pushed off the bottom, and nothing is clipped.

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
- The section lists `NEXT_LOCALE`, `stampeo_market`, `stampeo_consent` (6
  months, and 13 months for a US refusal renewed on each visit) and `stampeo_sid`
  (13 months) as always present, Google and Meta with `_ga`, `_gid`, `_fbp`,
  `_fbc` as consent-gated, and our own `stampeo_src`, `stampeo_ga` and
  `stampeo_ad` with their 6-month lifetimes and their category. It says the
  earlier `stampeo_attribution` cookie is no longer set. TikTok, `_ttp` and
  `stampeo_region` appear nowhere.
- It does **NOT** say anywhere that the site requires no cookie banner. That
  sentence was true before this release and is the specific thing that must not
  come back.
- "Last updated" reads 10 October 2026 in all four.

### LG-02 §5.5 says what Meta now receives — BLOCKER
DEPENDS: LG-01

WHY: Consent version 3 is valid only if the text describes what the code sends.
If §5.5 still promised "never your email", every hashed email sent would be
processing nobody agreed to.

1. Read §5.5 in `fr`, `en`, `es`, `pl`, and the **Advertising** line in the
   cookie preferences dialog.

EXPECT:
- §5.5 names the four steps, the SHA-256 hashing of email, phone, name,
  country, city, postcode and an account identifier, the IP address and browser
  characteristics, the 45-day limit, and Meta receiving steps for signups that
  did not come through a Meta ad.
- It does **NOT** say that the email, name or phone are never sent.
- The retention table (§8) has the 45-day row; §4's transfers paragraph names
  Google and Meta.
- The **Advertising** toggle text mentions contact details sent as an
  irreversible code.

### LG-03 The policy states the regional rules the code applies — BLOCKER
DEPENDS: LG-01

WHY: The privacy text is what the visitor was told, and the consent version is
valid only if it describes what the code does. This is a counsel draft
(`docs/features/STA-377/legal-review.md`); the case checks the draft against the
behaviour, not the draft's legality.

1. Read §5.1, §5.2, §5.3, §5.6 and §6 in `en` and `fr`, with the cases named below
   open beside them.

EXPECT:
- §5.1: the control sits in the footer of "every page where our measurement and
  advertising cookies can be set" (PG-05), refusing is one click with the same
  prominence (CN-03), a US refusal is kept 13 months and renewed on each visit
  (SP-04, SP-05), GPC in the US overrides an earlier choice and also switches
  audience measurement off while it is on (RG-04, RG-07), and in Europe an
  explicit choice outranks the signal (RG-04).
- §5.2: `stampeo_sid` is a random identifier kept 13 months and linked to the
  account (SP-01); `stampeo_consent` 6 months, 13 for a US refusal.
- §5.3: `stampeo_src`, `stampeo_ga`, `stampeo_ad` and their categories (AT-15).
- §6: US visitors can opt out of "sale, sharing and targeted advertising" through
  **Your Privacy Choices** (PR-08).
- NEGATIVE: the policy does not say the control is at the bottom of "every page",
  and does not say a private page (login, onboarding) sets a cookie.

### LG-04 §4 names every recipient of business-owner data — CORE
DEPENDS: LG-01

WHY: §4 is what a business owner is told about who receives their email address
and name. Trustpilot received both from 2026-06-29 (a review invitation) and §4
named it nowhere until STA-409. A new integration that sends personal data to a
third party has to be in §4 the day it ships, and this is the case that checks.

1. Read §4 "Third-Party Services" in `fr`, `en`, `es`, `pl`: the table, then the
   "Transfers Outside the EU" paragraph. Read §6 in `en`.
2. Ask the backend owner for the current list of outbound integrations that carry
   personal data, and tick each one against the table.

EXPECT:
- The table has a **Trustpilot A/S** row in all four locales, naming the review
  invitations and what is sent (email address, name, business identifier,
  language), with Denmark (EU) and the Standard Contractual Clauses for transfers
  outside the EU.
- The transfers paragraph lists Trustpilot with Stripe, Apple and Google as a
  sub-processor that may transfer data to the United States.
- §6 lists the review invitation among the purposes, on the basis of legitimate
  interest.
- NEGATIVE: Trustpilot is **not** in the sentence naming the sub-processors that
  process data exclusively within the EU (Supabase, OVH, Resend, PostHog, Sentry,
  Redis).
- NEGATIVE: no integration on the backend owner's list is missing from the table.
  If one is, file it as its own issue instead of widening this case.

---

## BG: the build guard (STA-377)

A production build of showcase now fails without the five analytics ids (the
pixel id, the GA measurement id, the showcase URL, the API URL, the cookie
domain): `scripts/analytics-ids.mjs` runs before and after `next build`, and the
Dockerfile default is on. There is nothing for QA to run about the failure itself.
The one thing QA confirms is the artefact.

### BG-01 The deployed bundle carries the pixel id and the GA id — CORE

WHY: Before the guard, a missing `NEXT_PUBLIC_*` value shipped dead tracking with
a green build. The ids are baked
into the chunks, so the chunks are where to look. Read-only requests.

1. `SITE=https://showcase.dev.stampeo.app` (after a production release repeat with
   the production origin; reading its public files touches nothing).
2. Run:
   `curl -s $SITE/en | grep -o '/_next/static/[^"]*\.js' | sort -u | while read p; do curl -s "$SITE$p"; done | grep -o -E '1088158323750710|G-ZFZ6JLPFXN|GTM-[A-Z0-9]+' | sort | uniq -c`

EXPECT:
- Both `1088158323750710` and `G-ZFZ6JLPFXN` appear at least once.
- NEGATIVE: no `GTM-...` container id appears (GA-10).
- For the developer, not QA: the build log prints `analytics-ids (pre): ok` and
  `analytics-ids (post): ok`.
