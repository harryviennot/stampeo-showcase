"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguagePicker } from "@/components/ui/LanguagePicker";
import { hidesLanguageSwitcher } from "@/lib/routing/language-switcher";

/** One 44px pill per language, the current one filled: the phone menu's language control. */
export function LanguageRow({
  locale,
  locales,
  onPick,
}: Readonly<{ locale: string; locales: readonly string[]; onPick: (locale: string) => void }>) {
  return (
    <div role="group" aria-label="Language" className="flex gap-2">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === locale}
          onClick={() => onPick(l)}
          className={`h-11 flex-1 rounded-full border-[1.5px] text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
            l === locale
              ? "border-[var(--near-black)] bg-[var(--near-black)] text-white"
              : "border-[var(--border)] bg-white text-[var(--foreground)] active:bg-[var(--muted)]"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/**
 * The language control. By default the picker that grows from one tile; `variant="row"` is the phone menu's
 * `LanguageRow`.
 */
export function LanguageSwitcher({ variant = "picker" }: Readonly<{ variant?: "picker" | "row" }>) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Blog posts (slug differs per language) and comparison pages (one language) would 404 on a switch.
  if (hidesLanguageSwitcher(pathname)) return null;

  if (variant === "row") {
    return <LanguageRow locale={locale} locales={routing.locales} onPick={(l) => router.replace(pathname, { locale: l })} />;
  }

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
