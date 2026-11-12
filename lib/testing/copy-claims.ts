/**
 * Claim guards shared by every test that reads copy: the catalogs in
 * `messages/` (`i18n-catalogs.test.ts`) and the TypeScript copy of the
 * `/us/landing-pages/*` pages (`landing-pages/copy.test.ts`).
 */

/**
 * A trial length written into words cannot follow the market.
 *
 * `/us` grants 14 days (`TRIAL_DAYS_BY_COUNTRY` in the backend's
 * `app/core/pricing_region.py`, mirrored by `MARKETS.us.trialDays`). Every
 * English page reachable from the /us nav that says "your free month" is
 * telling an American visitor something Stripe will not honour. The supported
 * form is the `{trialDays}` placeholder, which reads the market.
 *
 * Scoped to English: fr/es/pl genuinely get 30 days, so "1 mois gratuit" is
 * true there and stays.
 */
export const WORDED_TRIAL =
  /\b(?:free month|month free|one month free|\d+[\s-]*(?:days?|jours?)[\s-]*(?:free|trial)|free\s+(?:for\s+)?\d+[\s-]*days?|\d+[\s-]*days?\s+for\s+free|first\s+month\s+is\s+free)\b/i;

/**
 * "Card" on this site means two different things, and only one of them is a
 * promise we cannot keep.
 *
 * The LOYALTY card is the product: "no card to lose", "sin tarjetas que
 * perder" are true and are good copy. The PAYMENT card is the one
 * `requires_card_upfront` (backend migration 86) collects before the dashboard
 * opens, so "no credit card required" would be flatly false. It is the single
 * most tempting line in SaaS hero copy and we are not entitled to it.
 *
 * So every branch below is anchored to the payment sense: an English "no card"
 * only counts when it is "required"/"needed", and the other locales must name
 * the card type. A looser pattern would flag the product's own tagline.
 */
export const NO_CARD_CLAIM = new RegExp(
  [
    // EN: "required"/"needed" is what makes it the payment sense.
    String.raw`no\s+(?:credit\s+|debit\s+|payment\s+)?card\s+(?:required|needed)`,
    String.raw`no\s+payment\s+(?:details|method)\s+(?:required|needed)`,
    // FR / ES / PL: the card type has to be named.
    String.raw`sans\s+carte\s+(?:bancaire|de\s+cr\u00e9dit|de\s+paiement)`,
    String.raw`sin\s+tarjeta\s+(?:de\s+cr\u00e9dito|bancaria|de\s+pago)`,
    String.raw`bez\s+karty\s+(?:kredytowej|p\u0142atniczej)`,
  ].join('|'),
  'i',
);
