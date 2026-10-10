BRANCH: `fix/sta-389-matcher-segment-boundary`, then `feat/sta-388-qr-redirect` stacked on it (showcase)
SCOPES: showcase
ENVIRONMENT: **dev, except CQ-02/CQ-03,** which need a printed card and the prod analytics, so they run on prod after the deploy. No migration, no backend change. Every case is an anonymous GET, so nothing here writes data.

# Public URLs test pass

Covers the short URLs people reach by scanning something printed: a shop's
enrollment URL `/{slug}`, and the redirects the site answers at its top level.
They are the URLs nobody types and nobody can correct: a QR code on a counter
cannot be reprinted the day a route breaks, so each case asserts the final page
a real phone lands on, not just the first status code.

Work top to bottom. SU first: if a shop URL breaks, every printed counter code
for that shop is dead. CQ covers `/qr`, the code on Stampeo's own business cards.

---

## SETUP: Before you start

Everything runs against dev. Nothing here touches production.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Showcase (dev) | `https://showcase.dev.stampeo.app` | The public dev host. |
| Showcase (local) | `http://localhost:3001` | `bun run publicdev` from `showcase/`. Same code as the dev host when run from the main checkout. **Do not run `bun run build` while it is up.** |
| A terminal | `curl` | Most cases are fastest as `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" <url>`. `-L` follows redirects; add `-H "Accept-Language: fr-FR"` to pin the language. |

### Accounts

**None.** Every case is an anonymous visitor, like a customer scanning a code.

### Reset recipes

| ID | Recipe |
|---|---|
| R1 | Clear the locale choice: delete the `NEXT_LOCALE` cookie (devtools > Application > Cookies), or use a private window. Needed when a case pins the language by `Accept-Language`. |
| R2 | Read what a crawler is told: `curl -s -H "Accept-Language: fr-FR" <url> \| grep -oE '<title>[^<]*</title>\|<meta name="robots"[^>]*>\|<link rel="(canonical\|alternate)"[^>]*>'`. Next writes the hreflang attribute as `hrefLang`. The backslash before each pipe is only the table escape. |

### Known state before you start

- **New runbook (STA-389).** SU-01..03 are new. SU-02 is the case that would
  have caught STA-389: a shop whose slug starts like one of the site's route
  handlers (`go`, `api`, `auth`, `join`, `internal`) returned 404, because the
  middleware matcher skipped those names as prefixes, not whole segments. Fixed
  and verified on local dev (`/golden-hour-coffee` 404 before the fix, 200
  after). Not yet verified on prod, where `good-vibe-lemonade-and-more` is the
  affected shop: re-run SU-02 against `https://stampeo.app` after the deploy.
- **New section (STA-388).** CQ-01..04 cover `/qr`. CQ-01 and CQ-04 passed on
  local dev and `showcase.dev.stampeo.app` on 2026-10-07. CQ-02 and CQ-03 need
  Harry: a printed card, one iPhone, one Android phone, and the prod GA4 and
  PostHog projects.
- **Analytics caveat.** GA4 and Meta only load after the visitor accepts the
  cookie banner, so a card scan that refuses never reaches them. PostHog
  records every scan. CQ-03 accepts the banner on purpose.
- **New cases (STA-358, 2026-10-09): what crawlers are told about shop
  pages.** SU-04 to SU-06 are new. A shop page used to inherit the homepage's
  canonical and hreflang from the layout. It is now `noindex, follow`, with a
  canonical on its own unprefixed URL, and an unknown slug is a 404 marked
  noindex. The three cases were dry-run on a local production build of
  `feat/sta-358-seo-geo-hardening` (`903dfd5`) against the dev backend, with
  the expected results. They have not run on the dev host or production yet.
  The rest of the crawler view is in `seo-indexing.md`.
- **Since STA-358, `middleware.ts` is `proxy.ts`.** Wherever this runbook says
  middleware, read proxy: the matcher and the shop rewrite are unchanged.
  SU-01's title EXPECT already names "Stampeo" once.
- **Targeted re-run (STA-358):** SU-01, SU-02 (the rename kept the matcher),
  then SU-04 to SU-06. After the deploy, run SU-04 and SU-06 on
  `https://stampeo.app` with `good-vibe-lemonade-and-more` and
  `qa-no-such-shop-358`. Skip SU-05 on production: no live location URL is on
  record, and you must not guess one.

---

## SU: Shop enrollment URLs

`/{slug}` is what a shop's counter QR code encodes. The middleware rewrites it
to `/{locale}/{slug}`; without that rewrite the page 404s. Dev fixtures used:
`golden-hour-coffee` (slug starts with `go`) and any ordinary active shop.

### SU-01: An ordinary shop URL opens its sign-up page [BLOCKER]

