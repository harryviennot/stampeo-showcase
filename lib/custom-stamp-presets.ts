import type {
  CustomStampArrangement,
  CustomStampConfig,
  CustomStampEmptyMode,
  ProcessedIconAsset,
} from "@/lib/types/design";

/**
 * Demo "your own icons" for the playground: real hand-made brand-bank artwork
 * served from public/themes/ — the same assets the style gallery uses, so the
 * playground matches the cards shown everywhere else on the site. Filled icon
 * at `${base}.${ext}`, empty variant at `${base}-grey.${ext}`, mirroring what
 * the backend rembg pipeline produces for a real upload.
 */
export interface PlaygroundCustomIcon {
  id: string;
  base: string;
  ext: "svg" | "png";
}

export const PLAYGROUND_CUSTOM_ICONS: PlaygroundCustomIcon[] = [
  { id: "cup", base: "/themes/cafe/cup", ext: "png" },
  { id: "citrus", base: "/themes/pulp/citrus", ext: "svg" },
  { id: "drop", base: "/themes/lustre/drop", ext: "svg" },
  { id: "cone", base: "/themes/gelo/cone", ext: "svg" },
  { id: "tulip", base: "/themes/tige/tulip", ext: "svg" },
  { id: "boba", base: "/themes/oba/boba", ext: "svg" },
];

export function playgroundIconAsset(
  icon: PlaygroundCustomIcon
): ProcessedIconAsset {
  return {
    id: icon.id,
    original_url: `${icon.base}.${icon.ext}`,
    processed_url: `${icon.base}.${icon.ext}`,
    greyscale_url: `${icon.base}-grey.${icon.ext}`,
    outline_url: `${icon.base}-grey.${icon.ext}`,
    bg_removed: true,
  };
}

interface CustomConfigOptions {
  arrangement?: CustomStampArrangement;
  empty_mode?: CustomStampEmptyMode;
  /** Empty-slot opacity, percent (10-100). 100 = solid like the FLTR look. */
  empty_opacity?: number;
}

/** Build a CustomStampConfig from a playground demo icon. */
export function customConfigFor(
  icon: PlaygroundCustomIcon,
  opts: CustomConfigOptions = {}
): CustomStampConfig {
  return {
    icons: [playgroundIconAsset(icon)],
    reward_icon: null,
    empty_icon: null,
    empty_mode: opts.empty_mode ?? "greyscale",
    arrangement: opts.arrangement ?? "staggered",
    empty_opacity: opts.empty_opacity ?? 60,
  };
}
