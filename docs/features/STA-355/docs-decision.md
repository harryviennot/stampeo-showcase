# STA-355 — docs decision and recorded skips

## Docs decision: no help-center page

The four questions, against the diff:

| Question | Answer |
|---|---|
| User-visible behaviour changed? | Yes, but only on the public marketing site: links that 404'd now resolve. |
| New setting or option? | No. |
| Error message or copy changed? | Yes: four Spanish sector-card labels on the showcase homepage. |
| Pricing or tier gating changed? | No. |

Two "yes" answers, and neither triggers the help center. `stampeo-help-docs`
documents the product a business owner operates: the dashboard, the scanner, the
card, the billing. This diff changes the marketing site a prospect reads BEFORE
they have an account. No owner-facing behaviour, setting, error or gate moved.

The Spanish label rewrite is marketing copy, governed by `stampeo-copywriting`
(which was invoked before the strings were written), not by the help center.

## Recorded skips

**Phase F3, UX polish — skipped.** The diff is href strings, four Spanish label
strings, and a new `lib/` module with its test. No layout, spacing, component or
presentation change. `ux-designer` in MODE: POLISH is explicitly barred from
editing copy, so the only user-visible part of this diff is the one thing it
must not touch. Nothing for it to do.

**`security-reviewer` — not triggered.** No auth, billing, Stripe, webhook or
migration path in the diff.

**`next build` — not run.** A showcase dev server was live on port 3001 and a
build would have clobbered its `.next`. Verified against the running dev server
instead: all 33 blog posts requested and returned 200 (so every edited MDX file
compiled), every link destination returned 200 with no redirect hop, and no
doubled locale prefix remained anywhere on the site. What this does NOT cover is
anything that differs only under `output: "standalone"`. Carried as case IL-06 in
`docs/qa/seo-internal-links.md` for the next branch that builds.
