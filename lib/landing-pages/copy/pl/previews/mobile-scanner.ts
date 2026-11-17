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
