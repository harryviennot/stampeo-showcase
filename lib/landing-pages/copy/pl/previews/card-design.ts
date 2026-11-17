// The card design preview in Polish: can the card look like my shop, and what can I change on it.
import type { LandingCopy } from "../../bundle";

export const CARD_DESIGN_PREVIEW: LandingCopy["previews"]["cardDesign"]["CARD_DESIGN_PREVIEW"] = {
  meta: {
    title: "Zaprojektuj cyfrową kartę lojalnościową | Stampeo",
    description:
      "Zaprojektuj cyfrową kartę lojalnościową z logo, kolorami i ikonami pieczątek, do Apple Wallet i Google Wallet. Pieczątki, punkty albo poziomy. Darmowy okres próbny.",
  },
  hero: {
    h1: "Zaprojektuj cyfrową kartę lojalnościową.",
    accent: "cyfrową kartę lojalnościową.",
    sub: "Twoje logo, twoje kolory i własne ikony pieczątek, w Apple Wallet i Google Wallet.",
    secondary: "Zobacz każdy element karty",
  },
  reskin: {
    captions: ["Myjnia", "Piekarnia", "Winiarnia", "Studio rzęs", "Księgarnia", "Food truck z pizzą"],
    previous: "Poprzedni lokal",
    next: "Następny lokal",
    dot: "Pokaż kartę: {shop}",
    alt: "Jedna karta lojalnościowa w wyglądzie sześciu lokali: myjni, piekarni, winiarni, studia rzęs, księgarni i food trucka z pizzą.",
  },
  anatomy: {
    eyebrow: "Każdy element",
    title: "Każdy element karty jest twój.",
    lead: "Zmieniasz logo, kolory, pieczątki, nagrodę i dane. Kod QR dodajemy za ciebie.",
    labels: ["Logo", "Liczba pieczątek", "Pieczątki", "Imię klienta", "Nagroda", "Kod QR do zeskanowania"],
    mobileLabels: ["Logo", "Liczba", "Pieczątki", "Imię", "Nagroda", "Kod QR"],
    pointsLabels: ["Logo", "Stan punktów", "Wygląd punktów", "Imię klienta", "Następna nagroda", "Kod QR do zeskanowania"],
    pointsMobileLabels: ["Logo", "Stan", "Punkty", "Imię", "Nagroda", "Kod QR"],
  },
  programs: {
    eyebrow: "Pieczątki, punkty albo poziomy",
    title: "Karta na pieczątki, punktowa albo z poziomami.",
    lead: "Pieczątki nagradzają wizyty, punkty wydatki, a poziomy stałych klientów.",
    cards: [
      { title: "Karta na pieczątki", line: "Pieczątka za każdą wizytę i nagroda za pełną kartę." },
      { title: "Karta punktowa", line: "Punkty za wydatki i lista nagród do wyboru." },
      { title: "Poziomy", line: "Do pięciu poziomów. Stali klienci awansują, a ich karta zmienia wygląd." },
    ],
    alts: ["Karta na pieczątki burgerowni", "Karta punktowa siłowni", "Karta pralni na poziomach Brąz, Srebro i Złoto"],
  },
  icons: {
    eyebrow: "Ikony pieczątek",
    title: "Nasze ikony pieczątek albo twoje własne.",
    lead: "Wybierz jedną z 98 gotowych ikon albo wgraj logo. Tło usuniemy za ciebie.",
    facts: [
      "98 gotowych ikon pieczątek z wyszukiwaniem po nazwie",
      "Wgraj dowolny obrazek: tło usuwa się automatycznie",
      "Inna ikona do każdej pieczątki i osobna na nagrodę",
      "W rzędzie, naprzemiennie albo nakładane",
      "Nie masz logo? Karta pokaże twoje inicjały",
    ],
    cards: ["Pulp: własne ikony cytrusów", "Gelo: własne rożki", "Salon groomerski: łapki z biblioteki"],
  },
  wallets: {
    eyebrow: "iPhone i Android",
    title: "Cyfrowa karta lojalnościowa na każdym telefonie.",
    lead: "Ta sama karta w Apple Wallet i Google Wallet. Klienci skanują jeden kod QR.",
    cells: [
      { title: "Jeden kod QR", body: "Klienci go skanują i dostają kartę na swój telefon." },
      { title: "Podgląd na żywo", body: "Oba portfele widzisz już podczas projektowania." },
      { title: "Zawsze aktualna", body: "Zmieniasz kartę, a każda karta, która jest już w telefonach, się aktualizuje." },
    ],
    phoneAlts: {
      apple: "iPhone z kartą lojalnościową otwartą w Apple Wallet",
      google: "Telefon z Androidem z tą samą kartą otwartą w Google Wallet",
    },
  },
  cardFields: {
    holder: "Imię",
    reward: "Nagroda",
    nextReward: "Następna nagroda",
    shops: [
      { holder: "Antoni", reward: "Darmowe mycie" },
      { holder: "Zofia", reward: "Darmowy rogalik" },
      { holder: "Iga", reward: "Darmowy kieliszek" },
      { holder: "Kasia", reward: "Darmowe uzupełnienie" },
      { holder: "Filip", reward: "Darmowa torba" },
      { holder: "Bartek", reward: "Darmowy kawałek" },
    ],
    anatomy: {
      stamps: { holder: "Ania", reward: "Darmowy zabieg" },
      points: { holder: "Lena", reward: "Darmowa torba" },
    },
    wallets: { holder: "Ewa", reward: "-10%" },
  },
  faq: {
    title: "Pytania o twoją kartę",
    items: [
      {
        question: "Czy mogę użyć własnych ikon pieczątek?",
        answer:
          "Tak. Wgraj dowolny obrazek, na przykład croissanta, maskotkę albo logo. Tło usuwamy automatycznie i robi się z niego pieczątka. Możesz nawet dać inną ikonę do każdej pieczątki.",
      },
      {
        question: "A jeśli nie mam logo?",
        answer:
          "Karta i tak działa. Bez logo pokazuje twoje inicjały w kolorze akcentu, a ikony pieczątek wybierzesz z 98 gotowych.",
      },
      {
        question: "Czy mogę zrobić cyfrową kartę na pieczątki albo kartę punktową?",
        answer:
          "Jedno i drugie. Karta na pieczątki działa jak papierowa, z pieczątką za każdą wizytę. Karta punktowa nagradza wydatki. Do każdej możesz dodać poziomy i zmienić rodzaj później, a klienci nie stracą swojej karty.",
      },
      {
        question: "Czy karta działa na iPhonie i Androidzie?",
        answer:
          "Tak. Ta sama karta trafia do Apple Wallet i Google Wallet, a edytor pokazuje obie wersje podczas pracy. Klienci skanują jeden kod QR, niezależnie od telefonu.",
      },
      {
        question: "Czy mogę później zmienić kartę?",
        answer: "Kiedy tylko chcesz. Edytujesz kartę, a karty, które klienci mają już w telefonach, aktualizują się same.",
      },
      {
        question: "Czy zrobicie kartę za mnie?",
        answer:
          "Tak, za darmo. Wyślij nam logo i dane, a odeślemy gotową kartę. Potem nadal możesz ją zmieniać po swojemu.",
      },
    ],
  },
  band: {
    title: "Stwórz kartę w swoim stylu.",
    accent: "w swoim stylu.",
    sub: "Zaprojektuj ją samodzielnie albo przyślij logo, a zrobimy ją za ciebie, za darmo.",
  },
};
