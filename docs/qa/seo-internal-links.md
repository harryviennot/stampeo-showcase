BRANCH: fix/sta-355-showcase-internal-links
SCOPES: showcase
ENVIRONMENT: dev only. No migration, no backend change, no production touch.

# Internal Links and Indexing Test Pass

Covers every internal link the showcase authors by hand: blog call-to-action
buttons, blog prose links, and the `"link"` / `"href"` values in the message
catalogs. The area exists because these links are DATA, not code, so nothing in
the type system can check them.

Most of this pass is one command (IL-01). The browser cases exist because the
command checks what was AUTHORED, and the browser checks what was RENDERED.
Those differ precisely where the bug that opened this area lived: next-intl's
`Link` rewrites the href on its way to the page.

Work top to bottom. IL-00 first: if the guard does not run, nothing below is
trustworthy.

---

## SETUP: Before you start

Everything runs against dev. Nothing here writes to a database, so there is
nothing to reset between cases.

### Where things live

| Surface | URL / Command | Notes |
|---|---|---|
| showcase dev | `cd showcase && bun run dev` -> `http://localhost:3001` | Port 3001, not 3000. 3000 is `web/`. |
| showcase via tunnel | `https://showcase.dev.stampeo.app` | Needs `docker compose up tunnel`. Use it only when a case names it. |
| The guard | `cd showcase && bun test lib/internal-links.test.ts` | Runs offline. No server needed. |
| Full suite | `cd showcase && bun test lib` | `package.json` scopes the runner to `lib` — a test outside `lib/` silently never runs. |

### Accounts

None. Every surface in this pass is public and unauthenticated. If a case ever
needs a session, it belongs in a different runbook.

### Reset recipes

**R0: none needed.** This area is read-only: no case writes to a database, a
cookie, or the filesystem. Recorded explicitly so nobody invents a reset.

### Known state before you start

- **IL-01 through IL-05 were all failing before STA-355** and are
  fixed-pending-reverification. Root cause, in one sentence each:
  - IL-01: a locale-prefixed href was handed to next-intl's prefixing `Link`,
    so all 11 English and all 5 Spanish posts rendered `/en/en/onboarding` and
    `/es/es/onboarding`. French never showed it, being the unprefixed default
    locale.
  - IL-02, IL-05: Spanish slugs transliterated from French for articles nobody
    wrote.
  - IL-03: `/features/notificaciones` is in no map in `lib/feature-slugs.ts`,
    so the route called `notFound()`.
  - IL-04: the French feature slug was left in the Spanish catalog, so the page
    308'd before arriving.
- **IL-06 is CLOSED.** QA ran an isolated production build on 2026-09-25: it
  passed and generated all 251 static pages. The case stays in the runbook for
  future branches, but STA-355 no longer carries a build gap.
- **IL-09 failed its first run and the failure was missed.** The check grepped
  for doubled prefixes only, found none, and reported clean while `/en/` was
  308ing to `/en` on every page of the site. The case now checks response
  codes, and the recipe below does both halves. If you are re-running this
  area, trust the status code, not the link shape.
- **The guard's own blind spots are written into its header comment**
  (`lib/internal-links.ts`). Read them before concluding a green suite means a
  clean site: components, path depth below the first segment, `href={expr}`,
  reference-style markdown links and backend-authored changelog copy are all
  outside its reach. IL-09 exists because of the first of those.
- **A 404 here is not always a bug.** Three Spanish URLs are deliberately 404
  until STA-359 publishes them: `programa-fidelidad-peluqueria`,
  `tarjeta-fidelidad-cafeteria`, `tarjeta-fidelidad-restaurante`. IL-07 asserts
  nothing links to them in the meantime.
- **STA-358 (2026-10-09).** The header's hidden, `aria-hidden` copy of the
  navigation is gone. The footer's visually hidden sitemap nav is now the only
  place these links ship besides the visible menus, so IL-09 reads the footer
  alone and IL-10 (new) checks that the header block stays gone. The blog
  breadcrumb now follows the post's locale, and IL-11 (new) checks it. IL-09,
  IL-10 and IL-11 were dry-run on a local production build of
  `feat/sta-358-seo-geo-hardening` (`903dfd5`); IL-09's counts were unchanged
  (12, 12, 12, 11 and 0 failures). Not yet run on the dev server. **Targeted
  re-run:** IL-01, IL-09, IL-10, IL-11. The crawler-view checks shared by
  every page are in `seo-indexing.md`.

---

## IL: Internal link integrity

Run IL-00 first: it is the cheap, complete check, and the browser cases below
exist only to catch what it structurally cannot see. If IL-00 fails, read its
output before touching a browser; it names the file and line.

### IL-00: The guard runs and is wired into the suite [BLOCKER]

