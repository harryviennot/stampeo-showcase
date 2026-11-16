/**
 * The five palettes the card designer makes from the juice bar's logo, for the card design page's "colors
 * from your logo" section. They are the output of the designer's own generator, not a hand-picked list:
 * web's `generateThemeVariants(await extractLogoPalette("/themes/pulp/logo.svg"))`, run once in a browser on
 * 16 Nov 2026 and copied here in its order (light, dark, bold, mono, soft). The "light" one is brown because
 * the logo's palette has no light muted swatch, which is what the designer does with it too.
 */

import { STAMP_SAMPLES } from "@/lib/loyalty-samples";
import type { CardDesign } from "@/lib/types/design";

export interface PulpPalette {
  id: "light" | "dark" | "bold" | "mono" | "soft";
  background: string;
  foreground: string;
  label: string;
  stampFilled: string;
  stampEmpty: string;
  stampBorder: string;
  iconColor: string;
}

export const PULP_PALETTES: readonly PulpPalette[] = [
  { id: "light", background: "#8d3c0b", foreground: "#FFFFFF", label: "#FFFFFF", stampFilled: "#ec5c0c", stampEmpty: "#FFFFFF", stampBorder: "#d9d9d9", iconColor: "#ffffff" },
  { id: "dark", background: "#913807", foreground: "#FFFFFF", label: "#FFFFFF", stampFilled: "#f4a474", stampEmpty: "#582204", stampBorder: "#FFFFFF", iconColor: "#000000" },
  { id: "bold", background: "#ec5c0c", foreground: "#000000", label: "#000000", stampFilled: "#7e3106", stampEmpty: "#FFFFFF", stampBorder: "#FFFFFF", iconColor: "#ffffff" },
  { id: "mono", background: "#feece2", foreground: "#572204", label: "#572204", stampFilled: "#ec5c0c", stampEmpty: "#fcd9c5", stampBorder: "#f89f6d", iconColor: "#ffffff" },
  { id: "soft", background: "#FAFAFA", foreground: "#913807", label: "#913807", stampFilled: "#ec5c0c", stampEmpty: "#FFFFFF", stampBorder: "#E5E5E5", iconColor: "#ffffff" },
];

const PULP = STAMP_SAMPLES.find((sample) => sample.id === "pulp") ?? STAMP_SAMPLES[0];

/** The juice bar's card with preset stamps (a sun), so the palette's stamp colour is what the stamps show. */
export const PULP_CARD: { design: Partial<CardDesign>; stamps: number } = {
  design: {
    organization_name: "",
    logo_url: PULP.design.logo_url,
    background_color: PULP.design.background_color,
    stamp_filled_color: PULP.design.stamp_filled_color,
    icon_color: PULP.design.icon_color,
    stamp_icon: "sun",
    reward_icon: "gift",
    total_stamps: 10,
    secondary_fields: [
      { key: "holder", label: "Cardholder", value: "Noor" },
      { key: "reward", label: "Reward", value: "Free juice" },
    ],
  },
  stamps: 6,
};

/** The card colours a palette sets, as the designer applies a generated theme. */
export function paletteDesign(palette: PulpPalette): Partial<CardDesign> {
  return {
    background_color: palette.background,
    foreground_color: palette.foreground,
    label_color: palette.label,
    stamp_filled_color: palette.stampFilled,
    stamp_empty_color: palette.stampEmpty,
    stamp_border_color: palette.stampBorder,
    icon_color: palette.iconColor,
  };
}

/**
 * The palettes the card tries once the section is in view, by index: the other four in turn, then back to the
 * first, where it stays. Empty for a reader who asks for less motion.
 */
export function palettePlayback(reducedMotion: boolean): number[] {
  return reducedMotion ? [] : [1, 2, 3, 4, 0];
}
