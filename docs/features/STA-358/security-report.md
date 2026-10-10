# Security Report: STA-358
REVIEWED: 2026-10-10  DIFF: origin/dev...HEAD (merge-base ab9a0fa..cfb23bb), showcase feat/sta-358-seo-geo-hardening

VERDICT: FINDINGS (1 LOW, 0 MED, 0 HIGH; non-blocking)

## Findings
- [SEV: LOW] app/[locale]/founding-partner/page.tsx:40-42 and app/[locale]/programme-fondateur/page.tsx:40-42: the `[locale]` segment goes into `permanentRedirect(localePath(locale, "/pricing"))` without validation.
  - Suggested direction: check the locale with `hasLocale` before building the target.
  - **Coordinator verification (2026-10-10, local build of cfb23bb):** not reachable. `/%5Cevil.com/founding-partner`, `/%2F%2Fevil.com/founding-partner`, `/%5Cevil.com/programme-fondateur` and `/x.y/founding-partner` all return 404, because the layout's `notFound()` rejects unknown locales. `/fr/fr/%5Cevil.com` returns 308 → `/%5Cevil.com` on the same host, with the backslash still percent-encoded. The `hasLocale` guard is added anyway in the fix pass (defence in depth).

## Checked and sound
- **Cross-tenant:** no new business-scoped reads or writes. The acquisition canonical is only emitted after the slug resolves.
- **AuthProvider move:** a client-only provider; no server gate depended on it. Every `useAuth()` consumer sits under a providing layout, pinned by `auth-routes.test.ts`.
- **Session hint:** UI only. A forged cookie changes only the forger's own header, and the server snapshot is always false.
- **PkceCallbackHandler:** exchanges a code only with this browser's own verifier (PKCE), so a crafted link cannot sign a victim into the attacker's account. The surface is smaller than before.
- **Auth callback fallback:** `deviceLanguage` returns allowlisted locales only.
- **Legacy redirects:** static or repo-derived sources, fixed-prefix destinations, `assertDisjoint` against loops.
- **Share-image passthrough:** an anchored, linear regex, with nothing bypassed.
- **`/` negotiation:** next-intl validates input; the 307 is no-store.
- **JsonLd:** server-rendered with `<` escaped.
- **Race and replay:** Supabase enforces single-use PKCE codes, and the browser client is a singleton.
- **Sign-out:** same calls and scope as before.
- **Secrets and logs:** no new PII. Removing AuthProvider stops Sentry.setUser on marketing pages.
- **CI:** no secrets; indexnow runs on push to main only.
- **No new free or trial surface.** No webhooks changed.