| Field | Content |
|---|---|
| WHY | `package.json` runs `bun test lib`, so a test placed outside `lib/` passes CI by never executing. This case protects against the whole area becoming decorative. |
| DEPENDS | none |
| ACCOUNT | None. |
| STEPS | 1. `cd showcase && bun test lib` 2. Read the file count in the summary line. |
| EXPECT | The summary names `lib/internal-links.test.ts` among the files run, and the suite is green. You do NOT see a passing run that omits the file, and you do NOT see `0 tests` for it. |
| RESET | None. |

### IL-01: Every authored link resolves to a real route [BLOCKER]

| Field | Content |
|---|---|
| WHY | The one check that covers all three link-bearing surfaces at once. It is the regression guard for the entire STA-355 crawl, and it reads the routes off disk, so it stays true as articles are added. |
| DEPENDS | IL-00 |
| ACCOUNT | None. |
| STEPS | 1. `cd showcase && bun test lib/internal-links.test.ts` |
| EXPECT | 16 tests pass, 0 fail. You do NOT see any entry with `problem: "double-prefix"`, `"missing-post"`, `"wrong-locale-slug"`, `"unknown-route"` or `"missing-prefix"`. |
| RESET | None. |

### IL-02: A blog CTA reaches the funnel in ONE hop, in every locale [CORE]

| Field | Content |
|---|---|
| WHY | The headline STA-355 regression, and the case IL-01 cannot prove on its own: IL-01 reads the href as AUTHORED, this reads it as RENDERED, and next-intl rewrites it in between. A locale-free href is correct in the file and wrong nowhere until the page is built. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Open `http://localhost:3001/en/blog/coffee-shop-loyalty-card`. 2. Find the orange call-to-action box near the end of the article. 3. Read the link target (hover, or inspect the anchor). 4. Click it. 5. Repeat on `/es/blog/tarjeta-fidelidad-sin-app` and on `/blog/carte-fidelite-cafe`. |
| EXPECT | The target is `/en/onboarding`, `/es/onboarding` and `/onboarding` respectively, and the click lands on the onboarding page directly. You do NOT see a doubled locale anywhere in the URL bar (`/en/en/`, `/es/es/`), and you do NOT pass through a redirect on the way. |
| RESET | None. |

### IL-03: The Spanish homepage sector cards reach a real article [CORE]

| Field | Content |
|---|---|
| WHY | Four cards pointed at Spanish articles nobody wrote. The card is a single full-bleed `Link`, so a dead target makes the ENTIRE card a 404 rather than just a small link, which is why this is CORE and not EDGE. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Open `http://localhost:3001/es`. 2. Scroll to the sector carousel (Barbería, Cafetería, Restaurante, Salón de belleza, Librería). 3. Click through all five cards, returning each time. |
| EXPECT | All five land on a page that renders an article or the loyalty-program page. The four blog destinations are distinct from each other. You do NOT see a 404, and you do NOT see a card whose label promises a sector guide that its destination does not cover (a label reading "Leer la guía para barberías" on a generic article is a failure of this case). |
| RESET | None. |

### IL-04: The Spanish feature grid reaches the right localized page [CORE]

| Field | Content |
|---|---|
| WHY | `/features/notificaciones` was a hard 404: the slug is in no map in `lib/feature-slugs.ts`, so `resolveToCanonicalSlug` returned null and the route called `notFound()`. The header and footer were always correct because they go through `getLocalizedSlug` rather than a raw catalog string, which is exactly how the bug hid in plain sight. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Open `http://localhost:3001/es`. 2. Scroll to the six-tile feature grid. 3. Click each tile. 4. Compare each URL against the same feature reached from the footer nav. |
| EXPECT | All six render a feature page, and each tile's URL is identical to the footer's URL for that feature. You do NOT see `/es/features/notificaciones` (the real slug is `notificaciones-push`), and you do NOT see any French slug under `/es/`. |
| RESET | None. |

### IL-05: A cross-link between Spanish feature pages does not redirect [CORE]

| Field | Content |
|---|---|
| WHY | This one never 404'd, which is why it survived: `/es/features/campagnes-promotionnelles` is a VALID slug in the wrong locale, so the route 308s to the Spanish one. It costs a hop and dilutes link equity, and no manual click-through would have noticed. Watch the network, not the final page. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Open devtools, Network tab, with "Preserve log" on and redirects visible. 2. Open `http://localhost:3001/es/features/notificaciones-push`. 3. Scroll to the "Difusiones y segmentación" card in the advanced section. 4. Click "Descubrir las difusiones". |
| EXPECT | Exactly one request, landing on `/es/features/difusiones-promocionales` with a 200. You do NOT see a 307 or 308 in the network log, and you do NOT see `campagnes-promotionnelles` in any request URL. |
| RESET | None. |

