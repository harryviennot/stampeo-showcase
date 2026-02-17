"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function FloatingLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Hide on blog pages (French-only content)
  if (pathname.startsWith("/blog")) return null;

  const nextLocale = locale === "fr" ? "en" : "fr";
  const label = locale === "fr" ? "EN" : "FR";

  function handleSwitch() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      className="hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center px-3.5 py-2 text-xs font-bold rounded-full bg-white/80 backdrop-blur-md border border-[var(--accent)]/10 shadow-lg text-[var(--foreground)] hover:bg-white hover:shadow-xl hover:scale-105 transition-all"
      aria-label={`Switch to ${routing.locales.find((l) => l === nextLocale)}`}
    >
      {label}
    </button>
  );
}
