// The scanner preview in Polish: staff scan a card with the free app or with the scanner in a browser.
import type { LandingCopy } from "../../bundle";

export const MOBILE_SCANNER_PREVIEW: LandingCopy["previews"]["mobileScanner"]["MOBILE_SCANNER_PREVIEW"] = {
  meta: {
    title: "Skaner kart lojalnościowych na iPhone'a i Androida | Stampeo",
    description:
      "Skanuj karty lojalnościowe darmową aplikacją Stampeo na iPhone'a i Androida albo skanerem w dowolnej przeglądarce. Bez nowego sprzętu. Darmowy okres próbny.",
  },
  hero: {
    h1: "Skaner kart lojalnościowych dla twojej obsługi.",
    accent: "Skaner",
    sub: "Darmowa aplikacja na iPhone'a i Androida albo skaner w każdej przeglądarce. Bez nowego sprzętu.",
    secondary: "Zobacz, jak działa przy ladzie",
  },
  counter: {
    eyebrow: "Przy ladzie",
    title: "Pieczątki, punkty i nagrody jednym skanem.",
    lead: "Zeskanuj kartę klienta i naciśnij raz. Karta zaktualizuje się w kilka sekund.",
    options: [
      { key: "stamps", title: "Pieczątki", line: "Dodaj jedną albo kilka naraz" },
      { key: "points", title: "Punkty", line: "Wpisz wydaną kwotę" },
      { key: "rewards", title: "Nagrody", line: "Odbierz od razu albo zostaw na kolejną wizytę" },
      { key: "levels", title: "Poziomy", line: "Zobacz poziom klienta i jego korzyści" },
    ],
    fact: "Zaraz potem klient dostaje powiadomienie na ekranie blokady.",
    panes: [
      {
        screenAlt:
          "Aplikacja do skanowania dodaje trzy pieczątki na kartę Zosi jednym skanem: licznik ustawiony na 3 i przycisk Dodaj 3 pieczątki.",
        cardAlt: "Karta Zosi z Aurevo w portfelu, pełna: 8 z 8 pieczątek.",
        result: "5 → 8 pieczątek",
      },
      {
        screenAlt:
          "Aplikacja do skanowania przyjmuje kwotę 12,50 wpisaną na klawiaturze i pokazuje punkty za nią, około 12, zanim ktokolwiek zatwierdzi.",
        cardAlt: "Karta Zosi z księgarni Marginalia w portfelu, teraz z 252 punktami.",
        result: "240 → 252 pkt",
      },
      {
        screenAlt: "Lista nagród do odebrania w aplikacji do skanowania: trzy nagrody, każda z przyciskiem Odbierz.",
        cardAlt: "Karta Zosi z Aurevo w portfelu, z powrotem na 2 z 8 pieczątek po odebraniu nagrody.",
        result: "Darmowa kawa odebrana",
      },
      {
        screenAlt: "Aplikacja do skanowania pokazuje przywileje klienta na poziomie Srebro do zastosowania przy kasie przed płatnością.",
        cardAlt: "Karta Zosi z pralni Wrenfold w portfelu, na poziomie Srebro.",
        result: "Poziom: Srebro",
      },
    ],
  },
  screens: {
    customer: "Zosia",
    stamps: { detail: "5 / 8", added: "+3 pieczątki", completes: "To zapełni kartę", button: "Dodaj 3 pieczątki" },
    points: { detail: "240 pkt", amount: "12,50", earns: "≈ +12 pkt", button: "Dodaj punkty" },
    rewards: {
      detail: "8 / 8",
      title: "Nagrody do odebrania",
      redeem: "Odbierz",
      gift: "Prezent",
      expiresToday: "Wygasa dzisiaj",
      expiresLater: "Wygasa za 5 dni",
      held: ["Darmowa kawa", "Darmowe ciastko", "Darmowa kawa"],
    },
    levels: {
      detail: "4 / 6",
      perks: ["Darmowy zwrot wieszaków", "Odbiór bez kolejki"],
      perkOne: "Przywilej {level}: {perk}",
      perkMany: "Przywileje {level}:",
      applyOne: "Zastosuj go przy kasie, zanim pobierzesz płatność.",
      applyMany: "Zastosuj je przy kasie, zanim pobierzesz płatność.",
      button: "Dodaj pieczątkę",
    },
  },
  ways: {
    eyebrow: "Aplikacja albo przeglądarka",
    title: "Aplikacja do skanowania albo przeglądarka.",
    lead: "Aplikacja skanuje najpłynniej. Nie chcesz nic pobierać? Skaner w przeglądarce zawsze zadziała.",
    cells: [
      {
        title: "Aplikacja Stampeo",
        body: "Za darmo w App Store i Google Play. Logowanie przez Google albo Apple jednym naciśnięciem.",
        devices: ["iPhone", "Android"],
      },
      {
        title: "Skaner w przeglądarce",
        body: "Otwórz scan.stampeo.app w dowolnej przeglądarce. Nic do instalowania.",
        devices: ["Telefon", "Tablet", "Laptop"],
      },
    ],
    fact: "Oba robią to samo: skanują kartę, dodają pieczątki albo punkty i wydają nagrody.",
  },
  band: {
    title: "Pierwsza pieczątka jeszcze dziś.",
    accent: "jeszcze dziś.",
    sub: "Przygotuj kartę, a potem zeskanuj pierwszego klienta dowolnym telefonem.",
  },
};