### IL-06: The site survives a production build [CORE]

| Field | Content |
|---|---|
| WHY | STA-355 was verified only against `next dev`. Dev compiles routes on demand and is more forgiving than `output: "standalone"`. Until this case runs once, the MDX edits are proven to render but not proven to build. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Stop any showcase dev server (check port 3001 — a running one clobbers `.next`). 2. `cd showcase && bun run build`. 3. `bun run start`. 4. Re-run IL-02 against the built server. |
| EXPECT | The build completes with no MDX compile error and prerenders all 33 blog posts. IL-02 still passes. You do NOT see a build warning naming any file under `content/blog/es/`. |
| RESET | None. Restart the dev server afterwards if someone was using it. |

### IL-07: Deliberate 404s stay unlinked [EDGE]

| Field | Content |
|---|---|
| WHY | Three Spanish URLs are meant to 404 until STA-359 publishes them. The risk is that someone "fixes" the 404 by pointing a link at an unrelated article, which reads as deliberate to a visitor and is worse than the 404. This case makes the emptiness intentional and visible. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. `cd showcase && grep -rn "programa-fidelidad-peluqueria\|tarjeta-fidelidad-cafeteria\|tarjeta-fidelidad-restaurante" content messages` 2. Open each of the three URLs under `/es/blog/` in a browser. |
| EXPECT | The grep returns only the TODO comment in `content/blog/es/tarjeta-fidelidad-digital-pequeno-comercio.mdx`, never a `link`, `href` or markdown link. All three URLs return a 404 page. You do NOT see any of the three slugs in a message catalog, and you do NOT see them redirect anywhere. |
| RESET | None. |

### IL-08: A locale with no blog links to no articles [EDGE]

| Field | Content |
|---|---|
| WHY | Polish has no blog route at all. A `/blog/…` value in `pl/*.json` would render a link into a redirect-to-home, which looks like a working link in a click-through and is invisible in a catalog diff. Polish sidesteps this today by pointing every sector card at the loyalty page; this pins that it keeps doing so. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Open `http://localhost:3001/pl`. 2. Click through all five sector cards. |
| EXPECT | Every card lands on `/pl/program-lojalnosciowy` with a 200. You do NOT see `/pl/blog` in any URL, and you do NOT see a redirect to the Polish home page. |
| RESET | None. |

### IL-09: Header and footer links, on a rendered page [CORE]

*(Amended 2026-10-09 (STA-358): the header's hidden copy of these links is
gone, so the recipe below now reads the footer's sitemap nav alone. The link
counts are unchanged, because the recipe already merged the two copies. IL-10
checks that the header block stays gone.)*

| Field | Content |
|---|---|
| WHY | This surface shipped a redirect on EVERY page of the site and no test saw it, because the hrefs were built from template strings inside two components. `buildSeoLinks` in `lib/seo-links.ts` is now a pure function and `lib/seo-links.test.ts` walks it, so most of this case is automated. What stays manual is the rendered form: the test checks what the function RETURNS, this checks what the page SHIPS. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Run the block below for all four locales. 2. Spot-click three footer links and the language switcher. |
| EXPECT | Every href in the footer's sitemap nav (the only sr-only link block since STA-358) returns 200 with no `location` header. No doubled locale (`/en/en/`), no `/fr/` prefix (French is unprefixed), and **no trailing slash except the site root**. You do NOT see a 308, and you do NOT see the link count drop below 11 for any locale. |
| RESET | None. |

> **Check the status code, not just the shape.** The first run of this case
> grepped only for doubled prefixes, found none, and reported the case clean
> while `/en/` was 308ing to `/en` on every page. A link can be correctly
> prefixed and still redirect. The half that matters is the response.

<details>
<summary>The full check, both halves</summary>

```bash
B=http://localhost:3001
bad=0
for page in / /en /es /pl; do
  curl -s "$B$page" \
   | grep -oE '<a href="/[^"]*">(Home|Pricing|Loyalty programs|Blog|Contact|About|notifications-push|campagnes-promotionnelles|geolocalisation|scanner-mobile|analytiques|design-de-carte)</a>' \
   | grep -oE 'href="[^"]*"' | cut -d'"' -f2 | sort -u > /tmp/hrefs.txt
  n=0
  while IFS= read -r h; do
    [ -z "$h" ] && continue
    n=$((n+1))
    code=$(curl -s -o /dev/null -w '%{http_code}' "$B$h")
    [ "$code" = 200 ] || { echo "FAIL $page -> $h [$code]"; bad=$((bad+1)); }
  done < /tmp/hrefs.txt
  printf '%-4s %2d links\n' "$page" "$n"
done
echo "failures: $bad"
```

