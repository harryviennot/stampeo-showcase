BRANCH: `feat/sta-358-seo-geo-hardening` (showcase)
SCOPES: showcase
ENVIRONMENT: **a local production build first, then production after the deploy.** Every case except SX-29 to SX-31 is an anonymous `curl` read, so nothing here writes data. No migration and no backend change. The build reads the plan catalog from the dev backend; SX-30 signs in with a dev fixture account and runs on dev only.

# SEO and indexing test pass (crawler view)

Covers what a search engine or an AI assistant reads without running
JavaScript: status codes and redirects, robots directives, canonicals and
hreflang, structured data, prices, titles, and the machine files (sitemap,
robots.txt, llms.txt, feeds, the IndexNow key, icons and share images). Almost
every case is a `curl` command, because DevTools shows the page after
JavaScript has run, which is exactly what the crawlers this pass protects never
see.

Work top to bottom. Start with SX-01: `scripts/seo-smoke.ts` automates the
core of this pass, and the cases after it are its manual, diagnosable form
plus everything it does not check. Merchant enrolment pages are covered in
`public-urls.md` (SU-04 to SU-06), because they need a dev shop.

---

## SETUP: Before you start

Every case runs against a local production build, then again against
`https://stampeo.app` after the deploy. Nothing here touches production data:
on production every case is a read, and SX-30 is skipped.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| Local production build | `cd showcase && bun run build && bun start -p 3458` then `http://localhost:3458` | The main target. Any free port works (3000 is `web/`, 3001 the showcase dev server). Build in a checkout or worktree whose dev server is **not** running: `bun run build` clobbers `.next` under a live `next dev`. |
| Production | `https://stampeo.app` | After the deploy. Cloudflare sits in front (STA-379) and pages are cached up to 300 s (R3). Redirect `Location`s come back absolute (`https://stampeo.app/...`): compare the path. |
| Smoke test | `bun scripts/seo-smoke.ts <base>` from `showcase/` | 72 crawler-view checks; CI runs it after `bun run build` with no backend (prices from the fallback ladder, no Offers). |
| Plan catalog | `https://api.dev.stampeo.app/public/plans?currency=eur` (and `usd`) | Where the build reads prices (`NEXT_PUBLIC_API_URL` in `showcase/.env.local`; `api.dev.stampeo.app` is the local backend container). If it is unreachable the pages use the baked ladder, which today has the same amounts, and the structured data drops its Offers (SX-18). |
| Dev host | `https://showcase.dev.stampeo.app` | Tunnels to `next dev` (`bun run publicdev`). Only SX-30 uses it. `next dev` compiles on demand and sends dev caching headers, so it proves nothing for the header cases. |
| Helpers | the block below | Paste once per terminal. Every command below uses them and `$B`. They work in bash and zsh with the system `curl`, `grep` and `python3`. |

```bash
B=http://localhost:3458     # or B=https://stampeo.app after the deploy
hop()  { curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "$@"; }   # status and Location
hdr()  { curl -s -o /dev/null -D - "$@"; }                                 # status line and headers
tags() { curl -s "$@" | grep -oE '<title>[^<]*</title>|<meta name="(robots|description)"[^>]*>|<link rel="(canonical|alternate)"[^>]*>|<meta property="og:[a-z_:]+"[^>]*>'; }
ld()   { curl -s "$@" | grep -oE '<script type="application/ld\+json">[^<]*</script>' | sed -E 's#</?script[^>]*>##g'; }
vis()  { curl -s "$@" | python3 -c 'import sys,re,html; h=re.sub(r"(?s)<(script|style)\b.*?</\1>","",sys.stdin.read()); print(re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",h))))'; }
```

`tags` prints the head lines a crawler indexes (Next writes the hreflang
attribute as `hrefLang`). `ld` prints one structured-data block per line. `vis`
prints the visible text: scripts are removed, because every English page
carries the whole English message catalog inside its scripts, and a raw `grep`
on the HTML finds words no reader sees.

Inside a table cell, a backslash before a pipe (`\|`) is only the markdown
escape. Copy the command from the rendered page, or drop the backslash.

### Accounts

**None, except SX-30.** Every other case is an anonymous crawler with no
cookie. SX-30 signs in on dev as `driss@lustre.seed.stampeo.app` (a seeded dev
fixture, admin of Lustre) with the fixture password `StampeoSeed!2026`. Never
use a real person's account, and never run SX-30 on production.

### Reset recipes

| ID | Recipe |
|---|---|
| R1 | **Serve a fresh build** (before SX-01, and after any code change): stop the running `bun start` (Ctrl-C), then `bun run build && bun start -p 3458`, and wait until `hop $B/robots.txt` prints `200`. A built server never picks up source edits. If it never answers, stop the run: nothing in this runbook can be judged. |
| R2 | **No language state.** `curl` sends no cookie unless a case adds `-H "Cookie: ..."`. Never pass `-b`/`-c` cookie jars in this runbook. In a browser, delete `NEXT_LOCALE` (Application > Cookies) or use a private window. |
| R3 | **Production caches.** Pages are rebuilt at most every 300 s and Cloudflare may hold a copy. After a deploy, wait 5 minutes before calling a page stale. Appending `?qa=<random>` bypasses Cloudflare's copy, not Next's. |
| R4 | **Forge or remove the session hint** (browser console): `document.cookie = "sb-<ref>-auth-token=qa; path=/"`, then reload. `<ref>` is the first label of the build's `NEXT_PUBLIC_SUPABASE_URL` (dev `ysdpjxzldqwlmhlwzdaq`, prod `rygjkpuiyinekdwmsont`). Remove it with the same line plus `; max-age=0`. The cookie only changes which buttons the Header shows: it signs nobody in. |

### Known state before you start

- **New runbook (STA-358), first run.** Written against a local production
  build of `feat/sta-358-seo-geo-hardening` at `903dfd5` on 2026-10-09, with
  the dev backend reachable. Every curl case was dry-run there with the system
  `grep` while writing, and the smoke test passed 33/33. The browser cases
  (SX-29 to SX-31) and the production run have not been run.
- **The smoke test now has 72 checks.** It was extended after that run (the
  table below lists each) and passes on a build that reads the dev backend and
  on one built with the CI placeholder environment, where the structured data
  carries no Offers and `Offers …` accepts that.
- **SX-04 fails on `903dfd5`.** The proxy sets `Vary: Accept-Language, Cookie`
  on both answers at `/`, but on the 200 (the French homepage) Next replaces it
  with its own `Vary: rsc, next-router-state-tree, …, Accept-Encoding`, next to
  `Cache-Control: s-maxage=300`. The 307 is correct (SX-03). Reported to the
  coordinator. Until it is fixed, expect SX-04 to fail and keep `/` out of any
  shared cache (STA-379).
