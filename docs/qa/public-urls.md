BRANCH: `fix/sta-389-matcher-segment-boundary` (showcase)
SCOPES: showcase
ENVIRONMENT: **dev for every case.** No migration, no backend change. Every case is an anonymous GET, so nothing here writes data.

# Public URLs test pass

Covers the short URLs people reach by scanning something printed: a shop's
enrollment URL `/{slug}`, and the redirects the site answers at its top level.
They are the URLs nobody types and nobody can correct: a QR code on a counter
cannot be reprinted the day a route breaks, so each case asserts the final page
a real phone lands on, not just the first status code.

Work top to bottom. SU first: if a shop URL breaks, every printed counter code
for that shop is dead.

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

### Known state before you start

- **New runbook (STA-389).** SU-01..03 are new. SU-02 is the case that would
  have caught STA-389: a shop whose slug starts like one of the site's route
  handlers (`go`, `api`, `auth`, `join`, `internal`) returned 404, because the
  middleware matcher skipped those names as prefixes, not whole segments. Fixed
  and verified on local dev (`/golden-hour-coffee` 404 before the fix, 200
  after). Not yet verified on prod, where `good-vibe-lemonade-and-more` is the
  affected shop: re-run SU-02 against `https://stampeo.app` after the deploy.

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
| EXPECT | 200. The page title names the shop ("Obtenez votre carte de fidélité <Shop>"). You do NOT see the site's 404 page or the marketing homepage. |
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