Expect 12 links for `/`, `/en`, `/es`, 11 for `/pl` (no blog), and 0 failures.
A count below that means the footer's sitemap nav stopped rendering, which
the grep alone would report as a pass.
</details>

### IL-10: The header ships no hidden link block, and the footer keeps one sitemap nav [CORE]

| Field | Content |
|---|---|
| WHY | The header carried an `aria-hidden`, focus-skipped copy of the navigation. Links a crawler can see and a person cannot reach read as cloaking. The footer's visually hidden sitemap nav stays, reachable by keyboard and screen readers, and it is what IL-09 reads. IL-09's counts cannot tell one copy from two, because its recipe merges them. |
| DEPENDS | IL-09 |
| ACCOUNT | None. |
| STEPS | 1. Run the block below against the dev server or a production build of the branch. |
| EXPECT | Every line reads `hidden=0 sitemap=1 skipped=0`. You do NOT see `hidden=1` (the header block is back), `skipped` above 0 (a link taken out of the tab order), or `sitemap=0` (the footer lost the links IL-09 relies on). |
| RESET | None. |

```bash
B=http://localhost:3001
for page in / /en /es /pl /us; do
  html=$(curl -s "$B$page")
  printf '%-4s hidden=%s sitemap=%s skipped=%s\n' "$page" \
    "$(printf '%s' "$html" | grep -o '<nav class="sr-only" aria-hidden="true"' | wc -l | tr -d ' ')" \
    "$(printf '%s' "$html" | grep -o '<nav class="sr-only" aria-label=' | wc -l | tr -d ' ')" \
    "$(printf '%s' "$html" | grep -oE '<a [^>]*tabindex="-1"' | wc -l | tr -d ' ')"
done
```

### IL-11: Blog breadcrumbs point at real, locale-prefixed pages [CORE]

| Field | Content |
|---|---|
| WHY | The breadcrumb structured data on every post named `/` and `/blog` whatever the post's language, so an English post's trail pointed Google at the French blog, and its first item was always labelled "Home". The trail now follows the post's locale, and every item must answer 200. The line under a post's title (dates and reading time) also read French on every post; it now follows the post's language. |
| DEPENDS | IL-01 |
| ACCOUNT | None. |
| STEPS | 1. Run the block below. 2. Open `/en/blog/coffee-shop-loyalty-card` and `/es/blog/tarjeta-fidelidad-digital-pequeno-comercio`, and read the line under the title. |
| EXPECT | Step 1, the English post: `/en` (`Home`), `/en/blog` (`Blog`), then its own URL. The Spanish post: `/es` (`Inicio`), `/es/blog` (`Blog`), then its own URL. The French post: `/` (`Accueil`), `/blog` (`Blog`), then its own URL. Every item answers `200` with no redirect. Step 2: "Updated on August 3, 2026" and "min read" on the English post, "Actualizado el 3 de agosto de 2026" and "min de lectura" on the Spanish one. You do NOT see an unprefixed `/blog` item on an English or Spanish post, an item that redirects or 404s, or "Mis à jour le" on a post that is not French. |
| RESET | None. |

```bash
B=http://localhost:3001
for p in /en/blog/coffee-shop-loyalty-card /es/blog/tarjeta-fidelidad-sin-app /blog/carte-fidelite-cafe; do
  echo "== $p"
  curl -s "$B$p" | grep -oE '"name":"[^"]*","item":"[^"]+"' | sed -E 's#"name":"([^"]*)","item":"https://stampeo.app([^"]*)"#\2 \1#' |
  while IFS=' ' read -r u label; do
    printf '  %-50s %-12.12s %s\n' "${u:-/}" "$label" "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$B${u:-/}")"
  done
done
```

---

## Execution rules (for the testing agent)

1. **Order.** IL-00 and IL-01 first, then the browser cases in order.
2. **On BLOCKER failure:** stop. IL-00 and IL-01 gate everything below; if
   either fails, the browser cases cannot distinguish "this link is broken"
   from "the guard never checked it".
3. **On CORE failure:** write a failure report, skip only its dependents,
   continue.
4. **On EDGE failure:** write a failure report, continue.
5. **On ambiguity:** consult WHY. If still ambiguous, report it as AMBIGUOUS
   and treat it as a defect in this runbook, not in the product.
6. **Reporting:** one failure report per failed case, per
   `failure-report-template.md`, referenced by case ID only.
7. **Re-runs after fixes:** the failed case, its DEPENDS chain, and anything
   named in "Known state" as needing re-verification. Nothing else.
8. **A failing IL-01 names its own file and line.** Read the output before
   opening a browser; it is almost always enough to locate the fix.
