# STA-373 legal pre-review: privacy policy v3 (§4, §5.5, §8) and the Advertising toggle

Prepared 2026-10-03 for a lawyer's sign-off. This is a structured check against the
GDPR information duties (Art. 13), consent (Art. 7, ePrivacy Art. 5(3) / French
Loi Informatique et Libertés art. 82), joint controllership (Art. 26) and the US
state-privacy rules the site already applies. It is not legal advice.

Scope of the change being disclosed: with advertising consent (EU) or by default
under the US opt-out regime, Meta receives four funnel steps from our servers, plus
the owner's IP address, user agent, and SHA-256 hashes of email, phone, first/last
name, country, city, postcode and an account id. This happens also for signups that
did not come through a Meta ad. Google (GA4) receives the steps and values, never
contact details, IP or user agent.

## Findings

| # | Topic | Status in the v3 draft | Proposed fix |
|---|---|---|---|
| L1 | Legal basis (Art. 13(1)(c)) | §5.5 never states it | Add: "Legal basis: your consent (GDPR Art. 6(1)(a)), given in the cookie banner; in the United States, notice with the right to opt out." |
| L2 | Joint controllership with Meta (Art. 26, CJEU *Fashion ID* C-40/17) | Not mentioned. Collecting and transmitting this data to Meta for our advertising is processing we and Meta decide jointly | Add: we and Meta Platforms Ireland Ltd are joint controllers for collecting and transmitting the data (Meta's Controller Addendum); Meta is solely responsible for what it does with it afterwards (link to Meta's privacy policy); rights can be exercised with either |
| L3 | Recipient identity | "Meta", "Google" | Name the entities: Meta Platforms Ireland Limited (and Meta Platforms, Inc. in the US); Google Ireland Limited / Google LLC |
| L4 | Meta's own use | Draft says Meta uses the result "to measure and improve how our advertisements are shown" | Add that Meta may also use it under its own terms, e.g. to improve its advertising systems, as described in its privacy policy. Otherwise the purpose list is narrower than reality |
| L5 | "Irreversible code" wording | Accurate (a hash cannot be reversed), but a reader may take it as anonymous | Say it plainly: the code cannot be turned back into your details, but it still identifies you to Meta, which makes the same code from its users' details. Keep "personal data" explicit (hashing is pseudonymisation, CNIL/EDPB) |
| L6 | Right to complain (Art. 13(2)(d)) | Missing from the whole policy, not only §5.5 | Add to §10: "You may lodge a complaint with the CNIL (cnil.fr) or your local supervisory authority." |
| L7 | Google Analytics 4 as processor | GA4 is not in the §4 sub-processor table (only in §5.3) | Add a row: Google (Analytics 4) / audience measurement and conversion reporting, with consent / EU, possible US transfers (DPF) |
| L8 | California "sharing" | §6 says "We never sell personal data". Sending hashed contact data and events to Meta for ad measurement and delivery is likely "sharing for cross-context behavioral advertising" under CPRA | Add a US paragraph: we do not sell data for money; sending it to Meta for advertising may count as "sharing" under California law; opt out via **Your privacy choices** or Global Privacy Control (both already honoured) |
| L9 | Notice of change (§13) | §13 promises business users an email for substantial changes | Send a short email to existing business owners when v3 ships. Their existing accounts are not affected (their rows stay on the v2 rules), but the promise covers the policy |
| L10 | First banner layer | "We load measurement and advertising cookies only if you accept them." Consent now also covers server-side reporting and hashed contact details, which are not cookies | Consider: "…only if you accept them, and only then report to Meta and Google what you do after an ad." The details stay in layer 2 (toggle text) and §5.5 |
| L11 | Spanish register | The new ES §5.5 uses "tú" (as §5.1 does), but other ES sections use "usted" | Pick one register for the whole ES policy. The copywriting rules lock "tú" |
| L12 | Data minimisation (Art. 5(1)(c)) | Phone, name, city and postcode are optional match keys | Defensible as improving match accuracy under consent; document it in the record of processing. Dropping city/postcode costs little if the lawyer prefers fewer fields |
| L13 | Record of processing (Art. 30) | n/a in the policy | Add the activity "advertising measurement (Meta CAPI, GA4 MP)" with categories, recipients, transfers and retention |

Already sound:
- §5.5 names recipients, the four steps, the fields, the 45-day limit and withdrawal.
- US transfers sit under the Data Privacy Framework.
- Nothing is sent about end customers.
- Refusals outlive a consent-version bump.
- A dashboard withdrawal stops everything.
- Only consent recorded at signup can grant.

## For the re-ship
1. Apply L1–L8 and L10–L11 in en/fr/es/pl, with legal tests for the new mandatory statements (legal basis, joint controller, complaint right).
2. Revert the two hold commits (showcase `0474bd0`, web `f4006f7`) in the same PRs.
3. Send the §13 email to existing business owners (L9).
4. Have the lawyer read §5.5, §4, §6, §10 and the toggle and banner text before the `dev → main` merge.

## Re-ship, 2026-10-03 (showcase `feat/sta-373-legal-reship`)

