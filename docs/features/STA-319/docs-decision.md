# Docs decision — STA-319 (Meta pixel on showcase)

Answered against the real diff at Phase 6.

**Outcome: no help-centre page is created or updated.**

| Question | Answer |
|---|---|
| User-visible behaviour changed? | Only for a visitor who has already consented, and only invisibly — a pixel loads. No screen, copy, control or flow changes. Nothing a business owner sees or does is different. |
| New setting or option? | No. The marketing toggle that governs this pixel already exists, shipped by STA-317, and is already documented as covering "advertising measurement". This issue adds a consumer behind it, not a new control. |
| Error message or copy changed? | No. No string added, removed or altered in any locale. |
| Pricing or tier gating changed? | No. |

## Why the privacy policy needs no edit either

STA-317 already wrote the disclosure this pixel requires, and wrote it to
describe exactly this implementation rather than a placeholder:

- §5.3 lists `Advertising measurement | Meta | _fbp, _fbc` — the two cookies
  this pixel sets, named.
- §5.1 states that measurement and advertising scripts "are loaded only after
  you accept them… no request reaches Google, Meta or TikTok, and none of their
  cookies is created."

Both statements are true of the code as merged: the script is injected from
inside the gate, never rendered as a static tag, so a refusal leaves nothing to
delete. Had the implementation diverged — a `<noscript>` fallback, or automatic
advanced matching sending hashed emails — §5.1 would have become false and this
decision would have gone the other way. It is worth re-checking that sentence
against STA-318 and STA-320 when they land.

The help centre is written for business owners managing their own loyalty
programme. A marketing-site ad pixel is not something they configure, see, or
can be affected by, so there is no page it belongs on.

## Audience that does need telling

Not documentation, but recorded here so it is not lost: the **US
opt-out behaviour** (a US visitor is tracked without clicking anything) is
deliberate and is covered by runbook case MP-05 precisely because it reads as a
bug to anyone who has not seen STA-317's regime design.
