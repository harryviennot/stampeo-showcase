// Stamps, points and levels in Polish, as the Features tabs and the Platform rows describe them.
import type { LandingCopy } from "../bundle";

export const PROGRAM_TYPES: LandingCopy["programTypes"]["PROGRAM_TYPES"] = [
  {
    key: "stamps",
    label: "Pieczątki",
    eyebrow: "Nagradzaj każdą wizytę",
    title: "Pieczątki",
    body: "Każda wizyta to pieczątka, a pełna karta daje nagrodę. Obsługa może dodać kilka pieczątek jednym skanem.",
    facts: [{ text: "Nadmiarowe pieczątki mogą przejść na kolejną nagrodę" }, { text: "Prezent powitalny na dobry początek" }],
  },
  {
    key: "points",
    label: "Punkty",
    eyebrow: "Nagradzaj wydatki",
    title: "Punkty",
    body: "Obsługa wpisuje wydaną kwotę, a punkty się sumują. Klienci wybierają nagrody z twojej listy, w dowolnej kolejności.",
    facts: [{ text: "Punkty nigdy nie wygasają" }],
  },
  {
    key: "levels",
    label: "Poziomy",
    eyebrow: "Więcej dla stałych klientów",
    title: "Poziomy",
    body: "Do 5 poziomów, na przykład Brąz, Srebro i Złoto. Klienci awansują, gdy wracają, a ich karta zmienia wygląd.",
    facts: [{ text: "Korzyści na każdym poziomie, widoczne dla obsługi przy kasie" }, { text: "Prezent przy awansie" }],
  },
];

export const PROGRAM_TABS_LABEL: LandingCopy["programTypes"]["PROGRAM_TABS_LABEL"] = "Rodzaj programu";

export const PROGRAM_SWITCH_LINE: LandingCopy["programTypes"]["PROGRAM_SWITCH_LINE"] =
  "Zacznij od pieczątek albo punktów i zmień później. Klienci zachowują kartę, którą już mają.";
