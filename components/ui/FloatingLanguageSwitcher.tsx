"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

function isColorDark(color: string): boolean | null {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)")
    return null;

  // oklch(L C H) or oklch(L C H / A)
  const oklch = color.match(/oklch\(([\d.]+)/);
  if (oklch) return parseFloat(oklch[1]) < 0.5;

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgba = color.match(
    /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/
  );
  if (rgba) {
    const a = rgba[4] !== undefined ? parseFloat(rgba[4]) : 1;
    if (a < 0.1) return null;
    const [r, g, b] = [rgba[1], rgba[2], rgba[3]].map((v) => {
      const s = parseFloat(v) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.4;
  }

  // color(srgb r g b) or color(srgb r g b / a) — values are 0–1
  const srgb = color.match(
    /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/
  );
  if (srgb) {
    const [r, g, b] = [srgb[1], srgb[2], srgb[3]].map((v) => {
      const s = parseFloat(v);
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.4;
  }

  // hex
  const hex = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (hex) {
    const [r, g, b] = [hex[1], hex[2], hex[3]].map((h) => {
      const s = parseInt(h, 16) / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.4;
  }

  return null;
}

function isBackgroundDark(el: Element): boolean {
  let current: Element | null = el;
  while (current && current !== document.documentElement) {
    const bg = getComputedStyle(current).backgroundColor;
    const dark = isColorDark(bg);
    if (dark !== null) {
      return dark;
    }
    current = current.parentElement;
  }
  return false;
}

export function FloatingLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [onDark, setOnDark] = useState(false);

  const detectBackground = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    btn.style.visibility = "hidden";
    const behind = document.elementFromPoint(cx, cy);
    btn.style.visibility = "";
    if (behind) {
      setOnDark(isBackgroundDark(behind));
    } else {
    }
  }, []);

  useEffect(() => {
    // Delay initial detection to ensure layout is painted
    const timer = setTimeout(detectBackground, 100);
    window.addEventListener("scroll", detectBackground, { passive: true });
    window.addEventListener("resize", detectBackground, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", detectBackground);
      window.removeEventListener("resize", detectBackground);
    };
  }, [detectBackground]);

  if (pathname.startsWith("/blog")) return null;

  const nextLocale = locale === "fr" ? "en" : "fr";
  const label = locale === "fr" ? "EN" : "FR";

  function handleSwitch() {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleSwitch}
      className={`hidden md:flex fixed bottom-6 right-6 z-50 items-center justify-center px-3.5 py-2 text-xs font-bold rounded-full backdrop-blur-md border shadow-lg hover:shadow-xl hover:scale-105 transition-all ${
        onDark
          ? "bg-white/15 border-white/20 text-white hover:bg-white/25"
          : "bg-white/80 border-[var(--accent)]/10 text-[var(--foreground)] hover:bg-white"
      }`}
      aria-label={`Switch to ${routing.locales.find((l) => l === nextLocale)}`}
    >
      {label}
    </button>
  );
}
