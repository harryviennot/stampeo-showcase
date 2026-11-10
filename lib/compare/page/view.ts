import type { StampeoColumn } from "../stampeo";
import type { CompetitorFacts, ComparisonPage } from "../types";

/** A comparison found on disk, with the competitor it is about and the date its facts were last read. */
export interface LoadedComparison {
  page: ComparisonPage;
  competitor: CompetitorFacts;
  /** `YYYY-MM-DD`, the oldest `checkedAt` among the facts the page shows. */
  checkedAt: string;
}

/** Everything a comparison page renders from: the loaded page plus Stampeo's column in the page's market. */
export interface ComparisonView extends LoadedComparison {
  stampeo: StampeoColumn;
}
