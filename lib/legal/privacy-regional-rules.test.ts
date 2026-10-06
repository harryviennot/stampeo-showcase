import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { commonCatalog, privacySource, retentionTable, section } from "./policy-test-utils";

/**
 * What §5, §6 and §8 of the privacy policy say about the regional rules, the
 * cookies we set and what each withdrawal stops. Each case pins one statement
 * a counsel-reviewed text must keep, in the words each locale uses.
 */

const s51 = (locale: string) => section(locale, /^#+\s+5\.1\s/m);
const s52 = (locale: string) => section(locale, /^#+\s+5\.2\s/m);
const s53 = (locale: string) => section(locale, /^#+\s+5\.3\s/m);
const s55 = (locale: string) => section(locale, /^#+\s+5\.5\s/m, /^#+\s+5\.6\s/m);
const s56 = (locale: string) => section(locale, /^#+\s+5\.6\s/m);
const s6 = (locale: string) => section(locale, /^##\s+6\./m);

/** The table row for a cookie, or undefined. */
function cookieRow(text: string, cookie: string) {
  return text
    .split("\n")
    .find((line) => line.trim().startsWith("|") && line.includes(`\`${cookie}\``));
}

/** "6 months" as each locale writes it. */
const MONTHS: Record<string, (n: number) => RegExp> = {
  en: (n) => new RegExp(`\\b${n} months\\b`),
  fr: (n) => new RegExp(`\\b${n} mois\\b`),
  es: (n) => new RegExp(`\\b${n} meses\\b`),
  pl: (n) => new RegExp(`\\b${n} miesięcy\\b`),
};

const DAYS_90: Record<string, RegExp> = {
  en: /\b90 days\b/,
  fr: /\b90 jours\b/,
  es: /\b90 días\b/,
  pl: /\b90 dni\b/,
};

/** The statements that differ per locale, one record each. */
const WORDING: Record<
  string,
  {
    mayAskAgain: RegExp;
    usRefusalRestored: RegExp;
    gpcEveryState: RegExp;
    gpcMeasurementOff: RegExp;
    timeZone: RegExp;
    noIpAddress: RegExp;
    serverSetsCookies: RegExp;
    sharedWithDashboard: RegExp;
    createAccount: RegExp;
    retiredCreateBusinessAccount: RegExp;
    beforeAnyBusiness: RegExp;
    googleSessionId: RegExp;
    googleNeverContact: RegExp;
    offAdvertising: RegExp;
    offMeasurement: RegExp;
    offBoth: RegExp;
    laterRefusalApplies: RegExp;
    cannotBeRecalled: RegExp;
  }
> = {
  en: {
    mayAskAgain: /after which we may ask you again/,
    usRefusalRestored: /restored from your account/,
    gpcEveryState: /In every US state we honor the signal/,
    gpcMeasurementOff: /audience measurement is also turned off/,
    timeZone: /decided from your device's time zone/,
    noIpAddress: /We do not use your IP address for this/,
    serverSetsCookies: /Our server sets (these cookies|them)/,
    sharedWithDashboard: /shared between stampeo\.app and the dashboard/,
    createAccount: /If you create an account, we report up to four steps/,
    retiredCreateBusinessAccount: /If you go on to create a business account/,
    beforeAnyBusiness: /before any business exists/,
    googleSessionId: /Google receives its own session identifier with each step/,
    googleNeverContact:
      /It never receives your contact details, your IP address or your browser's characteristics/,
    offAdvertising: /Turning off advertising stops anything further being reported to Meta/,
    offMeasurement: /Turning off audience measurement does the same for Google/,
    offBoth: /Turning off both also deletes the stored campaign source/,
    laterRefusalApplies: /applies to your account and your businesses/,
    cannotBeRecalled: /cannot be recalled/,
  },
  fr: {
    mayAskAgain: /nous pouvons vous le redemander/,
    usRefusalRestored: /restauré depuis votre compte/,
    gpcEveryState: /Dans chacun des États américains, nous le respectons/,
    gpcMeasurementOff: /la mesure d'audience est aussi désactivée/,
    timeZone: /d'après le fuseau horaire de votre appareil/,
    noIpAddress: /Nous n'utilisons pas votre adresse IP pour cela/,
    serverSetsCookies: /Notre serveur (les |ces cookies )?dépose/,
    sharedWithDashboard: /partagés entre stampeo\.app et le tableau de bord/,
    createAccount: /Si vous créez un compte, nous signalons jusqu'à quatre étapes/,
    retiredCreateBusinessAccount: /Si vous créez ensuite un compte professionnel/,
    beforeAnyBusiness: /avant toute création de commerce/,
    googleSessionId: /Google reçoit son propre identifiant de session à chaque étape/,
    googleNeverContact:
      /Il ne reçoit jamais vos coordonnées, votre adresse IP ni les caractéristiques de votre navigateur/,
    offAdvertising: /Désactiver la publicité met fin à tout nouveau signalement à Meta/,
    offMeasurement: /Désactiver la mesure d'audience produit le même effet pour Google/,
    offBoth: /Désactiver les deux supprime aussi l'origine de campagne conservée/,
    laterRefusalApplies: /s'applique à votre compte et à vos commerces/,
    cannotBeRecalled: /ne peuvent pas être rappelées/,
  },
  es: {
    mayAskAgain: /podemos volver a pedírtela/,
    usRefusalRestored: /se restaura desde tu cuenta/,
    gpcEveryState: /En cada uno de los estados de Estados Unidos respetamos la señal/,
    gpcMeasurementOff: /la medición de audiencia también queda desactivada/,
    timeZone: /a partir de la zona horaria de tu dispositivo/,
    noIpAddress: /No usamos tu dirección IP para ello/,
    serverSetsCookies: /Nuestro servidor (las |estas cookies )?coloca/,
    sharedWithDashboard: /se comparten entre stampeo\.app y el panel/,
    createAccount: /Si creas una cuenta, comunicamos hasta cuatro pasos/,
    retiredCreateBusinessAccount: /Si después creas una cuenta profesional/,
    beforeAnyBusiness: /antes de que exista ningún comercio/,
    googleSessionId: /Google recibe su propio identificador de sesión en cada paso/,
    googleNeverContact:
      /Nunca recibe tus datos de contacto, tu dirección IP ni las características de tu navegador/,
    offAdvertising: /Desactivar la publicidad pone fin a cualquier nueva comunicación a Meta/,
    offMeasurement: /Desactivar la medición de audiencia hace lo mismo con Google/,
    offBoth: /Desactivar ambas elimina además el origen de campaña guardado/,
    laterRefusalApplies: /se aplica a tu cuenta y a tus comercios/,
    cannotBeRecalled: /no pueden retirarse/,
  },
  pl: {
    mayAskAgain: /możemy zapytać ponownie/,
    usRefusalRestored: /przywracamy ją z Twojego konta/,
    gpcEveryState: /W każdym stanie Stanów Zjednoczonych respektujemy ten sygnał/,
    gpcMeasurementOff: /wyłączony jest także pomiar ruchu/,
    timeZone: /decyduje strefa czasowa Twojego urządzenia/,
    noIpAddress: /Nie używamy do tego Twojego adresu IP/,
    serverSetsCookies: /[Uu]stawia (je )?nasz serwer/,
    sharedWithDashboard: /współdzielone między stampeo\.app a panelem/,
    createAccount: /Jeżeli założysz konto, przekazujemy/,
    retiredCreateBusinessAccount: /Jeżeli następnie założysz konto firmowe/,
    beforeAnyBusiness: /zanim powstanie jakakolwiek firma/,
    googleSessionId: /Google przy każdym etapie otrzymuje własny identyfikator sesji/,
    googleNeverContact:
      /Nigdy nie otrzymuje Twoich danych kontaktowych, adresu IP ani parametrów przeglądarki/,
    offAdvertising: /Wyłączenie reklamy wstrzymuje dalsze przekazywanie czegokolwiek do Meta/,
    offMeasurement: /Wyłączenie pomiaru ruchu daje ten sam skutek w przypadku Google/,
    offBoth: /Wyłączenie obu usuwa też zapisane źródło kampanii/,
    laterRefusalApplies: /obejmuje Twoje konto i Twoje firmy/,
    cannotBeRecalled: /nie można wycofać/,
  },
};

describe("privacy policy: the control a visitor finds", () => {
  it.each(routing.locales)(
    "names Your Privacy Choices wherever it addresses US visitors, and Cookie preferences elsewhere (%s)",
    (locale) => {
      const { footer } = commonCatalog(locale);
      // §5.1, the cookie tables, §5.5 and §5.6 all speak to visitors in both
      // regimes, so each names both controls; §6 speaks to the US only.
      for (const [name, text] of [
        ["5.1", s51(locale)],
        ["5.3", s53(locale)],
        ["5.5", s55(locale)],
        ["5.6", s56(locale)],
      ] as const) {
        expect(text, `${locale} §${name} omits ${footer.privacyChoices}`).toContain(
          footer.privacyChoices,
        );
        expect(text, `${locale} §${name} omits ${footer.cookiePreferences}`).toContain(
          footer.cookiePreferences,
        );
      }
      expect(s6(locale), `${locale} §6 omits ${footer.privacyChoices}`).toContain(
        footer.privacyChoices,
      );
    },
  );
});

/** Where each locale says the control is: the footer of the pages that set the cookies. */
const WHERE: Record<string, { footerOfCookiePages: RegExp; bottomOfEveryPage: RegExp }> = {
  en: {
    footerOfCookiePages: /in the footer of every page where our measurement and advertising cookies can be set/,
    bottomOfEveryPage: /bottom of every page/,
  },
  fr: {
    footerOfCookiePages: /dans le pied de page de chaque page où nos cookies de mesure et de publicité peuvent être déposés/,
    bottomOfEveryPage: /en bas de chaque page/,
  },
  es: {
    footerOfCookiePages: /en el pie de todas las páginas donde pueden instalarse nuestras cookies de medición y de publicidad/,
    bottomOfEveryPage: /al final de cada página/,
  },
  pl: {
    footerOfCookiePages: /w stopce każdej strony, na której mogą być zapisywane nasze pliki cookie do statystyk i do reklamy/,
    bottomOfEveryPage: /na dole każdej strony/,
  },
};

describe("privacy policy: where the control is", () => {
  it.each(routing.locales)(
    "says it is in the footer of the pages that set the cookies, in §5.1 and in §6, never at the bottom of every page (%s)",
    (locale) => {
      const { footerOfCookiePages, bottomOfEveryPage } = WHERE[locale];

      // §5.1 places both controls: Cookie preferences, then Your Privacy Choices.
      expect(
        s51(locale).match(new RegExp(footerOfCookiePages, "g"))?.length,
        `${locale} §5.1 places both controls in the footer`,
      ).toBe(2);
      expect(s51(locale), `${locale} §5.1 still says bottom of every page`).not.toMatch(bottomOfEveryPage);
      expect(s6(locale), `${locale} §6 omits the footer`).toMatch(footerOfCookiePages);
      expect(s6(locale), `${locale} §6 still says bottom of every page`).not.toMatch(bottomOfEveryPage);
      expect(privacySource(locale), `${locale} still says bottom of every page`).not.toMatch(bottomOfEveryPage);
    },
  );
});

describe("privacy policy: how long a choice is kept", () => {
  it.each(routing.locales)(
    "§5.1 keeps a choice 6 months, a US refusal 13 months renewed on each visit and restored from the account (%s)",
    (locale) => {
      const text = s51(locale);
      expect(text, `${locale} §5.1 omits the 6-month choice`).toMatch(MONTHS[locale](6));
      expect(text, `${locale} §5.1 omits the re-ask`).toMatch(WORDING[locale].mayAskAgain);
      expect(text, `${locale} §5.1 omits the 13-month US refusal`).toMatch(MONTHS[locale](13));
      expect(text, `${locale} §5.1 omits the restore from the account`).toMatch(
        WORDING[locale].usRefusalRestored,
      );
    },
  );

  it.each(routing.locales)("the cookie tables carry each cookie's lifetime (%s)", (locale) => {
    const strictlyNecessary = s52(locale);
    const consented = s53(locale);

    const consent = cookieRow(strictlyNecessary, "stampeo_consent");
    expect(consent, `${locale} 6 months in the consent row`).toMatch(MONTHS[locale](6));
    expect(consent, `${locale} 13 months in the consent row`).toMatch(MONTHS[locale](13));

    expect(
      cookieRow(strictlyNecessary, "stampeo_sid"),
      `${locale} stampeo_sid is a strictly necessary cookie kept 13 months`,
    ).toMatch(MONTHS[locale](13));

    for (const cookie of ["stampeo_src", "stampeo_ga", "stampeo_ad"]) {
      expect(
        cookieRow(consented, cookie),
        `${locale} ${cookie} is a consent-gated cookie kept 6 months`,
      ).toMatch(MONTHS[locale](6));
    }
  });
});

describe("privacy policy: region and the Global Privacy Control signal", () => {
  it.each(routing.locales)(
    "§5.1 honors GPC in every US state with measurement off, and decides the region from the time zone alone (%s)",
    (locale) => {
      const text = s51(locale);
      const w = WORDING[locale];
      expect(text).toMatch(w.gpcEveryState);
      expect(text).toMatch(w.gpcMeasurementOff);
      expect(text).toMatch(w.timeZone);
      expect(text).toMatch(w.noIpAddress);
    },
  );

  it("never names the network provider that a later change adds", () => {
    for (const locale of routing.locales) {
      expect(privacySource(locale), `${locale} names it`).not.toMatch(/cloudflare/i);
    }
  });
});

describe("privacy policy: the cookies shared with the dashboard", () => {
  it.each(routing.locales)("§5.3 and §5.5 say our server sets them and they are shared (%s)", (locale) => {
    const w = WORDING[locale];
    for (const [name, text] of [
      ["5.3", s53(locale)],
      ["5.5", s55(locale)],
    ] as const) {
      expect(text, `${locale} §${name}`).toMatch(w.serverSetsCookies);
      expect(text, `${locale} §${name}`).toMatch(w.sharedWithDashboard);
    }
  });
});

describe("privacy policy: what is reported and what a withdrawal stops", () => {
  it.each(routing.locales)(
    "§5.5 opens with 'If you create an account' and reports the first step before any business exists (%s)",
    (locale) => {
      const text = s55(locale);
      const w = WORDING[locale];
      expect(text).toMatch(w.createAccount);
      expect(text).not.toMatch(w.retiredCreateBusinessAccount);
      expect(text).toMatch(w.beforeAnyBusiness);
    },
  );

  it.each(routing.locales)(
    "§5.5 gives Google its session identifier and still never its contact details (%s)",
    (locale) => {
      const text = s55(locale);
      expect(text).toMatch(WORDING[locale].googleSessionId);
      expect(text).toMatch(WORDING[locale].googleNeverContact);
    },
  );

  it.each(routing.locales)("§5.5 withdraws advertising and measurement separately (%s)", (locale) => {
    const text = s55(locale);
    const w = WORDING[locale];
    expect(text).toMatch(w.offAdvertising);
    expect(text).toMatch(w.offMeasurement);
    expect(text).toMatch(w.offBoth);
    expect(text).toMatch(w.laterRefusalApplies);
    expect(text).toMatch(w.cannotBeRecalled);
  });

  it.each(routing.locales)(
    "§8 keeps delivery diagnostics 13 months and platform response messages 90 days (%s)",
    (locale) => {
      const rows = retentionTable(locale).filter((row) => /5\.5/.test(row));
      expect(
        rows.some((row) => MONTHS[locale](13).test(row)),
        `${locale} retention table has no 13-month delivery-diagnostics row`,
      ).toBe(true);
      expect(
        rows.some((row) => DAYS_90[locale].test(row)),
        `${locale} retention table has no 90-day response-messages row`,
      ).toBe(true);
    },
  );
});
