// The words every Platform-style page shares, in Polish; the banners follow the backend's Polish notification defaults.
import type { LandingCopy } from "../bundle";

/** "+120" or "120+" read inside a sentence: "ponad 120". */
function atLeast(figure: string): string {
  const trimmed = figure.trim();
  const number = trimmed.replace(/^\+\s*|\s*\+$/g, "");
  return number === trimmed ? number : `ponad ${number}`;
}

export const SAMPLE_BUSINESS: LandingCopy["shared"]["SAMPLE_BUSINESS"] = "Aurevo";

export const STAMP_BANNER: LandingCopy["shared"]["STAMP_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Pieczątka zebrana! Masz 5 z 8 pieczątek.",
};

export const REWARD_BANNER: LandingCopy["shared"]["REWARD_BANNER"] = {
  sender: SAMPLE_BUSINESS,
  body: "Nagroda odblokowana! Zapraszamy po odbiór.",
};

export const LEVELS_BUSINESS: LandingCopy["shared"]["LEVELS_BUSINESS"] = "Wrenfold";

export const LEVEL_UP_BANNER: LandingCopy["shared"]["LEVEL_UP_BANNER"] = {
  sender: LEVELS_BUSINESS,
  body: "Poziom Srebro osiągnięty! Twoja karta ma nowy wzór.",
};

export const SHARED: LandingCopy["shared"]["SHARED"] = {
  cta: "Zacznij za darmo",
  now: "teraz",
  googleCardTitle: "Karta lojalnościowa",
  levelNames: { bronze: "Brąz", silver: "Srebro", gold: "Złoto", platinum: "Platyna", noir: "Czerń" },
  reassurance: "{trialDays} dni za darmo · Rezygnujesz kiedy chcesz",
  proof: (businesses, countries) => `Działa już u ${atLeast(businesses)} firm w ${atLeast(countries)} krajach`,
  demoLink: "Wypróbuj na swoim telefonie",
  demo: {
    title: "Wypróbuj na własnym telefonie.",
    lead: "Dodaj przykładową kartę do portfela, przybij pieczątkę i zobacz to, co zobaczą twoi klienci.",
  },
  sampleData: "Przykładowe dane",
  dashboardUrl: "app.stampeo.app",
  levelCardsAlt: "Karta lojalnościowa pralni na trzech poziomach: Brąz, Srebro i Złoto.",
  sectorsEyebrow: "Dla każdej branży",
  faq: {
    title: "Pytania, które dostajemy najczęściej",
    items: [
      {
        question: "Czy moi klienci muszą pobierać aplikację?",
        answer:
          "Nie. Apple Wallet i Google Wallet są już w ich telefonie. Skanują twój kod QR i w kilka sekund karta jest w portfelu.",
      },
      {
        question: "Czy potrzebuję nowego sprzętu albo nowej kasy?",
        answer:
          "Nie. Pieczątki dodajesz w naszej darmowej aplikacji albo w przeglądarce dowolnego telefonu. Przy kasie nic się nie zmienia i niczego nie trzeba podłączać.",
      },
      {
        question: "Jak klienci dołączają?",
        answer:
          "Skanują kod QR przy ladzie albo naciskają link, który udostępniasz w sieci, i dodają kartę do Apple Wallet albo Google Wallet. W panelu wydrukujesz gotową ulotkę na ladę.",
      },
      {
        question: "Co się dzieje po zakończeniu okresu próbnego?",
        answer:
          "Decydujesz, czy zostajesz. Prosimy o kartę płatniczą na start okresu próbnego, ale przed upływem {trialDays} dni nie pobieramy nic. Możesz zrezygnować w każdej chwili przed tą datą.",
      },
      {
        question: "Czy muszę podpisywać umowę?",
        answer: "Nie. Plany miesięczne są bez umowy i bez opłaty wstępnej. Rezygnujesz w każdej chwili w swoim panelu.",
      },
    ],
    contact: {
      before: "Masz inne pytanie?",
      link: "Napisz do nas",
      after: "Odpowiadamy w ciągu 24 godzin.",
    },
  },
};
