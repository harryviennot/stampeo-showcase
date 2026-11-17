/**
 * The Scanner app's own colours (scanner-app `src/constants/colors.ts`, the auth tokens, and the sample café's brand as
 * the Scanner loop shows it), for the screens drawn on this page.
 */
export const APP = {
  surface: "#f6f4f5",
  paper: "#f0efe9",
  field: "#faf9f6",
  ink: "#2d3436",
  muted: "#6b7280",
  faint: "#9ca3af",
  line: "#ddd9d0",
  /** Aurevo's brand, the action colour inside the café's own screens. */
  brand: "#492c2a",
  /** Stampeo's orange, the one action on a screen shown before a business is chosen. */
  orange: "#f97316",
  amber: "#d97706",
  amberTint: "rgba(245, 158, 11, 0.16)",
} as const;
