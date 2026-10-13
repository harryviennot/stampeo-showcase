# Security Report: STA-456
REVIEWED: 2026-10-13  DIFF: origin/dev...feat/sta-456-in-app-signup (showcase)
VERDICT: FINDINGS (1 MED, 1 LOW, no HIGH)

## Findings
- [SEV: MED] lib/auth/password-rules.ts, AuthenticationStep.tsx, reset-password/page.tsx — dropping the character-class rules lets a business owner pick "12345678", "password", "aaaaaaaa"; nothing screens common passwords (cloud projects: 6-character minimum, leaked-password protection off). The 8-character minimum is client-only: a direct /auth/v1/signup or updateUser call can still set 6. Direction: add a common-password check (Supabase leaked-password protection, or a client blocklist plus a server check) and raise the Supabase minimum to 8 on dev and prod.
- [SEV: LOW] lib/auth/onboarding-resume.ts, OnboardingWizard.tsx — the resume record moves email, name and phone from tab-scoped sessionStorage to localStorage; expiry is only checked when /onboarding is opened again. On a shared shop computer the next person within the hour sees the first person's details, and after "change email" the first person's name/phone would be saved onto the new account. Direction: keep only email + verify mode in localStorage, name/phone in sessionStorage, clear them when the email is changed from a resumed screen.

## Checked and sound
Cross-tenant access, gate bypass, state forgery (verifyOtp still needs the code), escape-URL injection (fixed origin/path, URLSearchParams-encoded, strict cookie parsers, only 5 UTM tags + fbclid), open redirect (fixed returnTo), XSS from the resume record (type-checked, rendered as text), password exposure (field-by-field copy, tested), secrets in logs/analytics (provider, platform, in_app_browser only), resend email-bombing (server limits unchanged), account enumeration (nothing new), OTP replay (single-use), abuse economics (unchanged).

---

# Security Report: STA-456, final pass
REVIEWED: 2026-10-13  DIFF: origin/dev...feat/sta-456-in-app-signup (HEAD 235bcd5)
VERDICT: FINDINGS (1 LOW; no HIGH, no MED)

## Findings
- [SEV: LOW] InAppAuthChooser.tsx:52-62: the guide's `history.replaceState` to `/{locale}/start?utm…&fbclid` feeds the Next router, so `usePathname()` reports `/start`. MetaPixel and GoogleAnalytics (with consent) then send a PageView for `/start` from the private onboarding page, the ConsentBanner sees a trackable path, and PostHog's history-change pageview records `/start`. This inflates landing counts and sidesteps the private-segment rule in spirit; no PII leaves. Direction: keep the gated components on the real route while the guide is open, and pin it with a test.

## Checked and sound
Prior MED (password rules) resolved: reverted to origin/dev. Prior LOW (resume storage) resolved: email/verifyMode/sentAt only, cleared on leaving verify. Escape URL and address are built from a fixed path, an encoded allowlist and the origin. No open redirect (`/start` → fixed `/onboarding`). No XSS. The address restore only undoes its own swap. Cross-tenant, gate bypass, state forgery, race/replay and enumeration are unchanged or not applicable. Analytics payloads carry no PII. Removing in-app OAuth from mobile is security-positive. `/start` is reserved and noindex.
