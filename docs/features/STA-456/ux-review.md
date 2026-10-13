# UX Review: STA-456
MODE: POLISH   DOMAIN: showcase
VIEWED: code + screenshots (390x844 with an iOS Instagram user agent, en + fr; 1440x900 en)
VERDICT: FIXED WITH FINDINGS

## Fixed
- `components/onboarding/steps/InAppAuthChooser.tsx:113-126` - The fallback "Continue with {provider} here" button was a full-width outlined `h-11` pill, the same as the method rows and the Back button. At 390px it read as a fourth method row. It also sat 12px from both the tapped row and the next one, so it was unclear which row it belonged to. -> It is now a centred, auto-width, filled `bg-[var(--muted)]` pill (still `h-11`, so a 44px tap target) with no border, `font-semibold`, and the provider logo at 16px. That makes it clearly a follow-up to its row rather than another method. The block is tighter to its row (`pt-2`) and has `pb-2` before the next row, so it groups with the row above. The hint got `text-balance`, which stops the French two-line hint from leaving a ragged last line. A `focus-visible` accent ring was added.

## Mobile findings
- `InAppAuthChooser.tsx` fallback block - at 390px it read as an extra full-width row (see Fixed) - fixed.
- `PasswordRequirement` on the onboarding email form at 390px (en, fr) - fits on one line, ticks green at 8 characters, and the spacing matches the field above. No issue.
- `/reset-password` - not viewed live (the form only renders with a valid recovery token). Reviewed from the code: the same component in the same `space-y-2` field group, so the spacing is the same as before. No issue found.

## Brief drift
- The plan's "UX decisions" call for "a secondary 'Continue with … here' button". It is still secondary, now as a filled, auto-width pill rather than an outlined full-width one. The intent is the same; only the visual weight changed.
- In-app order is Email, Google, Apple, the hint is a polite live region inside the card, and there is no sheet or dialog. All of this matches the plan.

## Copy flagged
- `messages/fr/onboarding.json` `createAccount.escapeHint` - « Ouvrir dans le navigateur » uses plain spaces inside the guillemets, so at 390px a line can break between « and the word (seen before the `text-balance` fix; the break could come back at other widths). The spaces inside the guillemets and before `?` should be no-break spaces (U+202F or U+00A0). The `chooseTitle` "compte ?" has the same problem, and it shows today: the "?" sits alone on its own line at 390px. That key is not part of this diff. (for stampeo-copywriting)

## Left alone
- `components/auth/PasswordRequirement.tsx` - the requirement line is not linked to its input with `aria-describedby`. The fix needs a new optional `id` prop plus wiring at both call sites, and the reset page already uses `aria-describedby` conditionally for refusals. That is an accessibility follow-up for the implementer, not a polish edit.
- `/reset-password` keeps its amber gradient submit and amber focus ring, while onboarding uses `--accent`. This predates the diff. Left for a later reset-page pass.

## Verification
- type-check: pass   lint: pass (0 errors; 6 warnings, all in files outside the diff, e.g. `components/landing-variant/*`, `lib/consent-ledger.test.ts`)
- screenshots: taken with playwright-core and system Chrome against a worktree dev server on :3457 (now stopped). They are in `/tmp/sta456-ux-shots/` and are not committed: `ig-en-fallback.png` / `ig-fr-fallback.png` (before), `ig-en2-fallback.png` / `ig-fr2-fallback.png` (after), `ig-fr-form-empty.png`, `ig-fr-form-met.png`, `desk-en-form-met.png`.
