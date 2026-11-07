# Plan: US visitors — no cookie notice

ISSUE: STA-539 (https://linear.app/stampeo/issue/STA-539)
BRANCH: feat/sta-539-us-no-notice (showcase + backend, same name)
REPOS: showcase (notice, privacy policy), backend (byte-identical matrix copy)
MIGRATION: no
STATUS: APPROVED (2026-11-07, Harry)

## Problem

US visitors are tracked from arrival under the opt-out regime, and a cookie
notice tells them so. No US law requires a pop-up (the state opt-out laws ask
for an opt-out link, mostly above size thresholds Stampeo is under), and Harry
wants none for US visitors.

## Decisions

- The US row of the policy matrix goes from `"surface": "notice"` to `"none"`.
  The matrix is the single place that decides which surface a row gets.
- Everything else about the US stays: tags load on arrival, the footer
  "Your Privacy Choices" link and its dialog (refusing works), Global Privacy
  Control honoured, refusals already made kept, 400-day sliding refusal.
- The backend's byte-identical copy of the matrix changes with it; both SHA
  pins in each repo move. No backend logic reads `surface`.
- The notice code (`ConsentBanner` notice block, `noticeAcknowledgement`,
  `cookies.notice.*` copy) stays: a row can switch back with one word.
- Privacy policy (en/fr/es/pl): remove only the sentences that describe the US
  notice. Rights and the opt-out wording don't change. Harry reviews the text
  before release (his call, 2026-11-07). "Last updated" moves to the edit date.
- An earlier ask (a refuse button that does nothing) was declined: it would make
  the policy false.

## UX decisions

DESIGN skipped: this only removes a surface. POLISH: screenshots at 390 px and
1440 px of a US visit (no notice, footer link present) and an EU visit (banner
unchanged).

## Non-goals

- No change to the EU/UK/CH or unknown-region banner.
- No change to GPC, refusals, consent version, attribution or tags.
- No change to web or backend logic.

## Edge cases considered

- US visitor with GPC: still nothing loads, and still no surface.
- US visitor with an older-version partial refusal: no surface (nothing to
  ask in an opt-out row); the refusal stands.
- A US record still never counts as consent in an opt-in row.
- Timezone says US, server says EU: stricter row (EU) wins → banner.

## Acceptance criteria

- AC1: Given a US visitor with no stored choice, then no consent surface shows,
  and analytics + marketing resolve to granted (tags may load once the subject
  id exists).
- AC2: Given a US visitor, then the footer still shows "Your Privacy Choices",
  and choosing to refuse there switches tags off as before.
- AC3: Given a US visitor with GPC on, then nothing loads and no surface shows.
- AC4: Given an EU/UK/CH or unknown-region visitor with no choice, then the
  two-button banner shows, unchanged.
- AC5: The showcase and backend matrix files are byte-identical and each repo's
  SHA pin matches its copy.
- AC6: The privacy policy in en/fr/es/pl no longer mentions a US notice, and
  still names the "Your Privacy Choices" link, GPC and the 13-month refusal.

## File layout

- showcase: `lib/privacy/policy-matrix.v1.json`, `lib/privacy/policy-matrix.ts`
  (accept surface `"none"`, SHA), tests under `lib/privacy/`, `lib/consent*.test.ts`,
  `legal/{en,fr,es,pl}/*privac*.md`, `docs/qa/cookie-consent.md`.
- backend: `app/services/privacy/policy-matrix.v1.json`,
  `app/services/privacy/policy_matrix.py` (SHA), `tests/privacy/test_policy_matrix.py`,
  `docs/measurement/policy-matrix.md`.
