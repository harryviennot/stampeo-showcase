"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Hide language switcher on individual blog posts (different slugs per language)
  if (/^\/blog\/.+/.test(pathname)) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          aria-current={l === locale}
          aria-label={`Switch to ${l.toUpperCase()}`}
          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
            l === locale
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--foreground)] hover:bg-[var(--muted)]"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
