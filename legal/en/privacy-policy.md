# Privacy Policy: Stampeo

**Last updated: October 3, 2026**

## 1. Introduction

This privacy policy describes how Stampeo (hereinafter "we", "our", or "the Platform"), operated by Harry Viennot, sole proprietor registered in France under SIRET **10477625700016**, collects, uses, stores, and protects personal data in connection with its digital loyalty card service.

We are committed to complying with the General Data Protection Regulation (GDPR, EU Regulation 2016/679) and the French Data Protection Act (Loi Informatique et Libertés).

This policy applies to all users of the Platform, whether they are business owners, employees, or end customers holding a loyalty card.

## 2. Data Controller and Data Processor

### 2.1 Business Users (owners and employees)

Stampeo acts as the **data controller** for business account data (registration, authentication, billing).

### 2.2 End Customers (loyalty card holders)

The business using Stampeo is the **data controller** for its own customers' data. Stampeo acts as a **data processor**: we process end customer data solely on behalf of the business and in accordance with its instructions.

Each business chooses what information to collect from its customers (anonymous, email only, first name + email, or custom fields). By default, email and first name are enabled.

### 2.3 Support access by Stampeo personnel

Authorized Stampeo personnel may, on a strictly limited basis, access a Business User's dashboard for the sole purpose of providing technical or commercial support, debugging a reported issue, or fulfilling a legal obligation. Such access:

- is **read-only**: no data can be modified, created or deleted during the session;
- may be granted in the context of any business user role (owner, administrator, or scanner), and may be scoped to either a chosen role or a specific named user, in order to faithfully reproduce role-specific issues;
- triggers an automatic email notification to the **business owner** at session start, regardless of which role or user was targeted;
- is limited to a maximum duration of **60 minutes**, after which the session expires automatically;
- is logged for audit: the personnel member's identity, the business concerned, the target user and role, the stated reason, start and end timestamps, the personnel member's IP address, and the pages viewed during the session.

