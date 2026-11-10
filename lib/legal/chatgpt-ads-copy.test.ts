import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { cookiesOf, paragraphWith, privacySource, s4, s53, s55, s6 } from "./policy-test-utils";

/**
 * OpenAI (ChatGPT ads) as a recipient of advertising conversion reports: what a
 * visitor reads in the banner and the preferences dialog, and what the privacy
 * policy says in §4, §5.3, §5.5 and §6. Google Ads and OpenAI each hear only of
 * visitors who came through one of their own ads.
 */

/** How the banner, notice and cards name OpenAI, and the sentence both advertising cards share. */
const DIALOG: Record<string, { named: RegExp; sharedSentence: RegExp; offTail: RegExp }> = {
  en: {
    named: /Meta, Google Ads and OpenAI \(ChatGPT ads\)/,
    sharedSentence:
      /Google Ads and OpenAI each hear about you only if you came from one of their own ads, and then receive their own click identifier and your account email as an irreversible code, along with the step and, for a trial or a payment, its price\./,
    offTail: /Turned off, nothing is sent to Meta, Google Ads or OpenAI\.$/,
  },
  fr: {
    named: /Meta, Google Ads et OpenAI \(annonces dans ChatGPT\)/,
    sharedSentence:
      /Google Ads et OpenAI ne sont prévenus que si vous venez de l'une de leurs annonces : chacun reçoit alors son propre identifiant de clic et l'adresse email de votre compte sous forme de code irréversible, avec l'étape franchie et, pour un essai ou un paiement, son prix\./,
    offTail: /rien n'est transmis à Meta, à Google Ads ni à OpenAI\.$/,
  },
  es: {
    named: /Meta, Google Ads y OpenAI \(anuncios en ChatGPT\)/,
    sharedSentence:
      /Solo avisamos a Google Ads y a OpenAI si vienes de uno de sus anuncios, y entonces cada uno recibe su propio identificador de clic y el correo electrónico de tu cuenta como código irreversible, junto con el paso alcanzado y, para una prueba o un pago, su precio\./,
    offTail: /no se envía nada a Meta, a Google Ads ni a OpenAI\.$/,
  },
  pl: {
    named: /Meta, Google Ads i OpenAI \(reklamy w ChatGPT\)/,
    sharedSentence:
      /Google Ads i OpenAI informujemy tylko wtedy, gdy przychodzisz z reklamy danej platformy: każda z nich otrzymuje wtedy własny identyfikator kliknięcia oraz adres e-mail twojego konta w postaci nieodwracalnego kodu, a do tego etap i, przy okresie próbnym lub płatności, cenę\./,
    offTail: /nic nie trafia do Meta, Google Ads ani OpenAI\.$/,
  },
};

describe("the dialog names OpenAI wherever it lists the advertising recipients", () => {
  it.each(routing.locales)("the banner and the notice name OpenAI beside Meta and Google Ads (%s)", (locale) => {
    const { banner, notice } = cookiesOf(locale);
    for (const body of [banner.body, notice.body]) expect(body).toMatch(DIALOG[locale].named);
  });

  it.each(routing.locales)(
    "both advertising cards name the three recipients and give Google Ads and OpenAI one shared sentence about their own ads (%s)",
    (locale) => {
      const { prefs } = cookiesOf(locale);
      for (const body of [prefs.marketing.body, prefs.us.marketing.body]) {
        expect(body).toMatch(DIALOG[locale].named);
        expect(body).toMatch(DIALOG[locale].sharedSentence);
      }
    },
  );

  it.each(routing.locales)("the US advertising card ends by saying that turned off, nothing goes to any of the three (%s)", (locale) => {
    expect(cookiesOf(locale).prefs.us.marketing.body).toMatch(DIALOG[locale].offTail);
  });

  it.each(routing.locales)("the analytics cards name neither OpenAI nor ChatGPT (%s)", (locale) => {
    const { prefs } = cookiesOf(locale);
    for (const body of [prefs.analytics.body, prefs.us.analytics.body]) {
      expect(body).not.toMatch(/OpenAI|ChatGPT/);
    }
  });
});

