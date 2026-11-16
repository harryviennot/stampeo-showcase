import { INK as DASHBOARD_INK } from "../../platform/DeliverAnalytics";

/** The dashboard's chart colours: one blue family from its pale track to its navy, with the grey of a figure and a label. */
export const INK = { ...DASHBOARD_INK, track: "#eceff7", mid: "#4a63a8" } as const;

/** Light to dark, the dashboard's heat ramp: from the fewest visits (or the smallest share) to the most. */
export const RAMP = [INK.track, "#c9d3ea", "#8fa3d1", INK.mid, INK.navy] as const;
