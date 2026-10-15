import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { routing } from "@/i18n/routing";
import { getLegalContent } from "./index";
import { compileLegalMDX } from "./mdx";
import { commonCatalog, privacySource, section } from "./policy-test-utils";

/**
 * Google Ads as a recipient of advertising conversion reports: what a visitor
 * reads in the banner and the preferences dialog, and what the privacy policy
 * says in §4, §5.3, §5.5 and §6. Google Analytics stays the analytics
 * recipient, and the two Googles are never written as a bare "Google".
 */

type Cookies = ReturnType<typeof commonCatalog>["cookies"];
const cookiesOf = (locale: string): Cookies => commonCatalog(locale).cookies;

const IRREVERSIBLE_CODE: Record<string, RegExp> = {
  en: /irreversible code/,
  fr: /code irréversible/,
  es: /código irreversible/,
  pl: /nieodwracalnego kodu/,
};

/** The statements about Google Ads in the dialog, in each locale's words. */
const DIALOG: Record<
  string,
  { accountEmail: RegExp; nothingElse: RegExp; offSentence: RegExp; analyticsOnBehalf: RegExp }
> = {
  en: {
    accountEmail: /Google Ads receives only your account email, as an irreversible code/,
    nothingElse: /nothing else about you/,
    offSentence: /Turned off, nothing is sent to Meta or Google Ads/,
    analyticsOnBehalf: /Google Analytics handles this data on our behalf only/,
  },
  fr: {
    accountEmail: /Google Ads reçoit uniquement l'adresse email de votre compte, sous forme de code irréversible/,
    nothingElse: /rien d'autre sur vous/,
    offSentence: /rien n'est transmis à Meta ni à Google Ads/,
    analyticsOnBehalf: /Google Analytics traite ces données pour notre compte uniquement/,
  },
  es: {
    accountEmail: /Google Ads recibe únicamente el correo electrónico de tu cuenta, como código irreversible/,
    nothingElse: /nada más sobre ti/,
    offSentence: /no se envía nada a Meta ni a Google Ads/,
    analyticsOnBehalf: /Google Analytics trata estos datos solo por cuenta nuestra/,
  },
  pl: {
    accountEmail: /Google Ads otrzyma wyłącznie adres e-mail twojego konta, w postaci nieodwracalnego kodu/,
    nothingElse: /nic więcej o tobie/,
    offSentence: /nic nie trafia do Meta ani do Google Ads/,
    analyticsOnBehalf: /Google Analytics przetwarza te dane wyłącznie na nasze zlecenie/,
  },
};

