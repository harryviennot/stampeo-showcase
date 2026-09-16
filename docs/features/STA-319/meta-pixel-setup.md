# Getting a Meta pixel — setup guide (STA-319, checkbox 1)

This is the human-executed half of STA-319: everything that happens in a
browser rather than in the repo. It produces one artifact — a **pixel ID** —
which is the only thing the code needs.

> Meta reorganises Events Manager often and renames things (Pixels are now
> called **datasets**; Business Manager is now **Business Portfolio**). Labels
> below may drift. Navigate by *function*, not by exact button text.

---

## A. Prerequisites

| Need | Why | Where it comes from |
|---|---|---|
| Meta **Business Portfolio** with you as admin | Datasets are owned by a portfolio, not a personal profile | STA-271 (account ownership task) |
| An **ad account** inside that portfolio | The dataset must be assigned to it or campaigns can't optimise | STA-271 |
| Ability to add a **DNS TXT record** on `stampeo.app` | Domain verification (section D) | Your registrar |

If STA-271 hasn't landed, stop here — you can't create a dataset in a
portfolio you don't administer. Everything in the repo half of STA-319 works
without this, which is why it's being built first.

---

## B. Create the pixel (dataset)

1. Go to **business.facebook.com/events_manager**.
2. **Data sources** → **Connect data source** (or the `+` button) → choose **Web**.
3. Name it something unambiguous — `Stampeo Showcase`. You may later want a
   second one for the dashboard (`web/`), so don't just call it "Stampeo".
4. Enter the site URL: `https://stampeo.app`.
5. When it offers an install method, pick **Install code manually**. It will
   display the base `fbq` snippet.
   **Do not copy that snippet.** Our loader in `lib/meta-pixel.ts` injects it
   itself, gated behind consent. Pasting Meta's version into the layout is
   precisely the un-gated install this issue exists to avoid.
6. Copy the **dataset / pixel ID** — a 15–16 digit number. That's the deliverable.

Skip any "Conversions API" prompt. Server-side is out of scope (see plan Non-goals).

> **Current pixel ID: `1088158323750710`.**
>
> Not a secret — a pixel ID ships in client JS and is visible in devtools on any
> site running the tag.
>
> **Confirm ownership before relying on it:** Business Settings → Data sources →
> Datasets must now *list* it. Receiving install code from Events Manager is not
> proof — the abandoned first attempt below produced identical-looking code
> while the portfolio owned nothing.
>
> Abandoned: `2030471740941815` — created outside the business portfolio, no
> event history, never wired into any environment. Ignore or delete it; do not
> let it resurface in a config file.

### When the dataset doesn't appear in Business Settings

Symptom: Events Manager gives you install code, but Business Settings →
Datasets is empty. The pixel exists in a personal context or another portfolio.

Diagnose in this order:

1. **Check the portfolio selector** (top-left of Business Settings). The page is
   silently scoped to one portfolio; having more than one is common, especially
   right after being granted access to an existing one.
2. **Open Events Manager** → find the ID → **Settings** → read the owning
   business. That is definitive.
3. **Business Settings → Datasets → Add** offers roughly: create new, claim one
   you own, or request access to someone else's. A personally-owned pixel can
   usually be claimed. One owned by a *different business portfolio* generally
   cannot — portfolio-to-portfolio transfer has never been self-serve and ends
   in a support ticket.

**Default resolution: create a fresh dataset owned by the correct portfolio and
abandon the stray ID.** A brand-new pixel has no ad spend attributed, no warmed
audience and no event history, so there is nothing to preserve. Claiming is only
worth the effort if the pixel already carries real history.


### Two parts of Meta's snippet we deliberately do not ship

Meta's install screen hands you a block ending in a `<noscript>` fallback:

```html
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1088158323750710&ev=PageView&noscript=1" /></noscript>
```

That is a plain `<img>`. It fires with **no JavaScript involved**, so no
JS-based consent gate can suppress it — a visitor with JS disabled would be
tracked unconditionally. We omit it entirely and accept the lost JS-disabled
attribution.

Likewise the snippet's inline `fbq('track', 'PageView')` runs at parse time.
Ours fires `PageView` from inside the gated loader, after consent.

### Automatic advanced matching → leave it OFF

The toggle offered alongside the install code. It scrapes email and phone
inputs out of the DOM, hashes them client-side, and sends them to Meta to lift
match rates.

Reject it, because:

- **Automatic means you don't pick the fields.** Showcase isn't a brochure
  site — the onboarding wizard and signup flow collect business-owner emails
  and phone numbers. Those are what it would harvest.
- **Hashing is not an exemption.** SHA-256'd email is pseudonymised, not
  anonymised: still personal data under GDPR, needing its own lawful basis and
  *specific* disclosure. "We use a Meta pixel" does not cover "we transmit
  hashed contact details of everyone who starts signup".
- **It widens the blast radius.** If the consent gate ever fails, the leak goes
  from *someone visited* to *who they are*.

It's reversible: dataset → **Settings** in Events Manager. Revisit after
STA-317, when consent and the policy text actually exist. If match rate later
justifies it, use **manual** advanced matching — named fields passed explicitly
in `fbq('init', …)`, so what leaves the page is a reviewable diff rather than
whatever the scraper finds.

---

## C. Assign it

Business settings → **Data sources** → **Datasets** → select yours:

