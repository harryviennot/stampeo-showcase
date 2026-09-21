# Docs decision — STA-322 (Meta conversions + the vendor leak)

Answered against the real diff at Phase 6.

| Question | Answer |
|---|---|
| User-visible behaviour changed? | Not on any screen. Nothing a visitor or a business owner sees, clicks or configures is different. What changed is which server receives a conversion report. |
| New setting or option? | No new **user-facing** setting. Three backend settings were added (`meta_pixel_id`, `meta_capi_access_token`, `meta_test_event_code`), but they are operator configuration, not product surface. |
| Error message or copy changed? | **Yes — the privacy policy.** See below. |
| Pricing or tier gating changed? | No. |

## The privacy policy was edited, in all four locales

§5.5 "Conversion measurement from our servers" already existed, written by
STA-323/324 and accurate about the mechanism — but written **Google-only**. It
named one identifier (`gclid`) and one recipient (Google), and §5.3 listed the
`stampeo_attribution` cookie's recipient as "Stampeo, then Google".

Three changes, made in `en`, `fr`, `es` and `pl`:

1. §5.3 — the attribution row's recipient is now "Stampeo, then Google **or
   Meta**".
2. §5.5 — both identifiers are named: the `gclid` for Google, the `fbclid` for
   Meta, and the browser identifier is described as belonging to "that
   platform" rather than to Google Analytics specifically.
3. §5.5 — a new sentence stating the separation explicitly: **each platform
   receives only its own identifier; a Google click is never reported to Meta,
   and a Meta click is never reported to Google.**

That third sentence is a disclosure of exactly what this issue's code change
enforces, and it is worth noticing that it was **not** true before this issue:
the sender had no vendor branch, so an `fbclid` was being posted to Google. The
remedy was to fix the behaviour, not to widen the policy to describe the bug.

Each locale follows its own existing phrasing rather than a literal translation
of the English, per the copywriting rules.

## No help-centre page

The help centre is written for business owners running a loyalty programme.
Server-side ad conversion reporting is not something they see, configure, or can
act on. The privacy policy is the correct and sufficient disclosure surface.

## Worth re-checking when STA-320 lands

The same §5.5 wording will need TikTok adding. The code is already shaped for
it — `_SENDERS` has no `tiktok` entry, so a TikTok row records
`skipped_no_sender` and transmits nothing to anyone — but the moment a sender is
added, the policy must name it in the same edit.
