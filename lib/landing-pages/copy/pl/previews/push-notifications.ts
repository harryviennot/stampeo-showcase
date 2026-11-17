// The notifications preview in Polish; the banners and the editor's words follow the backend defaults and the dashboard's Polish catalog.
import type { LandingCopy } from "../../bundle";
import { LEVEL_UP_BANNER, REWARD_BANNER, SAMPLE_BUSINESS, STAMP_BANNER } from "../shared";

const REDEEMED_BANNER = { sender: SAMPLE_BUSINESS, body: "Nagroda odebrana. Korzystaj!" };

const AUREVO_LEVEL_UP = { sender: SAMPLE_BUSINESS, body: LEVEL_UP_BANNER.body };

export const PUSH_NOTIFICATIONS_PREVIEW: LandingCopy["previews"]["pushNotifications"]["PUSH_NOTIFICATIONS_PREVIEW"] = {
  meta: {
    title: "Powiadomienia z karty lojalnościowej | Stampeo",
    description:
      "Każda pieczątka i nagroda wysyła powiadomienie na ekran blokady klienta, w Apple Wallet i Google Wallet. Bez aplikacji do pobrania. Darmowy okres próbny.",
  },
  hero: {
    h1: "Powiadomienia z twojej karty lojalnościowej.",
    accent: "Powiadomienia",
    sub: "Każda pieczątka i nagroda wysyła automatyczne powiadomienie na ekran blokady klienta.",
    banner: STAMP_BANNER,
    alt: "Ekran blokady iPhone'a z powiadomieniem od Aurevo: Pieczątka zebrana! Masz 5 z 8 pieczątek.",
  },
  day: {
    eyebrow: "Wizyty jednego klienta",
    title: "Powiadomienie przy każdej zmianie na karcie.",
    lead: "Śledź jednego klienta: najpierw aktualizuje się karta, potem przychodzi wiadomość.",
    nodes: [
      { key: "stamp", label: "Pieczątka dodana", banner: STAMP_BANNER, cardAlt: "Karta Aurevo: 5 z 8 pieczątek" },
      { key: "reward", label: "Pełna karta", banner: REWARD_BANNER, cardAlt: "Pełna karta Aurevo: 8 z 8 pieczątek" },
      {
        key: "redeemed",
        label: "Nagroda odebrana",
        banner: REDEEMED_BANNER,
        cardAlt: "Karta Aurevo wraca do 0 z 8 po odebraniu nagrody",
      },
      { key: "level", label: "Nowy poziom", banner: AUREVO_LEVEL_UP, cardAlt: "Karta Aurevo na poziomie Srebro: 1 z 8 pieczątek" },
    ],
  },
  wallets: {
    eyebrow: "iPhone i Android",
    title: "Powiadomienia na iPhonie i Androidzie.",
    lead: "Pokazują je i Apple Wallet, i Google Wallet. Klienci niczego nie pobierają.",
    iphone: "Na iPhonie",
    android: "Na Androidzie",
    icon: {
      title: "Twoja własna ikona",
      line: "Wgraj ikonę albo wybierz taką, która powstała z twojego logo.",
    },
    phoneAlts: {
      apple: "iPhone z kartą lojalnościową Aurevo otwartą w Apple Wallet",
      google: "Telefon z Androidem z tą samą kartą otwartą w Google Wallet",
    },
  },
  editor: {
    eyebrow: "Twoje słowa",
    title: "Gotowa treść albo twoje własne słowa.",
    lead: "Każda wiadomość jest gotowa do wysłania. Wyłącz dowolną albo napisz ją po swojemu.",
    toggle: { label: "Treść wiadomości", ready: "Gotowa", own: "Twoja" },
    messageLabel: "Wiadomość",
    previewLabel: "Podgląd",
    ready: { text: STAMP_BANNER.body },
    own: {
      text: "Nowa pieczątka, {imię}! Jeszcze {pozostałe pieczątki} do nagrody.",
      preview: "Nowa pieczątka, Zosia! Jeszcze 3 do nagrody.",
    },
    switches: ["Pieczątka zebrana", "Nagroda odblokowana", "Nagroda odebrana"],
  },
  demo: {
    eyebrow: "Demo na żywo",
    title: "Wypróbuj na własnym telefonie.",
    lead: "Dodaj przykładową kartę do portfela, przybij pieczątkę i odbierz powiadomienie na swoim telefonie.",
  },
  band: {
    title: "Każda pieczątka na ekranie blokady.",
    accent: "na ekranie blokady.",
    sub: "Powiadomienia ruszają od pierwszej pieczątki. Klienci niczego nie instalują.",
  },
};
