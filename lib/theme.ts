/**
 * Theme utilities for generating and applying color palettes from an accent color.
 * Generates a Tailwind-style color scale (50-950) from a single hex color.
 */

export const DEFAULT_ACCENT = "#f97316";

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert hex color to HSL
 */
function hexToHsl(hex: string): HSL {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { h: 0, s: 0, l: 0 };
  }

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Lightness values for each shade in the palette.
 * Based on Tailwind's color scale distribution.
 */
const LIGHTNESS_MAP: Record<keyof ColorPalette, number> = {
  50: 97,
  100: 94,
  200: 86,
  300: 77,
  400: 66,
  500: 55,
  600: 45,
  700: 37,
  800: 27,
  900: 20,
  950: 12,
};

/**
 * Saturation adjustments for each shade.
 * Reduce saturation at very light and very dark ends for more natural colors.
 */
const SATURATION_SCALE: Record<keyof ColorPalette, number> = {
  50: 0.4,
  100: 0.6,
  200: 0.75,
  300: 0.85,
  400: 0.95,
  500: 1.0,
  600: 1.0,
  700: 0.95,
  800: 0.9,
  900: 0.85,
  950: 0.8,
};

/**
 * Generate a full color palette from a single hex color.
 * Uses HSL color space to create consistent shades.
 */
export function generatePalette(hex: string): ColorPalette {
  const hsl = hexToHsl(hex);

  const palette = {} as ColorPalette;
  const shades = Object.keys(LIGHTNESS_MAP).map(Number) as Array<keyof ColorPalette>;

  for (const shade of shades) {
    const lightness = LIGHTNESS_MAP[shade];
    const saturationScale = SATURATION_SCALE[shade];
    const adjustedSaturation = Math.round(hsl.s * saturationScale);

    palette[shade] = hslToHex(hsl.h, adjustedSaturation, lightness);
  }

  return palette;
}

/**
 * Apply a color palette as CSS variables on the document root.
 * Sets the user's exact color as --accent, and generates palette shades for variants.
 */
export function applyTheme(accentColor: string): void {
  if (typeof document === "undefined") return;

  const palette = generatePalette(accentColor);
  const root = document.documentElement;

  // Apply full palette (for numbered shade access)
  root.style.setProperty("--accent-50", palette[50]);
  root.style.setProperty("--accent-100", palette[100]);
  root.style.setProperty("--accent-200", palette[200]);
  root.style.setProperty("--accent-300", palette[300]);
  root.style.setProperty("--accent-400", palette[400]);
  root.style.setProperty("--accent-500", palette[500]);
  root.style.setProperty("--accent-600", palette[600]);
  root.style.setProperty("--accent-700", palette[700]);
  root.style.setProperty("--accent-800", palette[800]);
  root.style.setProperty("--accent-900", palette[900]);
  root.style.setProperty("--accent-950", palette[950]);

  // Use the EXACT user color for main accent (not the computed 500 shade)
  root.style.setProperty("--accent", accentColor);
  // Generate a slightly darker hover state from the actual color
  root.style.setProperty("--accent-hover", adjustBrightness(accentColor, -15));
  root.style.setProperty("--accent-light", palette[100]);
  root.style.setProperty("--accent-muted", palette[200]);
}

/**
 * Adjust brightness of a hex color by a percentage.
 * Negative values darken, positive values lighten.
 */
function adjustBrightness(hex: string, percent: number): string {
  const hsl = hexToHsl(hex);
  const newLightness = Math.max(0, Math.min(100, hsl.l + percent));
  return hslToHex(hsl.h, hsl.s, newLightness);
}

/**
 * Reset theme to defaults by removing custom CSS variables.
 */
export function resetTheme(): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const properties = [
    "--accent-50",
    "--accent-100",
    "--accent-200",
    "--accent-300",
    "--accent-400",
    "--accent-500",
    "--accent-600",
    "--accent-700",
    "--accent-800",
    "--accent-900",
    "--accent-950",
    "--accent",
    "--accent-hover",
    "--accent-light",
    "--accent-muted",
  ];

  for (const prop of properties) {
    root.style.removeProperty(prop);
  }
}

/**
 * Check if a color has good contrast with white.
 * Colors with lightness <= 55% typically provide good readability on white backgrounds.
 */
export function hasGoodContrastWithWhite(hex: string): boolean {
  const hsl = hexToHsl(hex);
  return hsl.l <= 55;
}

/**
 * Get the best theme color based on contrast requirements.
 * Prefers the accent color if it has good contrast with white,
 * otherwise falls back to the background color.
 */
export function getThemeColor(accentColor: string, backgroundColor: string): string {
  if (hasGoodContrastWithWhite(accentColor)) {
    return accentColor;
  }
  return backgroundColor;
}
