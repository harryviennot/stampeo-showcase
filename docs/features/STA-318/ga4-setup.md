# Setting up Google Analytics 4 — setup guide (STA-318, checkbox 1)

This is the human-executed half of STA-318: everything that happens in a
browser rather than in the repo. It produces one artifact — a **Measurement ID**
(`G-XXXXXXXXXX`) — which is the only thing the code needs.

> Google renames things in the Analytics admin constantly, and the left-hand nav
> has been reorganised several times. Navigate by *function*, not by exact button
> text. Where a path is given as **Admin → X → Y**, expect X or Y to have moved.

---

## A. Prerequisites

| Need | Why | Where it comes from |
|---|---|---|
| A Google account that will own the property | GA4 properties belong to an account, and moving one later is painful | Use a role address, not a personal one — see below |
| Admin on the Google Analytics **account** (not just the property) | Data sharing and the processing terms are account-level | Same |
| Google Ads account | Not linked to this property. Conversions reach Google Ads from our server, not through GA4 (section H) | Your ads consultant |

### Which Google login to use

**Use the same Google account that already owns Search Console and the Google
Cloud project behind Google Wallet and Sign-in-with-Google.** Analytics is not
technically coupled to any of them — GA has its own Account → Property → Stream
hierarchy and does not attach to a GCP project — so this is purely about which
identity you log in as. Two reasons it should be the same one:

- `stampeo.app` is already verified in Search Console (the DNS TXT record
  alongside SPF and the Meta verification). Same login makes the
  Search Console ↔ GA4 link a two-click job, which is how organic search queries
  reach GA4. Different accounts means cross-granting permissions to yourself.
- One identity across Wallet, OAuth, Search Console, Ads and Analytics is
  materially less to lose track of.

**What is and is not recoverable**, because this is widely misunderstood:

- The *login* is recoverable. Any Google account can be added as an
  Administrator on a GA account, and the original removed. Creating the property
  under the "wrong" login is a nuisance, not a trap.
- The *account structure* is not. Moving a property between two different GA
  **accounts** requires both to sit in the same Analytics Organization; otherwise
  you recreate the property and lose its history. So get the account right
  (one `Stampeo` account, properties beneath it) and worry less about the login.

Whichever you choose, **add a second Administrator immediately** after creating
the account. That, not the choice of first login, is the actual insurance.

If the account in question is a personal Gmail rather than a role address, that
is worth fixing — but the same exposure already applies to Google Wallet, which
issues production passes and is far worse to lose. Treat it as a project-level
cleanup, not a GA-specific decision.

---

## B. Create the property

1. Go to **analytics.google.com** → **Admin** (gear, bottom-left).
2. If you have no account yet: **Create** → **Account**. Name it `Stampeo`.
   - On the way through you are shown **account data sharing settings**. Uncheck
     all of them — see section D1. They are easier to reject here than to find
     again later.
3. **Create** → **Property**.
   - Property name: `Stampeo Showcase`. You may later want a separate property
     for the dashboard (`web/`), so don't just call it "Stampeo".
   - **Reporting time zone**: `France (GMT+01:00)`. This defines the day
     boundary for every report — changing it later does not rewrite history, so
     reports will straddle two definitions forever.
   - **Currency**: EUR. Same warning: it is not retroactive.
   - Keep one Showcase property for both EUR and USD pricing. EUR is the
     property's reporting currency; a future `purchase` event must carry the
     transaction's actual `currency` (`EUR` or `USD`) and numeric `value`.
     A separate USD property would split the same site's visitors and funnel
     across two reporting histories.
4. Business details / objectives: answer honestly, it only tunes which default
   reports appear. Choose **Generate leads** if asked for a primary objective.

---

## C. Create the web data stream — this is where the ID comes from

1. **Admin → Data collection and modification → Data streams → Add stream → Web**.
2. Website URL: `https://stampeo.app`. Stream name: `Showcase`.
3. **Enhanced measurement** — leave ON, with two edits (sections D5 and D7). It
   gives scroll, outbound click, and site search events with no code.
4. Create. The panel now shows the **Measurement ID**, format `G-XXXXXXXXXX`.
   **That is the deliverable.** Copy it.
5. Google will offer installation instructions and a `gtag.js` snippet.
   **Do not copy that snippet.**

> **Current Measurement ID: `G-ZFZ6JLPFXN`** (Showcase stream,
> `https://stampeo.app`, created 16 September 2026).
> Analytics account: **Stampeo** (`408377233`); property: **Stampeo Showcase**
> (`554639683`); web stream: **Showcase** (`15790254685`).
>
> It is not a secret: a Measurement ID ships in client JavaScript and is visible
> in devtools on any site running the tag. It still goes through env (section F)
> so it can differ per environment.

