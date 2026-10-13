# Quality Report: STA-421 (reset batch: STA-418 / STA-420 / STA-421)
REVIEWED: 2026-10-11  DIFF: uncommitted worktree `the batch worktree` vs HEAD f9c0a6c (batch-code.diff + batch-tests.diff)
VERDICT: FINDINGS

## Comments
- `lib/supabase/auth-provider.tsx:95`: contradiction. The comment says "Once per page load: revoke and delete…", but the ref guard at :91 only works per AuthProvider mount. The login, onboarding and reset-password layouts each mount their own provider, so the cleanup runs again on each of those layouts and never runs on any other page. Fix: `// On mount: revoke and delete any recovery session left in localStorage under supabase-js's default key.`
- `lib/privacy/credential-params.ts:74`: contradiction. The comment says "A copy of `value` with every string in it scrubbed", but `MAX_DEPTH = 12` (:10) returns objects and arrays at depth 12 untouched, so any string nested deeper is sent unscrubbed. The doc blocks at :86 ("every URL it carries") and :110 ("every URL in it") make the same claim. Fix: `/** A copy of value with every string scrubbed down to MAX_DEPTH levels; non-plain objects (dates, class instances) are kept as they are. */`, and give MAX_DEPTH a one-line reason.
- `lib/supabase/legacy-recovery-session.ts:21-27`: over-explained. The 6-line docstring repeats the catch comment at :61 ("The entry is deleted whatever the sign-out answers") and restates the `lock` and `autoRefreshToken: false` options set further down ("takes no lock and refreshes nothing"). Fix: cut it to `/** Revokes and deletes a recovery session left in localStorage under supabase-js's default key. No-op without one; never throws. */`
- History or narrative: none found in the added code comments. "legacy" appears only in identifiers.
- Density:
  - `app/[locale]/reset-password/page.tsx`: added 2.2% (2/93) vs baseline 1.2% (3/250). That is 1.8x, but only 2 lines, and both are one-line explanations of why. No action.
  - `lib/supabase/legacy-recovery-session.ts`: added 19.0% (12/63) vs a baseline of 9.3% (37/396) for the non-test files in lib/supabase. That is 2.0x. The docstring trim above brings it to about 14%.
  - All within baseline:
    - recovery-client.ts: 18.3% vs 22.9%
    - auth-provider.tsx: 5.0% vs 8.9%
    - credential-params.ts: 24.3% vs 27.1% (lib/privacy)
    - reset-page-state.ts: 19.4%, and login-link.ts: 20.0%, vs 24.8% (lib/auth)

## File size
None found.
- `app/[locale]/reset-password/page.tsx`: 273 -> 334 lines
- `lib/supabase/auth-provider.tsx`: 270 -> 292
- `lib/supabase/recovery-client.ts`: 51 -> 115
- `components/onboarding/steps/AuthenticationStep.tsx`: 553 -> 554. It was already over 500 before this change and grows by 1 line, so no action.

No file grows by more than 300 lines.

## Folder tree
None found.
- lib/auth: 7 -> 11 entries
- lib/privacy: 23 -> 25
- lib/supabase: 5 -> 7

Nothing was added directly to `lib/`, which has 93 entries.

## Flag-gated paths
- No feature flag is read anywhere in the diff.
- Transitional cleanup with no removal item: `lib/supabase/legacy-recovery-session.ts` and the effect at `lib/supabase/auth-provider.tsx:91-111` run on every AuthProvider mount with no end date. Neither `docs/features/STA-421/plan.md` (non-goals or edge cases) nor the STA-420 failure report says when to delete them.
  - Fix: open a follow-up issue: "delete legacy-recovery-session.ts and the AuthProvider effect once old recovery refresh tokens can no longer be live."
  - Cleanup issue: missing.

## Test shape
- Ratio: 593 test lines / 462 code lines = 1.28 (1.37 without the catalog JSON). Under 3:1. The largest test file is 207 lines.
- `lib/supabase/legacy-recovery-session.test.ts:65, :85`: implementation detail. `expect(signOut).toHaveBeenCalledTimes(1)` checks an exact mock call count, and the real-client test at :174 already pins exactly one logout request. Fix: delete both lines and keep `toHaveBeenCalledWith` at :66.
- Same file, `:70-76`: implementation detail. These lines pull the `createClient` options out of the mock and call the `lock` function directly. The browser test at :174-179 already checks the visible result: the app's lock is never requested and no broadcast is sent. Fix: delete the lock call at :75-76. The two option checks at :73-74 can stay.
- Same file, `:89-100` and `:102-115`: copied setup. Both tests spell out the full `clearLegacyRecoverySession({...})` arguments again, and :112 rebuilds the createClient mock that `run()` (:41-50) already makes. Fix: let `run(storage, { signOut?, createClient? })` take overrides.
- Same file, `:18`: copied setup. `fakeStorage` duplicates `lib/auth/use-has-session.test.ts:46` (the same Map-backed getItem/setItem/removeItem). Fix: move it to `lib/testing/fake-storage.ts`, next to `restore-globals.ts`, and import it in both files.
- `lib/auth/reset-page-state.test.ts:20-36` together with `:44-50`: duplicate. Three single-expect tests (no token, pending, verified) differ only in input and expected view from the `test.each` failure table. Fix: one `test.each([label, input, expected])`.
  - The title at :20 says "whatever the verify state says" but tests only `pending`. Add the other states as rows.
  - `:17` writes the reason union out inline. Fix: import `VerifyFailureReason`.
- `lib/supabase/recovery-client.test.ts:137`: copied constant. The locale list `["fr", "en", "es", "pl"]` is hard-coded, but the file already imports from `../testing/catalogs`, which exports `catalogLocales()`. Fix: `for (const locale of catalogLocales())`.

## Waivers
(filled by the main agent only if the user explicitly waives a finding)

## Resolution (2026-10-11)

- Comments: all three fixed. The provider comment is moot now: the cleanup moved to `components/auth/LegacyRecoverySessionCleanup.tsx` (security review). `MAX_DEPTH` has a one-line reason, and the cleanup docstring is cut to three lines.
- Removal item: filed as STA-426 (due 2027-04-01).
- Test shape: the call-count and lock-call assertions are gone; `run()` takes overrides; `fakeStorage` lives in `lib/testing/fake-storage.ts` (used by both files); the reset-page-state tests import `VerifyFailureReason` and cover several verify states for "no token"; the catalog loop uses `catalogLocales()`.
- Kept as separate tests: the three single-state `resetPageView` tests (no token, pending, verified), since each names a different state.
