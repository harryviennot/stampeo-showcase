# Privacy Policy — Stampéo

**Last updated: February 16, 2026**

## 1. Introduction

This privacy policy describes how Stampéo (hereinafter "we", "our", or "the Platform"), operated by Harry Viennot, sole proprietor registered in France, collects, uses, stores, and protects personal data in connection with its digital loyalty card service.

We are committed to complying with the General Data Protection Regulation (GDPR — EU Regulation 2016/679) and the French Data Protection Act (Loi Informatique et Libertés).

This policy applies to all users of the Platform, whether they are business owners, employees, or end customers holding a loyalty card.

## 2. Data Controller and Data Processor

### 2.1 Business Users (owners and employees)

Stampéo acts as the **data controller** for business account data (registration, authentication, billing).

### 2.2 End Customers (loyalty card holders)

The business using Stampéo is the **data controller** for its own customers' data. Stampéo acts as a **data processor**: we process end customer data solely on behalf of the business and in accordance with its instructions.

Each business chooses what information to collect from its customers (anonymous, email only, first name + email, or custom fields). By default, email and first name are enabled.

## 3. Data Collected

### 3.1 Business Users

| Data | Purpose | Legal Basis |
|------|---------|-------------|
| Email address | Account creation, communication | Performance of contract |
| Password (hashed) | Authentication | Performance of contract |
| Full name | Account identification | Performance of contract |
| Business name | Service personalization | Performance of contract |
| Payment information | Billing via Stripe | Performance of contract |
| Logo and brand assets | Loyalty card creation | Performance of contract |

### 3.2 Employees (Scanners)

| Data | Purpose | Legal Basis |
|------|---------|-------------|
| Email address | Invitation and authentication | Performance of contract |
| Full name | Identification | Performance of contract |

### 3.3 End Customers

Data collected depends on the configuration chosen by the business:

| Data | Collection | Purpose |
|------|------------|---------|
| Unique card identifier | Always | Service operation |
| Email address | Default (can be disabled) | Pass recovery, communication |
| First name | Default (can be disabled) | Personalization |
| Phone number | Optional (Pro) | Communication |
| Birthday | Optional (Pro) | Personalized offers |
| Visit history | Automatic | Loyalty tracking and statistics |
| Stamps/points balance | Automatic | Loyalty program |

### 3.4 Technical Data

For all users, we may collect:

- Pass type (Apple Wallet or Google Wallet)
- Device token for pass updates
- Scan geolocation data (if available)
- Anonymized usage data via Plausible Analytics (no cookies, no personal data)

## 4. Third-Party Services

We use the following sub-processors:

| Service | Role | Data Location |
|---------|------|---------------|
| Supabase | Database hosting | Ireland (EU) |
| OVH | VPS server | France (EU) |
| Stripe | Payment processing | EU (possible US transfers under Data Privacy Framework) |
| Resend | Transactional emails | United States (Data Privacy Framework) |
| Apple (APNs) | Apple Wallet pass updates | United States (Data Privacy Framework) |
| Google (Pay API) | Google Wallet pass updates | United States (Data Privacy Framework) |
| Plausible Analytics | Website analytics | EU |

### Transfers Outside the EU

Some of our sub-processors (Stripe, Resend, Apple, Google) may transfer data to the United States. These transfers are governed by the EU-US Data Privacy Framework or Standard Contractual Clauses approved by the European Commission.

## 5. Cookies

Stampéo uses Plausible Analytics, a privacy-friendly solution that **uses no cookies** and collects no personal data. No third-party tracking cookies are used on our platform.

Strictly necessary cookies may be used for authentication and session management. These cookies do not require consent under the ePrivacy Directive.

## 6. Use of Data

We use collected data to:

- Provide and maintain the digital loyalty card service
- Generate and update wallet passes
- Send loyalty notifications (stamps, rewards)
- Manage accounts and billing
- Send transactional emails (confirmation, pass recovery)
- Produce anonymized statistics for businesses
- Improve the Platform

We **never sell** personal data. We perform **no cross-business tracking**: a customer's data at one business is completely isolated from their data at another.

## 7. Notifications

### Transactional Notifications

When a customer adds a pass to their wallet, they may receive notifications related to their loyalty program (stamp received, milestone reached, reward available). Customers can disable these notifications at any time through their pass settings in Apple Wallet or Google Wallet.

### Promotional Notifications (Pro tier)

Businesses subscribed to the Pro tier can send promotional messages to cardholders. The business, as data controller, is responsible for compliance with applicable regulations. Customers can disable notifications at any time.

## 8. Data Retention

| Data | Retention Period |
|------|-----------------|
| Active Business account | Duration of subscription |
| Business account after cancellation | 60 days, then deleted |
| End customer data | Duration of business's activity on the Platform |
| Billing data | 10 years (French legal requirement) |
| Technical logs | 12 months maximum |

After a Business account is deleted, all associated data (including end customer data) is deleted within 60 days.

## 9. Pass Deletion by End Customers

When a customer removes their pass from their wallet:

- Their identifying data (email, first name, phone number) is **anonymized** upon request
- Their visit history is retained in anonymized form for the business's statistics
- Customers can request complete data deletion by contacting the relevant business or Stampéo directly

## 10. User Rights

Under the GDPR, you have the following rights:

- **Access** — obtain a copy of your personal data
- **Rectification** — correct inaccurate data
- **Erasure** — request deletion of your data
- **Restriction** — restrict processing of your data
- **Portability** — receive your data in a structured format
- **Objection** — object to processing of your data

**Business users and employees:** contact us at privacy@stampeo.com.

**End customers:** contact the business managing your loyalty card first. You may also reach us at privacy@stampeo.com.

We respond to all requests within 30 days. If you have a complaint, you may file it with the CNIL (French data protection authority): www.cnil.fr.

## 11. Security

We implement technical and organizational measures to protect your data:

- Encryption in transit (TLS/HTTPS)
- Passwords hashed with secure algorithms
- Restricted and controlled database access
- Data isolation between businesses (multi-tenant architecture)
- Hosting within the EU (Supabase Ireland, OVH France)

## 12. Minors

The Platform is not intended for persons under 16 years of age. We do not knowingly collect data from minors under 16. Business accounts are restricted to persons aged 18 or older.

## 13. Changes

We may update this privacy policy. In case of substantial changes, Business users will be notified by email. The last update date is shown at the top of this document.

## 14. Contact

- **Email:** privacy@stampeo.com
- **Data Controller:** Harry Viennot, Stampéo
