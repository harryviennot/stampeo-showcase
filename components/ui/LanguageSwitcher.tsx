"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguagePicker } from "@/components/ui/LanguagePicker";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Hide language switcher on individual blog posts (different slugs per language)
  if (/^\/blog\/.+/.test(pathname)) return null;

  return (
    <LanguagePicker
      direction="right"
      trigger="click"
      value={locale}
      options={routing.locales.map((l) => ({ value: l, label: l.toUpperCase() }))}
      onSelect={(l) => router.replace(pathname, { locale: l })}
      surfaceClassName="rounded-lg border border-[var(--border)] bg-[var(--cream)]"
      activeTileClassName="bg-[var(--accent)] text-white"
      inactiveTileClassName="text-[var(--foreground)] hover:bg-[var(--muted)]"
    />
  );
}