- **Blog post titles are outside the 60-character rule.** The title test
  (`lib/seo/metadata-copy.test.ts`) covers the catalog pages only. A post's title
  is its MDX frontmatter plus " | Stampeo", and 31 of the 33 posts run past 60
  characters. SX-26 checks catalog pages only. The one-brand rule holds
  everywhere, posts included. This is an open question for the coordinator,
  not a failure of this pass.
- **The French homepage's share image takes one redirect.** `/` advertises
  `https://stampeo.app/fr/opengraph-image?<hash>`, which 307s to
  `/opengraph-image`. Pages that set their own OpenGraph (SX-22) point
  straight at the image. This is known, and it is not a failure of SX-21 or
  SX-22.
- **What the smoke test covers, and where to look when one of its checks
  fails:**

  | Smoke check | Case |
  |---|---|
  | `JSON-LD <page>` (6 pages) | SX-16 |
  | `Prices <page>` (`/`, `/pricing`, `/en/pricing`, `/us/pricing`, `/us`) | SX-19 |
  | `/us links to /us/pricing, never /en/us/pricing` | SX-27, SX-08 |
  | `/us sector cards show $10, and no € anywhere` | `us-market-landing.md` (the sector cards); no case here |
  | `Offers /pricing are in EUR`, `Offers /us/pricing are in USD` | SX-18 |
  | `Title <page>` (8 pages: the six market pages, `/privacy`, `/terms`) | SX-26 (its block lists catalog pages, not the legal pages) |
  | `Canonical <page>` (6 pages) | SX-12 |
  | `Sitemap: every URL answers 200, is its own canonical and is indexable` | SX-12 |
  | `Private page <path>` (5 pages) | SX-11 |
  | `Junk paths /month /mo /mois /mes stay 404` | SX-10 |
  | `hreflang <page>` (`/`, `/en`, `/us`) | SX-14 |
  | `hreflang <page>` (`/pricing`, `/us/pricing`) | SX-13 |
  | `hreflang <page>` (the two coffee-shop posts) | SX-15 |
  | `RSS link <page>` (4 pages) | SX-25 |
  | `OpenGraph <page>` (5 pages, each `og:image` fetched) | SX-22 |
  | `Article image <post>` (2 posts) | SX-21 |
  | `Footer links and no hidden header nav <page>` (3 pages) | SX-27 |
  | `At most 2 font preloads on /` | SX-32 |
  | `Blog header …` (2 posts), `Breadcrumb …` | none: smoke only |
  | `Redirect / (en-US) → 307 /en …` | SX-03 |
  | `French deep URL … no NEXT_LOCALE cookie` | SX-02 |
  | `Redirect /en/us/pricing`, `/founding-partner`, `/en/blog/carte-fidelite-cafe` | SX-08, SX-09, SX-07 |
  | `Icon /icon-192.png`, `/icon-512.png` | SX-21 |
  | `IndexNow key file is served and holds the key` | SX-24 |
  | `llms.txt has a US section`, `robots.txt …`, `sitemap.xml answers 200` | SX-23, SX-20, SX-12 |

- **Not covered by the smoke test:** the French 200 at `/` (SX-04), the
  callback language (SX-05), most of the redirect table (SX-06 to SX-10),
  noindex on merchant pages (`public-urls.md` SU-04 to SU-06) and on the demo
  wallet page, the sitemap's per-entry hreflang clusters (SX-12), the
  hreflang of the other locales and posts (SX-13 to SX-15), what the
  structured data says (SX-17), llms.txt facts (SX-23), the IndexNow ping and
  its soft failure (SX-24), the feeds themselves and `/feed.xml` (SX-25), the
  supabase-js split and the signed-in Header (SX-28 to SX-31), and image sizes
  (SX-32).
- **Not covered by this runbook at all:**
  - The visual share preview. After the deploy, paste `/us` and a blog post
    into a share-preview debugger.
  - The Google and Apple sign-in round trip, which needs a human with a real
    provider account. Its language fallback is unit-tested
    (`lib/routing/auth-callback-locale.test.ts`) and SX-05 covers the redirect.
  - Search Console URL Inspection on `/us`, resubmitting the sitemap, and the
    Bing Webmaster import. Those are Harry's manual steps (plan, Verification
    6 and 7).
  - The region swap after hydration. That is `region-pricing.md`.

---

## SX-A: The automated guard

### SX-01: The smoke test passes against the build [CORE]

| Field | Content |
|---|---|
| WHY | CI runs this test after every build. It covers the core of the crawler view in one command, so a FAIL here names the area to open first. |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | 1. R1. 2. From `showcase/`: `bun scripts/seo-smoke.ts $B` |
| EXPECT | The output ends with `72 passed, 0 failed`. You do NOT see a `FAIL` line, and you do NOT see `request failed` (the server is down or `$B` is wrong). On a FAIL, report SX-01, then run the case its check maps to (Known state) before anything else. |
| RESET | R1 if the build is older than the code under test. |

---

## SX-B: Language routing

Only `/` follows the visitor's language. Every other URL is served in the
language its path names. This section protects the audit's first finding:
French URLs used to 404 for Google's English crawler.

### SX-02: A deep URL is served in its own language to every browser, with no redirect and no cookie [BLOCKER]

| Field | Content |
|---|---|
| WHY | Google crawls with an English `Accept-Language`. A French post used to send it a 307 to `/en/blog/<french-slug>`, which is a 404. Writing `NEXT_LOCALE` on a deep page also switched the visitor's later pages, merchant QR pages included, into that language. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. For each of `en-US`, `es-ES`, `pl-PL`: `hdr -H "Accept-Language: <lang>" $B/blog/carte-fidelite-wallet` 2. `curl -s -H "Accept-Language: en-US" $B/blog/carte-fidelite-wallet` and find `<html lang=`. 3. `hdr -H "Accept-Language: fr-FR" $B/en/pricing`, then `hdr -H "Accept-Language: en-US" $B/pricing` |
| EXPECT | Every response is `200`, with no `location:` header and no `set-cookie: NEXT_LOCALE`. Step 2 shows `<html lang="fr">`. In step 3 the path decides: `/en/pricing` is English and `/pricing` is French. You do NOT see a 307, and you do NOT see a `NEXT_LOCALE` cookie on any of them. |
| RESET | R2 |

### SX-03: `/` still sends each visitor to their language, and its redirect is never cached [BLOCKER]

