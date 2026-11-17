import { POINTS_SAMPLES, STAMP_SAMPLES, type StampSample } from "@/lib/loyalty-samples";

/** The sample café every visual on these pages belongs to (custom cup stamps). */
export const AUREVO = STAMP_SAMPLES.find((sample) => sample.id === "aurevo") ?? STAMP_SAMPLES[0];

/**
 * The made-up dry cleaner the level cards belong to (`LEVELS_BUSINESS` in the copy): a crisp white card
 * with near-black ink, its own wordmark, and preset T-shirt stamps, so its look can change per level.
 */
export const WRENFOLD: StampSample = {
  id: "wrenfold",
  design: {
    organization_name: "",
    logo_url: "/themes/wrenfold/logo.png",
    background_color: "#FFFFFF",
    foreground_color: "#343434",
    label_color: "#0B0B0B",
    stamp_filled_color: "#0B0B0B",
    icon_color: "#FFFFFF",
    stamp_icon: "t-shirt",
    reward_icon: "gift",
    total_stamps: 6,
  },
  stamps: 6,
};

/** The points sample: a bookstore, in the card colours of its own shop. */
export const MARGINALIA = POINTS_SAMPLES.find((sample) => sample.id === "marginalia") ?? POINTS_SAMPLES[0];

/** The beauty salon's points card: a ring that fills toward the next reward. */
export const VANITY = POINTS_SAMPLES.find((sample) => sample.id === "salon") ?? POINTS_SAMPLES[0];
