import type { CompetitorFacts } from "../types";
import { LOOPY_LOYALTY } from "./loopy-loyalty";
import { STAMP_ME } from "./stamp-me";
import { WINSTAMP } from "./winstamp";

/** Competitors compared on the US pages (`/us/vs/<slug>`), one file per competitor. */
export const US_COMPETITORS: readonly CompetitorFacts[] = [LOOPY_LOYALTY, STAMP_ME, WINSTAMP];
