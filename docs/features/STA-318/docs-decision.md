# Docs decision — STA-318

**Outcome: no client-facing help-centre page.**

The four questions, against the real diff:

1. **User-visible behavior changed?** No, for the business owners the help
   centre serves. The diff adds a third-party tag to the public marketing site;
   nothing in the dashboard, the scanner or the wallet pass changes. A visitor
   who has already answered the consent banner sees no difference at all.
2. **New setting or option?** No. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is a
   deploy-time variable, not something a business owner can see or set. The
   only user-facing control is the consent banner, which STA-317 shipped and
   documented.
3. **Error message or copy changed?** No. This issue adds no strings; the
   `i18n-catalogs` parity suite is untouched and still green.
4. **Pricing or tier gating changed?** No.

## What DID need a doc, and already has one

- **The privacy policy** must name Google Analytics before the tag can fire.
  STA-317 rewrote section 5 for exactly this (commit `7a23674`) and the `LG`
  section of `docs/qa/cookie-consent.md` asserts the policy agrees with the
  banner. Verified as covering GA4 rather than assumed — if a future consent
  version adds a vendor, that is a STA-317-style amendment, not this issue.
- **The operator-facing setup steps** live in
  `docs/features/STA-318/ga4-setup.md`: creating the property, the six "EU data
  settings" that GA4 does not expose as one switch, and the DebugView checks.
  That is internal documentation for whoever holds the Google account, not help
  centre material for business owners.

## Revisit if

The funnel work (STA-323) stores attribution against a business. That one very
likely DOES need a privacy-policy amendment and possibly a help-centre line,
because it records personal data against a customer record rather than sending
an anonymous page view. The question is deliberately deferred to that issue,
not answered here.
