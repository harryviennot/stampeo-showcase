import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { routing } from "@/i18n/routing";
import { getLegalContent } from "./index";
import { compileLegalMDX } from "./mdx";
import { commonCatalog, s55, section } from "./policy-test-utils";

/**
 * Google Ads as a recipient of advertising conversion reports: what a visitor
 * reads in the banner and the preferences dialog, and what the privacy policy
 * says in §4, §5.3, §5.5 and §6. Google Analytics stays the analytics
 * recipient, and the banner and dialog never write a bare "Google".
 */

type Cookies = ReturnType<typeof commonCatalog>["cookies"];
const cookiesOf = (locale: string): Cookies => commonCatalog(locale).cookies;

/** What the advertising cards say Google Ads receives, in each locale's words. */
const DIALOG: Record<
  string,
  {
    clickIdentifier: RegExp;
    accountEmail: RegExp;
    stepAndPrice: RegExp;
    nothingElse: RegExp;
    retiredOnlyClaim: RegExp;
    offSentence: RegExp;
    analyticsOnBehalf: RegExp;
  }
> = {
  en: {
    clickIdentifier: /Google Ads receives its click identifier if you came from one of its ads/,
    accountEmail: /your account email as an irreversible code/,
    stepAndPrice: /along with the step and, for a trial or a payment, its price/,
    nothingElse: /Nothing else about you\./,
    retiredOnlyClaim: /receives only/,
    offSentence: /Turned off, nothing is sent to Meta or Google Ads/,
    analyticsOnBehalf: /Google Analytics handles this data on our behalf only/,
  },
  fr: {
    clickIdentifier: /Google Ads reçoit son identifiant de clic si vous venez d'une de ses annonces/,
    accountEmail: /l'adresse email de votre compte sous forme de code irréversible/,
    stepAndPrice: /avec l'étape franchie et, pour un essai ou un paiement, son prix/,
    nothingElse: /Rien d'autre sur vous\./,
    retiredOnlyClaim: /reçoit uniquement/,
    offSentence: /rien n'est transmis à Meta ni à Google Ads/,
    analyticsOnBehalf: /Google Analytics traite ces données pour notre compte uniquement/,
  },
  es: {
    clickIdentifier: /Google Ads recibe su identificador de clic si vienes de uno de sus anuncios/,
    accountEmail: /el correo electrónico de tu cuenta como código irreversible/,
    stepAndPrice: /junto con el paso alcanzado y, para una prueba o un pago, su precio/,
    nothingElse: /Nada más sobre ti\./,
    retiredOnlyClaim: /recibe únicamente/,
    offSentence: /no se envía nada a Meta ni a Google Ads/,
    analyticsOnBehalf: /Google Analytics trata estos datos solo por cuenta nuestra/,
  },
  pl: {
    clickIdentifier: /Google Ads otrzyma identyfikator kliknięcia, jeśli przychodzisz z jednej z jego reklam/,
    accountEmail: /adres e-mail twojego konta w postaci nieodwracalnego kodu/,
    stepAndPrice: /a do tego etap i, przy okresie próbnym lub płatności, cenę/,
    nothingElse: /Nic więcej o tobie\./,
    retiredOnlyClaim: /otrzyma wyłącznie/,
    offSentence: /nic nie trafia do Meta ani do Google Ads/,
    analyticsOnBehalf: /Google Analytics przetwarza te dane wyłącznie na nasze zlecenie/,
  },
};

/** Character counts of the banner and notice bodies in the version 3 text; a line at 390px holds about 45. */
const V3_LENGTH: Record<string, { banner: number; notice: number }> = {
  en: { banner: 174, notice: 129 },
  fr: { banner: 214, notice: 151 },
  es: { banner: 203, notice: 149 },
  pl: { banner: 209, notice: 159 },
};
const MAX_GROWTH = 60;

