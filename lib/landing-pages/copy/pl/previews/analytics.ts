// The analytics preview in Polish; chart and segment names follow the dashboard's Polish Statystyki and Klienci pages.
import type { LandingCopy } from "../../bundle";

export const ANALYTICS_PREVIEW: LandingCopy["previews"]["analytics"]["ANALYTICS_PREVIEW"] = {
  meta: {
    title: "Statystyki programu lojalnościowego: wizyty i powroty | Stampeo",
    description:
      "Statystyki programu lojalnościowego dla małych firm: wizyty, powroty, nowi klienci i godziny szczytu, uzupełniane przy każdym skanie. Darmowy okres próbny.",
  },
  hero: {
    h1: "Statystyki twojego programu lojalnościowego.",
    accent: "Statystyki",
    sub: "Wizyty, powroty, nowi klienci i godziny szczytu. Każdy skan sam to uzupełnia.",
    secondary: "Zobacz wszystkie wykresy",
    alt: "Karta z najważniejszymi liczbami z panelu Stampeo: wizyty, powroty, nowi klienci i wykres wizyt w czasie.",
  },
  numbers: {
    title: "Ostatnie trzy miesiące",
    visits: { label: "Wizyty", line: "od {customers} klientów" },
    returnRate: { label: "Powroty w 30 dni", line: "nowych klientów wróciło w ciągu miesiąca" },
    newCustomers: { label: "Nowi klienci", line: "zapisani" },
    chart: { label: "Wizyty w czasie", legend: ["Już byli", "Pierwsza wizyta"] },
  },
  blindSpots: {
    eyebrow: "Z papierowymi kartami",
    title: "Czego dziś nie wiesz.",
    lead: "Przy papierowych kartach prowadzisz program po omacku: bez danych i bez szansy na poprawę.",
    questions: [
      "Ilu masz stałych klientów?",
      "Jak często wracają?",
      "Ilu przestało przychodzić?",
      "Który dzień jest najspokojniejszy?",
      "Ile nagród w tym miesiącu?",
      "Czy twój program działa?",
    ],
    noAnswer: "???",
  },
  charts: {
    eyebrow: "Wszystkie wykresy",
    title: "Statystyki programu, wykres po wykresie.",
    lead: "Każdy wykres odpowiada na jedno pytanie o twoich klientów. Każdy skan go uzupełnia.",
    rows: [
      {
        key: "visits",
        title: "Wizyty w czasie",
        line: "Każda wizyta, tydzień po tygodniu, z podziałem na pierwsze wizyty i klientów, którzy wracają.",
      },
      { key: "returnRate", title: "Powroty w 30 dni", line: "Ilu nowych klientów wróciło w ciągu miesiąca." },
      { key: "newCustomers", title: "Nowi klienci", line: "Ile osób dodało twoją kartę." },
      {
        key: "busiest",
        title: "Godziny szczytu",
        line: "Wizyty według dnia i godziny, z godziną największego ruchu i najcichszą godziną otwarcia.",
      },
      {
        key: "habits",
        title: "Jak często przychodzą",
        line: "Kto przychodzi co tydzień, co dwa tygodnie, mniej więcej raz w miesiącu, a kto tylko raz.",
      },
      { key: "rewards", title: "Postęp do nagrody", line: "Ile każdemu klientowi brakuje do nagrody i kto ma ją już gotową." },
      { key: "cohorts", title: "Kohorty miesięczne", line: "Z nowych klientów każdego miesiąca: ilu wróciło i jak szybko." },
      { key: "levels", title: "Poziomy", line: "Ilu klientów jest na każdym poziomie i ilu co miesiąc awansuje." },
      { key: "spend", title: "Zarejestrowane wydatki", line: "Na karcie punktowej: kwoty wpisane przez zespół przy ladzie i średni paragon." },
      { key: "locations", title: "Według lokalu", line: "Każdy wykres, lokal po lokalu, gdy masz więcej niż jeden." },
    ],
  },
  customers: {
    eyebrow: "Twoi klienci",
    title: "Lista klientów podzielona na grupy.",
    lead: "Zobacz, kto jest nowy, kto jest stałym klientem, a kto dawno nie wracał.",
    columns: ["Imię", "Pieczątki", "Segment", "Ostatnia wizyta"],
    segments: [
      { key: "new", label: "Nowy", definition: "w programie od najwyżej dwóch tygodni" },
      { key: "regular", label: "Stały", definition: "regularnie wraca" },
      { key: "vip", label: "VIP", definition: "ma za sobą co najmniej trzy odebrane nagrody" },
      { key: "rewardReady", label: "Nagroda gotowa", definition: "ma nagrodę do odebrania od razu" },
      { key: "closeToReward", label: "Blisko nagrody", definition: "najwyżej dwie pieczątki do nagrody" },
      { key: "atRisk", label: "Zagrożony", definition: "nie wraca od ponad miesiąca" },
      { key: "ghost", label: "Bez powrotu", definition: "po dodaniu karty ani jednej wizyty" },
    ],
    fact: "Listę klientów pobierzesz w każdej chwili jako plik CSV.",
  },
  dashboard: {
    eyebrow: "Komputer i telefon",
    title: "Twoje liczby na komputerze i w telefonie.",
    lead: "Ten sam panel tu i tu. Sprawdzasz liczby, gdziekolwiek jesteś.",
  },
  band: {
    title: "Przestań zgadywać. Zacznij wiedzieć.",
    accent: "Zacznij wiedzieć.",
    sub: "Statystyki zaczynają się od pierwszej zeskanowanej karty.",
  },
};
