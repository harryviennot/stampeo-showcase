"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

/**
 * Collapsible Improvements / Fixes block for the changelog timeline. Animates
 * with the grid-template-rows 0fr↔1fr technique (widely supported, no height
 * measuring, no layout flash). The content stays mounted (clipped when closed)
 * so it's still in the server-rendered HTML for SEO.
 */
export function ChangelogAccordion({
  label,
  count,
  icon,
  children,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[var(--foreground)]/[0.08] pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer select-none items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground)]/55 transition-colors hover:text-[var(--foreground)]/75"
      >
        {icon}
        <span>{label}</span>
        <span className="font-semibold text-[var(--foreground)]/35">{count}</span>
        <CaretDown
          weight="bold"
          className={`ml-auto h-3.5 w-3.5 text-[var(--foreground)]/45 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
