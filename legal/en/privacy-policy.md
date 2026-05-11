# Privacy Policy: Stampeo

**Last updated: May 11, 2026**

## 1. Introduction

This privacy policy describes how Stampeo (hereinafter "we", "our", or "the Platform"), operated by Harry Viennot, sole proprietor registered in France under SIRET **currently being obtained**, collects, uses, stores, and protects personal data in connection with its digital loyalty card service.

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

- is **read-only** — no data can be modified, created or deleted during the session;
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

### 3.3 End Customers

Data collected depends entirely on the configuration chosen by the business. All three identification fields are optional and can be disabled independently:

| Data | Collection | Purpose |
|------|------------|---------|
| Unique card identifier | Always | Service operation |
| Email address | Default (can be disabled) | Pass recovery, communication |
| First name / Last name | Default (can be disabled) | Personalization |
| Phone number | Optional (can be disabled) | Communication |
| Visit history | Automatic | Loyalty tracking and statistics |
| Stamps/points balance | Automatic | Loyalty program |

It is possible to configure the Platform in fully anonymous mode (no personal data collected, only a card identifier).

### 3.4 Technical Data

For all users, we may collect:

- Pass type (Apple Wallet or Google Wallet)
- Device token for pass updates
- Usage data sent to PostHog for our internal product analytics: event name, timestamp, page viewed, visitor IP, and (after a Business account is created) the associated business identifier. No cookies are set and no identifier is persisted to browser storage (see §5)
- Error-monitoring context sent to Sentry on exceptions: user identifier, business identifier, request path, and stack trace (no raw email, no password, no payment data)

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
| PostHog | Website analytics (cookieless) | EU |
| Sentry | Error monitoring | Germany (EU) |
| Redis (self-hosted, via Taskiq) | Job queue and short-lived cache for pass assets and notification delivery | France (EU), same infrastructure as our VPS |

### Resellers (when applicable)

Stampeo operates an optional reseller program. When a business chooses to be managed by a reseller partner, that reseller is granted full dashboard access to the business they manage (including end-customer data) so they can operate the loyalty program on the business's behalf.

In GDPR terms this creates a controller-to-processor-to-sub-processor chain: the managed business remains the data controller for its own end-customer data, Stampeo acts as the processor, and the reseller acts as a further sub-processor, authorized only for the scope agreed with that business. Reseller arrangements require a signed partnership agreement with the data-handling terms described in the Terms of Service (§9.1). Stampeo may revoke reseller access in case of breach or misuse.

A business that is not managed by a reseller is not exposed to any reseller access.

### Transfers Outside the EU

Some of our sub-processors (Stripe, Apple, Google) may transfer data to the United States. These transfers are governed by the EU-US Data Privacy Framework or Standard Contractual Clauses approved by the European Commission. Supabase, OVH, Resend, PostHog, Sentry, and our self-hosted Redis process data exclusively within the EU.

## 5. Cookies

Stampeo uses PostHog (hosted in the EU) for internal product analytics and audience measurement. PostHog is configured so that **no tracking cookies are set** and **no identifier is persisted to browser storage** (cookie, localStorage, or equivalent). Events are scoped to the current browser session and are not re-associated across visits. The visitor's IP address is transmitted to the PostHog server for technical logging and event deduplication, but it is not combined with a persistent identifier, is not used for profiling or advertising, and is not shared with third parties. Hosting is entirely within the European Union.

Under these conditions, Stampeo's audience measurement falls within the consent exemption for strictly necessary audience measurement described in the ePrivacy Directive and CNIL guidelines, and therefore does not require a cookie consent banner.

Strictly necessary cookies may be used for authentication and session management on the business dashboard. These cookies do not require consent.

## 6. Use of Data

We use collected data to:

- Provide and maintain the digital loyalty card service
- Generate and update wallet passes
- Send loyalty notifications (stamps, rewards)
- Manage accounts, subscriptions, and billing
- Send transactional and operational emails (account confirmation, pass recovery, trial and billing notifications; see Terms of Service §5.5)
- Produce anonymized statistics for businesses
- Produce aggregate, internal product analytics to understand how the Platform is used across all businesses, detect abuse, and prioritize improvements
- Improve the Platform

We **never sell** personal data. We perform **no cross-business tracking**: a customer's data at one business is completely isolated from their data at another.

## 7. Notifications

When a customer adds a pass to their wallet, the pass can receive notifications from the issuing business. There are two categories, each with a distinct legal basis.

### 7.1 Transactional Notifications

Sent automatically in response to customer activity: stamp received, milestone reached, reward earned, reward redeemed.

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
| Business account after cancellation | 60 days, then deleted |
| End customer data | Duration of business's activity on the Platform |
| Billing data | 10 years (French legal requirement) |
| Technical logs | 12 months maximum |
| Push registration tokens | Deleted when the customer removes the pass from their wallet, or when the wallet push service reports the token as permanently invalid |
| Latest wallet notification text | Only the latest message is retained per customer (overwritten on each notification); no history |
| Broadcast delivery metrics (aggregate) | 24 months |
| Stripe webhook failure records (internal debugging) | 90 days |
| Support access logs (impersonation sessions and associated audit entries per §2.3) | 24 months, then deleted |

The 24-month retention for support access logs is set to allow security-incident investigation while remaining proportionate to its purpose, in line with CNIL guidance on security logging.

After a Business account is deleted, all associated data (including end customer data) is deleted within 60 days.

## 9. Pass Deletion by End Customers

When a customer removes their pass from their wallet:

- Their identifying data (email, first name, phone number) is **anonymized** upon request
- Their visit history is retained in anonymized form for the business's statistics
- Customers can request complete data deletion by contacting the relevant business or Stampeo directly

## 10. User Rights

Under the GDPR, you have the following rights:

- **Access**: obtain a copy of your personal data
- **Rectification**: correct inaccurate data
- **Erasure**: request deletion of your data
- **Restriction**: restrict processing of your data
- **Portability**: receive your data in a structured format
- **Objection**: object to processing of your data

**Business users and employees:** contact us at contact@stampeo.app.

**End customers:** contact the business managing your loyalty card first. You may also reach us at contact@stampeo.app.

### 10.1 Right to object to support access

Business Users may, by written request to contact@stampeo.app, ask that no support access (§2.3) be granted to their account outside of an explicit support ticket they have opened. This option is offered as a contractual courtesy and does not affect cases where access is required by law, by a court order, or by an imminent security incident on the Platform.

We respond to all requests within 30 days. If you have a complaint, you may file it with the CNIL (French data protection authority): www.cnil.fr.

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
- **SIRET:** **currently being obtained**
- **Address:** 20 rue Marcel Paul, Bat. D Apt. 133-B, 94800 Villejuif, France