| Field | Content |
|---|---|
| WHY | The baseline every other SU case is compared against. If this fails, the problem is not the prefix rule. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. Pick an active dev shop whose slug does not start with go/api/auth/join/internal/qr. 2. `curl -s -o /dev/null -w "%{http_code}\n" -H "Accept-Language: fr-FR" https://showcase.dev.stampeo.app/<slug>` 3. Open the same URL in a private window. |
| EXPECT | 200. The page title is exactly "Obtenez votre carte de fidélité <Shop> \| Stampeo", with "Stampeo" once. You do NOT see the site's 404 page or the marketing homepage. |
| RESET | R1 |

### SU-02: A shop whose slug starts like a route handler still opens [BLOCKER]

| Field | Content |
|---|---|
| WHY | The exact STA-389 failure. The site skips its own handlers (`/go/app`, `/join/{code}`…) before the shop rewrite; matching them as prefixes silently took down every shop named "Good…", "Golden…", "Authentic…", "Joint…". |
| DEPENDS | SU-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. `curl -s -o /dev/null -w "%{http_code}\n" -H "Accept-Language: fr-FR" https://showcase.dev.stampeo.app/golden-hour-coffee` 2. Open it in a private window on a phone. 3. After a prod deploy, repeat step 1 with `https://stampeo.app/good-vibe-lemonade-and-more`. |
| EXPECT | 200, and the page title names Golden Hour Coffee (prod: Good Vibe Lemonade). You do NOT see a 404 or the marketing homepage. |
| RESET | R1 |

### SU-03: The route handlers the prefix rule protects still answer [CORE]

| Field | Content |
|---|---|
| WHY | The fix narrowed which paths skip the middleware. The handlers themselves must still skip it, or the middleware would take `go` for a shop slug and 404 the scanner-app install link. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://showcase.dev.stampeo.app/go/app` 2. Same with `-A "Mozilla/5.0 (Linux; Android 14)"`. 3. `curl -s -o /dev/null -w "%{http_code}\n" https://showcase.dev.stampeo.app/sitemap.xml` |
| EXPECT | Step 1: 302 to `apps.apple.com`. Step 2: 302 to `play.google.com`. Step 3: 200. None of them returns 404 or redirects to `/fr/...`/`/en/...`. |
| RESET | none |

### SU-04: A shop page stays out of search results but names its own URL [CORE]

| Field | Content |
|---|---|
| WHY | A shop page is a counter QR target: useful to the shop's customers, useless as a search result. It used to inherit the homepage's canonical from the layout, which told Google the shop page *was* the homepage. `follow` keeps its links counting. The canonical is the unprefixed URL the shop printed, whatever language the page is served in. |
| DEPENDS | SU-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. R2 on `https://showcase.dev.stampeo.app/lustre`. 2. The same with `Accept-Language: en-US` instead of `fr-FR`. 3. R2 on `https://showcase.dev.stampeo.app/en/lustre`. 4. `curl -s https://showcase.dev.stampeo.app/sitemap.xml \| grep -c lustre` |
| EXPECT | Steps 1 to 3 each print `<meta name="robots" content="noindex, follow"/>` and `<link rel="canonical" href="https://stampeo.app/lustre"/>`: one canonical in French, in English and under `/en`. Step 1's title is "Obtenez votre carte de fidélité Lustre \| Stampeo" and step 2's "Get your Lustre loyalty card \| Stampeo". Step 4: `0`. You do NOT see a canonical of `https://stampeo.app` or `https://stampeo.app/en`, any `hrefLang` line, or `index, follow`. |
| RESET | R1 |

### SU-05: A location page names its own URL [CORE]

| Field | Content |
|---|---|
| WHY | Each location of a multi-site shop has its own printed QR code. Collapsing them into the shop page's canonical would claim that every location URL duplicates the main one. |
| DEPENDS | SU-04 |
| ACCOUNT | No session at all. |
| STEPS | 1. R2 on `https://showcase.dev.stampeo.app/lustre/l/bastille`. 2. R2 on `https://showcase.dev.stampeo.app/lustre/l/nation`. |
| EXPECT | `noindex, follow` on both, with canonicals `https://stampeo.app/lustre/l/bastille` and `https://stampeo.app/lustre/l/nation`. You do NOT see `https://stampeo.app/lustre` as either canonical, or any `hrefLang` line. |
| RESET | R1 |

### SU-06: A slug no shop owns is a 404 that asks not to be indexed [CORE]

| Field | Content |
|---|---|
| WHY | A mistyped or retired QR slug must not become a thin indexable page (a soft 404), and must not claim another URL as its canonical. |
| DEPENDS | SU-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://showcase.dev.stampeo.app/qa-no-such-shop-358` 2. R2 on the same URL. |
| EXPECT | Step 1: `404`, with no redirect. Step 2 prints `<meta name="robots" content="noindex"/>`, and no `rel="canonical"` or `hrefLang` line. You do NOT see a 200 "not found" page, a redirect to the homepage, or a canonical. |
| RESET | R1 |

