import { describe, expect, test } from "bun:test";
import { CARD_NEEDED, CARD_NEEDED_CLAIM, DIGIT_DAYS, MONTH_TRIAL, NO_CARD_CLAIM, WORDED_TRIAL, type ClaimLocale } from "./copy-claims";

/**
 * The trial-length guards read a number and "day" joined by a space, a hyphen
 * or a Unicode hyphen: the pages write "{trialDays}‑day" with U+2011 so it
 * never breaks across a line, and a worded "14‑day free trial" typed the same
 * way has to be caught too.
 */
const JOINERS = [
  ["a space", " "],
  ["a hyphen", "-"],
  ["U+2010 (hyphen)", "‐"],
  ["U+2011 (non-breaking hyphen)", "‑"],
] as const;

describe("the worded trial guard", () => {
  test.each(JOINERS)("flags a trial length joined by %s", (_name, joiner) => {
    for (const phrase of [
      `Your 14${joiner}day free trial starts today.`,
      `Try it free for 14${joiner}days.`,
      `14${joiner}days for free`,
      `Start a 14${joiner}day trial`,
    ]) {
      expect({ phrase, flagged: WORDED_TRIAL.test(phrase) }).toEqual({ phrase, flagged: true });
    }
  });

  test.each(JOINERS)("accepts the {trialDays} token joined by %s", (_name, joiner) => {
    expect(WORDED_TRIAL.test(`Your {trialDays}${joiner}day free trial starts today.`)).toBe(false);
    expect(WORDED_TRIAL.test(`Try it free for {trialDays}${joiner}days.`)).toBe(false);
  });
});

/** The trial as every language wrote it when it was a month: each is a promise the backend no longer keeps. */
const MONTH_SHAPES: ReadonlyArray<readonly [ClaimLocale, string]> = [
  ["en", "Start your free month and reward visits from day one."],
  ["en", "One month free, no commitment."],
  ["en", "1 month free, no catch"],
  ["fr", "Commencez votre mois gratuit et envoyez votre première diffusion cette semaine."],
  ["fr", "Un mois gratuit, sans engagement."],
  ["fr", "On accompagne chaque commerce gratuitement pendant 1 mois."],
  ["fr", "Chaque nouveau commerce a un mois offert."],
  ["es", "Empieza tu mes gratis y recompensa cada visita."],
  ["es", "Un mes gratis, sin compromiso."],
  ["es", "Gratis durante un mes, sin compromiso."],
  ["pl", "Zacznij darmowy miesiąc i nagradzaj wizyty."],
  ["pl", "Miesiąc za darmo, bez zobowiązań."],
];

describe("the worded trial guard, in every language", () => {
  test.each(MONTH_SHAPES)("%s: flags %p", (locale, phrase) => {
    expect(WORDED_TRIAL.test(phrase)).toBe(true);
    expect(MONTH_TRIAL[locale].test(phrase)).toBe(true);
  });

  test.each([
    ["fr", "30 jours gratuits pour tester"],
    ["fr", "Essai gratuit de 14 jours"],
    ["es", "30 días gratis, sin compromiso"],
    ["es", "Prueba gratis de 14 días"],
    ["pl", "30 dni za darmo"],
    ["pl", "Okres próbny trwa 14 dni"],
  ] as const)("%s: flags a count of days, %p", (_locale, phrase) => {
    expect(WORDED_TRIAL.test(phrase)).toBe(true);
  });

  test.each([
    "{trialDays} jours gratuits · Sans engagement",
    "Essai gratuit de {trialDays} jours",
    "{trialDays} días gratis · Sin compromiso",
    "Prueba gratuita de {trialDays} días",
    "{trialDays} dni za darmo · Rezygnujesz kiedy chcesz",
    "Zacznij darmowy okres próbny",
    "Commencez votre essai gratuit",
    "Empieza tu prueba gratis",
    "Retour à 30 jours",
    "Retorno a 30 días",
    "Powroty w 30 dni",
    "Not back for 30+ days",
    "Un mois après son ajout, 98 % des cartes sont encore là",
    "Starter, Growth y Pro: historial de 30 días",
  ])("leaves %p alone", (fine) => {
    expect(WORDED_TRIAL.test(fine)).toBe(false);
  });

  test.each(["3 months free", "3 mois offerts", "3 meses gratis", "3 miesiące za darmo"])(
    "the founding programme's several free months, %p, is another offer",
    (phrase) => {
      expect(WORDED_TRIAL.test(phrase)).toBe(false);
    },
  );

  test("a competitor's trial in days is not a Stampeo month", () => {
    for (const locale of ["en", "fr", "es", "pl"] as const) {
      expect(MONTH_TRIAL[locale].test("Stamp Me: 30-day free trial. Loopy: 15-day free trial.")).toBe(false);
    }
  });
});