Applied in en/fr/es/pl. Pinned by `lib/legal/legal.test.ts`, describe
"privacy — the statements the legal review requires" (one case per locale for
each statement). Each case failed before the text existed, and a one-off
mutation of each statement fails exactly that case.

| # | Done | Where |
|---|---|---|
| L1 | "Legal basis: your consent (GDPR Art. 6(1)(a)), given in the cookie banner or through Cookie preferences. In the United States, where prior consent is not required, we rely on notice and your right to opt out (see 5.1 and §6)." | §5.5, bullet list before the withdrawal paragraph |
| L2 | Stampeo and Meta Platforms Ireland Limited are joint controllers (Art. 26) for collecting data through the Meta cookies in 5.3 and the §5.5 reporting, and for transmitting it to Meta, under Meta's Controller Addendum. Meta alone is responsible for what it does afterwards (link to Meta's privacy policy). Rights can be exercised with either | §5.5 bullet "Joint controllers with Meta" |
| L3 | Google = Google Ireland Limited, with Google LLC in the US; Meta = Meta Platforms Ireland Limited, with Meta Platforms, Inc. in the US | §5.5 bullet "Recipients", §4 transfers paragraph, §4 GA4 row |
| L4 | "Meta may also use this data under its own terms, for example to improve its advertising systems, as described in Meta's privacy policy." | §5.5, hashed-details bullet |
| L5 | The code cannot be turned back into your details, still identifies you to Meta (which makes the same code from its users' details), so it remains personal data | §5.5, hashed-details bullet |
| L6 | Right to lodge a complaint with the CNIL (www.cnil.fr) or the supervisory authority where you live or work. ES adds the AEPD, PL the Prezes UODO, as the local example. In EN the old complaint sentence sat under §10.1 (support access); it now sits in §10 | §10, before 10.1 |
| L7 | Row "Google (Analytics 4): Google Ireland Limited, with Google LLC / Audience measurement and conversion reporting, subject to your cookie choice (see 5.3 and 5.5) / EU (possible US transfers under Data Privacy Framework)" | §4 table |
| L8 | "We never sell personal data for money", then a US paragraph: sending data to Meta and the other advertising platforms named in 5.3 may count as "sharing" under California law; opt out through Your privacy choices, Cookie preferences, or Global Privacy Control (as described in 5.1) | §6, beside "never sell" |
| L9 | Not done here (an email, not page text) | |
| L10 | Banner and US notice now say we tell Meta and Google whether an ad led to the sign-up (banner: only if you accept) | `common.cookies.banner.body`, `common.cookies.notice.body` |
| L11 | No change needed: the "usted" phrasings were in the v2 §5.5 text the hold had restored; after the revert, every sentence addressing the reader uses "tú". The new ES text uses "tú" too | ES policy |
| L12, L13 | Not done here (record of processing, minimisation decision) | |

"Last updated" already reads 3 October 2026 in all four policies (set by the revert).

### Points for the lawyer
- **GPC after a dismissed US notice. Resolved in code.** In the US, a Global Privacy Control signal now wins over any recorded choice, a dismissed notice included, and clears the trackers already set (`resolveConsent` and `categoriesToClearOnLoad` in `lib/consent.ts`). The dashboard treats the signal over a US choice as a withdrawal, and the backend records a withdrawal for a US signup that sends `Sec-GPC: 1`. §5.1 now says so in every locale. An explicit EU choice still wins over the signal. Left for the lawyer: a US visitor sending GPC can still switch advertising on in the preferences dialog, and that choice has no effect (§7025(c)(3) allows asking them to confirm instead).
- **Opt-out link label.** The persistent footer link reads "Cookie preferences". "Your privacy choices" appears only in the dismissible US notice. The CCPA's alternative opt-out link expects "Your Privacy Choices" (with its icon) in the footer.
- **Does the CCPA apply at all?** Its thresholds ($25M revenue, 100,000 consumers, or 50% of revenue from selling or sharing) are probably not met. The §6 paragraph is worded "may count" for that reason.
- **"Sell for money."** California's "sale" includes "other valuable consideration". Confirm that the exchange with the ad platforms is "sharing", not "sale".
- **Scope of the US paragraph.** It names Meta and "the other advertising platforms named in 5.3" (Google, TikTok), not Meta alone, because their cookies load by default in the US.
- **Controller Addendum.** Art. 26(2) asks that the essence of the arrangement be made available. The text names Meta's Controller Addendum but does not link it: its URL could not be checked from here.
- **Joint controllership scope.** It is written to cover the Meta browser cookies (5.3, *Fashion ID*) as well as the server-side reporting.
- **Google's role.** GA4 is listed as a sub-processor (processor). Conversion reporting that reaches Google Ads may make Google an independent controller. §5.5 does not state Google's role.
- **Entity wording.** "with Meta Platforms, Inc. / Google LLC in the United States". The Google Wallet API row in §4 was left without an entity.
- **First layer.** "tell Meta and Google whether an ad led you to sign up" simplifies the four steps (payment page, trial, invoice). Google only hears about a Google click.
