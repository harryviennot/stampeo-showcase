# Plan: Consent ledger — server-side proof of every consent decision

ISSUE: STA-324 (https://linear.app/stampeo/issue/STA-324/consent-ledger-server-side-proof-of-every-consent-decision)
SIBLING: STA-325 (owner-facing privacy controls) — separate, see Non-goals
REPOS: **showcase** (record the decision) + **backend** (store it) + **web**
(forward the subject id at signup — AC10's linking happens where the business is
created, which is the dashboard, not the marketing site)
MIGRATION: yes — `174_consent_records.sql`, plus `175_consent_records_retention.sql`
(the prune function) and `176_consent_records_prune_floor.sql` (the orphan floor,
added after the security review)
STATUS: IMPLEMENTED — see gap-report.md and security-report.md

## Problem

Consent lives in exactly one place: the `stampeo_consent` cookie on the
visitor's device. One copy, editable by the subject, and every new choice
overwrites the last. GDPR Art. 7(1) makes demonstrating consent our burden, and
that cookie demonstrates nothing.

The gap is live right now: `CONSENT_VERSION` moved 1 → 2 for policy §5.5, so
every visitor is being re-asked — and we are recording neither what they said
before nor that they were asked again.

## Decisions

- **Record anonymous visitors, not just accounts.** They are the majority and
  the ones we can least prove consent for. This is what commercial CMPs do; a
  signup-only record would be copied out of the same editable cookie and would
  duplicate the snapshot `business_ad_attribution.consent_*` already holds.
- **Append-only. The application never UPDATEs or DELETEs a row.** A ledger
  that can be edited is not evidence. Enforced in the schema, not by convention.
- **Refusals are recorded exactly like acceptances.** A refusal is a choice we
  must equally be able to demonstrate, and a ledger holding only acceptances
  would misrepresent the population.
- **`subject_id` is random and meaningless.** A v4 UUID minted client-side,
  stored in the consent cookie. Never derived from anything about the visitor —
  no IP hash, no fingerprint. It exists only to chain one person's decisions.
- **The server stamps `recorded_at`; the client supplies `decided_at`.** The
  client timestamp is what the visitor's clock said when they clicked, which is
  evidence but forgeable. The server's is trustworthy but later. Keep both;
  they are different facts.
- **Erasure is refused for these rows** (user decision, 2026-09-20), under
  Art. 17(3)(b)/(e) — retention necessary to establish and defend legal claims.
  Deleting the proof destroys the defence for processing already done. Must be
  stated in the privacy policy, and this is the one place our "delete
  everything" posture has a documented exception.
- **Retention: 3 years after the consent ends** (user decision, 2026-09-20),
  per CNIL guidance on proof of consent. "Ends" = superseded by a newer decision
  or withdrawn. Pruning is a scheduled job, and is the *only* deletion path.
- **Best-effort recording, never blocking.** If the endpoint is down, the
  visitor's choice still applies locally — the cookie is still written and the
  banner still closes. A failed record is a missing row, never a broken banner.
- **Reuse `slowapi`**, already wired in `app/main.py` and used by
  `app/demo/routes.py`. No new rate-limiting infrastructure.

## Non-goals

- **Owner-facing privacy controls** — STA-325. A control used there becomes a
  decision this ledger records, but the UI and the revocation-gap fix are not
  here.
- **Replacing the cookie.** The cookie stays the source of truth for what fires
  on the page. This is a record of the decision, not a second decision-maker.
- **Reading the ledger back in the product.** No UI, no export. Writing it is
  the obligation; surfacing it is STA-325 and a future DSAR flow.
- **Consent for end customers** (a café's cardholders). Different controller,
  different surface, out of scope.
- **IAB TCF / consent strings.** We are not in programmatic advertising.
- **Migrating existing cookies.** Choices already made have no record and cannot
  retroactively gain one. The ledger starts empty and fills as people re-decide
  under v2, which the version bump is already forcing.

## Schema

Migration `174_consent_records.sql`, idempotent.

```sql
CREATE TABLE IF NOT EXISTS consent_records (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id   uuid        NOT NULL,
  version      integer     NOT NULL,
  analytics    boolean     NOT NULL,
  marketing    boolean     NOT NULL,
  regime       text        NOT NULL CHECK (regime IN ('opt-in','opt-out')),
  surface      text        NOT NULL CHECK (surface IN ('banner','notice','preferences')),
  decided_at   timestamptz NOT NULL,   -- the visitor's clock, evidence
  recorded_at  timestamptz NOT NULL DEFAULT now(),  -- ours, trustworthy
  user_id      uuid        REFERENCES users(id) ON DELETE SET NULL,
  business_id  uuid        REFERENCES businesses(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_consent_records_subject
  ON consent_records (subject_id, recorded_at DESC);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
```

<!-- The schema below is as planned. Two things changed in delivery, both
     recorded in gap-report.md: retention needed its own function (175/176)
     because "3 years after the consent ENDS" is a correlated rule that
     PostgREST cannot express, and `_prune_consent_records` in
     `app/services/retention_cleanup.py` calls it from the existing daily
     sweep rather than a new worker. -->

**RLS with zero policies**, exactly as migration 173 does — backend-only, and
the STA-323 review is a fresh reminder of what a missing `ENABLE ROW LEVEL
SECURITY` costs on a table holding personal data.

`ON DELETE SET NULL`, deliberately NOT `CASCADE`: deleting a business must not
delete the proof that its owner consented. That is the erasure decision
expressed in the schema. **These tables are therefore NOT added to
`_CONTENT_TABLES`** — the opposite of STA-323, and the reason is written into
the migration so nobody "fixes" it later.

## Edge cases considered

- **Endpoint unreachable**: the choice still applies locally. No retry storm,
  no blocking, no error shown. One row is lost; the next decision records.
- **Double submit** (double click, effect re-run): two rows. Deliberate —
  de-duplicating means deciding two identical decisions are one, and an
  append-only ledger should not make that judgement. The index makes them cheap.
- **Forged payload**: everything is validated and allowlisted before insert.
  The worst a forger achieves is a junk row under a `subject_id` they invented,
  attributable to nobody. It grants nothing and reads nothing.
- **Flood**: rate limited per IP via `slowapi`, with a payload cap. A ledger
  that can be inflated for free is a storage-amplification vector.
- **No cookie / storage blocked**: no `subject_id` can be persisted, so the
  chain is broken. Record anyway with a fresh id — an orphan record of a real
  decision beats no record.
- **`subject_id` absent or malformed**: mint a new one rather than rejecting.
- **A visitor who clears cookies**: a new `subject_id`, an unlinked chain. Not
  fixable and not worth trying to fix.
- **Signup linking**: the `subject_id` travels with the attribution cookie's
  existing journey, so `user_id`/`business_id` can be backfilled at business
  creation. If it is absent, the records stay anonymous — still valid evidence.
- **Clock skew / forged `decided_at`**: stored as given, never trusted alone.
  `recorded_at` is the one we would rely on.
- **Version bump mid-session**: the row records the version the visitor was
  actually shown, taken from the banner, not from the current constant.

## Acceptance criteria

- **AC1**: Accepting on the banner writes exactly one row carrying version,
  both categories, regime, surface `banner`, and both timestamps.
- **AC2**: Refusing writes a row too, with `analytics=false, marketing=false`.
- **AC3**: Given a stored v1 decision, when the visitor decides again under v2,
  then a SECOND row exists and the first is unchanged and still readable.
- **AC4**: Changing a choice in the preferences dialog writes a new row with
  surface `preferences`, and never updates an existing row.
- **AC5**: The US notice writes a row with surface `notice` and regime
  `opt-out`.
- **AC6**: Given the endpoint returns 500, when a visitor accepts, then the
  banner still closes, the cookie is still written, the tags still load, and no
  error is shown.
- **AC7**: An oversized or malformed payload is rejected with no row written.
- **AC8**: Exceeding the rate limit returns 429 and writes no row.
- **AC9**: A forged `subject_id` that is not a UUID is replaced, not trusted.
- **AC10**: Given a visitor with existing anonymous records signs up, then
  those rows gain `user_id` and `business_id`, and NO new row is written —
  linking is not a decision.
- **AC11**: Deleting a business leaves its consent rows in place with
  `business_id` NULL, and NOT deleted — the opposite of every other
  business-scoped table.
- **AC12**: No application code path issues an UPDATE or DELETE against
  `consent_records` except the retention job, **and the two link-only updates
  named below**.

  <!-- Corrected 2026-09-20. As first written this AC contradicted AC10: the
       plan demanded append-only in absolute terms while also requiring that
       anonymous rows be joined to an account at signup, which is an UPDATE.
       The coverage audit caught the contradiction. The resolution is a
       column-scoped carve-out rather than a weakening: both permitted updates
       write ONLY `user_id`/`business_id` and can never touch the decision. -->

  Permitted writers, each pinned by a test:
  - `consent_ledger.record_decision` — the insert. Append-only by definition.
  - `consent_ledger.link_subject_to_account` — fills `user_id`/`business_id`
    where they were NULL, at signup.
  - `account_deletion.purge_business_data` — clears those same two columns at
    erasure. Necessary because the `ON DELETE SET NULL` cascade **never fires**:
    the purge anonymises the business and scrubs the user *in place* rather
    than deleting either row, so without an explicit unlink the identifiers
    would survive erasure and remain joinable to ten years of billing records.
  - `prune_consent_records()` in migrations 175/176 — the only DELETE.

  `TestAppendOnlyIsEnforcedRepoWide` walks the source tree and fails if any
  other module touches the table.

- **AC13** (added 2026-09-20, from the security review): the public endpoint
  refuses a body larger than 4 KB on `Content-Length` alone, before reading it,
  and no parser error can escape as a non-204 — including `RecursionError`,
  which is not a `ValueError` and previously produced a 500 from deeply nested
  input.
- **AC14** (added 2026-09-20, from the security review): a decision whose
  `subject_id` was forged produces a row under a fresh id and therefore has no
  successor. Such orphans must still be prunable, or an unauthenticated caller
  can grow the table without bound. Migration 176 prunes singletons past the
  window; a RECENT singleton — an ordinary live visitor — is never pruned.

## Touched areas and risks

- **`ConsentBanner` / `ConsentPreferences`** are the compliance surface. A
  regression that blocks a click is worse than the missing ledger: the record
  must be fire-and-forget.
- **`lib/consent.ts`** gains `subject_id` in the cookie, so
  `CONSENT_VERSION` and `parseConsentCookie` are touched. `consent.test.ts` is
  large and exacting; expect fixture churn and treat an unexpected pass as
  suspicious.
- **New public write endpoint** — the pattern STA-323's review flagged. It
  should get a `security-reviewer` pass on that basis alone.
- **`_CONTENT_TABLES` must NOT gain these tables.** The reflex from STA-323 is
  exactly wrong here.
- **Privacy policy** needs a new subsection and a retention row, in four
  locales, and `legal.test.ts` enforces parity.

## Docs impact (preliminary)

**Yes, certainly.** The policy must disclose that the decision itself is
recorded server-side, that `subject_id` is an identifier we set, the 3-year
retention, and — most importantly — that erasure is refused for these records
with the Art. 17(3) basis stated. That last one is a documented exception to
our own "delete everything" posture and must be explicit rather than buried.

Whether this warrants a `CONSENT_VERSION` bump to 3 is a Phase 6 question. It
arguably does not: nothing new fires on the visitor's device, and the recipients
are unchanged. The processing added is our own record-keeping about a choice
they are actively making. Revisit against the real diff.
