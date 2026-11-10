import type { CompetitorFacts } from "../types";
import { FIDELATOO } from "./fidelatoo";
import { HEY_PONGO } from "./heypongo";
import { ZEROSIX } from "./zerosix";

/** Competitors compared on the French pages (`/comparatif/<slug>`), one file per competitor. */
export const FR_COMPETITORS: readonly CompetitorFacts[] = [FIDELATOO, ZEROSIX, HEY_PONGO];
