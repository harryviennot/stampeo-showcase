# Docs decision: STA-317

Answered against the real diff, per the four Phase 6 questions.

| Question | Answer |
|---|---|
| User-visible behavior changed? | **Yes.** A consent banner, a US notice, a preferences dialog and a footer entry, on every marketing page. |
| New setting or option? | **Yes.** "Cookie preferences", reachable from the footer of every page. |
| Error message or copy changed? | **Yes.** New copy in four locales, and §5 of the privacy policy rewritten in four locales. |
| Pricing or tier gating changed? | No. |

**Decision: no help-center page. The legal pages were updated instead, inside this diff.**

Three yeses, and still no help doc, for a reason worth writing down rather than
leaving as an omission.

The help center's audience is business owners and their team members operating
the dashboard (`stampeo-help-docs`: "for business owners and their team
members"). Everything this issue changes is on the public marketing site and is
seen by anonymous visitors, not by a signed-in owner. Nothing in the dashboard
gained a setting, a screen, or a behaviour. A page explaining the marketing
site's cookie banner would have no reader: an owner never encounters it while
doing their job, and a visitor who wants the detail is one click from the
policy via the banner's own "See the details" link.

The disclosure obligation this change creates is legal, not instructional, and
it is discharged where a regulator and a visitor both look for it: privacy
policy §5, rewritten in `en`, `fr`, `es` and `pl` as part of this diff. That
section now names the purposes, the recipients (Google, Meta, TikTok), the
cookies each sets, the six-month retention, the withdrawal route, the GPC
behaviour and the US difference. `lib/legal/legal.test.ts` keeps all of it from
regressing.

Checked and found nothing to update: there is no help-center content anywhere
in the workspace mentioning cookies, tracking or the banner, so nothing
existing became wrong.

**Revisit when the pixels land.** STA-318, STA-319 and STA-320 change what
accepting actually does. That still looks like a legal-page question rather than
a help-center one, but each of those issues answers these four questions again
against its own diff.
