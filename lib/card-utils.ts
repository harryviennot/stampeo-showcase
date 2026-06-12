import { CardDesign, CustomStampConfig } from "@/lib/types/design";

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Convert rgb(r, g, b) string to hex format
 */
export function rgbToHex(rgb: string): string {
  if (!rgb) return "#1c1c1e";
  if (rgb.startsWith("#")) return rgb;

  const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!match) return "#1c1c1e";

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Determine if a color is light (luminance > 0.5)
 */
export function isLightColor(color: string): boolean {
  if (!color) return false;

  let r = 0,
    g = 0,
    b = 0;

  if (color.startsWith("#")) {
    const hex = color.slice(1);
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g);
    if (match) {
      [r, g, b] = match.map(Number);
    } else {
      return false;
    }
  } else {
    return false;
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Adjust color brightness by a percentage
 */
export function adjustBrightness(color: string, percent: number): string {
  const hex = rgbToHex(color);
  if (!hex?.startsWith("#")) return hex;

  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Get initials from a name (1-2 characters)
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0 || !words[0]) return "YB";
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

// ============================================================================
// Stamp Layout Utilities (ported from backend strip_generator.py)
// ============================================================================

/**
 * Get distribution of stamps across rows
 * - 1-6 stamps: 1 row
 * - 7-16 stamps: 2 rows (ceil on top, floor on bottom)
 * - 17-24 stamps: 3 rows (predefined distribution)
 */
export function getRowDistribution(totalStamps: number): number[] {
  if (totalStamps <= 0) return [0];
  if (totalStamps <= 6) return [totalStamps];

  if (totalStamps <= 16) {
    // Two rows - split evenly, larger on top
    const topRow = Math.ceil(totalStamps / 2);
    const bottomRow = totalStamps - topRow;
    return [topRow, bottomRow];
  }

  // Three rows (17-24)
  const distributionMap: Record<number, number[]> = {
    17: [6, 6, 5],
    18: [6, 6, 6],
    19: [7, 7, 5],
    20: [7, 7, 6],
    21: [7, 7, 7],
    22: [8, 8, 6],
    23: [8, 8, 7],
    24: [8, 8, 8],
  };
  return distributionMap[totalStamps] || [8, 8, 8];
}

export interface StampPosition {
  centerX: number;
  centerY: number;
  radius: number;
  row: number;
  indexInRow: number;
  globalIndex: number;
}

export interface StampLayout {
  positions: StampPosition[];
  diameter: number;
  radius: number;
  rows: number;
  distribution: number[];
  /** Gap between rows and edges (straight) / band top offset (staggered).
   *  Used by the custom-icon box clamp. */
  verticalPadding: number;
}

// ============================================================================
// Custom stamp icon constants — MIRRORED from backend strip_generator.py and
// the web repo's card-utils.ts. Change them together or the preview drifts
// from the generated strips.
// ============================================================================

/** Custom icons render slightly larger than the circle they replace. */
export const CUSTOM_ICON_SCALE = 1.15;
/** 'staggered': front-row vertical drop, fraction of icon size. */
export const STAGGER_Y_OFFSET = 0.25;
/** 'overlap': per-level vertical drop, fraction of icon size. */
export const OVERLAP_Y_OFFSET = 0.45;
/** 'overlap' sizes icons from the strip HEIGHT first and squeezes the x
 *  advance to fit the count, clamped to [MIN, MAX] of the icon size; only
 *  when the squeeze hits MIN does the icon shrink below full height. */
export const OVERLAP_MIN_PITCH = 0.4;
export const OVERLAP_MAX_PITCH = 0.72;
/** Band depth levels mirror the grid's rows: 2 levels up to 16 stamps,
 *  3 levels for 17-24 ('overlap' only — 'staggered' falls back to the grid). */
export const STAGGERED_MAX_COUNT = 16;
export const OVERLAP_MAX_COUNT = 24;
/** Custom icons in the straight grid reserve only half the circle grid's
 *  vertical padding: no border ring to protect, so rows sit closer and
 *  icons use more of the strip height. */
export const CUSTOM_GRID_VPAD_SCALE = 0.5;

/**
 * Calculate stamp positions within a container
 * Mirrors the backend algorithm from strip_generator.py
 */
export function calculateStampLayout(
  totalStamps: number,
  containerWidth: number,
  containerHeight: number,
  minPadding: number = 8,
  sidePadding: number = 11, // 32/3 ≈ 10.67, rounded up
  verticalPaddingScale: number = 1
): StampLayout {
  const distribution = getRowDistribution(totalStamps);
  const rows = distribution.length;
  const maxInRow = Math.max(...distribution);

  // Calculate diameter based on available space
  // Width constraint: account for side padding on edges and min padding between circles
  const availableWidth = containerWidth - 2 * sidePadding;
  const maxDiameterByWidth =
    (availableWidth - (maxInRow - 1) * minPadding) / maxInRow;

  // Height constraint: min padding between rows and edges.
  // verticalPaddingScale < 1 lets custom icons pack rows closer.
  const maxDiameterByHeight =
    (containerHeight - (rows + 1) * minPadding * verticalPaddingScale) / rows;

  const diameter = Math.min(maxDiameterByWidth, maxDiameterByHeight);
  const radius = diameter / 2;

  // Calculate vertical padding (same between all rows and edges)
  const totalVerticalSpace = containerHeight - rows * diameter;
  const verticalPadding = totalVerticalSpace / (rows + 1);

  // Calculate positions
  const positions: StampPosition[] = [];

  let globalIndex = 0;
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const circlesInRow = distribution[rowIndex];

    // Calculate row content width and center it
    const rowContentWidth =
      circlesInRow * diameter + (circlesInRow - 1) * minPadding;
    const rowSidePadding = (containerWidth - rowContentWidth) / 2;

    // Y position for this row (center of circle)
    const y = verticalPadding * (rowIndex + 1) + diameter * rowIndex + radius;

    for (let i = 0; i < circlesInRow; i++) {
      // X position (center of circle)
      const x = rowSidePadding + radius + i * (diameter + minPadding);
      positions.push({
        centerX: x,
        centerY: y,
        radius,
        row: rowIndex,
        indexInRow: i,
        globalIndex,
      });
      globalIndex++;
    }
  }

  return {
    positions,
    diameter,
    radius,
    rows,
    distribution,
    verticalPadding,
  };
}

