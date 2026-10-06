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
 * title and icon; everyone else, and anyone before the row is known, gets the
 * generic label, so the slot is never empty and swaps at most once.
 */
export function choicesLabel(input: { surface: PolicySurface; ready: boolean }): {
  key: typeof PRIVACY_CHOICES_KEY | typeof COOKIE_PREFERENCES_KEY;
  icon: boolean;
} {
  const statutory = input.ready && input.surface === "notice";
  return { key: statutory ? PRIVACY_CHOICES_KEY : COOKIE_PREFERENCES_KEY, icon: statutory };
}

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
  const days =
    variant === "us" ? row.refusal_ttl_days : Math.min(row.grant_ttl_days, row.refusal_ttl_days);

  return {
    variant,
    order: ORDER[variant],
    locked: denied,
    gpcStatus: denied.length === 0 ? null : denied.includes("analytics") ? "all" : "advertising",
    onlyClose: CONSENT_CATEGORIES.every((category) => denied.includes(category)),
    months: monthsFromDays(days),
  };
}

/** The draft to save: a locked category is off, whatever the draft says. */
export function applyLocks(draft: ConsentState, locked: readonly ConsentCategory[]): ConsentState {
  return {
    analytics: draft.analytics && !locked.includes("analytics"),
    marketing: draft.marketing && !locked.includes("marketing"),
  };
}
