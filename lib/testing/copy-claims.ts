/**
 * Claim guards shared by every test that reads copy: the catalogs in
 * `messages/` (`i18n-catalogs.test.ts`), the blog (`plans/product-claims.test.ts`)
 * and the TypeScript copy of the Platform page and its previews
 * (`landing-pages/copy.test.ts`).
 */

/** What may join a number to "day": whitespace, a hyphen, or a Unicode hyphen (U+2010, and the no-break U+2011 the pages write). */
const JOIN = String.raw`[\s\-\u2010\u2011]`;

/** The site's languages, as `routing.locales` lists them. */
export type ClaimLocale = "en" | "fr" | "es" | "pl";

/** A letter or digit never touches the claim: `\b` fails next to an accented letter, so the edges are spelled out. */
const bounded = (sources: string[]) => `(?<![\\p{L}\\p{N}])(?:${sources.join("|")})(?![\\p{L}\\p{N}])`;

/**
 * A trial length written as a month, in each language. Only the singular counts: the closed founding
 * programme's "3 months free" is a different offer, not the trial.
 */
const MONTH_TRIAL_SOURCES: Record<ClaimLocale, string[]> = {
  en: [
    String.raw`free\s+month`,
    String.raw`month\s+free`,
    String.raw`first\s+month\s+is\s+free`,
    String.raw`month${JOIN}long\s+(?:free\s+)?trial`,
  ],
  fr: [
    String.raw`mois\s+(?:gratuit|offert|d['\u2019]essai)`,
    String.raw`gratuit(?:ement)?\s+pendant\s+(?:1|un)\s+mois`,
    String.raw`essai\s+(?:gratuit\s+)?d['\u2019]un\s+mois`,
  ],
  es: [
    String.raw`mes\s+(?:gratis|gratuito|de\s+prueba|de\s+regalo)`,
    String.raw`primer\s+mes\s+(?:es\s+)?gratis`,
    String.raw`gratis\s+(?:durante|por)\s+(?:1|un)\s+mes`,
  ],
  pl: [
    String.raw`(?:darmow|bezp\u0142atn)\p{L}*\s+miesi\u0105c(?:a|u|em)?`,
    String.raw`miesi\u0105c(?:a|u|em)?\s+(?:za\s+darmo|gratis|pr\u00f3bn\p{L}*)`,
    String.raw`za\s+darmo\s+(?:przez\s+)?(?:1|jeden)\s+miesi\u0105c(?:a|u|em)?`,
  ],
};

/** A trial length written as a count of days, in each language. */
const DAYS_TRIAL_SOURCES: Record<ClaimLocale, string[]> = {
  en: [
    String.raw`\d+${JOIN}*(?:days?|jours?)${JOIN}*(?:free|trial)`,
    String.raw`free\s+(?:for\s+)?\d+${JOIN}*days?`,
    String.raw`\d+${JOIN}*days?\s+for\s+free`,
  ],
  fr: [
    String.raw`\d+${JOIN}*jours?${JOIN}+(?:gratuits?|offerts?|d['\u2019]essai)`,
    String.raw`essai\s+(?:gratuit\s+)?de\s+\d+\s+jours?`,
    String.raw`(?:gratuit|offert)s?\s+(?:pendant|durant)\s+\d+\s+jours?`,
  ],
  es: [
    String.raw`\d+${JOIN}*d[i\u00ed]as?${JOIN}+(?:gratis|gratuitos?|de\s+prueba)`,
    String.raw`prueba\s+(?:gratis|gratuita)\s+de\s+\d+\s+d[i\u00ed]as?`,
    String.raw`gratis\s+(?:durante|por)\s+\d+\s+d[i\u00ed]as?`,
  ],
  pl: [
    String.raw`\d+${JOIN}*dni${JOIN}+(?:za\s+darmo|gratis|pr\u00f3bn\p{L}*|darmow\p{L}*)`,
    String.raw`okres\s+pr\u00f3bny\s+(?:trwa\s+)?\d+\s+dni`,
    String.raw`za\s+darmo\s+(?:przez\s+)?\d+\s+dni`,
  ],
};

const LOCALES: ClaimLocale[] = ["en", "fr", "es", "pl"];

/**
 * A trial length written as a month, per language.
 *
 * Every plan starts with the same trial in every market (`MARKETS[].trialDays`)
 * and it is never a month. The blog, which cannot read the token, is checked
 * with these alone: a post that quotes a competitor's "30-day free trial" is
 * not a Stampeo claim.
 */
export const MONTH_TRIAL = Object.fromEntries(
  LOCALES.map((locale) => [locale, new RegExp(bounded(MONTH_TRIAL_SOURCES[locale]), "iu")]),
) as Record<ClaimLocale, RegExp>;

/**
 * A trial length written into words (a month or a count of days), in any
 * language.
 *
 * The trial is `MARKETS[market].trialDays` and every page reads it through the
 * `{trialDays}` placeholder, so the number lives in one place. A length typed
 * into a string is the promise that drifts from what the backend grants.
 */
export const WORDED_TRIAL = new RegExp(
  bounded(LOCALES.flatMap((locale) => [...MONTH_TRIAL_SOURCES[locale], ...DAYS_TRIAL_SOURCES[locale]])),
  "iu",
);

