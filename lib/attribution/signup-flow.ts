/**
 * Leaving the onboarding wizard for the dashboard once an account is confirmed.
 *
 * The page is replaced by the dashboard, so the account sign-up call has to
 * have left it first: it starts at once, runs alongside any profile sync, and
 * is awaited (it is bounded, see `recordAccountSignup`) before the draft is
 * cleared and the page navigates.
 */

export interface LeaveOnboarding {
  /** Starts the sign-up call; resolves when it has been handed to the browser. Never rejects. */
  reportSignup: () => Promise<void>;
  /** Writes what the wizard collected to the new profile, when there is something to write. */
  syncProfile?: () => Promise<void>;
  clearDraft: () => void;
  leave: () => void;
}

export async function leaveOnboarding(steps: LeaveOnboarding): Promise<void> {
  const reported = steps.reportSignup();
  await steps.syncProfile?.();
  await reported;
  steps.clearDraft();
  steps.leave();
}