/**
 * Staggered/overlap layouts for custom stamp icons. Mirrors
 * calculate_staggered_layout in backend strip_generator.py: icons run left
 * to right in fill order, cycling 2 (or 3 for 17-24 stamps in overlap
 * mode) vertical depth levels. 'staggered' keeps minPadding between icons
 * with a subtle drop; 'overlap' sizes icons from the strip HEIGHT first
 * and squeezes the x advance to fit, clamped to the pitch floor. Deeper
 * levels must render ABOVE shallower ones (zIndex by row).
 */
export function calculateStaggeredStampLayout(
  totalStamps: number,
  containerWidth: number,
  containerHeight: number,
  sidePadding: number = 11,
  minPadding: number = 8,
  overlap: boolean = false
): StampLayout {
  const count = Math.min(
    Math.max(totalStamps, 0),
    overlap ? OVERLAP_MAX_COUNT : STAGGERED_MAX_COUNT
  );
  if (count <= 0) {
    return {
      positions: [],
      diameter: 0,
      radius: 0,
      rows: 0,
      distribution: [],
      verticalPadding: 0,
    };
  }

  const levels = overlap && count > STAGGERED_MAX_COUNT ? 3 : count > 1 ? 2 : 1;
  const yOffset = overlap ? OVERLAP_Y_OFFSET : STAGGER_Y_OFFSET;
  // Total band height = size * (1 + (levels-1) * yOffset)
  const heightFactor = 1 + (levels - 1) * yOffset;

  const availableWidth = containerWidth - 2 * sidePadding;
  const sizeByHeight = containerHeight / heightFactor;

  let size: number;
  let xAdvance: number;
  if (overlap) {
    // Height-first: keep the full-height size as long as the x advance
    // needed to span the count stays above the visibility floor.
    size = sizeByHeight;
    if (count > 1) {
      const advanceFit = (availableWidth - size) / (count - 1);
      if (advanceFit < size * OVERLAP_MIN_PITCH) {
        size = availableWidth / (1 + (count - 1) * OVERLAP_MIN_PITCH);
        xAdvance = size * OVERLAP_MIN_PITCH;
      } else {
        xAdvance = Math.min(advanceFit, size * OVERLAP_MAX_PITCH);
      }
    } else {
      size = Math.min(size, availableWidth);
      xAdvance = 0;
    }
  } else {
    // No overlap: width allots a full slot + gap per icon.
    const sizeByWidth = (availableWidth - (count - 1) * minPadding) / count;
    size = Math.min(sizeByWidth, sizeByHeight);
    xAdvance = size + minPadding;
  }
  const radius = size / 2;

  const bandWidth = size + (count - 1) * xAdvance;
  const startX = (containerWidth - bandWidth) / 2 + radius;
  const bandHeight = size * heightFactor;
  const bandTop = (containerHeight - bandHeight) / 2;

  const positions: StampPosition[] = [];
  for (let i = 0; i < count; i++) {
    const level = i % levels;
    positions.push({
      centerX: startX + i * xAdvance,
      centerY: bandTop + size * yOffset * level + radius,
      radius,
      row: level,
      indexInRow: Math.floor(i / levels),
      globalIndex: i,
    });
  }

  const distribution = Array.from({ length: levels }, (_, level) =>
    positions.filter((p) => p.row === level).length
  );
  return {
    positions,
    diameter: size,
    radius,
    rows: levels,
    distribution,
    verticalPadding: bandTop,
  };
}

