# Docs decision — STA-323

**Outcome: the privacy policy needs a change. Help-centre page: no.**

This is the opposite answer to STA-318, and for one reason: that issue sent an
anonymous page view to Google. This one **stores personal data against a
business record** — a click id identifies a device and an ad impression, and it
now sits in our database, joined to a named customer of ours, for as long as the
retention policy allows.

The four questions:

1. **User-visible behavior changed?** Not in the dashboard. A business owner
   sees nothing new; the capture is a cookie and a row.
2. **New setting or option?** No. `ga4_measurement_id` / `ga4_api_secret` are
   deploy-time, and the only user-facing control remains STA-317's banner.
3. **Error message or copy changed?** No strings added; the `i18n-catalogs`
   parity suite is untouched.
4. **Pricing or tier gating changed?** No.

## What must change: `legal/{en,fr,es,pl}/privacy-policy.md`

STA-317's section 5 names Google Analytics, Meta and TikTok as trackers that set
cookies. That covered sending behaviour to them. It does **not** cover:

- that we **retain** the advertising identifier ourselves, against the business
  account, rather than only passing it to a third party;
- that we **transmit a conversion server-side**, after and independently of any
  browser activity — a visitor who refuses on a later visit, or clears cookies,
  is still reported when their invoice is paid;
- the **retention period** for attribution rows.

## The `CONSENT_VERSION` question — deliberately left open

`CONSENT_VERSION` is currently `1`. Bumping it invalidates every stored choice
and re-asks every visitor, which is costly and user-hostile if done without
cause.

The argument for bumping: consent is only valid if informed, and a visitor who
accepted against text that never mentioned server-side conversion reporting or
first-party retention of a click id arguably did not consent to this.

The argument against: the recipients are unchanged — the same three ad
platforms, named in the policy since STA-317. What changed is the mechanism and
our own retention, not who receives the data.

**Recommendation: bump it**, on the principle the consent library itself
already states — "a stored choice from an older version is treated as no choice
at all, so the visitor is asked again rather than a new tracker quietly
inheriting consent that was given for a different list of recipients". The same
logic covers a materially different processing purpose.

**This is a judgement call with a real cost (every visitor re-asked), so it is
flagged rather than taken unilaterally.** It must be settled before the feature
is enabled in production — not before merge, since the sender is dormant
without `ga4_api_secret`.

## Not blocking merge

The tag and the sender are both dormant until their secrets are set, so nothing
is collected or transmitted in production on the strength of this merge alone.
The policy edit and the version decision gate **turning it on**, not landing it.
