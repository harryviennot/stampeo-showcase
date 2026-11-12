import { STAMP_SAMPLES } from "@/lib/loyalty-samples";

/** The sample café every visual on these pages belongs to (custom cup stamps). */
export const AUREVO = STAMP_SAMPLES.find((sample) => sample.id === "aurevo") ?? STAMP_SAMPLES[0];

/** The sample barbershop the level cards belong to: preset scissors, so its look can change per level. */
export const BARBER = STAMP_SAMPLES.find((sample) => sample.id === "barber") ?? STAMP_SAMPLES[0];