describe("the dialog names Google Ads wherever it lists the advertising recipients", () => {
  it.each(routing.locales)(
    "the banner, the US notice and both advertising cards name Meta and Google Ads (%s)",
    (locale) => {
      const { banner, notice, prefs } = cookiesOf(locale);
      for (const body of [banner.body, notice.body, prefs.marketing.body, prefs.us.marketing.body]) {
        expect(body).toContain("Meta");
        expect(body).toContain("Google Ads");
      }
    },
  );

  it.each(routing.locales)(
    "both advertising cards say Google Ads gets only the account email, as an irreversible code, and nothing else (%s)",
    (locale) => {
      const { prefs } = cookiesOf(locale);
      const w = DIALOG[locale];
      for (const body of [prefs.marketing.body, prefs.us.marketing.body]) {
        expect(body).toMatch(IRREVERSIBLE_CODE[locale]);
        expect(body).toMatch(w.accountEmail);
        expect(body).toMatch(w.nothingElse);
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

  it.each(routing.locales)("the banner stays within about one extra line at 390px (%s)", (locale) => {
    const { banner, notice } = cookiesOf(locale);
    expect(banner.body.length).toBeLessThanOrEqual(240);
    expect(notice.body.length).toBeLessThanOrEqual(200);
  });
});

const s4 = (locale: string) => section(locale, /^##\s+4\./m, /^##\s+5\./m);
const s53 = (locale: string) => section(locale, /^#+\s+5\.3\s/m, /^#+\s+5\.4\s/m);
const s55 = (locale: string) => section(locale, /^#+\s+5\.5\s/m, /^#+\s+5\.6\s/m);
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
    ownIdentifiers: RegExp;
    sessionIdentifier: RegExp;
    roleBullet: RegExp;
    recipients: RegExp;
    offAdvertising: RegExp;
    offMeasurement: RegExp;
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
    ownIdentifiers: /a Meta click identifier is never sent to Google Ads or Google Analytics/,
    sessionIdentifier: /Google Analytics receives its own session identifier with each step/,
    roleBullet: /\*\*Role of Google Ads:\*\* for the steps reported to it, Google Ads is an independent recipient for advertising measurement/,
    recipients: /Google means Google Ireland Limited, with Google LLC in the United States, which provides Google Analytics and Google Ads/,
    offAdvertising: /Turning off advertising stops anything further being reported to Meta and Google Ads/,
    offMeasurement: /Turning off audience measurement does the same for Google Analytics/,
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
    ownIdentifiers: /ni un identifiant de clic Meta à Google Ads ni à Google Analytics/,
    sessionIdentifier: /Google Analytics reçoit son propre identifiant de session à chaque étape/,
    roleBullet: /\*\*Rôle de Google Ads\*\* : pour les étapes qui lui sont signalées, Google Ads est un destinataire indépendant, pour la mesure publicitaire/,
    recipients: /Google désigne Google Ireland Limited, avec Google LLC aux États-Unis, qui fournit Google Analytics et Google Ads/,
    offAdvertising: /Désactiver la publicité met fin à tout nouveau signalement à Meta et à Google Ads/,
    offMeasurement: /Désactiver la mesure d'audience produit le même effet pour Google Analytics/,
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
    ownIdentifiers: /ni uno de Meta a Google Ads ni a Google Analytics/,
    sessionIdentifier: /Google Analytics recibe su propio identificador de sesión en cada paso/,
    roleBullet: /\*\*Papel de Google Ads\*\*: respecto a los pasos que se le comunican, Google Ads es un destinatario independiente, para la medición publicitaria/,
    recipients: /Google es Google Ireland Limited, con Google LLC en Estados Unidos, que ofrece Google Analytics y Google Ads/,
    offAdvertising: /Desactivar la publicidad pone fin a cualquier nueva comunicación a Meta y a Google Ads/,
    offMeasurement: /Desactivar la medición de audiencia hace lo mismo con Google Analytics/,
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
    ownIdentifiers: /ani identyfikator kliknięcia z Meta do Google Ads czy Google Analytics/,
    sessionIdentifier: /Google Analytics przy każdym etapie otrzymuje własny identyfikator sesji/,
    roleBullet: /\*\*Rola Google Ads:\*\* w odniesieniu do przekazywanych mu etapów Google Ads jest niezależnym odbiorcą, do pomiaru reklam/,
    recipients: /Google to Google Ireland Limited wraz z Google LLC w Stanach Zjednoczonych, czyli podmioty świadczące usługi Google Analytics i Google Ads/,
    offAdvertising: /Wyłączenie reklamy wstrzymuje dalsze przekazywanie czegokolwiek do Meta i Google Ads/,
    offMeasurement: /Wyłączenie pomiaru ruchu daje ten sam skutek w przypadku Google Analytics/,
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
    expect(text).toMatch(w.hashedAccountEmail);
    expect(text).toMatch(w.nothingElse);
    expect(text).toMatch(w.withoutAGoogleClick);
    expect(text).toMatch(w.gclidForGoogleAds);
  });

  it.each(routing.locales)("§5.5 keeps each platform to its own identifiers and Google Analytics to its session identifier (%s)", (locale) => {
    const text = s55(locale);

    expect(text).toMatch(POLICY[locale].ownIdentifiers);
    expect(text).toMatch(POLICY[locale].sessionIdentifier);
  });

  it.each(routing.locales)("§5.5 gives Google Ads a role bullet and defines Google as the company behind both products (%s)", (locale) => {
    expect(s55(locale)).toMatch(POLICY[locale].roleBullet);
    expect(s55(locale)).toMatch(POLICY[locale].recipients);
  });

  it.each(routing.locales)("§5.5 withdrawal: advertising off stops Meta and Google Ads, measurement off stops Google Analytics (%s)", (locale) => {
    expect(s55(locale)).toMatch(POLICY[locale].offAdvertising);
    expect(s55(locale)).toMatch(POLICY[locale].offMeasurement);
  });

  it.each(routing.locales)("§6 names Google Ads in the United States sharing paragraph (%s)", (locale) => {
    const sharing = s6(locale).split("\n").find((line) => /California|Californie|Californ|Kalifornii/.test(line))!;

    expect(sharing, `${locale} §6 sharing paragraph`).toContain("Google Ads");
  });
});

describe("what is left for counsel", () => {
  const ROLE = "{/* COUNSEL: role of Google for uploaded conversions (processor vs controller), plan L12 */}";
  const DATE = "{/* COUNSEL: set the date at sign-off */}";
  const count = (text: string, needle: string) => text.split(needle).length - 1;

  it.each(routing.locales)("the role of Google is flagged where §4 and §5.5 state it, and the date at the top (%s)", (locale) => {
    expect(count(s4(locale), ROLE), `${locale} §4`).toBe(1);
    expect(count(s55(locale), ROLE), `${locale} §5.5`).toBe(1);
    expect(count(privacySource(locale), DATE), `${locale} date`).toBe(1);
    expect(privacySource(locale).split("\n").slice(0, 6).join("\n")).toContain(DATE);
  });

  it.each(routing.locales)("the policy still compiles, the date still reads, and no comment reaches the page (%s)", async (locale) => {
    const legal = getLegalContent("privacy", locale)!;
    const html = renderToStaticMarkup(await compileLegalMDX(legal.content));

    expect(legal.lastUpdated).toMatch(/2026/);
    expect(html).not.toContain("COUNSEL");
    expect(html).toContain("Google Ads");
  });
});
