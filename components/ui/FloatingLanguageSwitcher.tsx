"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguagePicker } from "@/components/ui/LanguagePicker";
import { cn } from "@/lib/utils";

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
  const buttonRef = useRef<HTMLDivElement>(null);
  const [onDark, setOnDark] = useState(false);

  /**
   * What is behind the button decides whether it draws light or dark. Finding
   * that out is expensive — a hit test plus a walk up the ancestor chain
   * reading computed backgrounds — so it is kept off the scroll path:
   *
   *   `elementsFromPoint` returns the whole stack under the point, so the
   *   button can be skipped by filtering rather than by hiding it. Toggling
   *   `visibility` mid-measurement wrote style and then immediately forced
   *   layout again to read it back, twice per scroll event.
   *
   *   One detection per frame at most, and only once the page has actually
   *   moved a few pixels. The background under a fixed button cannot change
   *   without scrolling, so the intermediate events have nothing to tell us.
   */
  const detectBackground = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const stack = document.elementsFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
    const behind = stack.find((el) => !btn.contains(el));
    if (behind) setOnDark(isBackgroundDark(behind));
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastY = Number.NaN;

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        lastY = window.scrollY;
        detectBackground();
      });
    };

    const onScroll = () => {
      if (Math.abs(window.scrollY - lastY) < 8) return;
      schedule();
    };

    // Delay initial detection to ensure layout is painted
    const timer = setTimeout(detectBackground, 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
    };
  }, [detectBackground]);

  // Hide on individual blog posts (different slugs per language)
  if (/^\/blog\/.+/.test(pathname)) return null;

  return (
    <div ref={buttonRef} className="hidden md:block fixed bottom-6 right-6 z-50">
      <LanguagePicker
        direction="up"
        trigger="hover"
        value={locale}
        options={routing.locales.map((l) => ({ value: l, label: l.toUpperCase() }))}
        onSelect={(l) => router.replace(pathname, { locale: l })}
        surfaceClassName={cn(
          "rounded-full backdrop-blur-md border shadow-lg transition-colors",
          onDark ? "bg-white/15 border-white/20" : "bg-white/80 border-[var(--accent)]/10"
        )}
        tileClassName={
          onDark
            ? "text-white/80 hover:bg-white/15"
            : "text-[var(--foreground)] hover:bg-black/5"
        }
        selectedTileClassName="bg-[var(--accent)] text-white"
      />
    </div>
  );
}