Legal basis: legitimate interest (the operator's interest in providing support and ensuring platform security), balanced against the Business User's interests by the safeguards described above (read-only, time-limited, audited, notified). Support access logs are retained for 24 months (see §8).

## 3. Data Collected

### 3.1 Business Users

| Data | Purpose | Legal Basis | Required |
|------|---------|-------------|----------|
| Email address | Account creation, communication | Performance of contract | Yes |
| Password (hashed) | Authentication | Performance of contract | Yes |
| Full name | Account identification | Performance of contract | Yes |
| Business name | Service personalization | Performance of contract | Yes |
| Business website | Verification and personalization | Legitimate interest | No |
| Phone number | Contact and support | Legitimate interest | No |
| Source of discovery (including free-text "other" field) | Internal statistics (how you heard about Stampeo) | Legitimate interest | No |
| Payment information | Billing via Stripe | Performance of contract | Yes |
| Logo and brand assets | Service operation | Performance of contract | Yes |
| Preferred language (locale) | Interface localization and transactional emails | Legitimate interest | No |
| Support access logs (sessions, timestamps, pages viewed, IP of personnel) | Audit trail for support sessions per §2.3 | Legitimate interest | Yes (operational) |

The website, phone number, and "how you heard about us" fields are collected at signup and stored in an admin-only internal table used for support, outreach, and onboarding analytics. They are not shown to other users of the Platform.

### 3.2 Employees (Scanners)

| Data | Purpose | Legal Basis |
|------|---------|-------------|
| Email address | Invitation and authentication | Performance of contract |
| Full name | Identification | Performance of contract |
| Activity metrics (number of scans recorded, last-active timestamp) | Team-activity statistics shown to the business owner | Legitimate interest |
| Per-scan attribution (which employee recorded each scan) | Loyalty audit trail and business analytics | Legitimate interest |

These activity metrics are visible to the business owner to give a view of team activity. Stampeo does not use them for its own purposes.

### 3.3 End Customers

Data collected depends entirely on the configuration chosen by the business. All three identification fields are optional and can be disabled independently:

| Data | Collection | Purpose |
|------|------------|---------|
| Unique card identifier | Always | Service operation |
| Email address | Default (can be disabled) | Pass recovery, communication |
| First name / Last name | Default (can be disabled) | Personalization |
| Phone number | Optional (can be disabled) | Communication |
| Birthday (day and month) | Optional (can be disabled) | Birthday rewards and personalization |
| Fields defined by the business | Optional (defined by the business) | Set by the business, stated on the sign-up form |
| Visit history | Automatic | Loyalty tracking and statistics |
| Stamps/points balance | Automatic | Loyalty program |
| Purchase amount / transaction value | Automatic (points programs only) | Points accrual and business analytics |

The birthday is collected as a **day and month only**. No year is stored, so we hold neither a date of birth nor an age.

Businesses on the Growth and Pro plans may add their own fields to their sign-up form (for example a preference or a size). For each such field the business sets the question and a short line explaining why it is being asked, which is displayed to the customer above the "Get my card" button. The business alone decides what to ask and acts as data controller for those answers; Stampeo stores them as processor on the business's instructions, and applies to them the same retention, anonymization, and deletion rules as every other end-customer field. Businesses are contractually prohibited from using these fields to collect payment or identity-document data, or data falling under Article 9 GDPR (health, religious or philosophical beliefs, racial or ethnic origin, political opinions, trade-union membership, sexual orientation, biometric or genetic data). Deleting a field from the sign-up form also erases every answer already stored for it.

It is possible to configure the Platform in fully anonymous mode (no personal data collected, only a card identifier).

### 3.4 Technical Data

For all users, we may collect:

- Pass type (Apple Wallet or Google Wallet)
- Device token for pass updates
- Usage data sent to PostHog for our internal product analytics: event name, timestamp, page viewed, visitor IP, and (after a Business account is created) the associated business identifier. No cookies are set and no identifier is persisted to browser storage (see §5)
- Error-monitoring context sent to Sentry on exceptions: user identifier, business identifier, request path, and stack trace (no raw email, no password, no payment data)
- For emails we send to Business Users, engagement events recorded by our email provider (Resend): delivery, open, click (including which link was clicked), bounce, and spam-complaint signals, linked to the recipient's business and user identifier. These are used only to measure and improve our own communications and to maintain list hygiene, never for advertising

## 4. Third-Party Services

We use the following sub-processors:

| Service | Role | Data Location |
|---------|------|---------------|
| Supabase | Database hosting | Ireland (EU) |
| OVH | VPS server | France (EU) |
| Stripe | Payment processing | EU (possible US transfers under Data Privacy Framework) |
| Resend | Transactional emails | Ireland (EU) |
| Apple (APNs) | Apple Wallet pass updates | United States (Data Privacy Framework) |
| Google (Wallet API) | Google Wallet pass updates | United States (Data Privacy Framework) |
| Google (Analytics 4): Google Ireland Limited, with Google LLC | Audience measurement and conversion reporting, subject to your cookie choice (see 5.3 and 5.5) | EU (possible US transfers under Data Privacy Framework) |
| PostHog | Website analytics (cookieless) | EU |
| Sentry | Error monitoring | Germany (EU) |
| Redis (self-hosted, via Taskiq) | Job queue and short-lived cache for pass assets and notification delivery | France (EU), same infrastructure as our VPS |

### Resellers (when applicable)

Stampeo operates an optional reseller program. When a business chooses to be managed by a reseller partner, that reseller is granted full dashboard access to the business they manage (including end-customer data) so they can operate the loyalty program on the business's behalf.

In GDPR terms this creates a controller-to-processor-to-sub-processor chain: the managed business remains the data controller for its own end-customer data, Stampeo acts as the processor, and the reseller acts as a further sub-processor, authorized only for the scope agreed with that business. Reseller arrangements require a signed partnership agreement with the data-handling terms described in the Terms of Service (§9.1). Stampeo may revoke reseller access in case of breach or misuse.

A business that is not managed by a reseller is not exposed to any reseller access.

### Transfers Outside the EU

Some of our sub-processors (Stripe, Apple, Google) may transfer data to the United States. These transfers are governed by the EU-US Data Privacy Framework or Standard Contractual Clauses approved by the European Commission. Supabase, OVH, Resend, PostHog, Sentry, and our self-hosted Redis process data exclusively within the EU. The advertising platforms we report conversions to under §5.5, Google (Google Ireland Limited, with Google LLC in the United States) and Meta (Meta Platforms Ireland Limited, with Meta Platforms, Inc. in the United States), may process that data in the United States, under the same framework.

## 5. Cookies

### 5.1 Your choice

Measurement and advertising cookies are loaded only after you accept them. Until then their scripts are not placed on the page at all: no request reaches Google or Meta, and none of their cookies is created. Refusing therefore leaves nothing behind to delete.

Refusing takes one click, in the same banner and with the same prominence as accepting, and the site works identically either way. Your choice is kept for 6 months, after which we may ask you again. You can change it at any time through **Cookie preferences** in the footer of every page where our measurement and advertising cookies can be set. Withdrawing a consent deletes the cookies concerned and reloads the page so that the scripts stop running.

If your browser sends a Global Privacy Control signal, we treat it as a refusal and nothing is loaded. In the United States this holds even over a choice you made earlier here, and we show you no notice at all, since you have already answered. In every US state we honor the signal as an opt-out of sale, sharing and targeted advertising, and while it is on, audience measurement is also turned off. In Europe a choice you make yourself takes precedence over the signal: until you make one, the banner is still offered, so that you can opt in deliberately if you want to.

Visitors in the United States are handled differently, because the applicable state laws require notice and an opt-out rather than prior consent. There, measurement and advertising cookies load on arrival, a notice says so, and the **Your Privacy Choices** link switches them off at any time. It sits in the footer of every page where our measurement and advertising cookies can be set, and the notice has a button of the same name. A refusal is kept for 13 months and renewed on each visit, and when you sign in to the dashboard it is restored from your account.

Which rules apply to you is decided from your device's time zone. When the signals disagree, the stricter rules apply, and where we cannot place you, the strict (opt-in) rules apply. We do not use your IP address for this.

### 5.2 Cookies present whatever you choose

These are strictly necessary and are not subject to consent.

| Cookie | Purpose | Duration |
|---|---|---|
| `NEXT_LOCALE` | Remembers which language you are reading the site in. | 1 year |
| `stampeo_market` | Remembers which country's pages you opened, to prefill a field later. | 30 days |
| `stampeo_consent` | Records the choice you made about the cookies in 5.3, and the random identifier that links your successive choices together (see 5.6). | 6 months. In the United States, a refusal is kept 13 months and renewed on each visit. |
| `stampeo_sid` | A random identifier that records your choices and links them to the account you create, so that a later refusal applies to it (see 5.6). | 13 months |
| Supabase session cookies | Keeps you signed in on the business dashboard. | Session |

### 5.3 Cookies subject to your consent

These cookies are used only if you allow them (in the United States, until you switch them off through **Your Privacy Choices**; elsewhere, through **Cookie preferences**).

| Purpose | Recipient | Cookies |
|---|---|---|
| Audience measurement | Google (Google Analytics 4) | `_ga`, `_ga_*`, `_gid` |
| Advertising measurement | Meta | `_fbp`, `_fbc` |

The three cookies below are our own. Our server sets them, and they are shared between stampeo.app and the dashboard.

| Cookie | Purpose | Category | Duration |
|---|---|---|---|
| `stampeo_src` | Where your visit came from (campaign parameters, landing page, referring site). | Audience measurement or advertising | 6 months |
| `stampeo_ga` | Google Analytics' identifiers for your visit. | Audience measurement | 6 months |
| `stampeo_ad` | The advertising platform's click identifier and Meta's browser identifier, only when you arrived from an ad. | Advertising | 6 months |

The earlier `stampeo_attribution` cookie is no longer set; a browser that received it earlier may still hold it until it expires.

### 5.4 Audience measurement without cookies

Stampeo uses PostHog (hosted in the EU) for internal product analytics and audience measurement. PostHog is configured so that **no tracking cookies are set** and **no identifier is persisted to browser storage** (cookie, localStorage, or equivalent). Events are scoped to the current browser session and are not re-associated across visits. The visitor's IP address is transmitted to the PostHog server for technical logging and event deduplication, but it is not combined with a persistent identifier, is not used for profiling or advertising, and is not shared with third parties. Hosting is entirely within the European Union.

Because nothing is stored on your device, this measurement falls within the consent exemption for strictly necessary audience measurement described in the ePrivacy Directive and CNIL guidelines. It therefore runs whether you accept or refuse the cookies in 5.3, and refusing them does not leave us blind to how the site itself performs.

Strictly necessary cookies may be used for authentication and session management on the business dashboard. These cookies do not require consent.

### 5.5 Conversion measurement from our servers

If you accept the cookies in 5.3 (in the United States, as long as you have not switched them off), we keep, in the `stampeo_src`, `stampeo_ga` and `stampeo_ad` cookies listed there: where your visit came from, meaning the campaign parameters in the address, the landing page and the referring site; Google Analytics' identifiers for your visit; and, if you reached this site from an advertisement, the identifier the advertising platform added to the link you followed (for Google the `gclid`, for Meta the `fbclid`), together with Meta's browser identifier. Each cookie is kept only while you allow the category listed for it in 5.3. Our server sets them, and they are shared between stampeo.app and the dashboard, which runs on a different subdomain, so that this information survives the move from this site to the dashboard. If you later come back through another advertisement, the newer click replaces the earlier one.

If you create an account, we report up to four steps **from our servers**: that the account was created, that you opened the payment page, that your free trial started, and that a first invoice was paid. The first is reported when you confirm the account (with the code we email you, or by signing in with Google or Apple), before any business exists. Because this is sent server-side, it happens after whatever runs in your browser, and independently of it.

With each step, the platform receives its own identifiers when it has them (the click identifier and its browser identifier) and the campaign, plus, for the last three steps, the price of the plan you chose or the amount paid, and its currency. Each platform receives only its own identifiers: a Google click identifier is never sent to Meta, and a Meta click identifier is never sent to Google.

Meta also receives:

- your IP address and your browser's technical characteristics (type, version, operating system), as recorded when you created your account, and the address of our dashboard. We keep these two items for 45 days at most, then delete them;
- your email address, telephone number, first name, last name, the country, city and postcode of your business, and an identifier derived from your account, each **hashed** with the SHA-256 algorithm before it leaves our servers. Hashing turns each item into a code from which your details cannot be recovered. The code still identifies you to Meta, which makes the same code from the details of its own users, so it remains personal data. Meta compares these codes with those of its users to tell whether you have a Facebook or Instagram account, including when you saw the advertisement on another device, and uses the result to measure and improve how our advertisements are shown. Meta may also use this data under its own terms, for example to improve its advertising systems, as described in [Meta's privacy policy](https://www.facebook.com/privacy/policy).

Meta receives these steps whether or not you came from one of its advertisements, as long as you accepted the advertising cookies in 5.3 (in the United States, as long as you have not switched them off). Google receives its own session identifier with each step, so that the step joins your visit. It never receives your contact details, your IP address or your browser's characteristics.

We never send your password, your payment details, or anything about your customers (the people who hold your loyalty cards).

For each step we also keep delivery diagnostics: its status, the times we tried to send it and the response code returned by the platform, along with the platform's response messages. §8 gives how long we keep each.

- **Recipients:** Google means Google Ireland Limited, with Google LLC in the United States. Meta means Meta Platforms Ireland Limited, with Meta Platforms, Inc. in the United States.
- **Legal basis:** your consent (GDPR Art. 6(1)(a)), given in the cookie banner or through **Cookie preferences**. In the United States, where prior consent is not required, we rely on notice and your right to opt out through **Your Privacy Choices** (see 5.1 and §6).
- **Joint controllers with Meta:** Stampeo and Meta Platforms Ireland Limited are joint controllers (GDPR Art. 26) for collecting data through the Meta cookies in 5.3 and the reporting described here, and for transmitting it to Meta, under Meta's Controller Addendum. Meta alone is responsible for what it does with the data once received, as described in [Meta's privacy policy](https://www.facebook.com/privacy/policy). You can exercise your rights (§10) with either of us.

You can withdraw each choice separately, through **Cookie preferences** or, in the United States, **Your Privacy Choices**:

- Turning off advertising stops anything further being reported to Meta, and deletes the advertising identifiers we kept.
- Turning off audience measurement does the same for Google.
- Turning off both also deletes the stored campaign source.

A refusal you make on this site after you created an account applies to your account and your businesses, through the random identifier described in 5.6. Steps already reported cannot be recalled. This data is deleted together with the business account it belongs to (see §8).

### 5.6 Record of your cookie choices

When you accept or refuse cookies — on the banner, in the notice shown to visitors in the United States, or later through **Cookie preferences** or, in the United States, **Your Privacy Choices** — we keep a record of that decision on our servers. The GDPR requires us to be able to demonstrate that consent was given (Article 7(1)), and a choice stored only in your browser cannot demonstrate anything: it lives on your device, you can change it, and your next decision overwrites it.

Each record contains the decision itself and nothing about you: which categories you accepted or refused, the version of the cookie text you were shown, whether you were under the opt-in or opt-out regime, which surface you answered on, and two timestamps — the time your own device reported, and the time our server received it.

To link the decisions of one visitor together, we set a random identifier in the `stampeo_sid` cookie listed in 5.2, and the `stampeo_consent` cookie carries the same identifier. It is random, it is not derived from your IP address, your browser fingerprint or anything else about you, and it means nothing outside this record. If you then create an account, we attach your earlier decisions to that account so we can show which choices you made, and so that a refusal you make later on this site applies to it (see 5.5); the decisions themselves are never altered.

Refusals are recorded in exactly the same way as acceptances. A record showing only the people who agreed would misrepresent what actually happened, and would be of no use as proof.

**We keep these records for 3 years after the consent they describe comes to an end** — that is, from the moment it is replaced by a newer decision or withdrawn — in line with CNIL guidance on proof of consent. After that they are deleted.

**These records are the one exception to deletion on this platform.** If you ask us to erase your data, we will refuse for these records specifically, relying on Article 17(3)(b) and (e) of the GDPR: retention necessary to comply with a legal obligation, and for the establishment or defence of legal claims. Deleting the proof that you consented would destroy our only defence for processing that had already taken place, including processing you had asked for. For the same reason they are not deleted when a business account is closed; the account link is removed and the record remains, describing a decision and no longer an identifiable person. Every other right in §10 — access, rectification, restriction, portability and objection — applies to them normally.

## 6. Use of Data

We use collected data to:

- Provide and maintain the digital loyalty card service
- Generate and update wallet passes
- Send loyalty notifications (stamps, rewards)
- Manage accounts, subscriptions, and billing
- Send transactional and operational emails (account confirmation, pass recovery, trial notifications, plan-change confirmations, the notice sent before each yearly subscription renewal, and other billing notifications; see Terms of Service §5.7)
- Produce anonymized statistics for businesses
- Produce aggregate, internal product analytics to understand how the Platform is used across all businesses, detect abuse, and prioritize improvements
- Send Business Users a limited number of lifecycle and marketing emails, subject to the opt-out described in §6.1
- Improve the Platform

We **never sell** personal data for money. We perform **no cross-business tracking**: a customer's data at one business is completely isolated from their data at another.

**In the United States:** sending data to Meta and to Google for our advertising, as described in 5.5, may count as "sharing" under California law. You can opt out at any time through **Your Privacy Choices**, in the footer of every page where our measurement and advertising cookies can be set and in the notice, or with a Global Privacy Control signal, which we honor in every US state as described in 5.1.

### 6.1 Marketing and lifecycle emails to Business Users

Beyond the transactional and operational emails listed above, we send Business Users a limited number of lifecycle and marketing emails: onboarding and activation guidance, re-engagement reminders when an account is created but not yet used, a periodic activity digest, product-update announcements, and win-back messages after cancellation.

- **Legal basis:** our legitimate interest in helping Business Users get value from the Platform and in promoting features of a service they already use (GDPR Art. 6(1)(f)), relying for prospecting on the business-to-business "soft opt-in" permitted by the ePrivacy Directive and French LCEN Art. L34-5.
- **Opt-out:** every such email carries a one-click unsubscribe link and a link to a preferences page where Business Users can opt out independently by category: re-engagement, marketing, and product updates. The transactional and operational emails described in Terms of Service §5.7 are excluded from this opt-out because they are required to administer the account.
- To measure and improve these communications we record the engagement events described in §3.4.

This applies only to emails Stampeo sends to its own Business Users. It is separate from the wallet notifications a business sends to its End Customers, which are covered in §7.

## 7. Notifications

When a customer adds a pass to their wallet, the pass can receive notifications from the issuing business. There are two categories, each with a distinct legal basis.

### 7.1 Transactional Notifications

Sent automatically in response to customer activity: stamp received, points earned, milestone reached, reward earned, reward redeemed.

- **Legal basis:** performance of the loyalty service (GDPR Art. 6(1)(b)), on behalf of the business as data controller.
- **Content:** strictly related to the customer's own loyalty card activity.

### 7.2 Promotional Broadcasts

Businesses on the Growth and Pro tiers can send broadcast messages to their cardholders (for example: a seasonal offer, a new menu item, a special event). Growth has a monthly quota; Pro is unlimited. The Starter tier cannot send broadcasts.

- **Legal basis:** the business's legitimate interest in marketing to its existing customers (GDPR Art. 6(1)(f)), combined with the "soft opt-in" permitted by the ePrivacy Directive (Art. 13(2)) and French LCEN Art. L34-5. This exemption from prior explicit consent applies because (a) the customer's contact happened in the course of a service (installing the business's loyalty pass), (b) the message concerns similar products or services from the same business, and (c) a simple, free opt-out is available with every message (see 7.3).
- **Scope, strictly first-party.** A business may use broadcasts only to reach **its own** cardholders about **its own** products, services, or offers. Broadcasts may not be used for third-party advertising, cross-business promotion, data sharing, or content unrelated to the business's own offering. These restrictions are written into the Terms of Service §8 and breach of them is grounds for suspension. They are what keeps the soft opt-in exemption intact.

### 7.3 Opting Out

Each pass exposes a per-pass notification toggle in Apple Wallet and Google Wallet. Turning it off is the single, industry-standard opt-out and is legally sufficient for both transactional and promotional messages on that pass. This is the same control used by every major wallet-based loyalty program.

Because the wallet OS exposes a single toggle per pass, disabling notifications disables **both** transactional and promotional messages for that pass. This is a limitation of the wallet medium, not a choice by Stampeo. A customer who wishes to stop only promotional messages can either: ask the business to exclude them from future broadcasts (businesses are required by the Terms of Service to honor such requests), or remove the pass from their wallet.

### 7.4 Business Obligations

Businesses using broadcasts must publish their own privacy notice to their customers, stay within the first-party scope above, and honor opt-out requests received through any channel (verbal, email, in person) by excluding the customer from future broadcasts or revoking the pass. These obligations are detailed in the Terms of Service §8.

## 8. Data Retention

| Data | Retention Period |
|------|-----------------|
| Active Business account | Duration of subscription |
| Business account after cancellation | Up to 12 months of inactivity, then personal data is deleted. Two email warnings are sent (30 and 14 days before), and the account is kept if the owner logs back in or resubscribes |
| End customer data | Kept while the business is active; irreversibly anonymized when the business account is deleted (anonymized statistics may be retained) |
| Billing data | 10 years (French legal requirement) |
| Technical logs | 12 months maximum |
| Push registration tokens | Deleted when the customer removes the pass from their wallet, or when the wallet push service reports the token as permanently invalid |
| Latest wallet notification text | Only the latest message is retained per customer (overwritten on each notification); no history |
| Broadcast delivery metrics (aggregate) | 24 months |
| Email send and engagement logs for Business User communications (delivery, open, click, bounce, complaint) | 24 months |
| Stripe webhook failure records (internal debugging) | 90 days |
| Support access logs (impersonation sessions and associated audit entries per §2.3) | 24 months, then deleted |
| Advertising attribution (click identifier, campaign) | Deleted with the Business account it belongs to |
| IP address and browser characteristics used for conversion reporting (§5.5) | 45 days at most, then deleted |
| Delivery diagnostics for each step reported under §5.5 (status, attempt times, the platform's response code) | 13 months |
| Platforms' response messages to the steps reported under §5.5 | 90 days |
| Consent records — proof of your cookie choices (§5.6) | 3 years after the consent ends (replaced or withdrawn). **Not** deleted with the Business account: the account link is removed and the record is kept, under GDPR Art. 17(3)(b) and (e) |

The 24-month retention for support access logs is set to allow security-incident investigation while remaining proportionate to its purpose, in line with CNIL guidance on security logging.

When a Business account becomes inactive, we retain its data for up to 12 months to allow reactivation, sending two email warnings before permanent deletion. On deletion, Business-account personal data is deleted and End Customer personal data is irreversibly anonymized; anonymized statistics may be retained. Billing records are kept for 10 years as required by law.

## 9. Pass Deletion by End Customers

When a customer removes their pass from their wallet:

- Their identifying data (email, first name, phone number) is **anonymized** upon request
- Their visit history is retained in anonymized form for the business's statistics
- Customers can request complete data deletion by contacting the relevant business or Stampeo directly

## 10. User Rights

Under the GDPR, you have the following rights:

- **Access**: obtain a copy of your personal data
- **Rectification**: correct inaccurate data
- **Erasure**: request deletion of your data (with one documented exception for the consent records described in §5.6)
- **Restriction**: restrict processing of your data
- **Portability**: receive your data in a structured format
- **Objection**: object to processing of your data

**Business users and employees:** contact us at contact@stampeo.app.

**End customers:** contact the business managing your loyalty card first. You may also reach us at contact@stampeo.app.

We respond to all requests within 30 days. You also have the right to lodge a complaint with the CNIL, the French data protection authority (www.cnil.fr), or with the supervisory authority of the country where you live or work.

### 10.1 Right to object to support access

Business Users may, by written request to contact@stampeo.app, ask that no support access (§2.3) be granted to their account outside of an explicit support ticket they have opened. This option is offered as a contractual courtesy and does not affect cases where access is required by law, by a court order, or by an imminent security incident on the Platform.

## 11. Security

We implement technical and organizational measures to protect your data:

- Encryption in transit (TLS/HTTPS)
- Passwords hashed with secure algorithms
- Restricted and controlled database access
- Data isolation between businesses (multi-tenant architecture)
- Hosting within the EU (Supabase Ireland, OVH France)
- Per-business Apple Pass signing certificates, encrypted at rest with AES-256-GCM

In the event of a personal-data breach, Stampeo will notify the CNIL within 72 hours of discovery and the affected controllers (or, where applicable, data subjects) as required by GDPR Articles 33–34.

## 12. Minors

The Platform is not intended for persons under 16 years of age. We do not knowingly collect data from minors under 16. Business accounts are restricted to persons aged 18 or older.

## 13. Changes

We may update this privacy policy. In case of substantial changes, Business users will be notified by email. The last update date is shown at the top of this document.

## 14. Contact

- **Email:** contact@stampeo.app
- **Data Controller:** Harry Viennot, Stampeo
- **SIRET:** **10477625700016**
- **Address:** 20 rue Marcel Paul, Bat. D Apt. 133-B, 94800 Villejuif, France