| Field | Content |
|---|---|
| WHY | `/` is the one URL with no language of its own, so it still negotiates. Its 307 depends on the visitor: a shared cache that stored one would send everybody to the first visitor's language. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `hdr -H "Accept-Language: en-US,en;q=0.9" $B/` 2. `hdr -H "Accept-Language: pl-PL" $B/` 3. `hdr -H "Accept-Language: en-US" -H "Cookie: NEXT_LOCALE=es" $B/` 4. `hdr -H "Accept-Language: fr-FR" $B/` 5. `hdr $B/` (no language at all, as Googlebot asks) |
| EXPECT | Step 1: `307`, `location: /en`, `vary: Accept-Language, Cookie`, `cache-control: no-store`. Step 2: the same, to `/pl`. Step 3: `307` to `/es`, because the cookie beats the browser. Steps 4 and 5: `200` French, with no `location`. Step 5 may carry `set-cookie: NEXT_LOCALE=fr`: `/` is the only URL whose answer writes it, and only for a browser language the site does not serve (the language switcher writes it in the browser). You do NOT see a 301 or a 308 from `/`, which browsers would cache for good, and you do NOT see a 307 without `cache-control: no-store`. |
| RESET | R2 |

### SX-04: `/`'s French answer says it varies by language [CORE]

| Field | Content |
|---|---|
| WHY | The 200 at `/` depends on the visitor just as much as the redirect does. A cache that stores it without keying on language would serve the French homepage to the next English visitor, who should get a 307. AC2 asks for the same `Vary` on both answers. |
| DEPENDS | SX-03 |
| ACCOUNT | No session at all. |
| STEPS | 1. `hdr -H "Accept-Language: fr-FR" $B/` 2. Read `vary` and `cache-control`. |
| EXPECT | `vary` names `Accept-Language` and `Cookie`. You do NOT see a `vary` without them next to a shared-cache `cache-control` (`s-maxage=…`). **Known failing on `903dfd5`** (see Known state). |
| RESET | None. |

### SX-05: A sign-in with no language cookie continues in the browser's language [CORE]

| Field | Content |
|---|---|
| WHY | After a Google sign-in, a new user is sent to onboarding in the `NEXT_LOCALE` language. `/en/*` visits no longer write that cookie, so without the browser-language fallback an English visitor would land on the French onboarding. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `hop -H "Accept-Language: en-US" $B/auth/callback` 2. The same with `es-ES`, then `de-DE`. 3. `hop -H "Accept-Language: en-US" -H "Cookie: NEXT_LOCALE=pl" $B/auth/callback` |
| EXPECT | `307` to `…/en/onboarding?just_authed=oauth`, then `…/es/onboarding…`, then `…/fr/onboarding…` (German is not served, so French), then `…/pl/onboarding…` (the cookie wins). The host is the build's `NEXT_PUBLIC_SHOWCASE_URL`, not `$B`, so read only the path. With no `code`, the callback skips sign-in and goes straight to the onboarding redirect, which is why curl can test it. You do NOT see `/fr/onboarding` for the English browser in step 1. |
| RESET | None. |

---

## SX-C: Legacy redirects

Old URLs that Google still crawls, from Reference A in
`docs/features/STA-358/plan.md`. Each one is a single 308 served by
`next.config.ts` `redirects()` (`lib/seo/legacy-redirects.ts`), straight to a
page that answers 200.

To count hops, run `curl -sL -o /dev/null -w '%{num_redirects} %{http_code} %{url_effective}\n' -H "Accept-Language: en-US" <url>`.
It is called "the hop count" below.

### SX-06: Search Console 404s land on their page in one 308 [BLOCKER]

| Field | Content |
|---|---|
| WHY | Google reported these as 404s, and they have traffic and links behind them. One permanent hop hands their ranking to the page that replaced them. A chain or a 307 does not. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `hop $B/blog/apple-wallet-loyalty-card` 2. `hop $B/features/notificaciones` 3. `hop $B/en/en/onboarding` 4. The hop count on all three. |
| EXPECT | `308` to `/en/blog/apple-wallet-loyalty-card`, `/es/features/notificaciones-push` and `/en/onboarding`. The hop count prints `1 200 …` for each: one hop, then the page. You do NOT see a 307, a second hop, or a 404 at the end. |
| RESET | None. |

### SX-07: A post asked for under the wrong locale goes to the locale that has it, in both directions [CORE]

| Field | Content |
|---|---|
| WHY | The table lists 12 URLs by hand. The derived rules cover every post: an English or Spanish post asked for without its prefix, and a French post asked for under `/en` or `/es`. Both shapes used to 404. |
| DEPENDS | SX-02 |
| ACCOUNT | No session at all. |
| STEPS | 1. `hop $B/blog/loyalty-card-without-app` 2. `hop $B/blog/tarjeta-fidelidad-sin-app` 3. `hop $B/es/blog/carte-fidelite-wallet` 4. `hop $B/en/blog/carte-fidelite-cafe` 5. The hop count on all four. |
| EXPECT | `308` to `/en/blog/loyalty-card-without-app`, `/es/blog/tarjeta-fidelidad-sin-app`, `/blog/carte-fidelite-wallet` and `/blog/carte-fidelite-cafe`. The hop count is `1 200` for every one, even with the English browser on the French destinations: after landing, nothing bounces the visitor by language (SX-02). You do NOT see a loop, and you do NOT see a French slug under `/en/` as a destination. |
| RESET | None. |

### SX-08: Locale-prefixed pilots and doubled prefixes lose the extra segment in one hop [CORE]

| Field | Content |
|---|---|
| WHY | `/en/us/pricing` answered 200 as a copy of `/us/pricing`, and the Header on `/us` linked to it, so Google saw two US pricing pages. A doubled prefix is what a broken relative link produces. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | `hop` on each: `$B/en/us`, `$B/en/us/pricing`, `$B/es/uk`, `$B/pl/us/pricing`, `$B/es/es/pricing`, `$B/fr/fr/pricing`, `$B/en/en`. |
| EXPECT | `308` to `/us`, `/us/pricing`, `/uk`, `/us/pricing`, `/es/pricing`, `/pricing` and `/en`, and each destination answers `200` to `hop`. You do NOT see a 200 on any source URL (that would be a duplicate page), and you do NOT see `/en/us…` as a destination. |
| RESET | None. |

### SX-09: The founding routes go to pricing in one 308 [CORE]

| Field | Content |
|---|---|
| WHY | The founding programme closed on 2026-08-04, but its URLs still have backlinks. Each must pass them to pricing in one hop. The page used to render first and then redirect. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `hop` on `$B/programme-fondateur`, `$B/founding-partner`, `$B/en/programme-fondateur`, `$B/en/founding-partner`. 2. `hop $B/es/founding-partner` |
| EXPECT | Step 1: `308` to `/pricing`, `/pricing`, `/en/pricing` and `/en/pricing`. Step 2: `308` to `/es/pricing`, sent by the page itself, still one hop. You do NOT see a 307 or a founder page, and none of these URLs is in the sitemap (SX-12). |
| RESET | None. |

### SX-10: Junk stays 404, and the Spanish post Search Console listed stays 200 [CORE]