---

## CQ: Business-card QR code (`/qr`)

The cards encode `https://stampeo.app/qr` and cannot be reprinted. `/qr`
answers a 302 (never cached) to `/?utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10`,
relative to the host that answered.

### CQ-01: /qr lands on the homepage with the card's three tags [BLOCKER]

| Field | Content |
|---|---|
| WHY | Every scan of the 500 printed cards goes through this hop. Wrong tags mean the cards are invisible in analytics; a 404 means the cards are dead. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `curl -sI https://showcase.dev.stampeo.app/qr` 2. For each of `fr-FR`, `en-US`, `pl-PL`: `curl -sL -o /dev/null -w "%{http_code} %{url_effective}\n" -H "Accept-Language: <lang>" https://showcase.dev.stampeo.app/qr` |
| EXPECT | Step 1: `302`, `location: /?utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10`, `cache-control: no-store`. Step 2: `200` and a final URL of `/`, `/en` or `/pl` (by language) followed by all three tags. You do NOT see a 404, a shop's sign-up page, a 301/307/308 from `/qr` itself, or a redirect to `stampeo.app` from the dev host. |
| RESET | R1 |

### CQ-02: A printed card opens the homepage on real phones [BLOCKER]

| Field | Content |
|---|---|
| WHY | The ticket's own "done when". A phone's camera app is the real client: it shows the encoded URL before opening it, which is the only way to confirm the printer did not change it (an uppercase `/QR` would 404). |
| DEPENDS | CQ-01 (on prod) |
| ACCOUNT | No session at all. |
| STEPS | 1. After the deploy, scan a printed card with an iPhone's Camera app. Note the URL in the preview banner. 2. Open it. 3. Repeat on an Android phone (Camera or Google Lens). |
| EXPECT | The preview reads `stampeo.app/qr` (lowercase). The homepage opens, and the address bar (tap it) shows `utm_source=card&utm_medium=qr&utm_campaign=business-cards-2026-10`. You do NOT see a 404 or a shop page. If the preview shows `/QR`, stop and report: the code needs an uppercase route. |
| RESET | none |

### CQ-03: A card visit shows up as source "card" [CORE]

| Field | Content |
|---|---|
| WHY | The second half of the ticket: the tags are only worth printing if the dashboards file the visit under them. |
| DEPENDS | CQ-02 |
| ACCOUNT | No session at all, on a phone with no prior visit (private tab, or cleared site data). |
| STEPS | 1. Scan a card. 2. On the landing page, before navigating anywhere, accept all cookies. 3. In GA4 > Reports > Realtime, look at "Session source / medium" (or open the Traffic acquisition report the next day). 4. In PostHog, find the `$pageview` from that minute. |
| EXPECT | GA4 shows `card / qr` (campaign `business-cards-2026-10`). PostHog's `$pageview` has `utm_source = card`. You do NOT see the visit as `(direct) / (none)`. A refusal in step 2 is expected to leave GA4 empty: that is the consent contract, not a failure. |
| RESET | none |

### CQ-04: /qr variants reach the same destination [EDGE]

| Field | Content |
|---|---|
| WHY | Link previewers send HEAD, some scanner apps add a trailing slash or their own query, and `www.` is a common rewrite. None of them may land elsewhere. |
| DEPENDS | CQ-01 |
| ACCOUNT | No session at all. |
| STEPS | 1. `curl -sI https://showcase.dev.stampeo.app/qr/` 2. `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://showcase.dev.stampeo.app/qr?ref=x"` 3. After the deploy: `curl -sIL https://www.stampeo.app/qr \| grep -i "^location"` |
| EXPECT | Step 1: 308 to `/qr`, then CQ-01's 302. Step 2: the same fixed destination, without `ref=x`. Step 3: a 308 to `https://stampeo.app/qr` (the edge redirects `www` before Next), then the fixed destination. You do NOT see a 404 at any hop. |
| RESET | none |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first. Then sections top to bottom, and within a section,
   BLOCKER cases first unless DEPENDS forces otherwise.
2. **On BLOCKER failure:** stop the section. Cases that DEPEND on it are
   marked SKIPPED, not failed. Write a failure report, then continue with
   sections that do not depend on the failed case.
3. **On CORE failure:** write a failure report, skip only its dependents,
   continue the run.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS
   with what you saw, so the runbook gets fixed.
6. **After any failure:** run the case's RESET before retrying or moving on.
7. **Reporting:** one failure report per failed case, using
   failure-report-template.md. Reference cases only by ID.
8. **Re-runs after fixes:** re-run the failed case, its dependents, and any
   case listed in "Known state" as needing re-verification. Nothing else.
