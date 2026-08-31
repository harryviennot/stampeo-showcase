/**
 * Apple / Google badge artwork, per locale.
 *
 * These badges are trademarked assets. We ship Apple's and Google's own
 * localized art and never redraw it, so a locale only gets its own badge once
 * a human has downloaded the official file into `public/` (see below). Every
 * other locale falls back to the English badge, which is the widely recognized
 * form and is what Apple and Google themselves suggest when no localization
 * exists.
 *
 * Adding a locale is two steps:
 *   1. drop `AppleWallet<XX>.svg`, `GoogleWallet<XX>.svg`, `AppStore<XX>.svg`
 *      and `GooglePlay<XX>.svg` into `showcase/public/`, where `<XX>` is the
 *      uppercased locale code;
 *   2. add the locale here.
 *
 * Official sources:
 *   Apple Wallet  https://developer.apple.com/wallet/add-to-apple-wallet-guidelines/
 *   App Store     https://developer.apple.com/app-store/marketing/guidelines/
 *   Google Wallet https://developers.google.com/wallet/generic/resources/brand-guidelines
 *   Google Play   https://play.google.com/intl/en_us/badges/
 *
 * Keep in sync with `web/src/lib/store-badges.ts`.
 */

/** Locales whose official badge artwork is present in `public/`. */
const LOCALIZED_BADGE_LOCALES = new Set(["fr", "es", "pl"]);

/** `""` for the English default, `"FR"` / `"ES"` / … when art exists. */
function badgeSuffix(locale: string): string {
  return LOCALIZED_BADGE_LOCALES.has(locale) ? locale.toUpperCase() : "";
}

/** "Add to Apple Wallet" / "Add to Google Wallet" badges. */
export function walletBadges(locale: string): { apple: string; google: string } {
  const suffix = badgeSuffix(locale);
  return {
    apple: `/AppleWallet${suffix}.svg`,
    google: `/GoogleWallet${suffix}.svg`,
  };
}

/** "Download on the App Store" / "Get it on Google Play" badges. */
export function storeBadges(locale: string): { apple: string; google: string } {
  const suffix = badgeSuffix(locale);
  return {
    apple: `/AppStore${suffix}.svg`,
    google: `/GooglePlay${suffix}.svg`,
  };
}