| Field | Content |
|---|---|
| WHY | A redirect claims that one page replaced another. These URLs never had content. Sending them to the homepage would be a soft 404, which Search Console flags. The two post slugs are articles not yet written (STA-359): they must 404 until they exist. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `hop` on `$B/month`, `$B/mo`, `$B/mois`, `$B/mes` 2. `hop $B/es/blog/tarjeta-sellos-digital`, then `hop $B/blog/tarjeta-fidelidad-restaurante` 3. `hop $B/_next/static/media/797e433ab948586e-s.p.08e28id.o-okb.woff2` 4. `hop $B/es/blog/tarjeta-fidelidad-sin-app` |
| EXPECT | Steps 1 to 3: `404`, with no `Location`. Step 4: `200`. You do NOT see any of them redirect, to the homepage or anywhere else. |
| RESET | None. |

---

## SX-D: What may be indexed

### SX-11: Private routes are noindex, nofollow, and claim no canonical [BLOCKER]

| Field | Content |
|---|---|
| WHY | These pages are reached mid-signup or from an email link, and the demo wallet URL carries a token. A search result for any of them is a dead end at best and a leaked token at worst. They also used to inherit the homepage's canonical and hreflang from the layout, which told Google "this page is the homepage". |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | `tags` on each: `$B/login`, `$B/en/login`, `$B/reset-password`, `$B/email-preferences`, `$B/onboarding`, `$B/en/onboarding`, `$B/en/demo/wallet-select/qa-token-358`. |
| EXPECT | Each prints `<meta name="robots" content="noindex, nofollow"/>`. You do NOT see a `rel="canonical"` or a `hrefLang` line on any of them, and you do NOT see `index, follow`. |
| RESET | None. |

### SX-12: The sitemap lists only indexable, self-canonical pages, each with its own cluster [CORE]

| Field | Content |
|---|---|
| WHY | The sitemap asks Google to index every URL in it. Listing a private route, a redirect source, a noindex page, or a URL whose canonical points elsewhere asks for something the page itself refuses. Each entry used to carry the homepage's hreflang. It now carries its own page's. |
| DEPENDS | SX-11 |
| ACCOUNT | No session at all. |
| STEPS | Run the block below. Step 3 makes one request per URL and takes about a minute. |
| EXPECT | Step 1: `94` on `903dfd5`. It grows with each new post or page. Step 2 prints nothing. Step 3 ends with `bad 0`: every URL answers 200, names itself as canonical, and is not noindex. Step 4 shows six `hreflang` links for the pricing cluster (`x-default` → `/en/pricing`, `en-US` → `/us/pricing`), not the homepage's (`x-default` → `/en`). Step 5: `33`, one `lastmod` per post: static pages carry no invented date. You do NOT see `/uk` (noindex), a private route, a founding route, `/en/us…`, or any URL that redirects. |
| RESET | None. |

```bash
# 1. how many URLs
curl -s $B/sitemap.xml | grep -c '<loc>'
# 2. anything that must not be there
curl -s $B/sitemap.xml | grep -oE '<loc>[^<]+</loc>' | grep -E 'login|onboarding|reset-password|email-preferences|demo|founding|fondateur|/uk|/en/us|/fr/'
# 3. every URL: 200, self-canonical, indexable
bad=0; n=0
while IFS= read -r p; do
  n=$((n+1))
  page=$(curl -s -w '\n%{http_code}' "$B${p:-/}")
  code=$(printf '%s\n' "$page" | tail -n 1)
  canon=$(printf '%s' "$page" | grep -oE '<link rel="canonical" href="[^"]*"' | head -n 1 | sed -E 's#.*href="https://stampeo.app([^"]*)"#\1#')
  noindex=$(printf '%s' "$page" | grep -c '<meta name="robots" content="noindex')
  [ "$code" = 200 ] && [ "${canon:-/}" = "${p:-/}" ] && [ "$noindex" = 0 ] || { echo "BAD ${p:-/} [$code] canonical=${canon:-none} noindex=$noindex"; bad=$((bad+1)); }
done < <(curl -s "$B/sitemap.xml" | grep -oE '<loc>[^<]+</loc>' | sed -E 's#</?loc>##g; s#^https://stampeo.app##; s#/$##')
echo "checked $n, bad $bad"
# 4. one entry's own cluster
curl -s $B/sitemap.xml | grep -A8 '<loc>https://stampeo.app/us/pricing</loc>'
# 5. dates only where they are true
curl -s $B/sitemap.xml | grep -c '<lastmod>'
```

---

## SX-E: hreflang clusters

A cluster only works when every page in it lists the same set of URLs.
Google ignores an annotation that the other page does not return.

### SX-13: Every pricing page, `/us/pricing` included, declares one shared cluster [CORE]

| Field | Content |
|---|---|
| WHY | `/us/pricing` quotes dollars and must rank for US searches without competing with `/en/pricing`. That only works if every pricing page names the same URLs, `en-US` included. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | `tags` on `$B/pricing`, `$B/en/pricing`, `$B/es/pricing`, `$B/pl/pricing`, `$B/us/pricing` and `$B/uk/pricing`. Read the `canonical` and `hrefLang` lines. |
| EXPECT | All six list the same six alternates: `x-default` → `/en/pricing`, `fr` → `/pricing`, `en` → `/en/pricing`, `es` → `/es/pricing`, `pl` → `/pl/pricing`, `en-US` → `/us/pricing`. Each page's canonical is itself, and `/uk/pricing` is also `noindex, follow`. You do NOT see `en-GB` (the UK page is not indexable), `/en/us/pricing`, or a page whose list differs. |
| RESET | None. |

### SX-14: `x-default` is English in every cluster [CORE]

| Field | Content |
|---|---|
| WHY | 68% of organic visitors read English, so English is the page for a language we do not serve. `x-default` used to point at French everywhere except the homepage. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | `tags` on `$B/`, `$B/es`, `$B/features/notifications-push`, `$B/programme-fidelite`, `$B/contact`, `$B/about`, `$B/changelog`, `$B/blog`. Read the `x-default` line. |
| EXPECT | In order: `/en`, `/en`, `/en/features/push-notifications`, `/en/loyalty-programs`, `/en/contact`, `/en/about`, `/en/changelog`, `/en/blog`. You do NOT see an `x-default` pointing at an unprefixed French URL on any of these pages. A blog post with no English version is the one exception (SX-15). |
| RESET | None. |

### SX-15: Translated posts name each other, and untranslated posts name nobody [CORE]

