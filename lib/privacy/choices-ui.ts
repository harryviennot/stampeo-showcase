import type { ConsentCategory, ConsentState } from "../consent";
import { gpcDeniedCategories } from "./policy";
import { POLICY_MATRIX, type PolicyMatrix, type PolicyRow, type PolicySurface } from "./policy-matrix";

/**
 * What the privacy-choices surfaces show, decided from the visitor's policy
 * row. Pure, so the components only render the answers. A notice row gets the
 * `us` dialog; any other row gets the `eu` one.
 */

/** Message keys under `common`: the footer label, and the notice's button. */
export const PRIVACY_CHOICES_KEY = "footer.privacyChoices";
export const COOKIE_PREFERENCES_KEY = "footer.cookiePreferences";

/**
 * The footer entry's label. A row whose surface is a notice gets the statutory
 * title and icon, whether or not a subject has been minted on this page;
 * everyone else, and the server render (which is the strict row), gets the
 * generic label, so the slot is never empty and swaps at most once.
 */
export function choicesLabel(input: { surface: PolicySurface }): {
  key: typeof PRIVACY_CHOICES_KEY | typeof COOKIE_PREFERENCES_KEY;
  icon: boolean;
} {
  const statutory = input.surface === "notice";
  return { key: statutory ? PRIVACY_CHOICES_KEY : COOKIE_PREFERENCES_KEY, icon: statutory };
}

/** The keys the notice's two controls read: the footer's statutory label, and its own dismiss. */
export const NOTICE_KEYS = { choices: PRIVACY_CHOICES_KEY, dismiss: "cookies.notice.dismiss" } as const;

/** A touch target on the banner, the notice and the dialog: `h-11` is 44px. */
export const TAP_TARGET = "h-11";

/** The dialog's action row stays at the bottom while the cards scroll, so Save is always in reach. */
export const DIALOG_ACTION_ROW =
  "sticky bottom-0 -mx-5 mt-4 flex gap-2 bg-[var(--paper)] px-5 pb-5 pt-2 before:pointer-events-none before:absolute before:inset-x-0 before:-top-4 before:h-4 before:bg-linear-to-t before:from-[var(--paper)] before:to-transparent sm:-mx-6 sm:justify-end sm:px-6 sm:pb-6";

/** A switch row spans its card: its padding plus the 24px track is 44px tall. */
export const SWITCH_ROW = { padding: "pb-1 pt-4", track: "h-6" } as const;

/** A label cut before its last word, so an icon can stay with that word when it wraps. */
export function splitLastWord(label: string): { head: string; tail: string } {
  const cut = label.lastIndexOf(" ") + 1;
  return { head: label.slice(0, cut), tail: label.slice(cut) };
}

export type PreferencesVariant = "us" | "eu";
export type PreferenceCard = "necessary" | ConsentCategory;

/** Which GPC sentence the status row shows: both purposes off, or advertising only. */
export type GpcStatus = "all" | "advertising";

export interface PreferencesView {
  variant: PreferencesVariant;
  /** Card order, top to bottom. */
  order: readonly PreferenceCard[];
  /** Categories shown as an "off" label instead of a switch. */
  locked: readonly ConsentCategory[];
  /** The GPC status row, or null when there is nothing to explain. */
  gpcStatus: GpcStatus | null;
  /** Every choice is locked, so the only action is Close. */
  onlyClose: boolean;
  /** The intro's key under `common.cookies.prefs`: a dialog with nothing left to switch has its own. */
  intro: "intro" | "us.intro" | "us.introLocked";
  /** How long the intro says a choice is kept. */
  months: number;
}

const CONSENT_CATEGORIES: readonly ConsentCategory[] = ["analytics", "marketing"];

const ORDER: Record<PreferencesVariant, readonly PreferenceCard[]> = {
  // The control a visitor came to flip sits under the intro, not below the fold.
  us: ["marketing", "analytics", "necessary"],
  eu: ["necessary", "analytics", "marketing"],
};

const DAYS_PER_MONTH = 365.25 / 12;

/** Whole months, at least one: 400 days is 13, 182 days is 6. */
export function monthsFromDays(days: number): number {
  return Math.max(1, Math.round(days / DAYS_PER_MONTH));
}

/**
 * The dialog for this row and GPC state. A notice row is the US dialog and its
 * intro is about how long a refusal lasts; any other row is the EU dialog and
 * says how long its choice is kept, the shorter of a grant and a refusal.
 */
export function preferencesView(
  row: PolicyRow,
  gpc: boolean,
  matrix: PolicyMatrix = POLICY_MATRIX,
): PreferencesView {
  const variant: PreferencesVariant = row.surface === "notice" ? "us" : "eu";
  const denied = gpcDeniedCategories(row, gpc, matrix);
  const onlyClose = CONSENT_CATEGORIES.every((category) => denied.includes(category));
  const days =
    variant === "us" ? row.refusal_ttl_days : Math.min(row.grant_ttl_days, row.refusal_ttl_days);

  return {
    variant,
    order: ORDER[variant],
    locked: denied,
    gpcStatus: denied.length === 0 ? null : denied.includes("analytics") ? "all" : "advertising",
    onlyClose,
    intro: variant === "eu" ? "intro" : onlyClose ? "us.introLocked" : "us.intro",
    months: monthsFromDays(days),
  };
}

/**
 * What "Got it" on the notice records: the state already in force, so it only
 * dismisses. A refusal is kept and a category with no choice takes the row's
 * default; it never grants what was refused.
 */
export function noticeAcknowledgement(inForce: ConsentState): ConsentState {
  return { analytics: inForce.analytics, marketing: inForce.marketing };
}

/** The draft to save: a locked category is off, whatever the draft says. */
export function applyLocks(draft: ConsentState, locked: readonly ConsentCategory[]): ConsentState {
  return {
    analytics: draft.analytics && !locked.includes("analytics"),
    marketing: draft.marketing && !locked.includes("marketing"),
  };
}