/**
 * "Card" on this site means two different things.
 *
 * The LOYALTY card is the product: "no card to lose", "sin tarjetas que
 * perder" are good copy about something else. The PAYMENT card is the one the
 * trial does not ask for, so the site may say a card is not required to
 * start. Every branch below is anchored to the payment sense: an English "no
 * card" only counts when it is "required"/"needed", and the other languages
 * must name the card type or the verb. A looser pattern would match the
 * product's own tagline.
 */
export const NO_CARD_CLAIM = new RegExp(
  [
    // EN: "required"/"needed" is what makes it the payment sense.
    String.raw`no\s+(?:credit\s+|debit\s+|payment\s+)?card\s+(?:is\s+)?(?:required|needed)`,
    String.raw`no\s+payment\s+(?:details|method)\s+(?:is\s+|are\s+)?(?:required|needed)`,
    String.raw`(?:don'?t|do\s+not)\s+need\s+a\s+(?:credit\s+|debit\s+|payment\s+)?card`,
    // FR / ES / PL: the card type, or the verb, has to be named.
    String.raw`(?:sans|aucune?|pas\s+de)\s+carte\s+(?:bancaire|de\s+crédit|de\s+paiement)`,
    String.raw`sin\s+tarjeta\s+(?:de\s+crédito|bancaria|de\s+pago)`,
    String.raw`no\s+hace\s+falta\s+(?:una\s+)?tarjeta\s+(?:de\s+crédito|bancaria|de\s+pago)`,
    String.raw`bez\s+karty\s+(?:kredytowej|płatniczej)`,
  ].join("|"),
  "i",
);

/** Not preceded by a negation, so "no card required" is the claim the site may make and is not read as the one it may not. */
const NOT_NEGATED = String.raw`(?<!\bno\s)(?<!\bno\s(?:credit|debit|payment|bank)\s)`;

/**
 * Saying a payment card is needed to START the trial, in each language. The
 * trial begins without one; a card is added when the owner chooses a plan, and
 * copy may say so as long as it does not make the card a condition of starting.
 */
export const CARD_NEEDED: Record<ClaimLocale, RegExp> = {
  en: new RegExp(
    [
      String.raw`\bask(?:s|ed|ing)?\s+(?:you\s+)?for\s+(?:a|your)\s+(?:(?:credit|debit|payment|bank)\s+)?card`,
      String.raw`${NOT_NEGATED}\bcard\s+(?:is\s+)?(?:required|needed)\s+(?:to|at|for|before)\s+(?:start|begin|sign|try|the\s+trial)`,
      String.raw`\b(?:requires?|needs?)\s+(?:a|your)\s+(?:(?:credit|debit|payment|bank)\s+)?card\s+(?:to|at|for|before)\s+(?:start|begin|sign)`,
      String.raw`\bcard\s+(?:up\s?front|on\s+file\s+to\s+start)`,
      String.raw`\b(?:enter|add|give|provide)\s+(?:a|your)\s+(?:(?:credit|debit|payment|bank)\s+)?card\s+(?:to|before)\s+(?:start|begin|try)`,
    ].join("|"),
    "i",
  ),
  fr: new RegExp(
    [
      String.raw`\bdemand(?:ons|e)\s+(?:votre|une)\s+(?:carte|cb\b)`,
      String.raw`(?<!aucune\s)(?<!pas\sde\s)(?<!sans\s)\bcarte\s+(?:bancaire\s+)?(?:(?:est|sera)\s+)?(?:demandée|requise|nécessaire|obligatoire|exigée)(?![\p{L}\p{N}])`,
      String.raw`\bcarte\s+(?:bancaire\s+)?à\s+l['’]inscription`,
      String.raw`\b(?:saisir|renseigner|ajouter|fournir)\s+(?:votre|une)\s+carte\s+(?:bancaire\s+)?(?:pour|avant\s+de)\s+(?:démarrer|commencer|essayer)`,
    ].join("|"),
    "iu",
  ),
  es: new RegExp(
    [
      String.raw`\bpedimos\s+(?:una|la|tu)\s+tarjeta`,
      String.raw`\btarjeta\s+(?:bancaria\s+|de\s+crédito\s+)?(?:es\s+)?(?:obligatoria|necesaria|requerida|exigida)\b`,
      String.raw`(?<!\bno\s)\b(?:necesit|requier|exig)\p{L}+\s+(?:una|tu|la)\s+tarjeta\s+(?:bancaria\s+)?para\s+(?:empezar|iniciar|comenzar)`,
    ].join("|"),
    "iu",
  ),
  pl: new RegExp(
    [
      String.raw`\bprosimy\s+o\s+kart\p{L}*`,
      String.raw`\bkart[aęy]\s+(?:płatnicz\p{L}*\s+|kredytow\p{L}*\s+)?(?:jest\s+)?(?:wymagan\p{L}*|obowiązkow\p{L}*|konieczn\p{L}*)`,
      String.raw`\bwymagamy\s+kart\p{L}*`,
      String.raw`\bwymagane\s+jest\s+podanie\s+kart\p{L}*`,
    ].join("|"),
    "iu",
  ),
};

/** Saying a payment card is needed to start the trial, in any language. */
export const CARD_NEEDED_CLAIM = new RegExp(
  Object.values(CARD_NEEDED)
    .map((pattern) => `(?:${pattern.source})`)
    .join("|"),
  "iu",
);

/** A count of days written as a number ("14 days", "30-day"): the trial is the {trialDays} token. */
export const DIGIT_DAYS = new RegExp(String.raw`\d+${JOIN}*days?\b`, "i");