/** The statements about OpenAI in the policy, in each locale's words. */
const POLICY: Record<
  string,
  {
    transfers: RegExp;
    independentRecipient: RegExp;
    adCookieRow: RegExp;
    clickIdentifiers: RegExp;
    ownIdentifiers: RegExp;
    pixelReadsAddress: RegExp;
    threeSteps: RegExp;
    noPaymentPage: RegExp;
    onlyItsOwnAds: RegExp;
    clickAndPrice: RegExp;
    hashedAccountEmail: RegExp;
    nothingElse: RegExp;
    optOut: RegExp;
    recipients: RegExp;
    roleBullet: RegExp;
  }
> = {
  en: {
    transfers: /Meta \(Meta Platforms Ireland Limited, with Meta Platforms, Inc\. in the United States\) and OpenAI \(ChatGPT ads\), may process that data in the United States/,
    independentRecipient: /as an independent recipient for advertising measurement, and so does OpenAI/,
    adCookieRow: /a Google click identifier goes to Google Ads, a Meta click identifier to Meta, an OpenAI click identifier to OpenAI/,
    clickIdentifiers: /for Google Ads the `gclid`, for Meta the `fbclid`, for OpenAI the `oppref`/,
    ownIdentifiers: /In the reports sent from our servers, each platform receives only its own identifiers: a Google click identifier is never sent to Meta, and a Meta click identifier is never sent to Google Ads or Google Analytics\. An OpenAI click identifier goes to OpenAI alone, and a Google or Meta click identifier is never sent to OpenAI\./,
    pixelReadsAddress: /Your browser is a separate matter\. Meta's pixel, the tool behind the Meta cookies in 5\.3, runs there only if you accepted the advertising cookies \(in the United States, as long as you have not switched them off\)\. It reads the address of the page you are on\. When you arrive from another platform's advertisement, that address can contain its click identifier, so Meta can see it\./,
    threeSteps: /OpenAI \(ChatGPT ads\) receives the same three steps: that the account was created, that your free trial started, and that a first invoice was paid/,
    noPaymentPage: /It does not receive the opening of the payment page/,
    onlyItsOwnAds: /It receives them only when you came to us through one of its advertisements, as long as you accepted the advertising cookies in 5\.3 \(in the United States, as long as you have not switched them off\)/,
    clickAndPrice: /With each step it receives the OpenAI click identifier; for the last two, the price of the plan you chose or the amount paid, and its currency/,
    hashedAccountEmail: /your account email address, \*\*hashed\*\* with the SHA-256 algorithm before it leaves our servers/,
    nothingElse: /Nothing else about you reaches OpenAI: no telephone number, name, address, IP address or browser characteristics/,
    optOut: /with every report we ask OpenAI not to use that report to personalize the advertising it shows you/,
    recipients: /OpenAI means the United States company that operates ChatGPT and its advertising/,
    roleBullet: /\*\*Role of OpenAI:\*\* for the steps reported to it, OpenAI is an independent recipient for advertising measurement/,
  },
  fr: {
    transfers: /Meta \(Meta Platforms Ireland Limited, avec Meta Platforms, Inc\. aux États-Unis\) et OpenAI \(publicités dans ChatGPT\), peuvent traiter ces données aux États-Unis/,
    independentRecipient: /en tant que destinataire indépendant, pour la mesure publicitaire, tout comme OpenAI/,
    adCookieRow: /un identifiant de clic Google est transmis à Google Ads, un identifiant de clic Meta à Meta, un identifiant de clic OpenAI à OpenAI/,
    clickIdentifiers: /pour Google Ads, le `gclid` ; pour Meta, le `fbclid` ; pour OpenAI, l'`oppref`/,
    ownIdentifiers: /Dans les signalements envoyés depuis nos serveurs, chaque plateforme ne reçoit que ses propres identifiants : un identifiant de clic Google n'est jamais transmis à Meta, ni un identifiant de clic Meta à Google Ads ni à Google Analytics\. Un identifiant de clic OpenAI n'est transmis qu'à OpenAI, et aucun identifiant de clic Google ou Meta ne lui est jamais transmis\./,
    pixelReadsAddress: /Votre navigateur est un cas à part\. Le pixel de Meta, l'outil à l'origine des cookies Meta du 5\.3, n'y fonctionne que si vous avez accepté les cookies publicitaires \(aux États-Unis, tant que vous ne les avez pas désactivés\)\. Il lit l'adresse de la page où vous vous trouvez\. Lorsque vous arrivez par la publicité d'une autre plateforme, cette adresse peut contenir son identifiant de clic, que Meta peut donc voir\./,
    threeSteps: /OpenAI \(publicités dans ChatGPT\) reçoit les trois mêmes étapes : la création du compte, le début de votre essai gratuit et le règlement d'une première facture/,
    noPaymentPage: /Elle ne reçoit pas l'ouverture de la page de paiement/,
    onlyItsOwnAds: /Elle ne les reçoit que si vous êtes arrivé chez nous par l'une de ses publicités, dès lors que vous avez accepté les cookies publicitaires du 5\.3 \(aux États-Unis, tant que vous ne les avez pas désactivés\)/,
    clickAndPrice: /À chaque étape, elle reçoit l'identifiant de clic OpenAI ; pour les deux dernières, le prix de l'offre choisie ou le montant réglé, et sa devise/,
    hashedAccountEmail: /l'adresse email de votre compte, \*\*hachée\*\* par l'algorithme SHA-256 avant de quitter nos serveurs/,
    nothingElse: /Rien d'autre à votre sujet n'arrive chez OpenAI : ni numéro de téléphone, ni nom, ni adresse, ni adresse IP, ni caractéristiques de votre navigateur/,
    optOut: /avec chaque signalement, nous demandons à OpenAI de ne pas s'en servir pour personnaliser les publicités qu'elle vous montre/,
    recipients: /OpenAI désigne la société américaine qui exploite ChatGPT et ses publicités/,
    roleBullet: /\*\*Rôle d'OpenAI\*\* : pour les étapes qui lui sont signalées, OpenAI est un destinataire indépendant, pour la mesure publicitaire/,
  },
  es: {
    transfers: /Meta \(Meta Platforms Ireland Limited, con Meta Platforms, Inc\. en Estados Unidos\) y OpenAI \(anuncios en ChatGPT\), pueden tratar esos datos en Estados Unidos/,
    independentRecipient: /como destinatario independiente, para la medición publicitaria, igual que OpenAI/,
    adCookieRow: /el de un clic de Google se envía a Google Ads, el de un clic de Meta, a Meta, y el de un clic de OpenAI, a OpenAI/,
    clickIdentifiers: /en el caso de Google Ads, el `gclid`; en el de Meta, el `fbclid`; en el de OpenAI, el `oppref`/,
    ownIdentifiers: /En las comunicaciones enviadas desde nuestros servidores, cada plataforma recibe únicamente sus propios identificadores: un identificador de clic de Google nunca se envía a Meta, ni uno de Meta a Google Ads ni a Google Analytics\. Un identificador de clic de OpenAI solo se envía a OpenAI, y ninguno de Google ni de Meta se envía nunca a OpenAI\./,
    pixelReadsAddress: /Tu navegador es un caso aparte\. El píxel de Meta, la herramienta que hay detrás de las cookies de Meta del 5\.3, solo funciona en él si has aceptado las cookies publicitarias \(en Estados Unidos, mientras no las hayas desactivado\)\. Lee la dirección de la página en la que estás\. Cuando llegas desde el anuncio de otra plataforma, esa dirección puede contener su identificador de clic, que Meta puede ver así\./,
    threeSteps: /OpenAI \(anuncios en ChatGPT\) recibe esos mismos tres pasos: que se creó la cuenta, que empezó tu prueba gratuita y que se pagó una primera factura/,
    noPaymentPage: /No recibe la apertura de la página de pago/,
    onlyItsOwnAds: /Los recibe solo si llegaste a nosotros desde uno de sus anuncios, siempre que hayas aceptado las cookies publicitarias del 5\.3 \(en Estados Unidos, mientras no las hayas desactivado\)/,
    clickAndPrice: /En cada paso recibe el identificador de clic de OpenAI; en los dos últimos, el precio del plan elegido o el importe pagado y su divisa/,
    hashedAccountEmail: /la dirección de correo electrónico de tu cuenta, \*\*convertida en hash\*\* con el algoritmo SHA-256 antes de salir de nuestros servidores/,
    nothingElse: /Nada más sobre ti llega a OpenAI: ni teléfono, ni nombre, ni dirección, ni dirección IP, ni características del navegador/,
    optOut: /con cada comunicación, pedimos a OpenAI que no la use para personalizar los anuncios que te muestra/,
    recipients: /OpenAI es el proveedor estadounidense de ChatGPT y de su publicidad/,
    roleBullet: /\*\*Papel de OpenAI\*\*: respecto a los pasos que se le comunican, OpenAI es un destinatario independiente, para la medición publicitaria/,
  },
  pl: {
    transfers: /Meta \(Meta Platforms Ireland Limited wraz z Meta Platforms, Inc\. w Stanach Zjednoczonych\) i OpenAI \(reklamy w ChatGPT\), mogą przetwarzać te dane w Stanach Zjednoczonych/,
    independentRecipient: /jako niezależny odbiorca, do pomiaru reklam, tak samo jak OpenAI/,
    adCookieRow: /identyfikator kliknięcia z Google trafia do Google Ads, a z Meta do Meta i z OpenAI do OpenAI/,
    clickIdentifiers: /w przypadku Google Ads jest to `gclid`, w przypadku Meta `fbclid`, a w przypadku OpenAI `oppref`/,
    ownIdentifiers: /W zgłoszeniach wysyłanych z naszych serwerów każda platforma otrzymuje wyłącznie własne identyfikatory: identyfikator kliknięcia z Google nigdy nie jest przekazywany do Meta ani identyfikator kliknięcia z Meta do Google Ads czy Google Analytics\. Identyfikator kliknięcia z OpenAI trafia wyłącznie do OpenAI, a identyfikator z Google lub Meta nigdy nie jest do niego przekazywany\./,
    pixelReadsAddress: /Przeglądarka to osobna sprawa\. Piksel Meta, czyli narzędzie stojące za plikami cookie Meta z punktu 5\.3, działa w niej tylko pod warunkiem zaakceptowania reklamowych plików cookie \(w Stanach Zjednoczonych: dopóki nie zostaną wyłączone\)\. Odczytuje adres strony, na której jesteś\. Gdy trafisz na stronę z reklamy innej platformy, ten adres może zawierać jej identyfikator kliknięcia, który Meta może wtedy zobaczyć\./,
    threeSteps: /OpenAI \(reklamy w ChatGPT\) otrzymuje te same trzy etapy: założenie konta, rozpoczęcie bezpłatnego okresu próbnego i opłacenie pierwszej faktury/,
    noPaymentPage: /Nie otrzymuje informacji o otwarciu strony płatności/,
    onlyItsOwnAds: /Otrzymuje je tylko wtedy, gdy trafisz do nas z reklamy OpenAI, pod warunkiem zaakceptowania reklamowych plików cookie z punktu 5\.3 \(w Stanach Zjednoczonych: dopóki nie zostaną wyłączone\)/,
    clickAndPrice: /Przy każdym etapie otrzymuje identyfikator kliknięcia z OpenAI; przy dwóch ostatnich także cenę wybranego planu lub zapłaconą kwotę wraz z walutą/,
    hashedAccountEmail: /adres e-mail Twojego konta, \*\*zahaszowany\*\* algorytmem SHA-256 przed opuszczeniem naszych serwerów/,
    nothingElse: /Nic więcej o Tobie nie trafia do OpenAI: ani numer telefonu, ani imię i nazwisko, ani adres, ani adres IP, ani parametry przeglądarki/,
    optOut: /przy każdym zgłoszeniu zaznaczamy, że nie ma ono służyć do personalizowania reklam wyświetlanych Tobie/,
    recipients: /OpenAI to amerykańska spółka, która prowadzi ChatGPT i jego reklamy/,
    roleBullet: /\*\*Rola OpenAI:\*\* w odniesieniu do przekazywanych etapów OpenAI jest niezależnym odbiorcą, do pomiaru reklam/,
  },
};