describe("the dialog names Google Ads wherever it lists the advertising recipients", () => {
  it.each(routing.locales)(
    "both advertising cards say exactly what Google Ads receives: its click identifier, the account email as an irreversible code, the step and its price, nothing else (%s)",
    (locale) => {
      const { prefs } = cookiesOf(locale);
      const w = DIALOG[locale];
      for (const body of [prefs.marketing.body, prefs.us.marketing.body]) {
        expect(body).toContain("Meta");
        expect(body).toMatch(w.clickIdentifier);
        expect(body).toMatch(w.accountEmail);
        expect(body).toMatch(w.stepAndPrice);
        expect(body).toMatch(w.nothingElse);
        expect(body).not.toMatch(w.retiredOnlyClaim);
      }
    },
  );

  it.each(routing.locales)("the US advertising card says that turned off, nothing goes to Meta or Google Ads (%s)", (locale) => {
    expect(cookiesOf(locale).prefs.us.marketing.body).toMatch(DIALOG[locale].offSentence);
  });

  it.each(routing.locales)(
    "the analytics cards name Google Analytics only, and 'on our behalf only' is Google Analytics' (%s)",
    (locale) => {
      const { prefs } = cookiesOf(locale);
      expect(prefs.us.analytics.body).toMatch(DIALOG[locale].analyticsOnBehalf);
      for (const body of [prefs.analytics.body, prefs.us.analytics.body]) {
        expect(body).toContain("Google Analytics");
        expect(body).not.toContain("Google Ads");
        expect(body).not.toContain("Meta");
      }
    },
  );

  it.each(routing.locales)("every Google in the dialog and banner names its product (%s)", (locale) => {
    const { banner, notice, prefs } = cookiesOf(locale);
    const texts = [
      banner.body,
      notice.body,
      prefs.analytics.body,
      prefs.marketing.body,
      prefs.us.analytics.body,
      prefs.us.marketing.body,
    ];
    for (const text of texts) expect(text).not.toMatch(/Google(?! (Analytics|Ads)\b)/);
  });

  it.each(routing.locales)("the banner and the notice grew by at most one line over the version 3 text (%s)", (locale) => {
    const { banner, notice } = cookiesOf(locale);
    expect(banner.body.length - V3_LENGTH[locale].banner).toBeLessThanOrEqual(MAX_GROWTH);
    expect(notice.body.length - V3_LENGTH[locale].notice).toBeLessThanOrEqual(MAX_GROWTH);
  });
});

