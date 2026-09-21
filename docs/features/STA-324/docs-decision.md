# Docs decision — STA-324 (consent ledger)

Decision: **no help-centre article.** The four Phase 6 questions, against the diff:

**1. Did user-visible behaviour change?** No. The banner, the US notice and the
preferences dialog look and behave exactly as they did before — same copy, same
buttons, same outcomes. What changed is invisible by design: the decision is now
also recorded on our servers, fire-and-forget, after the choice has already been
applied on the visitor's device. A visitor cannot tell the difference, and CL-05
in the runbook exists to prove that even a total outage of the new endpoint
leaves the experience unchanged.

**2. Is there a new setting or option?** No. Nothing was added to the dashboard,
and there is deliberately no UI for reading the ledger back — writing it is the
legal obligation, surfacing it is STA-325 and a future DSAR flow.

**3. Did an error message or copy change?** No error copy. Product copy is
unchanged. The **Privacy Policy** did change substantially (§5.6, a retention
row in §8, and a qualification on the erasure right in §10, in all four
locales) — but that is a legal document with its own review path and its own
parity tests in `lib/legal/legal.test.ts`, not a help-centre article.

**4. Did pricing or tier gating change?** No. The ledger applies to every
visitor regardless of plan, and to visitors who have no account at all.

## Why the policy change is not "docs"

It is worth being explicit, because this issue adds a genuinely new processing
activity and refuses an erasure request — the sort of thing that would normally
demand a written explanation somewhere.

It gets one, in the place that carries legal weight: Privacy Policy §5.6 states
what is recorded, that we set a random identifier to chain decisions, the
3-year retention, and — stated outright rather than left to be inferred — that
erasure is refused for these records under GDPR Art. 17(3)(b) and (e). A
help-centre article restating that in softer words would create a second,
non-binding version of a disclosure that must be exact, and the two would drift.

## If this ever becomes user-visible

STA-325 (owner-facing privacy controls) is where a person will first be able to
SEE their consent history. That issue needs a help article; this one does not.
