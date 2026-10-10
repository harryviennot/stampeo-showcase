# STA-409 failure report: Trustpilot is not disclosed in the privacy policy

CASE: none (reshaped from the Linear ticket, not from a QA run); nearest area is `LG` in `docs/qa/cookie-consent.md`, and the case that would have caught it is added there as LG-04
VERDICT: FAILED
SEVERITY: CORE
RUN: 2026-10-10, `origin/dev` at e255001 (the policy files are identical on `origin/main`)
SURFACE: showcase, the four privacy-policy Markdown files under `legal/` (`/en/privacy-policy`, `/fr/politique-de-confidentialite`, `/es/politica-privacidad`, `/pl/polityka-prywatnosci`)
ACCOUNT: none, anonymous reading

## Failed at

Step 1 of the missing case (LG-04): read §4 "Third-Party Services" in `en`, `fr`, `es` and `pl`, the processor table and the "Transfers Outside the EU" paragraph.

## Expected

Every third party that receives personal data is disclosed in §4 of the privacy policy, in all four locales: a row in the processor table, and a mention in the transfers paragraph when the recipient may move data outside the EU.

## Actual

Since 2026-06-29 Stampeo sends Trustpilot A/S (Copenhagen, Denmark) data about paying business owners so Trustpilot can invite them to review Stampeo: the owner's email address, name, the business's identifier and the language. Trustpilot acts as a processor for review invitations under its DPA. The DPA uses Standard Contractual Clauses for transfers outside the EEA/UK, and its sub-processors include Trustpilot, Inc. (New York, USA) and SendGrid, Inc. (USA). Hosting locations are not published.

None of the four policies names Trustpilot anywhere: not in the §4 table, not in the transfers paragraph, not in §6.

## Evidence

`grep -rci trustpilot legal/` returns 0 for all eight files (four policies, four terms of service). The facts about the data sent and about Trustpilot's DPA were verified by the coordinator on 2026-10-10 and are taken from the stage brief, not re-derived here.

## State at time of failure

- Session: no session.
- Preceding cases this run: none (no QA run).
- Relevant data: policy "Last updated" reads 3 October 2026 in all four files before the fix.

## Aftermath

- RESET performed: none needed (read-only text).
- Dependents skipped: none.
- Run continued: yes.

## Hypothesis (optional, clearly speculative)

The Trustpilot invitation integration shipped in the backend without a step that reopens the privacy policy when personal data goes to a new third party. The same hole would let the next integration through, which is why the regression test pins the shape of §4 and the runbook gets a case.

## Notes (fix track)

- **F1:** the regression test lives in `lib/legal/legal.test.ts` and reads §4 only (`section` helper), so a mention in another section cannot satisfy it.
- **F3 (UX pass), skipped:** a Markdown text change to an existing table, no layout change.
- **F4 (audit), skipped:** a text diff of about 30 lines in no auth, billing, webhook or migration path, so no subagents; the implementation checklist was walked by hand.
- **F5 (runbook):** `docs/qa/cookie-consent.md` has an `LG` section ("the privacy policy agrees with the banner"). LG-04 is added there with a WHY and a negative assertion, and the "Last updated" line in LG-01 now reads 10 October 2026. The regression test is the first guard; LG-04 covers the rendered page and the part a test cannot judge (whether the row is true).
- **F6 (docs question):** the policy is the document. Nothing in the help center describes the review invitation's data flow, so there is no other document to update.