### Why you must not paste Google's snippet

The install screen gives you a `<script src="…googletagmanager.com/gtag/js?id=G-…">`
block to put in `<head>`. Pasting it into `app/[locale]/layout.tsx` would load
the tag on every page for every visitor, before any consent gate runs — which is
precisely the un-gated install this issue exists to avoid, and would undo
STA-317. Our loader in `lib/google-analytics.ts` injects the same script itself,
only after consent resolves and only on trackable routes.

### Consent Mode: not a gate, used once to deny ad signals

Google's UI will push you toward **Consent Mode v2** as the compliance answer.
We do not use it to decide whether the tag loads. In its `denied` state Consent
Mode still loads the tag and still sends cookieless pings to
`googletagmanager.com`. STA-317's rule is that a refusal leaves *nothing*
behind, which is only true if the script was never fetched. Our gate is the
script tag itself: it is injected only after the analytics answer.

We do use one Consent Mode call, after that gate. When the tag is injected,
`initGa` in `lib/google-analytics.ts` queues
`gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied",
ad_personalization: "denied", analytics_storage: "granted" })` before
`config`, so nothing is sent before the visitor's answer. The denial is
permanent: the browser never grants those signals. If a Google Ads destination
is ever attached to this property again, the tag can neither set ad cookies nor
use our visitors for advertising. Google Ads only receives what our servers
upload (section H).

If a Google screen warns that Consent Mode is incomplete or that no consent
update was detected, that is expected and not a fault to fix: there is no
banner-driven update, because the tag never loads without the analytics grant
and never grants ad signals.

---

## D. "EU data settings" — what that actually means

There is **no single EU-residency switch in GA4.** The issue's checkbox is
really a set of five separate settings plus the processing terms. Do all of them.

### D1. Data sharing settings — turn them off
**Admin → Account settings → Data sharing settings.** Uncheck:

