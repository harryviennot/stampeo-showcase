/**
 * The CTA button's look, apart from its click tracking, so a plain link can wear
 * it too without a locale prefix or a signup-funnel event.
 */

export type CtaSize = "sm" | "md" | "lg";
export type CtaVariant = "primary" | "secondary" | "outline" | "link";

export const ctaBase =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all";

// Heights, not padding, so buttons of different sizes still line up in a row.
export const ctaSizeStyles: Record<CtaSize, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-[52px] px-7 text-base",
};

export const ctaVariantStyles: Record<CtaVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20 hover:brightness-105",
  secondary:
    "bg-white/10 text-white border border-white/10 hover:bg-white/20",
  outline:
    "bg-transparent text-[var(--foreground)] border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white",
  // For a secondary action next to a primary button: reads as a link, still
  // reports its click like the others.
  link: "bg-transparent text-[var(--foreground)] underline-offset-4 hover:underline",
};
