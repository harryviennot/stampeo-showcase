"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { hidesLanguageSwitcher, switchLanguage } from "@/lib/routing/language-switcher";

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

/** The language control: a `LanguageRow` for the page's language, hidden where a switch would 404. */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Blog posts (slug differs per language) and comparison pages (one language) would 404 on a switch.
  if (hidesLanguageSwitcher(pathname)) return null;

  return <LanguageRow locale={locale} locales={routing.locales} onPick={switchLanguage(router, pathname)} />;
}