- Google products and services *(this is the one that feeds your data into
  Google's own ad models)*
- Benchmarking
- Technical support
- Account specialists

None are needed for measurement. Each one broadens who processes the data and
therefore what the privacy policy has to claim.

### D2. Accept the data processing terms — required
**Admin → Account settings → Account details → Data processing terms.**
Read and accept, and fill in the **data protection officer / legal contact**
fields underneath.

This is the controller-to-processor agreement that makes Google a processor
rather than an independent controller. Without it there is no lawful basis for
the transfer, regardless of what the banner says.

### D3. Data retention — raise it
**Admin → Data collection and modification → Data retention.**
Default is **2 months**, which is uselessly short. Set **14 months** (the
maximum on free GA4) for both event and user data.

14 months is a deliberate ceiling, not an oversight — it lets you compare
year-on-year while staying inside a defensible retention period. It also matches
the 12-month retention posture already documented for the product itself.

### D4. Google signals — leave OFF
**Admin → Data collection and modification → Data collection.**

Google signals ties your traffic to signed-in Google users for cross-device
reporting and remarketing. It pulls in data from a source the visitor did not
give us and that our consent text does not describe, and it triggers thresholding
that hides rows in reports. Leave it disabled.

If a report later says data is withheld "to prevent anyone from inferring the
identity of individual users", that is thresholding — the fix is fewer
dimensions in the report, not enabling signals.

### D5. Redact PII from URLs
**Data streams → Showcase → Enhanced measurement (gear) → Show advanced
settings**, and **Data streams → Showcase → Data redaction**.

- Turn **on** email redaction and URL-query redaction.
- Add query parameters to strip: `email`, `token`, `code`, `phone`. Once the Google Ads Final URL suffix is live (backend `docs/measurement/operations.md` C26), also add `gclid`, `fbclid`, `gbraid`, `wbraid` (C27), so GA4 still sees the campaign through the UTMs. The code already removes those click ids, and `ttclid`, from the page address it reports (section J); this is defence beside it.

Showcase has routes that can legitimately carry a token in the URL
(`/demo/wallet-select/[token]`, email preference links). Sending a token to
Google in a `page_location` is a data leak that no consent banner covers.

Also under Enhanced measurement, turn **off** "Form interactions" (D7): it
fires on form submits across the site and is the noisiest source of accidental
field capture.

### D6. Regional ad-personalization controls
**Admin → Data collection and modification → Data collection → Advanced
settings for ad personalization** (naming varies).

Disable ad personalization for the **EEA and UK**. Ad measurement still works;
what is switched off is using EU visitors' behaviour to build ad audiences.

### D7. Enhanced measurement: no history or form events
**Data streams → Showcase → Enhanced measurement (gear) → Show advanced
settings.**

- Turn **off** "Page changes based on browser history events". With it on, gtag
  reports a `page_view` for every History API change on its own, including a
  client-side hop onto `/onboarding`, `/login` or a business's enrollment page,
  which our route check never sees. Our loader sends every page view itself
  (`shouldSendPageView`), so turning this off loses nothing.
- Turn **off** "Form interactions".
- Leave scroll, outbound clicks and site search on.

The code also sets `window['ga-disable-<id>']` on private routes (and clears it on trackable ones where analytics is allowed), so DebugView must confirm that no hit carries a private `page_location` after a client-side hop.

This is a console setting, not code. After it changes, re-run QA case GA-02
against the **production** stream: only the live stream proves that nothing is
reported for `/onboarding` (`docs/qa/cookie-consent.md`).

### D8. User-provided data collection — off, both switches
**Admin → Data collection and modification → Data collection → User-provided data
collection**, and the tag setting that detects it (**Data streams → Showcase →
Configure tag settings → Collect user-provided data from your website**; names
move).

Turn off **automatic detection** and **manual collection**. With either on, the
tag can read an email address, a phone number or an address from a page, and
`/contact` and the newsletter field are tracked pages. Contact details must
reach Google only through our server's Google Ads upload, hashed and under
advertising consent, never by the tag scraping a form. The privacy policy says
Google Analytics never receives them.

Verify from the live script (section H): the `__ogt_1p_data_v2` instance reads
`"vtp_isAutoEnabled":false` and `"vtp_isManualEnabled":false`. The console's
names change; the script is the authority.

### On IP addresses

You do not need to do anything, and there is no toggle. GA4 does not log or
store IP addresses — it derives coarse geography and discards the address, and
EU traffic is terminated on EU-based servers before that happens. Anyone telling
you to "enable IP anonymisation" is describing Universal Analytics, which no
longer exists.

---

## E. Reporting identity
**Admin → Data display → Reporting identity.** Choose **Device-based**.

The alternatives (Blended / Observed) mix in Google signals and modelled data.
With signals off (D4) they would partly do nothing anyway, and device-based
keeps reports reproducible — what you see is what was measured, not what was
estimated.

---

## F. Where the ID goes in this repo

Variable name: **`NEXT_PUBLIC_GA_MEASUREMENT_ID`**

`NEXT_PUBLIC_*` vars here are **build-time** — Next inlines them into the bundle
at build, they are not read at runtime. That means three edits, not one:

1. **`.env.example`** — document it, empty, next to `NEXT_PUBLIC_META_PIXEL_ID`
   (line 47).
2. **`Dockerfile`** — add the matching `ARG` (with the block at lines 21–28) *and*
   `ENV` (lines 30–37) pair. Adding only one of the two silently produces an
   empty value, and the tag is then dead in production with no error anywhere.
3. **Production build args** — wherever the real deploy passes build args.
   CI needs nothing: the loader no-ops cleanly when the var is unset (plan AC1),
   so an absent value cannot fail the build.

---

## F2. The Measurement Protocol API secret (STA-323)

The server-side conversion sender needs a **second** credential, separate from
the measurement id. Unlike the measurement id, **this one is a real secret**:
anyone holding it can inject arbitrary events into the property.

**Where to create it:**

**Admin → Data collection and modification → Data streams →** click the
`Showcase` stream **→ Measurement Protocol API secrets → Create**. Name it for
where it will be used (`backend-prod`), and copy the value.

Notes:

- Create a **separate secret per environment** (`backend-dev`, `backend-prod`).
  They can be revoked independently, so a leaked dev secret does not mean
  rotating the one production depends on.
- It can be revoked and recreated from the same screen at any time. The sender
  no-ops when it is unset or wrong, so a rotation degrades to "no conversions"
  rather than to errors.
- Do **not** put it in `.env.example`, the Dockerfile, or any `NEXT_PUBLIC_*`
  variable. It must never reach the browser bundle.

### Where each value goes

| Value | Secret? | Goes where | Read by |
|---|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-ZFZ6JLPFXN` | No — ships in the bundle | `.env.example`, `Dockerfile` (ARG line 41 + ENV line 52), and the **prod build args** | showcase, at build time |
| `GA4_MEASUREMENT_ID` = `G-ZFZ6JLPFXN` | No | **Doppler** | backend, at runtime |
| `GA4_API_SECRET` | **YES** | **Doppler only** | backend, at runtime |

**Set the Doppler keys in UPPERCASE.** `pydantic-settings` is case-insensitive
by default, so the lowercase Python attributes `settings.ga4_measurement_id` and
`settings.ga4_api_secret` read the environment variables `GA4_MEASUREMENT_ID`
and `GA4_API_SECRET`. Lowercase is the attribute convention, uppercase the
env-var one; every field in `app/core/config.py` works this way
(`supabase_url` ← `SUPABASE_URL`).

The backend pair is read through `Settings`, never `os.getenv` — see
`backend/CLAUDE.md`. Both must be present or `send_conversion` no-ops, which is
the intended dormant state until you are ready.

**CI needs nothing.** `showcase/.github/workflows/ci.yml` builds with
placeholder values for every `NEXT_PUBLIC_*`, and the loader no-ops on an
absent or malformed id (plan AC1), so an unset value cannot fail the build.

**The prod build args are the one thing not in this repo.** CI only ever builds
with placeholders, so passing the real measurement id is a change wherever the
production image is actually built. Until that happens the tag is dormant in
production no matter what is set in Doppler — the measurement id reaches the
browser through the *build*, not through the runtime environment.

---

## G. Verification in DebugView

**Admin → DebugView**, or the left nav under Admin.

DebugView only shows sessions explicitly flagged as debug. Two ways in:

- Install the **Google Analytics Debugger** Chrome extension and toggle it on.
- Or append `?debug_mode=1` — our loader passes `debug_mode` through when present.

**You must accept the cookie banner first.** The tag does not exist on the page
until analytics consent resolves to granted, by construction. An empty DebugView
before you click Accept is the correct result, not a fault — that is plan AC2.

What to check, in order:

1. Accept consent on `https://stampeo.app`. A `page_view` appears within ~10s.
2. Navigate to `/pricing`. A **second** `page_view` with the new path appears
   (plan AC8 — client-side navigation is not automatic in GA4).
3. Click a signup CTA. A `sign_up_cta_click` event appears with
   `cta_location`, `locale`, `href`.
4. Navigate to `/onboarding`. **No `page_view` should appear** (plan AC7 —
   private route). This is the negative check most people forget; the tag being
   quiet here is the feature.
5. Open devtools → Application → Cookies. `_ga` and `_ga_G-XXXXXXXXXX` exist
   *only* after accepting. Refuse in a fresh private window and neither appears,
   and there is no request to `googletagmanager.com` in the Network tab at all.
6. Open `/pricing?gclid=test&utm_source=google&keep=1` and accept analytics. The
   `page_view` in DebugView (or the `dl` parameter of the `/g/collect` request)
   shows the address without `gclid`, with `utm_source` and `keep` intact, and no
   `_gcl_*` or `_gac_*` cookie is set.
7. In the console, `window.dataLayer` holds a `consent` `default` entry with
   `ad_storage`, `ad_user_data` and `ad_personalization` denied, before the
   `config` entry. The collect request carries `gcs=G101`.

### Mark the conversion as a key event
Once `sign_up_cta_click` has been seen at least once:
**Admin → Data display → Events** → toggle **Mark as key event**.

It cannot be marked before GA has observed it — the row does not exist yet. This
is the usual reason this step gets skipped and then forgotten.

---

## H. Google Ads: no link, and no destination on this tag

Google Ads conversions are uploaded by our server (Data Manager API: the Google
click id when there is one, and the SHA-256 of the account email, only under
advertising consent). The setup is in the backend repo, `docs/measurement/`
(`events.md`, `operations.md` C18 to C27). So, for this property:

- **Admin → Product links → Google Ads links** stays empty. GA4 key events are
  not imported into Google Ads as conversions, and no audience is shared.
- **The Google tag has no Google Ads destination.** Admin → Data streams →
  Showcase → Configure tag settings → the tag's destinations lists this property
  only. If an Ads account is ever attached (it was on 15 October 2026, which made
  this analytics-only tag send advertising data), use **Remove destination** and
  **Create a new tag**: the destination moves to a tag we never install. A
  combined tag cannot be un-combined any other way.
- **Verify from the live script**, not from the console, because the script's
  tag-id list can keep ids of removed destinations. Only an *instance* counts:

  ```bash
  curl -s -A "Mozilla/5.0" "https://www.googletagmanager.com/gtag/js?id=<GA_MEASUREMENT_ID>" -o /tmp/gtag.js
  grep -o '"function":"__[a-z0-9_]*"' /tmp/gtag.js | sort | uniq -c
  grep -c '"function":"__dest_aw"' /tmp/gtag.js                # must print 0
  grep -o '"function":"__ogt_1p_data_v2"[^}]*' /tmp/gtag.js    # isAutoEnabled and isManualEnabled false
  ```

  `__dest_ga` is the only destination instance; `__dest_aw` and `__ccd_ads_*` are
  absent. The bare string `__dest_aw` always appears once in Google's library
  code and is not a destination.
- The browser tag also denies ad signals for good (see "Consent Mode" above), so
  a re-attached destination could not use our visitors even before you notice it.

### Console audit — 20 September 2026

- Google Ads: **no account linked yet**.
- Search Console: **no property linked yet**.
- The web stream still reports **no normal production data received**. DebugView
  showed one `page_view` and three `sign_up` debug events during the audit, so
  Measurement Protocol/test traffic can reach the property; this does not prove
  that the production Showcase build is sending browser events.

### Console audit — 15 October 2026

- A Google Ads account had been attached to this Google tag, so loading the GA4
  tag also activated an Ads destination. The destination was split off into its
  own uninstalled tag. The live script read on 16 October 2026 holds no Google
  Ads destination instance, and both user-provided-data switches read false; its
  tag-id list still names a few ids of removed destinations, which is harmless.
  Harry confirms these in the console.

---

## I. GDPR / CNIL notes

- The consent gate is the compliance mechanism. Nothing in this setup substitutes
  for it.
- The processing terms (D2) are not optional paperwork; they are the legal basis
  for the transfer.
- The privacy policy must name Google Analytics as a tracker before the tag can
  fire. STA-317 already did this (commit `7a23674`) — verify GA4 is actually
  named there before flipping the ID on in production.

---

## J. Click ids in the page address

`gclid`, `gbraid`, `wbraid`, `fbclid` and `ttclid` are removed, in code, from the
`page_location` the tag reports: in the `config` call and in every manual
`page_view` (`stripAdClickIds` in `lib/privacy/ad-click-params.ts`, used by
`lib/google-analytics.ts`). Every other parameter, `utm_*` included, is kept as
written, so GA4 still sees the campaign. PostHog is deliberately outside this: it
is our EU processor and keeps the full address as `$current_url` for the
ad-landing analysis. The redaction in D5 is a second layer, not the first.

---

## Checklist

- [x] Property created under the same Google login that owns Search Console
      and the Wallet/OAuth cloud project; time zone France, currency EUR
      (implied — the data stream below could not exist otherwise)
- [x] A **second Administrator** added on the GA account:
      `jack@lexa-agence.com` (16 September 2026)
- [x] Web data stream created for `https://stampeo.app`
- [x] **Measurement ID recorded here:** `G-ZFZ6JLPFXN`
- [x] Google's gtag snippet NOT pasted into the repo
- [x] D1 — account data sharing settings all unchecked
- [ ] D2 — data processing terms accepted on 16 September 2026;
      legal/DPO contact details still need to be supplied and entered
- [x] D3 — event and user data retention set to 14 months
- [x] D4 — Google signals left OFF
- [x] D5 — email/query redaction on; `email`, `token`, `code`, and `phone` stripped
- [x] D6 — ad personalization disabled for EEA/UK and separately listed EU territories
- [ ] D7 — "Page changes based on browser history events" and "Form interactions"
      off on the Showcase stream; then re-verify GA-02 on the production stream
- [ ] D8 — user-provided data collection off, automatic detection and manual
      (read from the live script on 16 October 2026: both false; Harry confirms)
- [ ] D5 — `gclid`, `fbclid`, `gbraid`, `wbraid` added to the redacted query
      parameters, after the Google Ads Final URL suffix is live
- [ ] H — no Google Ads link, no Google Ads destination on the Google tag
      (verified from the live script)
- [x] E — reporting identity set to Device-based
- [x] F — `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.example` and the Dockerfile
      (ARG line 41 *and* ENV line 52). **Prod build args still to do** — the
      tag stays dormant until the deploy passes it.
- [x] F2 — Measurement Protocol API secrets created for `backend-dev` and
      `backend-prod`
- [ ] F2 — `GA4_API_SECRET` and `GA4_MEASUREMENT_ID` verified in Doppler for
      each backend environment
- [ ] F2 — prod build args pass `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] G — DebugView received test traffic on 20 September 2026; the browser
      flow and negative check on `/onboarding` still need verification
- [ ] G — `sign_up_cta_click` marked as a key event
