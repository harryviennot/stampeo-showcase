// The promotional broadcasts preview in Polish ("Rozsyłki promocyjne"): one message written once, on every customer's card.
import type { LandingCopy } from "../../bundle";
import { SAMPLE_BUSINESS } from "../shared";

const HAPPY_HOUR = { sender: SAMPLE_BUSINESS, body: "Spokojne popołudnie? Druga kawa za pół ceny do 17:00." };

export const PROMOTIONAL_CAMPAIGNS_PREVIEW: LandingCopy["previews"]["promotionalCampaigns"]["PROMOTIONAL_CAMPAIGNS_PREVIEW"] = {
  meta: {
    title: "Promocje na telefony klientów bez opłat za SMS-y | Stampeo",
    description:
      "Wyślij promocję na telefon każdego klienta jako powiadomienie z jego karty lojalnościowej. Alternatywa dla marketingu SMS, bez opłaty za wiadomość.",
  },
  hero: {
    h1: "Wyślij promocję na telefon każdego klienta.",
    accent: "na telefon każdego klienta.",
    sub: "Napisz jedną wiadomość, a pojawi się na ekranie blokady każdego klienta. Bez opłat za SMS-y.",
    alt: "Ekran blokady iPhone'a z powiadomieniem od Aurevo: Spokojne popołudnie? Druga kawa za pół ceny do 17:00.",
  },
  heroBanner: HAPPY_HOUR,
  how: {
    eyebrow: "Jak to działa",
    title: "Jedna wiadomość na ekranie blokady każdego klienta.",
    lead: "Rozsyłka to jedna wiadomość, którą piszesz raz. Trafia na kartę każdego klienta.",
    steps: [
      { title: "Napisz wiadomość", body: "Wpisz ją raz w panelu, swoimi słowami." },
      { title: "Wyślij", body: "Trafia do każdego klienta, który ma twoją kartę w telefonie." },
      { title: "Klienci widzą ją na ekranie blokady", body: "Powiadomienie od twojego lokalu, w Apple Wallet albo Google Wallet." },
    ],
    visual: {
      messageLabel: "Twoja wiadomość",
      phones: ["iPhone Zosi", "Android Marka", "iPhone Ani"],
    },
    alt: "Jedna wiadomość napisana raz w panelu i to samo powiadomienie od Aurevo na ekranach blokady trzech klientów.",
  },
  texting: {
    eyebrow: "Zamiast SMS-ów",
    title: "Wysyłaj promocje bez płacenia za każdy SMS.",
    lead: "Bez opłaty za wiadomość i bez limitu klientów, do których dociera.",
    sms: {
      title: "SMS-y",
      facts: [
        { text: "Opłata za każdy wysłany SMS" },
        { text: "Im więcej klientów, tym wyższy rachunek" },
        { text: "Potrzebujesz numeru telefonu każdego klienta" },
      ],
    },
    stampeo: {
      title: "Rozsyłki Stampeo",
      facts: [
        { text: "Bez opłaty za wiadomość" },
        { text: "Bez limitu klientów, do których dociera" },
        { text: "Trafia na kartę, którą klient ma już w telefonie" },
      ],
    },
  },
  ideas: {
    eyebrow: "Pomysły na rozsyłkę",
    title: "Daj im powód, żeby wpadli jeszcze dziś.",
    lead: "Cztery wiadomości dla kawiarni na ten tydzień. Swoje napiszesz tak samo.",
    rows: [
      { key: "slow-afternoon", name: "Spokojne popołudnie", body: "Do wszystkich.", banner: HAPPY_HOUR },
      {
        key: "something-new",
        name: "Nowość",
        body: "Do wszystkich.",
        banner: { sender: SAMPLE_BUSINESS, body: "Chlebek dyniowy wraca dziś na ladę." },
      },
      {
        key: "tonight-only",
        name: "Tylko dziś wieczorem",
        body: "Do wszystkich.",
        banner: { sender: SAMPLE_BUSINESS, body: "Dziś od 19:00 muzyka na żywo. Wpadnij się przywitać!" },
      },
      {
        key: "new-customers",
        name: "Nowi klienci",
        body: "Tylko do klientów, którzy dołączyli w ostatnim miesiącu.",
        banner: { sender: SAMPLE_BUSINESS, body: "Dziękujemy, że jesteś z nami! Do następnej kawy dorzucamy ciastko." },
      },
    ],
  },
  delivery: {
    eyebrow: "Po wysłaniu",
    title: "Zobacz, ilu klientów ją dostało.",
    lead: "Każda rozsyłka pokazuje, ilu klientów dostało ją w Apple Wallet i Google Wallet.",
    report: {
      status: "Wysłana",
      sentAt: "Wysłano o",
      time: "14:30",
      stats: "Dostarczenie",
      deliveryRate: "{rate}% dostarczonych",
      reachable: "osiągalnych",
      sendAgain: "Wyślij ponownie",
    },
    delivered: [
      { label: "Apple Wallet", value: 412 },
      { label: "Google Wallet", value: 268 },
    ],
    missed: [
      { label: "Ponad dzienny limit Google", value: 14 },
      { label: "Karta usunięta", value: 22 },
    ],
    after: {
      title: "Po każdej rozsyłce",
      facts: [
        { text: "Ilu klientów ją dostało, w Apple Wallet i w Google Wallet" },
        { text: "Klienci, którzy usunęli kartę, liczeni osobno" },
        { text: "Wyślij ją ponownie, kiedy chcesz" },
      ],
    },
  },
  faq: {
    title: "Pytania o rozsyłki",
    items: [
      {
        question: "Ile kosztuje wysłanie rozsyłki?",
        answer:
          "Nie ma opłaty za wiadomość. Rozsyłki są w cenie subskrypcji Stampeo, więc nie płacisz od każdej wysłanej wiadomości, jak przy SMS-ach.",
      },
      {
        question: "Czy jest limit rozsyłek?",
        answer:
          "Nie ma limitu klientów, do których dociera rozsyłka: trafia do każdego klienta, który ma twoją kartę w telefonie. Liczbę rozsyłek w miesiącu ustala twój plan (szczegóły w cenniku).",
      },
      {
        question: "Czy moi klienci potrzebują aplikacji albo numeru telefonu?",
        answer:
          "Nie. Wiadomość trafia na kartę lojalnościową w Apple Wallet albo Google Wallet. Klienci nie pobierają żadnej aplikacji, a ty nie potrzebujesz ich numeru telefonu ani e-maila.",
      },
      {
        question: "Czy to alternatywa dla marketingu SMS?",
        answer:
          "Tak, dla każdego klienta, który ma twoją kartę. Wiadomość pojawia się na ekranie blokady jak SMS, ale bez opłaty za wiadomość i bez zbierania numerów telefonów.",
      },
      {
        question: "Czy to działa na iPhonie i Androidzie?",
        answer:
          "Tak. Każda rozsyłka trafia do Apple Wallet i Google Wallet. Google pokazuje najwyżej trzy powiadomienia na kartę dziennie, więc klient, który dostał już trzy tego dnia, tej nie zobaczy.",
      },
      {
        question: "Czy mogę napisać ją w kilku językach?",
        answer:
          "Tak. Dodaj tłumaczenie po angielsku, francusku albo hiszpańsku, a każdy klient zobaczy wersję w języku swojego telefonu.",
      },
    ],
  },
  band: {
    title: "Zapełnij spokojne popołudnie.",
    accent: "spokojne popołudnie.",
    sub: "Zacznij za darmo i wyślij pierwszą rozsyłkę jeszcze w tym tygodniu.",
  },
};