describe("the no-card claim the site may make", () => {
  test.each([
    "Start free, no card required.",
    "No credit card needed",
    "No card is needed to start the trial.",
    "You don't need a card to start",
    "Essai gratuit, sans carte bancaire",
    "Aucune carte bancaire n'est demandée",
    "Pas de carte bancaire pour démarrer",
    "Prueba gratis, sin tarjeta de crédito",
    "Para empezar no hace falta tarjeta bancaria",
    "Wypróbuj bez karty kredytowej",
    "Okres próbny bez karty płatniczej",
  ])("recognises %p", (claim) => {
    expect(NO_CARD_CLAIM.test(claim)).toBe(true);
  });

  test.each([
    "No app to download, no card to lose.",
    "Sin aplicaciones que descargar, sin tarjetas que perder.",
    "Aucune appli à télécharger, aucune carte à perdre.",
    "Bez aplikacji do pobrania, bez plastiku do zgubienia.",
    "{trialDays} days free · Cancel anytime",
  ])("does not read the loyalty card into it: %p", (honest) => {
    expect(NO_CARD_CLAIM.test(honest)).toBe(false);
  });
});

/** Every sentence that made the card a condition of starting, as it shipped, plus the shapes it could take. */
const CARD_NEEDED_SHAPES: ReadonlyArray<readonly [ClaimLocale, string]> = [
  ["en", "We ask for your card to begin the trial, with no charge before they are up."],
  ["en", "We ask for a card to start the trial, and nothing is charged before the 14 days are up."],
  ["en", "A credit card is required to start the trial."],
  ["en", "Card required to start. Cancel anytime."],
  ["en", "Add a card to start your free trial."],
  ["en", "Every plan needs a card to start."],
  ["en", "Card upfront, nothing charged for 14 days."],
  ["fr", "Nous demandons votre carte pour démarrer l'essai, sans prélèvement avant la fin de cette période."],
  ["fr", "Votre carte bancaire est demandée pour démarrer l'essai, mais aucun débit n'a lieu avant la fin."],
  ["fr", "L'essai est gratuit : on vous demande une carte bancaire pour le démarrer, mais rien n'est débité avant la fin."],
  ["fr", "Carte bancaire requise pour commencer."],
  ["fr", "Carte bancaire à l'inscription, rien n'est débité avant la fin."],
  ["es", "Te pedimos la tarjeta para empezar la prueba, sin ningún cobro antes de que acaben."],
  ["es", "Te pedimos una tarjeta bancaria para empezar la prueba, pero no se hace ningún cargo."],
  ["es", "Tarjeta bancaria obligatoria para empezar."],
  ["es", "Necesitas una tarjeta para empezar la prueba."],
  ["pl", "Prosimy o kartę, żeby rozpocząć okres próbny, ale nic nie pobieramy."],
  ["pl", "Do startu prosimy o kartę płatniczą, ale nic nie pobieramy."],
  ["pl", "Karta płatnicza jest wymagana na start."],
  ["pl", "Przy rejestracji wymagane jest podanie karty płatniczej."],
];

describe("the claim that a card is needed to start", () => {
  test.each(CARD_NEEDED_SHAPES)("%s: flags %p", (locale, phrase) => {
    expect(CARD_NEEDED[locale].test(phrase)).toBe(true);
    expect(CARD_NEEDED_CLAIM.test(phrase)).toBe(true);
  });

  test.each([
    "Start free. No credit card required.",
    "No card required to start.",
    "No card is needed to start the trial.",
    "After 14 days, choose a plan and add your payment card to keep going.",
    "No app to download, no card to lose.",
    "Add your card to the wallet in one scan.",
    "Aucune carte bancaire requise pour démarrer.",
    "Sans carte bancaire requise, votre essai démarre aujourd'hui.",
    "Au bout de 14 jours, choisissez un plan et ajoutez votre carte bancaire pour continuer.",
    "Aucune carte n'est demandée pour démarrer l'essai.",
    "Ajoutez la carte de fidélité à votre téléphone.",
    "No necesitas tarjeta para empezar.",
    "No necesitas una tarjeta para empezar.",
    "Al terminar, eliges un plan y añades tu tarjeta bancaria para seguir.",
    "Karta nie jest wymagana na start.",
    "Po upływie 14 dni wybierasz plan i dodajesz kartę płatniczą, żeby korzystać dalej.",
  ])("leaves %p alone", (honest) => {
    expect(CARD_NEEDED_CLAIM.test(honest)).toBe(false);
  });
});

describe("the digit-day guard", () => {
  test.each(JOINERS)("flags a count of days joined by %s", (_name, joiner) => {
    for (const phrase of [`Cancel within 14${joiner}day`, `a 30${joiner}days window`]) {
      expect({ phrase, flagged: DIGIT_DAYS.test(phrase) }).toEqual({ phrase, flagged: true });
    }
  });

  test.each(JOINERS)("accepts the {trialDays} token joined by %s", (_name, joiner) => {
    expect(DIGIT_DAYS.test(`your {trialDays}${joiner}day free trial`)).toBe(false);
  });

  test.each(["Live the same day", "From sign-up to first stamp, same day", "5 of 8 stamps", "Every day counts"])(
    "leaves %p alone",
    (fine) => {
      expect(DIGIT_DAYS.test(fine)).toBe(false);
    },
  );
});
