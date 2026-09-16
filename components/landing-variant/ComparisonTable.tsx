"use client";

import { useState } from "react";
import { Check, X, CaretDown } from "@phosphor-icons/react";
import { ScrollReveal } from "../ui/ScrollReveal";

export type ComparisonRow = {
  label: string;
  us: string;
  values: string[];
  note?: string;
  /**
   * The column this note substantiates, when it is about one of them.
   *
   * Desktop shows every column at once, so every note applies. Mobile shows one
   * competitor at a time, and a note reading "Stamp Me's first step is Download
   * App & Join" under a Square comparison is just confusing. A note with no
   * `noteFor` is general and always shows.
   */
  noteFor?: string;
};

/**
 * The competitor comparison, built on the same shape as the pricing page's
 * FeatureComparisonTable: a real table on desktop, and on mobile a column
 * picker with a single-column list.
 *
 * The mobile half is the point. A four-column table cannot be made to fit a
 * 390px phone, and the usual fix, a horizontally scrolling box, hides two of
 * the four columns off-screen with nothing to say so: on a page where 90% of
 * readers are on a phone, that is most of the argument clipped away. Picking
 * one competitor at a time shows every row of the comparison the reader chose.
 */
export function ComparisonTable({
  usLabel,
  columns,
  rows,
}: Readonly<{ usLabel: string; columns: string[]; rows: ComparisonRow[] }>) {
  const [mobileColumn, setMobileColumn] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <ScrollReveal delay={200} className="hidden md:block">
        <div className="bg-white border border-[var(--border)] shadow-sm rounded-3xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-6 w-[34%]" />
                <th scope="col" className="p-6 text-center w-[22%] bg-[var(--accent)]/5">
                  <div className="text-sm font-bold text-[var(--accent)]">{usLabel}</div>
                </th>
                {columns.map((name) => (
                  <th key={name} scope="col" className="p-6 text-center w-[22%]">
                    <div className="text-sm font-bold">{name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-t border-[var(--border)]/50 ${i % 2 === 0 ? "bg-[var(--muted)]/30" : ""}`}
                >
                  <th scope="row" className="px-6 py-3 text-left align-top">
                    <span className="block text-[13px] font-semibold text-[var(--foreground)]">
                      {row.label}
                    </span>
                    {row.note && (
                      <span className="mt-1 block text-xs font-normal leading-snug text-[var(--muted-foreground)]">
                        {row.note}
                      </span>
                    )}
                  </th>
                  <td className="px-6 py-3 text-center align-top bg-[var(--accent)]/5">
                    <Cell value={row.us} emphasis />
                  </td>
                  {row.values.map((value, c) => (
                    <td key={columns[c]} className="px-6 py-3 text-center align-top">
                      <Cell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollReveal>

      {/* Mobile: pick a competitor, see every row against it */}
      <div className="md:hidden">
        <ScrollReveal delay={200}>
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-white rounded-xl border border-[var(--border)] text-sm font-bold shadow-sm"
            >
              <span>
                <span className="text-[var(--accent)]">{usLabel}</span>
                <span className="text-[var(--muted-foreground)] font-semibold"> vs </span>
                {columns[mobileColumn]}
              </span>
              <CaretDown
                className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                weight="bold"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[var(--border)] shadow-lg z-20 overflow-hidden">
                {columns.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setMobileColumn(i);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${
                      mobileColumn === i
                        ? "bg-[var(--accent)]/5 text-[var(--accent)]"
                        : "hover:bg-[var(--cream)]"
                    }`}
                  >
                    {usLabel} vs {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[var(--border)] shadow-sm rounded-2xl overflow-hidden">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`px-5 py-3 border-t border-[var(--border)]/50 first:border-t-0 ${i % 2 === 0 ? "bg-[var(--muted)]/30" : ""}`}
              >
                <span className="block text-[13px] font-semibold text-[var(--foreground)]">
                  {row.label}
                </span>
                <div className="mt-2 flex items-start gap-3">
                  <div className="flex-1 min-w-0 rounded-lg bg-[var(--accent)]/5 px-3 py-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                      {usLabel}
                    </span>
                    <span className="mt-0.5 block">
                      <Cell value={row.us} emphasis />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 rounded-lg bg-[var(--muted)]/40 px-3 py-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                      {columns[mobileColumn]}
                    </span>
                    <span className="mt-0.5 block">
                      <Cell value={row.values[mobileColumn]} />
                    </span>
                  </div>
                </div>
                {row.note && (!row.noteFor || row.noteFor === columns[mobileColumn]) && (
                  <p className="mt-2 text-xs leading-snug text-[var(--muted-foreground)]">
                    {row.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}

/**
 * "Yes" and "No" become the same tick and cross the pricing table uses, because
 * a column of marks is read at a glance where a column of words is read one at
 * a time. Anything else is a real answer and prints as written.
 */
function Cell({ value, emphasis = false }: Readonly<{ value: string; emphasis?: boolean }>) {
  if (/^yes$/i.test(value)) {
    return (
      <span className="inline-flex justify-center">
        <Check className="w-5 h-5 text-green-500" weight="bold" aria-hidden />
        <span className="sr-only">{value}</span>
      </span>
    );
  }
  if (/^no$/i.test(value)) {
    return (
      <span className="inline-flex justify-center">
        <X className="w-5 h-5 text-[var(--border)]" weight="bold" aria-hidden />
        <span className="sr-only">{value}</span>
      </span>
    );
  }
  return (
    <span className={`text-sm font-medium ${emphasis ? "text-[var(--accent)]" : ""}`}>
      {value}
    </span>
  );
}
