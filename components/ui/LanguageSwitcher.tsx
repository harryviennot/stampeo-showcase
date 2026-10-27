"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguagePicker } from "@/components/ui/LanguagePicker";
import { hidesLanguageSwitcher } from "@/lib/routing/language-switcher";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Hide on individual blog posts (different slugs per language) and the help center (English only)
  if (hidesLanguageSwitcher(pathname)) return null;

  return (
    <LanguagePicker
      direction="right"
      trigger="click"
      value={locale}
      options={routing.locales.map((l) => ({ value: l, label: l.toUpperCase() }))}
      onSelect={(l) => router.replace(pathname, { locale: l })}
      surfaceClassName="rounded-lg border border-[var(--border)] bg-[var(--cream)]"
      tileClassName="text-[var(--foreground)] hover:bg-[var(--muted)]"
      selectedTileClassName="bg-[var(--accent)] text-white"
    />
  );
}