describe("the privacy policy names OpenAI as a recipient of advertising conversion reports", () => {
  it.each(routing.locales)("§4 lists OpenAI with the other advertising platforms, not in the sub-processor table (%s)", (locale) => {
    const text = s4(locale);
    const rows = text.split("\n").filter((line) => line.trim().startsWith("|"));
    const transfers = text.split("\n").find((line) => line.includes("Meta Platforms Ireland Limited"))!;

    expect(transfers, `${locale} §4 transfers paragraph`).toMatch(POLICY[locale].transfers);
    expect(transfers).toMatch(POLICY[locale].independentRecipient);
    expect(rows.filter((row) => /OpenAI|ChatGPT/.test(row)), `${locale} §4 table`).toEqual([]);
  });

  it.each(routing.locales)("§5.3 sets no OpenAI cookie, and says where the OpenAI click identifier goes (%s)", (locale) => {
    const rows = s53(locale).split("\n").filter((line) => line.trim().startsWith("|"));

    expect(rows.filter((row) => /OpenAI|ChatGPT|oppref|obref/.test(row) && !row.includes("`stampeo_ad`"))).toEqual([]);
    expect(rows.find((row) => row.includes("`stampeo_ad`"))).toMatch(POLICY[locale].adCookieRow);
  });

  it.each(routing.locales)("§5.5 lists the oppref among the click identifiers (%s)", (locale) => {
    expect(s55(locale)).toMatch(POLICY[locale].clickIdentifiers);
  });

  it.each(routing.locales)(
    "§5.5 keeps each platform to its own identifiers in the reports from our servers, and says the Meta pixel reads the page address (%s)",
    (locale) => {
      // The browser pixel sees the address, which can carry another platform's click id.
      expect(s55(locale)).toMatch(POLICY[locale].ownIdentifiers);
      expect(s55(locale)).toMatch(POLICY[locale].pixelReadsAddress);
    },
  );

  it.each(routing.locales)(
    "§5.5 says which steps and data OpenAI receives, only for visitors from one of its ads, under the advertising choice (%s)",
    (locale) => {
      const w = POLICY[locale];
      const paragraph = paragraphWith(s55(locale), w.threeSteps);

      expect(paragraph, `${locale} §5.5 OpenAI paragraph`).not.toBe("");
      for (const claim of [
        w.noPaymentPage,
        w.onlyItsOwnAds,
        w.clickAndPrice,
        w.hashedAccountEmail,
        w.nothingElse,
        w.optOut,
      ]) {
        expect(paragraph).toMatch(claim);
      }
    },
  );

  it.each(routing.locales)("§5.5 defines OpenAI and gives it a role bullet (%s)", (locale) => {
    const text = s55(locale);

    expect(text).toMatch(POLICY[locale].recipients);
    expect(text).toMatch(POLICY[locale].roleBullet);
  });

  it.each(routing.locales)("§6 names OpenAI in the United States sharing paragraph (%s)", (locale) => {
    const sharing = s6(locale).split("\n").find((line) => /California|Californie|Californ|Kalifornii/.test(line))!;

    expect(sharing, `${locale} §6 sharing paragraph`).toContain("OpenAI");
  });

  it.each(routing.locales)("the policy gains no heading for OpenAI (%s)", (locale) => {
    const headings = privacySource(locale)
      .split("\n")
      .filter((line) => /^#+\s/.test(line));

    expect(headings.filter((heading) => /OpenAI|ChatGPT/.test(heading))).toEqual([]);
  });
});
