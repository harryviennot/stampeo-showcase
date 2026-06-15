// Maps a changelog area's palette KEY (from changelog_areas.color, the DB source
// of truth) to Tailwind chip classes. Colors may repeat across areas — that's
// intentional, Linear-style. Keep the key list identical to the web/admin maps
// and the email inline-hex map.

export const AREA_CHIP_CLASSES: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  green: "bg-green-50 text-green-700 border-green-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  red: "bg-red-50 text-red-700 border-red-200",
};

export function areaChipClass(color: string | undefined | null): string {
  return (color && AREA_CHIP_CLASSES[color]) || AREA_CHIP_CLASSES.slate;
}

// Linear-style: a neutral pill with a small colored dot (the palette key's hex).
// Keep keys identical across surfaces.
export const AREA_DOT_HEX: Record<string, string> = {
  indigo: "#6366f1",
  blue: "#3b82f6",
  pink: "#ec4899",
  slate: "#64748b",
  orange: "#f97316",
  amber: "#f59e0b",
  purple: "#a855f7",
  green: "#22c55e",
  teal: "#14b8a6",
  red: "#ef4444",
};

export function areaDotHex(color: string | undefined | null): string {
  return (color && AREA_DOT_HEX[color]) || AREA_DOT_HEX.slate;
}