| Field | Content |
|---|---|
| WHY | Translated posts used to declare no hreflang, so the French and English versions competed as unrelated pages for the same searches. A pair declared on one side only is ignored. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `tags $B/blog/carte-fidelite-cafe` and `tags $B/en/blog/coffee-shop-loyalty-card` 2. `tags` on `$B/blog/carte-fidelite-sans-application`, `$B/en/blog/loyalty-card-without-app`, `$B/es/blog/tarjeta-fidelidad-sin-app` 3. `tags $B/blog/google-wallet-carte-fidelite` and `tags $B/es/blog/google-wallet-tarjeta-fidelidad` 4. `tags $B/blog/carte-fidelite-wallet` |
| EXPECT | Step 1: both pages print the same three lines: `x-default` and `en` → `/en/blog/coffee-shop-loyalty-card`, `fr` → `/blog/carte-fidelite-cafe`. Each canonical is the page itself. Step 2: all three print the same four lines (`fr`, `en`, `es`, and `x-default` → the English post). Step 3: no English version exists, so `x-default` → `/blog/google-wallet-carte-fidelite`, with `fr` and `es` on both pages. Step 4: no `hrefLang` line, because the post is untranslated. You do NOT see a pair where one side leaves out the other, or an hreflang to a URL that does not answer 200. |
| RESET | None. |

---

## SX-F: Structured data and prices in the server HTML

### SX-16: Structured data is in the raw HTML as valid JSON [BLOCKER]

| Field | Content |
|---|---|
| WHY | Structured data used to be injected by a script after load, so crawlers that do not run JavaScript, and most AI assistants, never saw it. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | Run the block below. |
| EXPECT | Exactly these types, page by page: `/` and `/us` → `Organization WebSite SoftwareApplication FAQPage`. `/pricing` and `/us/pricing` → `SoftwareApplication FAQPage`. `/en/blog/coffee-shop-loyalty-card` → `Article BreadcrumbList FAQPage` (the `FAQPage` only appears when the post has FAQs). `/en/blog` → `CollectionPage`. You do NOT see a Python traceback (a block that is not valid JSON) or a page with nothing after its path (no structured data in the HTML). |
| RESET | None. |

```bash
for p in / /us /pricing /us/pricing /en/blog/coffee-shop-loyalty-card /en/blog; do
  printf '%-36s' "$p"
  ld "$B$p" | while IFS= read -r j; do
    printf '%s' "$j" | python3 -c 'import json,sys; print(json.load(sys.stdin)["@type"], end=" ")'
  done
  echo
done
```

### SX-17: The entities link to each other and name the real founder, logo and profiles [CORE]

| Field | Content |
|---|---|
| WHY | Search engines join the blocks by `@id`: the site, the software and every article point at one Organization. A logo that 404s, or a `sameAs` to a profile that does not exist, weakens the entity Google builds for Stampeo. |
| DEPENDS | SX-16 |
| ACCOUNT | No session at all. |
| STEPS | 1. `ld $B/ \| python3 -m json.tool --json-lines` (one block after another) 2. `ld $B/en/blog/coffee-shop-loyalty-card \| python3 -m json.tool --json-lines` 3. `hop` on the Organization `logo` and the Article `image` (swap `https://stampeo.app` for `$B`). 4. From `showcase/`: `grep -h '^author:' content/blog/*/*.mdx \| sort \| uniq -c` |
| EXPECT | Organization: `@id` `https://stampeo.app/#organization`, `logo` `https://stampeo.app/icon-512.png`, `founder` Harry Viennot with `url` `https://stampeo.app/about`, and `sameAs` with exactly the five profiles the site already links (x.com, LinkedIn, Instagram, the App Store app, the Play Store app). WebSite: `@id` `…/#website`, `publisher` `{"@id": "…/#organization"}`. Article: `author` Harry Viennot, `publisher` `{"@id": "…/#organization"}`, `image` `https://stampeo.app/en/blog/coffee-shop-loyalty-card/opengraph-image`. Step 3: `200` twice. Step 4: `33 author: "Harry Viennot"`. You do NOT see a `potentialAction` (SearchAction) or `speakable` on the WebSite, an author other than Harry Viennot, or a logo or image that does not answer 200. |
| RESET | None. |

### SX-18: Pricing pages state Offers in their own market's currency [CORE]

| Field | Content |
|---|---|
| WHY | Offers are read per URL and indexed for weeks: `/us/pricing` must say USD and every other pricing page EUR, whatever the visitor's region. The FAQ answers must be interpolated, because a literal `{starterPrice}` has shipped to Google before. |
| DEPENDS | SX-16 |
| ACCOUNT | No session at all. |
| STEPS | Run the block below. |
| EXPECT | `/`, `/pricing`, `/en/pricing`, `/es/pricing`, `/pl/pricing` and `/uk/pricing` → `EUR20 EUR192 EUR40 EUR384 EUR60 EUR576`. `/us` and `/us/pricing` → `USD49 USD468 USD79 USD756 USD119 USD1140`. Every page also prints `FAQPage`. The last line prints `tokens: 0`. If the build could not reach the backend, every page prints `no offers` instead. That is correct: a stale price must not be indexed. Check the build log, then R1 with the backend up. You do NOT see USD on a non-US page, EUR on a US page, or a `tokens:` count above 0. `/` and `/us` are also checked in `region-pricing.md` RP-09. |
| RESET | None. |

```bash
for p in / /pricing /en/pricing /es/pricing /pl/pricing /uk/pricing /us /us/pricing; do
  printf '%-12s' "$p"
  ld "$B$p" | python3 -c '
import json, sys
for line in sys.stdin:
    d = json.loads(line)
    if d["@type"] == "SoftwareApplication":
        print(" ".join(o["priceCurrency"] + o["price"] for o in d.get("offers", [])) or "no offers", end="  ")
    if d["@type"] == "FAQPage":
        print("FAQPage", end="")
print()'
done
echo "tokens: $(for p in / /us /pricing /us/pricing; do ld "$B$p"; done | grep -oE '\{[a-zA-Z]+\}' | wc -l | tr -d ' ')"
```

### SX-19: Prices and the trial length are in the raw HTML [BLOCKER]

| Field | Content |
|---|---|
| WHY | Every price and trial length used to be a skeleton until JavaScript ran, so crawlers, ad reviewers and AI assistants read a pricing page with no price. The server now renders the URL's own market. The visitor's region swaps in after hydration, which `region-pricing.md` covers. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | Run the block below. The numbered comments are the lines the EXPECT refers to. |
| EXPECT | Line 1 includes `20 €`, `40 €`, `60 €`, `16 €`, `32 €`, `48 €`, `192 €`, `384 €` and `576 €`, the catalog's ladder (`/pricing` is French, so the symbol comes after the number). Line 2: `1`. Line 3 includes `$49`, `$79`, `$119`, `$39`, `$63`, `$95`, `$468`, `$756` and `$1,140`. Lines 4 and 5: `1`. Line 6: `/us €:0 30-day:0` and `/us/pricing €:0 30-day:0`. Line 7: `/pricing $:0`. Line 8: `0 0 0 0`. You do NOT see a `€` amount on either US page, a `$` amount on `/pricing`, a 30-day trial on a US page, or `animate-pulse` (a loading skeleton) anywhere. |
| RESET | None. |

