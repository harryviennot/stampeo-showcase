// The sibling links a Polish feature preview closes with, named after the live Polish feature pages.
import type { LandingCopy } from "../../bundle";

export const PREVIEW_SHARED: LandingCopy["previews"]["shared"]["PREVIEW_SHARED"] = {
  lockScreenAlt: "Powiadomienie od {sender} na ekranie blokady: {message}",
  related: {
    title: "Więcej funkcji Stampeo.",
    cards: {
      cardDesign: { title: "Wzór karty", line: "Twoje logo, kolory i ikony pieczątek na karcie." },
      mobileScanner: { title: "Skaner mobilny", line: "Pieczątki z aplikacji albo z dowolnej przeglądarki." },
      pushNotifications: { title: "Powiadomienia", line: "Każda pieczątka i nagroda na ekranie blokady." },
      analytics: { title: "Statystyki", line: "Wizyty, powroty i godziny szczytu." },
      promotionalCampaigns: { title: "Rozsyłki promocyjne", line: "Jedna wiadomość na kartę każdego klienta." },
      geolocation: { title: "Geolokalizacja", line: "Wkrótce: twoja karta, gdy klient przechodzi obok." },
      loyaltyPrograms: { title: "Programy lojalnościowe", line: "Pieczątki, punkty i poziomy dla stałych klientów." },
    },
  },
};