/**
 * Box size for a custom icon in a cell. Mirrors _paste_slot_icon in
 * backend strip_generator.py: 'overlap' boxes ARE the solved size
 * (overlapping is the point); straight/staggered boxes grow by
 * CUSTOM_ICON_SCALE but never eat more than 60% of the smaller gutter.
 */
export function customIconBoxSize(
  layout: StampLayout,
  minPadding: number,
  arrangement: "straight" | "staggered" | "overlap"
): number {
  if (arrangement === "overlap") return layout.diameter;
  const allowedExtra = Math.min(minPadding, layout.verticalPadding) * 0.6;
  return Math.min(layout.diameter * CUSTOM_ICON_SCALE, layout.diameter + allowedExtra);
}

/**
 * Which image URL a slot renders in custom mode. Mirrors
 * _custom_icon_for_slot in backend strip_generator.py: slot i uses
 * icons[i % n], the last slot uses reward_icon when set; empty slots show
 * their own slot's greyscale/outline variant or the shared empty icon.
 */
export function resolveStampIconUrl(
  config: CustomStampConfig,
  slotIndex: number,
  totalStamps: number,
  filled: boolean
): string | null {
  const isLast = slotIndex === totalStamps - 1;
  const iconSet =
    isLast && config.reward_icon
      ? config.reward_icon
      : config.icons.length > 0
        ? config.icons[slotIndex % config.icons.length]
        : null;
  if (!iconSet) return null;

  if (filled) return iconSet.processed_url;

  if (config.empty_mode === "custom" && config.empty_icon) {
    return config.empty_icon.processed_url;
  }
  if (config.empty_mode === "outline") {
    return iconSet.outline_url || iconSet.processed_url;
  }
  return iconSet.greyscale_url || iconSet.processed_url;
}

// ============================================================================
// Card Color Scheme
// ============================================================================

export interface CardColorScheme {
  bgHex: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  accentHex: string;
  iconColorHex: string;
  textColor: string;
  mutedTextColor: string;
  emptyStampBg: string;
  emptyStampBorder: string;
  isLightBg: boolean;
}

/**
 * Compute all derived colors from a card design
 */
export function computeCardColors(
  design: Partial<CardDesign>
): CardColorScheme {
  const backgroundColor = design.background_color ?? "rgb(28, 28, 30)";
  const accentColor = design.stamp_filled_color ?? "rgb(249, 115, 22)";
  const iconColor = design.icon_color ?? "rgb(255, 255, 255)";

  const bgHex = rgbToHex(backgroundColor);
  const accentHex = rgbToHex(accentColor);
  const iconColorHex = rgbToHex(iconColor);

  const bgGradientFrom = adjustBrightness(bgHex, 15);
  const bgGradientTo = adjustBrightness(bgHex, -10);

  const isLightBg = isLightColor(bgHex);

  // Calculate auto colors based on background brightness
  const autoTextColor = isLightBg ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,1)";
  const autoMutedColor = isLightBg
    ? "rgba(0,0,0,0.5)"
    : "rgba(255,255,255,0.5)";

  // Use foreground_color if set, otherwise use auto-calculated colors
  const textColor = design.foreground_color
    ? rgbToHex(design.foreground_color)
    : autoTextColor;
  const mutedTextColor = design.label_color
    ? rgbToHex(design.label_color)
    : autoMutedColor;

  const emptyStampBg = isLightBg ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const emptyStampBorder = isLightBg
    ? "rgba(0,0,0,0.2)"
    : "rgba(255,255,255,0.2)";

  return {
    bgHex,
    bgGradientFrom,
    bgGradientTo,
    accentHex,
    iconColorHex,
    textColor,
    mutedTextColor,
    emptyStampBg,
    emptyStampBorder,
    isLightBg,
  };
}
