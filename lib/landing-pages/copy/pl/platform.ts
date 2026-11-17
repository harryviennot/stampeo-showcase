// The Platform page in Polish: a tour of the product for a Polish shop owner.
import type { LandingCopy } from "../bundle";

export const PLATFORM: LandingCopy["platform"]["PLATFORM"] = {
  meta: {
    title: "Karty lojalnościowe w Apple i Google Wallet | Stampeo",
    description:
      "Cyfrowa karta lojalnościowa w Apple Wallet i Google Wallet: tworzysz ją w panelu, a pieczątki dodajesz w darmowej aplikacji. Darmowy okres próbny.",
  },
  hero: {
    h1: "Karty lojalnościowe w Apple i Google Wallet.",
    accent: "Apple i Google Wallet.",
  },
  heroCards: {
    stackAlt:
      "Karty lojalnościowe ułożone jak w portfelu telefonu: z przodu karta na pieczątki kawiarni, a za nią górne krawędzie karty punktowej salonu, karty z poziomami groomera i karty na pieczątki piekarni.",
  },
  marquee: {
    label: "Stworzone dla",
    types: [
      "Kawiarnie",
      "Piekarnie",
      "Barber shopy",
      "Studia paznokci",
      "Restauracje",
      "Księgarnie",
      "Food trucki",
      "Salony spa",
      "Studia rzęs",
      "Bary z sokami",
      "Myjnie samochodowe",
      "Salony groomerskie",
    ],
  },
  deliver: {
    eyebrow: "W portfelu klienta",
    title: "Prosto do Apple Wallet i Google Wallet.",
    lead: "Bez aplikacji do pobrania. Karta czeka tuż obok kart płatniczych klienta.",
    analyticsLabel: "Statystyki",
    notificationsLabel: "Powiadomienia na ekranie blokady",
    updatesLabel: "Aktualizacje na żywo",
    updatesFrom: "5/8",
    updatesTo: "6/8",
  },
  analyticsCard: {
    visits: "Wizyty",
    returnRate: "Powroty w 30 dni",
    overTime: "Wizyty w czasie",
    returning: "Już byli",
    first: "Pierwsza wizyta",
    points: "pkt",
    alt: "Statystyki. Wizyty: {visits}, wzrost o {visitsChange}%. {returnRate}: {returnRatePercent}%, wzrost o {returnRateChange} pkt. Do tego wizyty w czasie, tydzień po tygodniu.",
  },
  numbers: {
    eyebrow: "W liczbach",
    title: "Gdzie dziś jest Stampeo.",
    figures: [
      {
        value: "95%",
        text: "kart zostaje w telefonie",
        source: "Dane Stampeo: 2 786 kart z 73 firm, dodanych od czerwca do sierpnia 2026",
      },
    ],
  },
  how: {
    eyebrow: "Jak to działa",
    title: "Stwórz, udostępnij, przybij pieczątkę.",
    lead: "Zaprojektuj kartę, postaw kod na ladzie i dodawaj pieczątki z dowolnego telefonu.",
    cells: [
      { title: "Stwórz", body: "Karta, która wygląda jak twój lokal: twoje logo, twoje kolory, twoja nagroda." },
      { title: "Udostępnij", body: "Klienci skanują kod QR z lady albo naciskają twój link. Bez aplikacji, bez konta." },
      {
        title: "Przybij pieczątkę",
        body: "Skanujesz kartę dowolnym telefonem. Zmiana pojawia się w kilka sekund, także na ekranie blokady klienta.",
      },
    ],
    link: "Wypróbuj dodawanie pieczątki",
  },
  demo: {
    eyebrow: "Demo na żywo",
  },
  programTypes: {
    eyebrow: "Rodzaje programu",
    title: "Pieczątki, punkty albo poziomy.",
    lead: "Nagradzaj wizyty, nagradzaj wydatki albo pozwól stałym klientom awansować.",
    closer: "Jak wybrać między pieczątkami a punktami",
  },
  platform: {
    eyebrow: "Platforma Stampeo",
    title: "Zarządzaj z komputera albo z telefonu.",
    lead: "Panel dla ciebie i darmowa aplikacja do skanowania dla zespołu.",
    tabs: { dashboard: "Panel", scanner: "Skaner" },
    dashboard: {
      title: "Wszystko w jednym miejscu",
      facts: [
        { text: "Projektujesz kartę i od razu widzisz efekt" },
        { text: "Każdy klient, jego postęp i nagrody" },
        { text: "Rozsyłki na każdą kartę" },
        { text: "Twoje liczby, aktualne po każdym skanie" },
      ],
      link: "Zobacz statystyki",
    },
    scanner: {
      title: "Za darmo dla całego zespołu",
      facts: [
        { text: "iPhone, Android albo przeglądarka w dowolnym telefonie" },
        { text: "Pracownicy dołączają kodem i widzą tylko skaner" },
      ],
      link: "Zobacz skaner",
    },
  },
  share: {
    eyebrow: "Udostępniaj wszędzie",
    title: "Pokaż kartę tam, gdzie już są klienci.",
    lead: "Jeden kod QR i jeden link: na ladzie i wszędzie w sieci.",
    channels: [
      { title: "Ulotka na ladę", body: "Do wydruku, z twoim kodem QR" },
      { title: "Aplikacja do skanowania", body: "Pokazuje twój kod QR przy kasie" },
      { title: "Instagram", body: "Twój link w bio albo w relacjach" },
      { title: "Facebook", body: "Twój link na stronie firmy" },
      { title: "Twoja strona", body: "Przycisk albo kod QR" },
      { title: "Profil Firmy w Google", body: "Twój link tam, gdzie ludzie cię szukają" },
    ],
  },
  band: {
    title: "Uruchom swoją kartę jeszcze dziś.",
    accent: "jeszcze dziś.",
    sub: "Zaprojektuj ją, wypróbuj na swoim telefonie, a potem wybierz plan.",
  },
  blog: {
    eyebrow: "Blog",
    title: "Poradniki dla właścicieli firm.",
    lead: "Praktycznie o tym, jak prowadzić kartę lojalnościową, dzięki której klienci wracają.",
    viewAll: "Zobacz wszystkie",
  },
};
