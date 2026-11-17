// The geolocation preview in Polish: not live yet, so every claim is in the future tense or under "wkrótce".
import type { LandingCopy } from "../../bundle";
import { SAMPLE_BUSINESS } from "../shared";

export const GEOLOCATION_PREVIEW: LandingCopy["previews"]["geolocation"]["GEOLOCATION_PREVIEW"] = {
  meta: {
    title: "Powiadomienia geolokalizacyjne już wkrótce | Stampeo",
    description:
      "Wkrótce: powiadomienia geolokalizacyjne, które pokażą twoją kartę lojalnościową na ekranie blokady klienta, gdy przejdzie obok twojego lokalu.",
  },
  hero: {
    h1: "Powiadomienia geolokalizacyjne już wkrótce.",
    accent: "już wkrótce.",
    sub: "Gdy klient przejdzie obok lokalu, twoja karta pojawi się na ekranie blokady jego telefonu.",
    secondary: "Zobacz, jak to będzie działać",
    alt: "Ekran blokady z powiadomieniem od Aurevo: Aurevo tuż za rogiem. Twoja szósta kawa czeka. Jeszcze 2 pieczątki do darmowej.",
  },
  banner: {
    sender: SAMPLE_BUSINESS,
    title: "Aurevo tuż za rogiem",
    body: "Twoja szósta kawa czeka. Jeszcze 2 pieczątki do darmowej.",
  },
  how: {
    eyebrow: "Jak to będzie działać",
    title: "Jak będą działać powiadomienia geolokalizacyjne.",
    lead: "Adres dodasz raz. Resztą zajmie się telefon klienta, bez żadnej aplikacji.",
    cells: [
      { title: "Dodaj adres lokalu", body: "Wpiszesz go raz, w swoim panelu." },
      { title: "Klient przechodzi obok", body: "Jego telefon zauważy, że jest blisko twojego lokalu." },
      { title: "Karta pojawia się na ekranie blokady", body: "Jedno naciśnięcie ją otworzy, gotową do zeskanowania przy ladzie." },
    ],
  },
  privacy: {
    eyebrow: "Prywatność",
    title: "Lokalizacja klienta zostanie w jego telefonie.",
    lead: "Karta będzie zawierać adres twojego lokalu. Nigdy nie zobaczymy, gdzie jest klient.",
    facts: [
      { text: "Telefon klienta sam sprawdzi odległość" },
      { text: "Nigdy nie otrzymamy jego lokalizacji" },
      { text: "Będzie można to wyłączyć w ustawieniach telefonu" },
    ],
    alt: "Telefon w przerywanym okręgu wokół lokalu. Linia do chmury jest przerwana: żadna lokalizacja nie opuści telefonu.",
  },
  faq: {
    title: "Pytania o geolokalizację",
    items: [
      {
        question: "Kiedy będzie dostępna?",
        answer: "Nie mamy jeszcze daty. Gdy będzie gotowa, ogłosimy to na stronie Nowości.",
      },
      {
        question: "Czy klienci będą potrzebować nowej karty?",
        answer: "Nie. Karta, którą już mają w telefonie, dostanie tę funkcję przy najbliższej aktualizacji.",
      },
      {
        question: "Czy klienci będą musieć coś ustawiać?",
        answer:
          "Nie. Nie będzie żadnej aplikacji do instalowania. Wszystkim zajmie się telefon, a w ustawieniach będzie można to wyłączyć.",
      },
      {
        question: "Czy mogę zacząć, zanim się pojawi?",
        answer:
          "Tak. Karta, pieczątki, nagrody i powiadomienia działają już dziś, a geolokalizacja dołączy do nich, gdy będzie gotowa.",
      },
    ],
  },
  band: {
    title: "Przygotuj kartę już dziś.",
    accent: "już dziś.",
    sub: "Zacznij teraz od pieczątek albo punktów. Karta będzie gotowa na start geolokalizacji.",
  },
  related: {
    title: "Sposoby, żeby klienci wracali już dziś.",
  },
};