- **Assign people** → give yourself full control.
- **Assign assets / ad accounts** → attach the ad account that will run the
  campaigns. Skipping this is the classic failure: the pixel collects events
  but no campaign can optimise against them.

---

## D. Verify the domain

Required for Aggregated Event Measurement (post-iOS 14.5), and without it your
event configuration options are restricted.

1. Business settings → **Brand safety and suitability** → **Domains**.
2. Add `stampeo.app`.
3. Verify by **DNS TXT record** — preferred, since it needs no code change and
   survives redeploys. The meta-tag and HTML-file methods both mean shipping
   something from this repo.

   At the registrar (OVH), the TXT form's *Subdomain* field is marked required
   with a 1-character minimum, which reads as though the record can only go on a
   subdomain. It can't — **enter `@`**, the DNS shorthand for the zone apex, and
   the record lands on `stampeo.app` itself. Not `www`: showcase serves from the
   apex and that is the domain registered in Business Settings.

   Notes:
   - Multiple TXT records coexist at the apex. This is an *additional* record;
     it does not overwrite existing SPF/DMARC entries.
   - Leave TTL on default.
   - Confirm propagation before clicking Verify in Meta — a premature attempt
     fails unhelpfully and can need a cooldown before retrying:
     `dig TXT stampeo.app +short`
   - Unverified: whether apex verification also covers `app.stampeo.app` for the
     future `web/` pixel. If it doesn't, that's simply a second TXT record then.
Domain verification is the whole of section D. **Aggregated Event Measurement
configuration is NOT done here** — it moved to section F. See the note there.

---

## E. Where the ID goes in this repo

The pixel ID is **not a secret** — it ships in client JavaScript and is visible
to anyone with devtools. It still goes through env rather than being
hard-coded, so it can differ per environment.

Variable name: `NEXT_PUBLIC_META_PIXEL_ID`

`NEXT_PUBLIC_*` vars here are **build-time**, baked into the bundle by Next at
build. That means three edits, not one:

1. **`.env.example`** — document it, commented out, alongside the PostHog block.
2. **`Dockerfile`** — add the matching `ARG` (near line 21) *and* `ENV` (near
   line 30) pair. Adding only one of the two silently produces an empty value.
3. **Production build args** — wherever the real deploy passes build args. CI
   (`.github/workflows/ci.yml`) needs **nothing**: it uses placeholders for
   PostHog, and our loader no-ops cleanly when the var is unset (plan AC3), so
   an absent value can't fail the build.

**Leave it unset in production until STA-317 ships.** With the dormant design
setting it early is harmless — the consent gate still denies, and that's plan
AC2 — but it buys nothing and muddies the flip-on moment.

---

## F. Verification — deferred, and why

The two standard tools:

- **Meta Pixel Helper** — Chrome extension, shows pixels firing on the page.
- **Events Manager → your dataset → Test Events** — paste the site URL, click
  around, watch events land in real time.

Both require the tag to *actually load*. While the pixel is dormant it loads
never, by construction, so neither tool will show anything — that is the
correct result, not a fault. Real verification happens after STA-317 ships and
you accept consent in the banner; it belongs to **STA-317's runbook**, not to
this issue's QA pass.

### Aggregated Event Measurement — also deferred to here

AEM ranks up to 8 conversion events per verified domain in priority order, which
determines what still gets attributed for iOS users who decline ATT. Suggested
order once it applies: `Lead` → `Contact` → `PageView`.

**Do not attempt this before STA-317.** AEM prioritises events Meta has seen,
and a dormant pixel has sent none — so the screen is either empty, absent, or
offers nothing worth ranking. If you go looking anyway and find nothing, check
in this order: domain verification actually completed (section D); an ad account
is attached to the dataset (section C); then the location, usually Events
Manager → left nav **Aggregated Event Measurement** → *Configure Web Events*, or
the dataset's **Settings** tab. Meta has moved this repeatedly.

STA-319 checkbox 3 is therefore only half-deliverable here: the event mapping
is built and unit-tested, the live verification is handed to STA-317.

---

## G. GDPR / CNIL notes

- The consent gate is the compliance mechanism. Nothing else in this setup
  substitutes for it.
- In Business settings, accept Meta's **data processing terms** /
  controller-to-business terms for the portfolio.
- The privacy policy must name Meta as a tracker before the pixel can fire —
  `legal/{en,fr,es,pl}/privacy-policy.md` and its translations. That edit is
  **STA-317's checkbox**, not this one, because it must land in the same
  release as the first tag that can actually fire.

---

## Checklist

Do now:

- [x] STA-271 landed; you administer the Business Portfolio
- [x] Dataset created — pixel ID `1088158323750710`
- [x] Ownership confirmed — implied by the ad-account assignment succeeding: a
      portfolio's ad account cannot be attached to a dataset it does not own
- [x] Dataset assigned to the ad account
- [x] `stampeo.app` domain-verified via DNS TXT (`@` as the subdomain), record
      confirmed live: `dig TXT stampeo.app +short` returns
      `facebook-domain-verification=oxwnjinw6dgm7oyyf07moxqbfa0cg4`, coexisting
      with the existing SPF and Google verification records
- [x] Automatic advanced matching left OFF
- [x] ID recorded here — **not** set in any prod env, by design

Deferred to the STA-317 flip-on, do NOT attempt while dormant:

- [ ] Aggregated Event Measurement events ranked
- [ ] Pixel Helper / Test Events verification
