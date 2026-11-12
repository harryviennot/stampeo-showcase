import { POINTS_SAMPLES, STAMP_SAMPLES } from "@/lib/loyalty-samples";

/** The sample café every visual on these pages belongs to (custom cup stamps). */
export const AUREVO = STAMP_SAMPLES.find((sample) => sample.id === "aurevo") ?? STAMP_SAMPLES[0];

/** The sample barbershop the level cards belong to: preset scissors, so its look can change per level. */
export const BARBER = STAMP_SAMPLES.find((sample) => sample.id === "barber") ?? STAMP_SAMPLES[0];

/** The points sample: a bookstore, in the card colours of its own shop. */
export const MARGINALIA = POINTS_SAMPLES.find((sample) => sample.id === "marginalia") ?? POINTS_SAMPLES[0];
