import { INK as DASHBOARD_INK } from "../../platform/DeliverAnalytics";

/** The dashboard's own colours as Platform's analytics tiles use them, and the grey of an empty bar. */
export const INK = { ...DASHBOARD_INK, track: "#eceff7" } as const;
