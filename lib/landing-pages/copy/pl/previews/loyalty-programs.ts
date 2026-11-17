// The loyalty programs preview in Polish. The product word is "poziomy"; "wielopoziomowy" is the search word, used only in the meta and the one question that defines it.
import type { LandingCopy } from "../../bundle";

const HEAD_START_SOURCE = "Nunes & Drèze, Journal of Consumer Research, 2006 (karty lojalnościowe myjni, 9 miesięcy)";

export const LOYALTY_PROGRAMS_PREVIEW: LandingCopy["previews"]["loyaltyPrograms"]["LOYALTY_PROGRAMS_PREVIEW"] = {
  meta: {
    title: "Program lojalnościowy: pieczątki, punkty i poziomy | Stampeo",
    description:
      "Karta na pieczątki albo punkty w Apple Wallet i Google Wallet, a do tego wielopoziomowy program lojalnościowy: Brąz, Srebro, Złoto. Darmowy okres próbny.",
  },
  hero: {
    h1: "Program lojalnościowy: pieczątki, punkty i poziomy.",
    accent: "pieczątki, punkty i poziomy.",
    sub: "Karta na pieczątki albo punkty w Apple Wallet i Google Wallet, z poziomami dla stałych klientów.",
    secondary: "Zobacz, jak działają poziomy",
    alt: "Trzy karty lojalnościowe: karta na pieczątki baru z sokami, karta punktowa księgarni i karta barbera na poziomie Złoto z powiadomieniem „Poziom Złoto osiągnięty!”",
    labels: ["Pieczątki", "Poziomy", "Punkty"],
    banner: { sender: "Gaspard & Gus", body: "Poziom Złoto osiągnięty! Twoja karta ma nowy wzór." },
  },
  programs: {
    eyebrow: "Pieczątki albo punkty",
    title: "Pieczątki za wizyty, punkty za wydatki.",
    lead: "Ta sama karta, to samo przygotowanie. Zmienisz później, a klienci zachowają kartę.",
    stamps: {
      title: "Pieczątki",
      line: "Cyfrowa karta na pieczątki: pieczątka za każdą wizytę i nagroda za pełną kartę.",
      facts: [
        { text: "Jeden skan przy ladzie, bez wpisywania kwoty" },
        { text: "Ty wybierasz liczbę pieczątek i nagrodę" },
        { text: "Nadmiarowe pieczątki mogą przejść na kolejną kartę" },
      ],
      bestFor: "Każda wizyta kosztuje mniej więcej tyle samo: kawa, strzyżenie, myjnia, piekarnia.",
      alt: "Karta na pieczątki kawiarni: 5 z 8 pieczątek",
    },
    points: {
      title: "Punkty",
      line: "Punkty za to, ile klienci wydają, i lista nagród do wyboru.",
      facts: [
        { text: "Obsługa wpisuje kwotę, a punkty się sumują" },
        { text: "Klienci wybierają dowolną nagrodę, na którą mają punkty" },
        { text: "Punkty nigdy nie wygasają" },
      ],
      bestFor: "Koszyki się różnią: restauracje, butiki, sklepy spożywcze i specjalistyczne.",
      alt: "Karta punktowa salonu piękności, której pierścień wypełnia się do następnej nagrody",
    },
    bestForLabel: "Najlepsze, gdy",
  },
  levels: {
    eyebrow: "Poziomy lojalnościowe",
    title: "Dodaj poziomy, takie jak Brąz, Srebro i Złoto.",
    lead: "Stali klienci awansują, gdy wracają. Każdy poziom może mieć własny wygląd, korzyści i prezent.",
    ladder: [
      {
        name: "Brąz",
        reach: "Tu zaczyna każdy klient",
        card: "6 pieczątek za darmowe strzyżenie",
        perks: [],
      },
      {
        name: "Srebro",
        reach: "1 pełna karta na poziomie Brąz",
        card: "5 pieczątek za darmowe strzyżenie",
        perks: ["Darmowy gorący ręcznik na koniec"],
        gift: "Butelka olejku do brody",
      },
      {
        name: "Złoto",
        reach: "2 pełne karty na poziomie Srebro",
        card: "4 pieczątki za strzyżenie i trymowanie brody",
        perks: ["Darmowe trymowanie brody", "Pierwszeństwo przy rezerwacji"],
        gift: "Darmowe golenie z gorącym ręcznikiem",
      },
    ],
    labels: { card: "Karta", perks: "Korzyści", gift: "Prezent", noPerks: "Na razie bez korzyści", top: "Najwyższy poziom, już na zawsze" },
    alt: "Karta lojalnościowa barbera na poziomach Brąz, Srebro i Złoto: z każdym poziomem karta zmienia kolor i szybciej się zapełnia.",
    facts: [
      { title: "Do 5 poziomów", body: "Nazwij je, jak chcesz. Na start proponujemy trzy." },
      { title: "Karta na każdy poziom", body: "Zostaw swoją kartę albo daj poziomowi wzór Brąz, Srebro, Złoto, Platyna lub Czerń." },
      {
        title: "Do 3 korzyści na poziom",
        body: "Na przykład darmowe trymowanie brody albo pierwszeństwo przy rezerwacji. Obsługa widzi je w aplikacji do skanowania.",
      },
      { title: "Prezent przy awansie", body: "Jednorazowa nagroda w chwili, gdy klient osiąga poziom." },
    ],
    tip: "Nasza rada: zacznij od trzech poziomów, a Srebro ustaw w zasięgu ręki. Szybki pierwszy awans sprawia, że stali klienci wracają.",
  },
  moveUp: {
    eyebrow: "Awans",
    title: "Jak klienci awansują na wyższy poziom.",
    lead: "Awansują za to, co zbierają, a nie za to, co wydają, i nigdy nie spadają niżej.",
    stamps: {
      title: "Na karcie na pieczątki",
      body: "Każda pełna karta liczy się do następnego poziomu. Domyślnie wystarczy jedna albo tyle, ile ustawisz.",
      level: "Srebro",
      next: "Złoto",
      filled: 1,
      needed: 2,
      progress: "Pełne karty: 1 z 2",
      caption: "Jeszcze 1 karta do poziomu Złoto",
      alt: "Postęp klienta na poziomie Srebro: 1 z 2 pełnych kart do poziomu Złoto",
    },
    points: {
      title: "Na karcie punktowej",
      body: "Każdy punkt zdobyty na danym poziomie liczy się do następnego, nawet te wydane na nagrody.",
      level: "Srebro",
      next: "Złoto",
      earned: 320,
      needed: 500,
      progress: "Zdobyte punkty: 320 z 500",
      caption: "Jeszcze 180 punktów do poziomu Złoto",
      spent: "Punkty wydane na nagrody też się liczą",
      alt: "Postęp klienta na poziomie Srebro: 320 z 500 punktów do poziomu Złoto",
    },
    facts: [
      { title: "Nigdy nie spadają niżej", body: "Zdobyty poziom zostaje. Poziom klienta możesz nadal zmienić ręcznie." },
      { title: "Prezent powitalny się liczy", body: "Pieczątki albo punkty przyznane przy zapisie liczą się do pierwszego awansu." },
      {
        title: "Wyżej lepsze nagrody",
        body: "Przy pieczątkach poziom może zapełniać się szybciej albo dawać większą nagrodę. Przy punktach każdy poziom może mieć własną listę nagród.",
      },
    ],
  },
  moments: {
    eyebrow: "Co widać",
    title: "Gdzie klienci i obsługa widzą poziomy.",
    lead: "Poziomy widać tam, gdzie mają znaczenie, bez dodatkowej pracy z twojej strony.",
    signup: {
      title: "Na stronie zapisu",
      body: "Nowi klienci widzą poziomy, zanim dołączą.",
    },
    lockScreen: {
      title: "Na ekranie blokady",
      body: "Powiadomienie przy awansie, razem z prezentem.",
      banner: {
        sender: "Gaspard & Gus",
        body: "Poziom Srebro osiągnięty! Twoja karta ma nowy wzór. Twoja nagroda: Butelka olejku do brody.",
      },
    },
    scanner: {
      title: "W aplikacji do skanowania",
      body: "Obsługa widzi poziom klienta i jego korzyści, zanim przyjmie płatność.",
    },
    alts: [
      "Pasek poziomów na stronie zapisu: Brąz, Srebro i Złoto oraz to, jak zdobyć Srebro",
      "Powiadomienie od Gaspard & Gus na ekranie blokady: Poziom Srebro osiągnięty!",
      "Aplikacja do skanowania pokazuje klienta na poziomie Srebro i korzyść do zastosowania przed płatnością",
    ],
  },
  settings: {
    eyebrow: "Ustawienia",
    title: "Ustawienia, które robią dobry program.",
    lead: "Spotkasz je przy konfiguracji. Oto cztery najważniejsze, z naszą radą.",
    tipLabel: "Nasza rada:",
    items: [
      {
        title: "Prezent powitalny",
        body: "Daj nowym klientom fory: kilka pieczątek lub punktów przy zapisie albo coś za darmo.",
        tip: "Daj im rozpęd. Kartę z 2 darmowymi pieczątkami na start klienci kończą dużo częściej.",
      },
      {
        title: "Nagrody, które się kumulują",
        body: "Pełna karta zachowuje swoją nagrodę, a nowa rusza od razu. Ty decydujesz, ile nagród może czekać na klienta.",
        tip: "Pozwól na co najmniej dwie, żeby nikt nie przestał przychodzić tylko dlatego, że jedna nagroda już czeka.",
      },
      {
        title: "Pierwsza nagroda w zasięgu",
        body: "Ustalasz liczbę pieczątek na karcie albo cenę każdej nagrody w punktach.",
        tip: "Pierwsza nagroda niech będzie blisko. Szybka wygrana zamienia pierwszą wizytę w nawyk.",
      },
      {
        title: "Zmiana w każdej chwili",
        body: "Przejdź z pieczątek na punkty albo z powrotem. Klienci zachowują kartę, a ich saldo zostaje przeliczone.",
        tip: "Zacznij od oczywistego wyboru i dostrój go, gdy pojawią się prawdziwe liczby.",
      },
    ],
    figure: {
      value: "34%",
      text: "klientów skończyło kartę z 2 darmowymi pieczątkami na start, wobec 19% przy karcie zaczętej od zera",
      source: HEAD_START_SOURCE,
    },
  },
  picker: {
    eyebrow: "Pieczątki czy punkty?",
    title: "Nie wiesz, co wybrać? Odpowiedz na cztery pytania.",
    lead: "Podpowiemy program. Bez podawania e-maila.",
    progress: "Pytanie {current} z {total}",
    questions: [
      {
        question: "Czy twoje ceny mocno się różnią z zakupu na zakup?",
        options: ["Nie, większość zakupów kosztuje podobnie", "Tak, koszyk bardzo się waha"],
      },
      {
        question: "Jak wracają twoi najlepsi klienci?",
        options: ["Często, po drobne zakupy", "Od czasu do czasu, za większe kwoty"],
      },
      {
        question: "Która nagroda spodobałaby się klientom najbardziej?",
        options: ["Coś za darmo po kilku wizytach", "Wybór spośród kilku nagród", "Jeszcze nie wiem"],
      },
      {
        question: "Czy masz stałych klientów, którzy wracają co tydzień?",
        options: ["Tak, całkiem sporo", "Jeszcze niewielu"],
      },
    ],
    resultLabel: "Nasza podpowiedź",
    results: {
      stamps: {
        title: "Postaw na pieczątki.",
        body: "Wizyty są regularne i podobne cenowo, więc karta na pieczątki będzie najczytelniejsza.",
      },
      points: {
        title: "Postaw na punkty.",
        body: "Koszyki się różnią, więc nagradzanie tego, ile klient wydaje, jest uczciwsze i sprowadza z powrotem tych, którzy wydają najwięcej.",
      },
      either: {
        title: "Sprawdzi się jedno i drugie.",
        body: "Jesteś dokładnie pośrodku. Pieczątki to najprostszy start, a punkty ustawisz równie szybko.",
      },
    },
    levels: {
      yes: "Dodaj też poziomy: stali klienci będą mieć do czego dążyć.",
      no: "Poziomy dodasz później, gdy pojawią się stali klienci.",
    },
    restart: "Zacznij od nowa",
  },
  sectors: {
    eyebrow: "Według branży",
    title: "Co wybiera większość firm.",
    lead: "Punkt wyjścia, nie reguła.",
    items: [
      { label: "Kawiarnie", reason: "Ten sam napój, prawie codziennie", program: "stamps" },
      { label: "Piekarnie i cukiernie", reason: "Drobne, częste zakupy", program: "stamps" },
      { label: "Fryzjer i uroda", reason: "Nagroda za wizytę", program: "stamps" },
      { label: "Myjnie samochodowe", reason: "Jedna usługa, powtarzana", program: "stamps" },
      { label: "Restauracje", reason: "Rachunek za każdym razem inny", program: "points" },
      { label: "Sklepy i butiki", reason: "Bardzo różne koszyki", program: "points" },
      { label: "Sklepy spożywcze i warzywniaki", reason: "Nagroda za łączne wydatki", program: "points" },
      { label: "Winiarnie i sklepy specjalistyczne", reason: "Wyższe, nierówne rachunki", program: "points" },
    ],
    programLabels: { stamps: "Pieczątki", points: "Punkty" },
  },
  faq: {
    title: "Pytania o programy lojalnościowe",
    items: [
      {
        question: "Czym różnią się pieczątki od punktów?",
        answer:
          "Pieczątki liczą wizyty: każdy skan dodaje pieczątkę, a pełna karta daje nagrodę. Punkty liczą wydatki: obsługa wpisuje kwotę, a klient wymienia punkty na nagrody, które ustawiasz. Pieczątki pasują do wizyt w podobnej cenie, punkty do koszyków, które się różnią.",
      },
      {
        question: "Czym jest wielopoziomowy program lojalnościowy?",
        answer:
          "To program, w którym klienci awansują na kolejne poziomy, na przykład Brąz, Srebro i Złoto, gdy wracają, i na każdym dostają trochę więcej. W Stampeo poziomy działają na bazie pieczątek albo punktów: do 5 poziomów, każdy z własnym wyglądem karty, do 3 korzyści i prezentem za awans.",
      },
      {
        question: "Jak klienci awansują na wyższy poziom?",
        answer:
          "Za to, co zbiorą na obecnym poziomie: pełne karty na karcie na pieczątki (domyślnie jedna) albo punkty zdobyte na karcie punktowej. Wydawanie punktów na nagrody nigdy nie cofa postępu, a pieczątki albo punkty z prezentu powitalnego też się liczą.",
      },
      {
        question: "Czy klienci mogą stracić poziom?",
        answer: "Nie. Klienci nigdy sami nie spadają niżej. Poziom klienta możesz nadal zmienić ręcznie w jego profilu.",
      },
      {
        question: "Czy mogę zrobić cyfrową kartę na pieczątki?",
        answer:
          "Tak. Działa jak papierowa karta na pieczątki, z pieczątką za każdą wizytę, ale mieszka w Apple Wallet albo Google Wallet i nie da się jej zgubić.",
      },
      {
        question: "Czy mogę później przejść z pieczątek na punkty?",
        answer:
          "Tak, kiedy chcesz. Klienci zachowują kartę, którą już mają, a zebrane pieczątki albo punkty zostają przeliczone na nowy program.",
      },
      {
        question: "Czy moi klienci potrzebują aplikacji?",
        answer:
          "Nie. Karta trafia do Apple Wallet albo Google Wallet, które już są w ich telefonie. Skanują twój kod QR raz i karta jest dodana.",
      },
    ],
  },
  band: {
    title: "Daj stałym klientom powód do powrotu.",
    accent: "powód do powrotu.",
    sub: "Zacznij od pieczątek albo punktów i dodaj poziomy, kiedy zechcesz.",
  },
};
