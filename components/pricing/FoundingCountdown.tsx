"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { FOUNDING_PROGRAM_END_DATE } from "@/lib/pricing";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
}

function calcRemaining(): Remaining | null {
  const ms = FOUNDING_PROGRAM_END_DATE.getTime() - Date.now();
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
  };
}

// useSyncExternalStore requires a stable snapshot reference between renders —
// returning a fresh object every call triggers an infinite render loop. Cache
// by value-key so the same reference is returned until the displayed values
// actually change.
let cachedSnapshot: Remaining | null = null;
let cachedKey = "";

function getSnapshot(): Remaining | null {
  const next = calcRemaining();
  const key = next ? `${next.days}:${next.hours}:${next.minutes}` : "";
  if (key !== cachedKey) {
    cachedKey = key;
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

function subscribe(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}

const getServerSnapshot = (): Remaining | null => null;

interface Props {
  variant?: "inline" | "badge";
  className?: string;
}

export function FoundingCountdown({ variant = "inline", className = "" }: Props) {
  const t = useTranslations("pricing.countdown");
  const remaining = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!remaining) return null;

  const { days, hours, minutes } = remaining;
  const label =
    days > 0
      ? t("daysHours", { days, hours })
      : t("hoursMinutes", { hours, minutes });

  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
        {label}
      </span>
    );
  }

  return (
    <span
      className={`text-sm font-semibold text-[var(--accent)] ${className}`}
    >
      {label}
    </span>
  );
}