const s4 = (locale: string) => section(locale, /^##\s+4\./m, /^##\s+5\./m);
const s53 = (locale: string) => section(locale, /^#+\s+5\.3\s/m, /^#+\s+5\.4\s/m);
const s6 = (locale: string) => section(locale, /^##\s+6\./m, /^###\s+6\.1/m);

/** The statements about Google Ads in the policy, in each locale's words. */
const POLICY: Record<
  string,
  {
    independentRecipient: RegExp;
    threeSteps: RegExp;
    noPaymentPage: RegExp;
    hashedAccountEmail: RegExp;
    nothingElse: RegExp;
    withoutAGoogleClick: RegExp;
    gclidForGoogleAds: RegExp;
    adCookieRow: RegExp;
    valueAndCurrency: RegExp;
    ownIdentifiers: RegExp;
    roleBullet: RegExp;
    recipients: RegExp;
  }
> = {
  en: {
    independentRecipient: /Google Ads receives these reports as an independent recipient for advertising measurement/,
    threeSteps: /Google Ads receives three of these steps: that the account was created, that your free trial started, and that a first invoice was paid/,
    noPaymentPage: /It does not receive the opening of the payment page/,
    hashedAccountEmail: /your account email address, \*\*hashed\*\* with the SHA-256 algorithm before it leaves our servers/,
    nothingElse: /Nothing else about you reaches Google Ads: no telephone number, name, address, IP address or browser characteristics/,
    withoutAGoogleClick: /Like Meta, Google Ads receives these steps whether or not you came from one of its advertisements/,
    gclidForGoogleAds: /for Google Ads the `gclid`, for Meta the `fbclid`/,
    adCookieRow: /a Google click identifier goes to Google Ads, a Meta click identifier to Meta/,
    valueAndCurrency: /for the last two, the price of the plan you chose or the amount paid, and its currency/,
    ownIdentifiers: /a Meta click identifier is never sent to Google Ads or Google Analytics/,
    roleBullet: /\*\*Role of Google Ads:\*\* for the steps reported to it, Google Ads is an independent recipient for advertising measurement/,
    recipients: /Google means Google Ireland Limited, with Google LLC in the United States, which provides Google Analytics and Google Ads/,
  },
  fr: {
    independentRecipient: /Google Ads reçoit ces signalements en tant que destinataire indépendant, pour la mesure publicitaire/,
    threeSteps: /Google Ads reçoit trois de ces étapes : la création du compte, le début de votre essai gratuit et le règlement d'une première facture/,
    noPaymentPage: /Il ne reçoit pas l'ouverture de la page de paiement/,
    hashedAccountEmail: /l'adresse email de votre compte, \*\*hachée\*\* par l'algorithme SHA-256 avant de quitter nos serveurs/,
    nothingElse: /Rien d'autre à votre sujet n'arrive chez Google Ads : ni numéro de téléphone, ni nom, ni adresse, ni adresse IP, ni caractéristiques de votre navigateur/,
    withoutAGoogleClick: /Comme Meta, Google Ads reçoit ces étapes que vous soyez arrivé ou non par l'une de ses publicités/,
    gclidForGoogleAds: /pour Google Ads, le `gclid` ; pour Meta, le `fbclid`/,
    adCookieRow: /un identifiant de clic Google est transmis à Google Ads, un identifiant de clic Meta à Meta/,
    valueAndCurrency: /pour les deux dernières, le prix de l'offre choisie ou le montant réglé, et sa devise/,
    ownIdentifiers: /ni un identifiant de clic Meta à Google Ads ni à Google Analytics/,
    roleBullet: /\*\*Rôle de Google Ads\*\* : pour les étapes qui lui sont signalées, Google Ads est un destinataire indépendant, pour la mesure publicitaire/,
    recipients: /Google désigne Google Ireland Limited, avec Google LLC aux États-Unis, qui fournit Google Analytics et Google Ads/,
  },
  es: {
    independentRecipient: /Google Ads recibe esas comunicaciones como destinatario independiente, para la medición publicitaria/,
    threeSteps: /Google Ads recibe tres de estos pasos: que se creó la cuenta, que empezó tu prueba gratuita y que se pagó una primera factura/,
    noPaymentPage: /No recibe la apertura de la página de pago/,
    hashedAccountEmail: /la dirección de correo electrónico de tu cuenta, \*\*convertida en hash\*\* con el algoritmo SHA-256 antes de salir de nuestros servidores/,
    nothingElse: /Nada más sobre ti llega a Google Ads: ni teléfono, ni nombre, ni dirección, ni dirección IP, ni características del navegador/,
    withoutAGoogleClick: /Igual que Meta, Google Ads recibe estos pasos tanto si llegaste desde uno de sus anuncios como si no/,
    gclidForGoogleAds: /en el caso de Google Ads, el `gclid`; en el de Meta, el `fbclid`/,
    adCookieRow: /el de un clic de Google se envía a Google Ads, el de un clic de Meta, a Meta/,
    valueAndCurrency: /en los dos últimos, el precio del plan elegido o el importe pagado y su divisa/,
    ownIdentifiers: /ni uno de Meta a Google Ads ni a Google Analytics/,
    roleBullet: /\*\*Papel de Google Ads\*\*: respecto a los pasos que se le comunican, Google Ads es un destinatario independiente, para la medición publicitaria/,
    recipients: /Google es Google Ireland Limited, con Google LLC en Estados Unidos, que ofrece Google Analytics y Google Ads/,
  },
  pl: {
    independentRecipient: /Google Ads otrzymuje te informacje jako niezależny odbiorca, do pomiaru reklam/,
    threeSteps: /Google Ads otrzymuje trzy z tych etapów: założenie konta, rozpoczęcie bezpłatnego okresu próbnego i opłacenie pierwszej faktury/,
    noPaymentPage: /Nie otrzymuje informacji o otwarciu strony płatności/,
    hashedAccountEmail: /adres e-mail Twojego konta, \*\*zahaszowany\*\* algorytmem SHA-256 przed opuszczeniem naszych serwerów/,
    nothingElse: /Nic więcej o Tobie nie trafia do Google Ads: ani numer telefonu, ani imię i nazwisko, ani adres, ani adres IP, ani parametry przeglądarki/,
    withoutAGoogleClick: /Tak jak Meta, Google Ads otrzymuje te etapy niezależnie od tego, czy wejście na stronę nastąpiło z reklamy Google Ads/,
    gclidForGoogleAds: /w przypadku Google Ads jest to `gclid`, w przypadku Meta `fbclid`/,
    adCookieRow: /identyfikator kliknięcia z Google trafia do Google Ads, a z Meta do Meta/,
    valueAndCurrency: /przy dwóch ostatnich także cenę wybranego planu lub zapłaconą kwotę wraz z walutą/,
    ownIdentifiers: /ani identyfikator kliknięcia z Meta do Google Ads czy Google Analytics/,
    roleBullet: /\*\*Rola Google Ads:\*\* w odniesieniu do przekazywanych mu etapów Google Ads jest niezależnym odbiorcą, do pomiaru reklam/,
    recipients: /Google to Google Ireland Limited wraz z Google LLC w Stanach Zjednoczonych, czyli podmioty świadczące usługi Google Analytics i Google Ads/,
  },
};

describe("the privacy policy names Google Ads as a recipient of advertising conversion reports", () => {
  it.each(routing.locales)("§4 puts Google Ads beside Meta in the transfers paragraph, not in the sub-processor table (%s)", (locale) => {
    const text = s4(locale);
    const rows = text.split("\n").filter((line) => line.trim().startsWith("|"));
    const transfers = text.split("\n").find((line) => line.includes("Meta Platforms Ireland Limited"))!;

    expect(transfers, `${locale} §4 transfers paragraph`).toContain("Google Ads (Google Ireland Limited");
    expect(transfers).toMatch(POLICY[locale].independentRecipient);
    expect(rows.filter((row) => row.includes("Google Ads")), `${locale} §4 table`).toEqual([]);
  });

  it.each(routing.locales)("§5.3 sets no Google Ads cookie, and says where the Google click identifier goes (%s)", (locale) => {
    const text = s53(locale);
    const rows = text.split("\n").filter((line) => line.trim().startsWith("|"));

    expect(rows.filter((row) => row.includes("_gcl")), `${locale} §5.3 table`).toEqual([]);
    expect(rows.filter((row) => row.includes("Google Ads") && !row.includes("`stampeo_ad`"))).toEqual([]);
    expect(rows.find((row) => row.includes("`stampeo_ad`"))).toMatch(POLICY[locale].adCookieRow);
  });

  it.each(routing.locales)("§5.5 says which steps and which data Google Ads receives, with and without a Google click (%s)", (locale) => {
    const text = s55(locale);
    const w = POLICY[locale];

    expect(text).toMatch(w.threeSteps);
    expect(text).toMatch(w.noPaymentPage);
    expect(text).toMatch(w.valueAndCurrency);
    expect(text).toMatch(w.hashedAccountEmail);
    expect(text).toMatch(w.nothingElse);
    expect(text).toMatch(w.withoutAGoogleClick);
    expect(text).toMatch(w.gclidForGoogleAds);
  });

  it.each(routing.locales)("§5.5 keeps each platform to its own identifiers (%s)", (locale) => {
    expect(s55(locale)).toMatch(POLICY[locale].ownIdentifiers);
  });

  it.each(routing.locales)("§5.5 gives Google Ads a role bullet and defines Google as the company behind both products (%s)", (locale) => {
    expect(s55(locale)).toMatch(POLICY[locale].roleBullet);
    expect(s55(locale)).toMatch(POLICY[locale].recipients);
  });

  it.each(routing.locales)("§6 names Google Ads in the United States sharing paragraph (%s)", (locale) => {
    const sharing = s6(locale).split("\n").find((line) => /California|Californie|Californ|Kalifornii/.test(line))!;

    expect(sharing, `${locale} §6 sharing paragraph`).toContain("Google Ads");
  });
});

describe("the policy renders with its counsel markers", () => {
  it.each(routing.locales)("the policy still compiles, the date still reads, and no marker reaches the page (%s)", async (locale) => {
    const legal = getLegalContent("privacy", locale)!;
    const html = renderToStaticMarkup(await compileLegalMDX(legal.content));

    expect(legal.lastUpdated).toMatch(/2026/);
    expect(html).not.toContain("COUNSEL");
    expect(html).toContain("Google Ads");
  });
});
