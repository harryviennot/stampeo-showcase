"use client";

import { useTranslations } from "next-intl";

const TONES = {
  light: "bg-white text-[var(--foreground)] ring-[var(--near-black)]/30",
  dark: "bg-white/10 text-white/80 ring-white/25",
} as const;

/** "Soon", as the homepage's feature grid says it, on a plate of its own: white on a light menu, translucent on the footer. */
export function SoonPill({ className = "", tone = "light" }: Readonly<{ className?: string; tone?: keyof typeof TONES }>) {
  const t = useTranslations("common.wallet");

  return <span className={`rounded-full px-2 py-0.5 text-[11px] leading-4 font-semibold ring-1 ${TONES[tone]} ${className}`}>{t("soon")}</span>;
}
