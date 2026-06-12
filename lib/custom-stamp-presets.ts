import type {
  CustomStampArrangement,
  CustomStampConfig,
  CustomStampEmptyMode,
  ProcessedIconAsset,
} from "@/lib/types/design";

/**
 * Demo assets for the custom-stamp-icon feature (STA-216) on the marketing
 * site. The PNGs in public/custom-icons/ stand in for merchant-uploaded icons;
 * the three URLs map to the same variants the backend rembg pipeline produces
 * for a real upload (filled / greyscale / outline). Source art: Twemoji,
 * CC-BY 4.0 — regenerate with scripts/generate-custom-icons.mjs.
 */
export function staticIconAsset(name: string): ProcessedIconAsset {
  const base = `/custom-icons/${name}`;
  return {
    id: name,
    original_url: `${base}.png`,
    processed_url: `${base}.png`,
    greyscale_url: `${base}-grey.png`,
    outline_url: `${base}-outline.png`,
    bg_removed: true,
  };
}

interface CustomConfigOptions {
  arrangement?: CustomStampArrangement;
  empty_mode?: CustomStampEmptyMode;
  /** Empty-slot opacity, percent (10-100). 100 = solid like the FLTR look. */
  empty_opacity?: number;
  /** Icon name for the final (reward) stamp. */
  reward?: string;
}

/** Build a CustomStampConfig from static demo icon names. */
export function customConfigFor(
  names: string[],
  opts: CustomConfigOptions = {}
): CustomStampConfig {
  return {
    icons: names.map(staticIconAsset),
    reward_icon: opts.reward ? staticIconAsset(opts.reward) : null,
    empty_icon: null,
    empty_mode: opts.empty_mode ?? "greyscale",
    arrangement: opts.arrangement ?? "staggered",
    empty_opacity: opts.empty_opacity ?? 60,
  };
}

/** Icons offered in the playground's custom-icon picker. No upload — visitors
 *  play with our presets. Names map to files in public/custom-icons/. */
export const PLAYGROUND_CUSTOM_ICONS = [
  "croissant",
  "coffee",
  "donut",
  "flower",
  "pizza",
  "scissors",
] as const;

export type PlaygroundCustomIcon = (typeof PLAYGROUND_CUSTOM_ICONS)[number];

/**
 * Finished example cards for the custom-icons gallery. Visuals (colours,
 * icon, arrangement, stamp counts) live here; the localized text (org name,
 * reward, caption) comes from i18n and is zipped by index in the component.
 * Together they cover all three arrangements plus the outline/greyscale empty
 * modes and a dedicated reward icon.
 */
export interface CustomExample {
  bg: string;
  accent: string;
  totalStamps: number;
  filled: number;
  config: CustomStampConfig;
}

export const CUSTOM_EXAMPLES: CustomExample[] = [
  // Bakery — croissants that pile up (overlap, the FLTR look).
  {
    bg: "#3B2A1E",
    accent: "#C9842B",
    totalStamps: 12,
    filled: 7,
    config: customConfigFor(["croissant"], {
      arrangement: "overlap",
      empty_mode: "greyscale",
      empty_opacity: 100,
    }),
  },
  // Café — staggered rows, line-art empties.
  {
    bg: "#1F1B18",
    accent: "#D97706",
    totalStamps: 10,
    filled: 6,
    config: customConfigFor(["coffee"], {
      arrangement: "staggered",
      empty_mode: "outline",
      empty_opacity: 100,
    }),
  },
  // Donut shop — straight row, faded greyscale empties.
  {
    bg: "#F8E8F0",
    accent: "#D4688E",
    totalStamps: 8,
    filled: 5,
    config: customConfigFor(["donut"], {
      arrangement: "straight",
      empty_mode: "greyscale",
      empty_opacity: 45,
    }),
  },
  // Florist — staggered, with a gift on the final reward stamp.
  {
    bg: "#E8F1E6",
    accent: "#5E9E63",
    totalStamps: 9,
    filled: 5,
    config: customConfigFor(["flower"], {
      arrangement: "staggered",
      empty_mode: "greyscale",
      empty_opacity: 55,
      reward: "gift",
    }),
  },
];
