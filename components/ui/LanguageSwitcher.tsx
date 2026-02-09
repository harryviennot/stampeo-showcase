"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const nextLocale = locale === "fr" ? "en" : "fr";
  const label = locale === "fr" ? "EN" : "FR";

  function handleSwitch() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <button
      onClick={handleSwitch}
      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
      aria-label={`Switch to ${routing.locales.find((l) => l === nextLocale)}`}
    >
      {label}
    </button>
  );
}