```bash
vis $B/pricing | grep -oE '[0-9]+[^0-9a-z]{0,3}€' | sort -u | tr '\n' ' '; echo                 # 1
vis $B/pricing | grep -o 'Essai gratuit de 30 jours' | head -n 1 | wc -l | tr -d ' '              # 2
vis $B/us/pricing | grep -oE '\$[0-9][0-9,]*' | sort -u | tr '\n' ' '; echo                      # 3
vis $B/us/pricing | grep -o '14-day free trial' | head -n 1 | wc -l | tr -d ' '                  # 4
vis $B/us | grep -o '14 days free' | head -n 1 | wc -l | tr -d ' '                               # 5
for p in /us /us/pricing; do echo "$p €:$(vis $B$p | grep -o '€' | wc -l | tr -d ' ') 30-day:$(vis $B$p | grep -oE '30-day free trial|30 days free' | wc -l | tr -d ' ')"; done   # 6
echo "/pricing \$:$(vis $B/pricing | grep -oE '\$[0-9]' | wc -l | tr -d ' ')"                     # 7
for p in /pricing /us/pricing /us /en; do printf '%s ' "$(curl -s $B$p | grep -o animate-pulse | wc -l | tr -d ' ')"; done; echo   # 8
```

---

## SX-G: Machine files, images and feeds

### SX-20: robots.txt lets share images through and keeps private paths out [CORE]

| Field | Content |
|---|---|
| WHY | robots.txt used to block `/*opengraph-image*`, so Google Images could not fetch the share images, and the Article structured data pointed at images crawlers could not open. The private rules must stay in their three-line form: a bare `Disallow: /auth` would also hide a shop slugged `authentic-cafe`. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `curl -s $B/robots.txt \| grep -c opengraph` 2. `curl -s $B/robots.txt \| grep -E '^(User-agent\|Sitemap):'` 3. `curl -s $B/robots.txt \| grep -cx 'Disallow: /auth'` 4. `curl -s $B/robots.txt \| grep -m3 'Disallow: /login'` 5. `hop $B/blog/carte-fidelite-cafe/opengraph-image` |
| EXPECT | Step 1: `0`. Step 2: eight `User-agent` lines (`*`, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Googlebot, Bingbot), then `Sitemap: https://stampeo.app/sitemap.xml`. Step 3: `0`. Step 4: `/login/`, `/login$`, `/login?`. Step 5: `200`. You do NOT see `Disallow: /*opengraph-image*`, a bare `Disallow: /auth`, or a missing `Sitemap:` line. |
| RESET | None. |

### SX-21: Icons, the manifest and share images answer 200 [CORE]

| Field | Content |
|---|---|
| WHY | The Organization logo and the manifest point at `/icon-512.png` and `/icon-192.png`, which used to 404, and every Article points at its share image. A structured-data image that 404s invalidates the rich result. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. For `/icon-192.png`, `/icon-512.png`, `/icon.svg`, `/manifest.webmanifest`, `/en/opengraph-image`, `/opengraph-image`, `/en/blog/coffee-shop-loyalty-card/opengraph-image`, `/es/blog/tarjeta-fidelidad-sin-app/opengraph-image`: `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' $B<path>` 2. `curl -s $B/manifest.webmanifest` 3. `curl -s $B/ \| grep -c og-image.png` |
| EXPECT | Step 1: `200 image/png` for the two icons and the four share images, `200 image/svg+xml` for `/icon.svg`, and `200 application/manifest+json`. Step 2 lists `/icon-192.png` (192x192) and `/icon-512.png` (512x512). Step 3: `0`. `/og-image.png` still 404s, but nothing references it any more. You do NOT see a 404, or a `text/html` content type where an image was expected (an error page served as 200). |
| RESET | None. |

### SX-22: Market, pricing and contact pages carry a full OpenGraph block [CORE]

| Field | Content |
|---|---|
| WHY | A page that sets its own `openGraph` replaces the layout's block, image included. `/us` used to share as the generic English homepage, and several pages lost their image. A link pasted into WhatsApp or LinkedIn should show the page's own title and an image. |
| DEPENDS | SX-21 |
| ACCOUNT | No session at all. |
| STEPS | 1. `tags` on `$B/us`, `$B/uk`, `$B/us/pricing`, `$B/uk/pricing`, `$B/pricing`, `$B/en/pricing`, `$B/contact`, `$B/en/contact`. Read the `og:` lines. 2. `hop` on the `og:image` path of `/us` and of `/pricing` (swap `https://stampeo.app` for `$B`). |
| EXPECT | Each page has `og:title` (its own title, without " \| Stampeo"), `og:description`, `og:url` (equal to its canonical), `og:site_name` Stampeo, `og:type` website, `og:locale` (`en_US` on `/us…` and `/en/…`, `en_GB` on `/uk…`, `fr_FR` on `/pricing` and `/contact`), and `og:image` with width 1200 and height 630. English pages use `…/en/opengraph-image?<hash>` and French ones `…/opengraph-image?<hash>`. `/us` reads "Digital Punch Cards for Apple &amp; Google Wallet". Step 2: `200` twice. You do NOT see a page without `og:image`, `/us` sharing the `/en` homepage title, or "Stampeo" twice in an `og:title`. |
| RESET | None. |

### SX-23: llms.txt states the plan facts, both price ladders and only sourced figures [CORE]

| Field | Content |
|---|---|
| WHY | AI assistants quote llms.txt as fact. It used to claim things the backend does not do: Starter stamps-only, scheduling on Growth, geofencing on sale. It also quoted figures with no source, and it had no US prices at all. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `hdr $B/llms.txt` 2. `curl -s $B/llms.txt \| sed -n '/^## Plans/,/^## FAQ/p'` 3. `curl -s $B/llms.txt \| grep -nE '[0-9]+ ?%'` 4. `curl -s $B/llms.txt \| grep -niE 'stamps-only\|geofencing \(Pro\)\|3 free\|45 ?%\|95 ?% of users\|\{[a-zA-Z]+\}'` |
| EXPECT | Step 1: `200`, `content-type: text/plain; charset=utf-8`. Step 2, Plans: Starter "stamps or points, 2 team members (owner + 1), no broadcasts, single location, basic analytics". Growth "… 8 broadcasts per month, 3 custom milestones per program, single location, basic analytics". Pro "… scheduled broadcasts … multiple locations, per-location analytics, basic and advanced analytics, scheduled card designs, geofencing notifications (coming soon)". Pricing has `### Europe and rest of the world (EUR)`: €20 / €40 / €60 a month, yearly €16 / €32 / €48 billed €192 / €384 / €576, 30-day trial. It also has `### United States (USD)`: $49 / $79 / $119, yearly $39 / $63 / $95 billed $468 / $756 / $1,140, 14-day trial, links to `/us` and `/us/pricing`. Step 3: every line either is "Yearly billing is 20% off" or ends with "(Stampeo data, 86 businesses, Feb–Oct 2026)". Step 4 prints nothing. You do NOT see a plan fact that contradicts `lib/plans/plan-facts.ts`, a percentage without its source line, or a literal `{…}` token. |
| RESET | None. Amounts come from the plan catalog at request time and refresh every 300 s. On a price mismatch, check the catalog first. |

