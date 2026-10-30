"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { ArrowRightIcon, StarIcon } from "@/components/icons";
import { levelMarkColor } from "@/lib/levels/level-mark";
import {
  ladderRows,
  levelName,
  stripLine,
  usableLevels,
  type LevelProgramType,
  type PublicLevel,
} from "@/lib/levels/levels";
import { LevelSheet } from "./LevelSheet";

const CHIP = "inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold";

/**
 * The ladder in one compact block under the card preview: a chip per level
 * with the top one emphasised, the first step in one line, and a button that
 * opens the full ladder. Renders nothing unless the business has two or more
 * named levels.
 */
export function LevelStrip({
  levels,
  programType,
  accent,
}: Readonly<{
  levels: PublicLevel[] | null | undefined;
  programType: LevelProgramType;
  /** The business's own accent colour; the marks use it only when it shows on the strip. */
  accent?: string | null;
}>) {
  const t = useTranslations("acquisition.levels");
  const locale = useLocale();
  const titleId = useId();
  const [sheetOpen, setSheetOpen] = useState(false);

  const ladder = usableLevels(levels);
  if (!ladder) return null;

  const mark = levelMarkColor(accent);
  const line = stripLine(ladder, programType, locale, t);
  const rows = ladderRows(ladder, programType, locale, t);

  return (
    <section
      aria-labelledby={titleId}
      className="mt-4 rounded-xl border border-[var(--border)] bg-white/70 px-3.5 py-2.5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={titleId} className="text-[13px] font-semibold leading-tight text-[var(--primary)]">
          {t("title")}
        </h2>
        {/* The pseudo-element stretches the tap area to ~44px without growing the strip. */}
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setSheetOpen(true)}
          className="relative shrink-0 rounded-sm text-[13px] font-semibold leading-tight text-[var(--primary)] underline underline-offset-2 before:absolute before:-inset-x-2 before:-inset-y-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {t("howItWorks")}
        </button>
      </div>

      <ol aria-labelledby={titleId} className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-1.5">
        {ladder.map((level, index) => {
          const isTop = index === ladder.length - 1;
          return (
            <li key={level.rank} className="flex items-center gap-1">
              {isTop ? (
                <span
                  className={`${CHIP} font-bold text-[var(--primary)]`}
                  style={{
                    borderColor: mark,
                    backgroundColor: `color-mix(in srgb, ${mark} 14%, transparent)`,
                  }}
                >
                  <StarIcon size={11} weight="fill" aria-hidden="true" style={{ color: mark }} />
                  {levelName(level, locale)}
                </span>
              ) : (
                <span className={`${CHIP} border-[var(--border)] bg-[var(--paper)] text-[var(--primary)]`}>
                  {levelName(level, locale)}
                </span>
              )}
              {!isTop && (
                <ArrowRightIcon
                  size={12}
                  weight="bold"
                  aria-hidden="true"
                  className="shrink-0 text-[var(--muted-foreground)]"
                />
              )}
            </li>
          );
        })}
      </ol>

      {line && <p className="mt-1.5 text-[13px] leading-snug text-[var(--muted-foreground)]">{line}</p>}

      <LevelSheet open={sheetOpen} rows={rows} markColor={mark} onClose={() => setSheetOpen(false)} />
    </section>
  );
}
