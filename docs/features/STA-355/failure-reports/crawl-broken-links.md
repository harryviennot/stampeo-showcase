# Failure report — broken internal links found by site crawl

CASE: CRAWL-01 (no prior runbook case existed — see "Aftermath")
VERDICT: FAILED
SEVERITY: CORE
RUN: 2026-09-24, showcase `dev` @ 272df43 (== `origin/dev`, merged to `main` by PR #132)
SURFACE: showcase, production build (stampeo.app) + committed `.next` output
ACCOUNT: none — all surfaces are public

## Failed at

A full crawl of the 94 URLs in `/sitemap.xml`, following every internal link on
each page.

## Expected

Every internal link on a sitemap page resolves to HTTP 200 at the URL written in
the `href`, without an intermediate redirect.

## Actual

Nine distinct broken destinations and one unnecessary redirect, across **26
authored link instances**:

| Shape | Instances |
|---|---|
| Double locale prefix (A) | 16 |
| Missing Spanish article (B, D) | 8 |
| Slug in no map — hard 404 (C) | 1 |
| Wrong-locale feature slug (E) | 1 |

### A. Double locale prefix — `/{locale}/{locale}/onboarding`

Every non-French blog post renders its call-to-action as `/en/en/onboarding` or
`/es/es/onboarding`. 16 instances, one per post: all 11 EN posts, all 5 ES posts.

Confirmed in the committed build output:

```
.next/server/app/en/blog/coffee-shop-loyalty-card.html   →  href="/en/en/onboarding"
.next/server/app/es/blog/tarjeta-fidelidad-sin-app.html  →  href="/es/es/onboarding"
.next/server/app/fr/blog/carte-fidelite-cafe.html        →  href="/onboarding"        (correct)
```

### B. Spanish homepage links to three articles that do not exist

`messages/es/landing.json` sector cards, rendered by `SectorCarousel` through
next-intl `Link`:

| Line | Card | Rendered URL | Status |
|---|---|---|---|
| 109 | Barbería | `/es/blog/programa-fidelidad-peluqueria` | 404 |
| 127 | Cafetería | `/es/blog/tarjeta-fidelidad-cafeteria` | 404 |
| 145 | Restaurante | `/es/blog/tarjeta-fidelidad-restaurante` | 404 |
| 163 | Salón de belleza | `/es/blog/programa-fidelidad-peluqueria` | 404 (same slug as 109) |

`content/blog/es/` contains exactly 5 articles; none of these slugs is among
them. The values are literal transliterations of the French slugs at
`messages/fr/landing.json:109/127/145/163`.

### C. Spanish feature grid points at a slug that is in no map — hard 404

`messages/es/landing.json:194` → `/features/notificaciones`, rendered as
`/es/features/notificaciones`.

`notificaciones` appears in no map in `lib/feature-slugs.ts`, so
`resolveToCanonicalSlug` returns `null` and `app/[locale]/features/[slug]/page.tsx`
calls `notFound()`. The real page is `notificaciones-push`.

The same page's header and footer nav link correctly to
`/es/features/notificaciones-push`, because those go through `getLocalizedSlug`
rather than a raw catalog string.

### D. Four dead links in Spanish article bodies

Inline markdown links, rendered as bare `<a>` (`a` is not overridden in the MDX
component map at `components/blog/mdx/index.ts`):

| File:line | href | Status |
|---|---|---|
| `content/blog/es/como-crear-tarjeta-fidelidad-digital.mdx:64` | `/es/blog/tarjeta-sellos-digital` | 404 |
| `content/blog/es/como-crear-tarjeta-fidelidad-digital.mdx:110` | `/es/blog/apple-wallet-tarjeta-fidelidad` | 404 |
| `content/blog/es/tarjeta-fidelidad-digital-pequeno-comercio.mdx:87` | `/es/blog/tarjeta-fidelidad-papel-vs-digital` | 404 |
| `content/blog/es/tarjeta-fidelidad-digital-pequeno-comercio.mdx:132` | `/es/blog/apple-wallet-tarjeta-fidelidad` | 404 |

All three targets exist in FR and EN. None was ever written in ES.

### E. One unnecessary redirect — French slug on a Spanish page

`messages/es/features.json:554`, inside
`features["notifications-push"].advanced.items[2]`, carries
`"href": "/features/campagnes-promotionnelles"` — a verbatim copy of the French
catalog. Rendered on `/es/features/notificaciones-push` as
`/es/features/campagnes-promotionnelles`.

That URL is valid: `resolveToCanonicalSlug` maps it, but
`isCorrectSlugForLocale("campagnes-promotionnelles", "es")` is false, so the page
issues a 308 to `/es/features/difusiones-promocionales`. A wasted hop and diluted
link equity, not a 404.

EN (`/features/promotional-campaigns`) and PL
(`messages/pl/features.json:779` → `/features/rozsylki-promocyjne`) were
localized. ES was missed.

## Evidence

- Committed `.next/server/app/**/*.html` for A, B, C, D and E
- `content/blog/es/` directory listing — 5 files, none matching the B or D slugs
- `lib/feature-slugs.ts` — the four slug maps, none containing `notificaciones`
- `messages/{fr,en,pl}/landing.json:194` — all three name the correct localized
  feature slug, which isolates the ES catalog as the defect

## State at time of failure

- Session: none required; every affected surface is public
- Preceding cases this run: none — this is the first crawl of these surfaces
- Relevant data: showcase `dev` @ 272df43, clean working tree, identical to the
  commit deployed by PR #132

## Aftermath

- RESET performed: none needed — read-only crawl
- Dependents skipped: none
- Run continued: yes

## Root causes (established, not speculative)

Three, each confirmed by reading the code path end to end.

**1. A prefixed href handed to a prefixing `Link`.** `i18n/routing.ts` sets
`localePrefix: "as-needed"` with `defaultLocale: "fr"`. next-intl's `Link`
prepends the locale itself, so an href passed to it must be locale-agnostic. The
chain is `<CallToAction href>` → `components/blog/mdx/CallToAction.tsx` →
`components/ui/CTAButton.tsx`, which imports `Link` from `@/i18n/navigation`.
French escapes only because it is the unprefixed default locale — the bug is
invisible in the locale the team reads most.

Two link conventions coexist in this repo and both are correct in their place:

| Element | href must be | Why |
|---|---|---|
| `Link` from `@/i18n/navigation` | locale-agnostic (`/onboarding`) | next-intl prepends |
| raw `<a>` / markdown `[](…)` | explicitly prefixed (`/es/onboarding`) | rendered verbatim |

Group A is the first rule broken; group D is content that follows the second
rule correctly but points at a file that does not exist.

**2. Spanish link data transliterated from French without checking the target.**
Groups B, C and E. The pattern is identical each time: a French value was
translated word-by-word into a plausible Spanish slug, and nothing verified the
result resolved.

**3. No guard exists, and none is possible at the type level.** `messages/*.json`
values are read at runtime, so next-intl's typed hrefs cannot check them. The
call sites defeat the check anyway with casts:

```
components/sections/FeatureGrid.tsx:45         href={feature.link as "/features/notifications-push"}
components/landing-variant/SectorCarousel.tsx:91   href={slide.link as "/blog/carte-fidelite-cafe"}
components/features/notifications-push/NotificationsPushPage.tsx:202  href={feature.href as "/features/notifications-push"}
```

Removing those casts would not help: a value read from JSON at runtime cannot be
narrowed to a literal union without a full next-intl `pathnames` map. **A
data-level test that resolves every authored link against the real route
inventory is the only guard that can catch this class**, which is why F1 writes
one before any fix lands.

## Runbook hole

No case in `docs/qa/` covered internal-link integrity — by definition a hole, per
the fix track's F5 rule. `docs/qa/seo-internal-links.md` is created as part of
this issue.