### SX-24: The IndexNow key is served, and the ping fails soft [EDGE]

| Field | Content |
|---|---|
| WHY | Bing, Copilot, ChatGPT Search and DuckDuckGo use IndexNow to learn about changed pages within hours. Their API checks the key file on our host before accepting a submission. The workflow must never be what fails a deploy. |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | 1. `curl -s -D - $B/a54facc9a2c4dbf7f5170fa9e04b6dbc.txt` 2. From `showcase/`: `bun test scripts/indexnow.test.ts` 3. After the merge to `main`: GitHub > Actions > "IndexNow Submit" > the run for that push > the `bun scripts/indexnow.ts` step. |
| EXPECT | Step 1: `200`, `content-type: text/plain`, and a body of exactly `a54facc9a2c4dbf7f5170fa9e04b6dbc` (32 hex characters, the file's own name). Step 2: green. Step 3: the log ends with `IndexNow response: 200` or `202`. A `403` or `422` means the key or the host is wrong: report it. The job is `continue-on-error`, so the deploy stays green either way. You do NOT see the key file 404 or answer HTML. **Do not run `bun scripts/indexnow.ts` by hand:** it submits the production sitemap to the real API. |
| RESET | None. |

### SX-25: One feed per blog locale, `/feed.xml` moves permanently, and there is no empty Polish feed [CORE]

| Field | Content |
|---|---|
| WHY | An empty Polish feed advertised a blog with nothing in it. `/feed.xml` answered as a duplicate of the French feed. Feed readers and some crawlers find a feed through the `<link rel="alternate">` on its blog pages. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `hop $B/feed.xml` 2. For `/feed-fr.xml`, `/feed-en.xml`, `/feed-es.xml`, `/feed-pl.xml`: `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' $B<path>` 3. `tags` on `$B/blog`, `$B/en/blog`, `$B/es/blog`, `$B/en/blog/coffee-shop-loyalty-card` and read the `type="application/rss+xml"` line. |
| EXPECT | Step 1: `308` to `/feed-fr.xml`. Step 2: `200 application/xml` three times, then `404` for Polish. Step 3: `/blog` → `feed-fr.xml`, `/en/blog` → `feed-en.xml`, `/es/blog` → `feed-es.xml`, and the English post → `feed-en.xml`. You do NOT see a 200 Polish feed, a 307 on `/feed.xml`, or a page that advertises another locale's feed. |
| RESET | None. |

---

## SX-H: Titles and the Header

### SX-26: Page titles name the brand once and fit in 60 characters [CORE]

| Field | Content |
|---|---|
| WHY | Titles used to read "… \| Stampeo \| Stampeo". Google shows about 60 characters of a title and cuts the rest, so the keyword has to come first and the brand only once. The pricing titles quote the starting price of the page's own market. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | Run the block below. |
| EXPECT | Every line starts with a length of 60 or less, then a brand count of `1`. The homepages name the category: `/` "Carte de fidélité digitale Apple & Google Wallet \| Stampeo", `/en` "Digital Loyalty Cards for Apple & Google Wallet \| Stampeo". The pricing titles quote their market: `/pricing` "… dès 20 €/mois \| Stampeo", `/us/pricing` "Digital Punch Card Pricing from $49/mo \| Stampeo". `/us` has its own title, not `/en`'s. You do NOT see a count of `2`, a length over 60, `(none)`, or a literal `{starterPrice}`. Blog posts are out of scope for the length rule (Known state). |
| RESET | None. |

```bash
for p in / /en /es /pl /us /uk /pricing /en/pricing /es/pricing /pl/pricing /us/pricing /uk/pricing \
         /about /en/about /contact /blog /en/blog /changelog /programme-fidelite /en/loyalty-programs \
         /features/notifications-push /en/features/push-notifications /es/features/notificaciones-push \
         /pl/features/powiadomienia /features/campagnes-promotionnelles; do
  curl -s "$B$p" | python3 -c 'import sys,re,html; m=re.search(r"<title>(.*?)</title>", sys.stdin.read(), re.S); t=html.unescape(m.group(1)) if m else "(none)"; print("%3d %d  %-36s %s" % (len(t), t.lower().count("stampeo"), sys.argv[1], t))' "$p"
done
```

### SX-27: The Header's server HTML offers Log in and Get started, with no placeholder [CORE]

| Field | Content |
|---|---|
| WHY | The Header used to wait for supabase-js and show a pulsing grey pill in place of its buttons. Crawlers saw no call to action, and the swap shifted the layout. The server now renders the signed-out Header for everyone, which is also what a crawler is. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | Run the block below. |
| EXPECT | `/en` and `/us` list `Loyalty`, `Pricing`, `('/en/login', 'Log in')` and `('/en/onboarding', 'Get started\xa0\xa0→')`, and the Pricing link on `/us` is `/us/pricing`. `/` and `/pricing` list `('/login', 'Se connecter')` and `('/onboarding', 'Démarrer\xa0\xa0→')`. Every line ends with `pulse: 0`. You do NOT see Dashboard or Sign out (or their French labels) in the server HTML, or a pulse count above 0. |
| RESET | None. |

```bash
for p in /en / /us /pricing; do
  printf '%-9s' "$p"
  curl -s "$B$p" | python3 -c 'import sys,re; h=sys.stdin.read(); hd=re.search(r"(?s)<header.*?</header>", h).group(0); print(re.findall(r"<a [^>]*?href=\"([^\"]+)\"[^>]*>([^<>]{2,40})</a>", hd), "pulse:", h.count("animate-pulse"))'
done
```

### SX-28: Marketing pages load no supabase-js up front; the sign-in pages do [CORE]

| Field | Content |
|---|---|
| WHY | supabase-js shipped on every page so the Header could ask whether someone was signed in, a cost every visitor and crawler paid. Only the sign-in pages need it now. A deferred prefetch after the page is idle is allowed. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | Run the block below. It downloads each page's initial scripts and looks for the supabase-js auth client. |
| EXPECT | `0 with supabase-js` on `/en`, `/pricing`, `/us` and the blog post. At least `1 with supabase-js` on `/en/login` and `/en/onboarding`: those are the controls that show the check can find it. You do NOT see a marketing page above 0, or the sign-in pages at 0 (that would mean the check is broken, not that the page is fixed). |
| RESET | None. |

```bash
for p in /en /pricing /us /blog/carte-fidelite-cafe /en/login /en/onboarding; do
  n=0; hit=0
  while IFS= read -r s; do
    n=$((n+1)); curl -s "$B$s" | grep -q GoTrueClient && hit=$((hit+1))
  done < <(curl -s "$B$p" | grep -oE '<script[^>]*src="/_next/static/[^"]+"' | grep -oE '/_next/static/[^"]+' | sort -u)
  echo "$p: $n scripts, $hit with supabase-js"
done
```

### SX-29: A session cookie swaps the Header's buttons after hydration (browser) [EDGE]

| Field | Content |
|---|---|
| WHY | The Header now reads the Supabase session cookie directly, so it no longer needs supabase-js. The cookie's name decides: a full session or one of its `.0`, `.1` chunks counts, and the code-verifier cookie left by an unfinished Google sign-in does not. |
| DEPENDS | SX-27 |
| ACCOUNT | No session at all (the cookie is forged; it signs nobody in). |
| STEPS | 1. Open `$B/en` in a private window at 1024 px wide or more, with DevTools open. 2. R4 with `sb-<ref>-auth-token`, then reload. 3. Remove it. Forge only `sb-<ref>-auth-token-code-verifier`, then reload. 4. Remove it. Forge `sb-<ref>-auth-token.0`, then reload. 5. During step 2, view the page source (Cmd+Opt+U). 6. Remove every forged cookie and focus another tab, then come back. |
| EXPECT | Step 2: right after load, the Header's right side reads Dashboard and Sign out. Log in may show for an instant first, because the server always renders the signed-out Header. Step 3: Log in and Get started. Step 4: Dashboard and Sign out. Step 5: the source still says Log in and Get started. Step 6: Log in returns, without a reload. You do NOT see a pulsing grey pill in the button slot, and the console shows no hydration error. Do NOT click Sign out with a forged cookie: SX-30 covers it with a real session. |
| RESET | R4 (remove). |

### SX-30: A real sign-in shows Dashboard, and Sign out brings Log in back (browser, dev only) [CORE]

| Field | Content |
|---|---|
| WHY | This is the whole loop with a real session. It proves the cookie the sign-in writes is the one the Header reads, and that Sign out loads supabase-js only when clicked and still clears the session. |
| DEPENDS | SX-29 |
| ACCOUNT | `driss@lustre.seed.stampeo.app` (dev fixture), password `StampeoSeed!2026`. |
| STEPS | 1. Serve this branch on the dev host: `bun run publicdev` from a checkout of the branch, after stopping any other dev server on port 3001. Its `.env.public` sets the `.stampeo.app` cookie domain. A plain local build keeps the nip.io domain from `.env.local`, so a sign-in on localhost writes no cookie the page can read. 2. On `https://showcase.dev.stampeo.app/en/login`, sign in with the fixture. 3. Open `https://showcase.dev.stampeo.app/en` in the same browser. 4. With the Network tab open, click Sign out. 5. Reload. |
| EXPECT | Step 3: Dashboard and Sign out in the Header. Step 4: a JavaScript chunk downloads at the click (supabase-js, loaded only now), then the Header returns to Log in and Get started without a reload, and `sb-ysdpjxzldqwlmhlwzdaq-auth-token` is gone from Application > Cookies. Step 5: still Log in. You do NOT see a console error, and you do NOT see Dashboard come back after the reload. |
| RESET | None. Sign-out is the reset. |

### SX-31: The sign-in pages still work, with `AuthProvider` mounted only there (browser) [CORE]

| Field | Content |
|---|---|
| WHY | `AuthProvider` used to wrap every page. It now wraps only login, reset-password and onboarding. Any other component that still calls `useAuth()` would throw on its page. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | With the DevTools console open, load `$B/en/login`, `$B/login`, `$B/en/reset-password`, `$B/en/onboarding`, then `$B/en`, `$B/pricing` and `$B/en/blog/coffee-shop-loyalty-card`. |
| EXPECT | The sign-in pages render their form (the email field, and the first onboarding step). The marketing pages render normally. You do NOT see "useAuth must be used within an AuthProvider", any other uncaught error, or a hydration warning on any of them. |
| RESET | None. |

### SX-32: Fonts and theme images are light [EDGE]

| Field | Content |
|---|---|
| WHY | Every preloaded font competes with the first paint. Geist Mono and Caveat are secondary faces and load on first use. The restaurant strip (514 KB) and the gelo cones (1.2 MB and 513 KB) were the heaviest images on the landing page. |
| DEPENDS | none |
| ACCOUNT | No session at all. |
| STEPS | 1. `curl -s $B/en \| grep -oE '<link rel="preload"[^>]*as="font"[^>]*>'` 2. For `/themes/restaurant/strip.jpg`, `/themes/gelo/cone.png`, `/themes/gelo/cone-grey.png`: `curl -s -o /dev/null -w '%{http_code} %{size_download}\n' $B<path>` |
| EXPECT | Step 1: two font preloads, the Geist latin and latin-ext files. Step 2: `200` each, the strip at 80,000 bytes or less (68,296 on `903dfd5`) and each cone at 60,000 bytes or less (22,943 and 23,485). You do NOT see four or six font preloads (Geist Mono or Caveat preloaded again), or an image over its budget. |
| RESET | None. |

---

## Execution rules (for the testing agent)

1. **Order.** Setup first (R1, then paste the helpers). Then sections top to
   bottom, and within a section, BLOCKER cases first unless DEPENDS forces
   otherwise. SX-29 to SX-31 need a browser: run them last.
2. **On BLOCKER failure:** stop the section. Cases that DEPEND on it are
   marked SKIPPED, not failed. Write a failure report, then continue with the
   other sections: no section depends on another.
3. **On CORE failure:** write a failure report, skip only its dependents,
   continue the run. SX-01 is CORE on purpose: a FAIL in the smoke output is
   reported, and the case it maps to (Known state) is how you diagnose it.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS
   with the exact command and its output, so the runbook gets fixed.
6. **After any failure:** run the case's RESET before retrying or moving on.
   After a code fix, R1: a built server never picks up an edit.
7. **Reporting:** one failure report per failed case, using
   failure-report-template.md, under `docs/features/STA-358/failure-reports/`.
   Reference cases only by ID, and paste the command with its raw output.
8. **Re-runs after fixes:** re-run the failed case, its dependents, SX-01, and
   any case listed in "Known state" as needing re-verification. Nothing else.
9. **Production run.** After the deploy, run the whole pass again with
   `B=https://stampeo.app`. Skip SX-24 step 2 (a repo test) and SX-30 (dev
   fixtures only). Where production differs from the local build on a header
   (`vary`, `cache-control`), report both outputs: Cloudflare (STA-379) sits
   in front of production and can rewrite them.
