"use client";

import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { MarketLink } from "@/components/market/MarketLink";
import type { ProgramType, RowCopy } from "@/lib/landing-pages/copy/types";
import type { Market } from "@/lib/markets";
import { HoverRows } from "./HoverRows";

type Key = ProgramType["key"];

/** The program types as rows: their label, title and text, and no plan chip. */
export type ProgramRow = RowCopy<Key>;

/** The guide that helps an owner choose between stamps and points: its words, and where it leads. */
export interface ChoosingGuide {
  label: string;
  href: string;
  market: Market;
}

/**
 * The program types as stacked rows with their cards, closing on a full-width
 * link to the guide that helps an owner choose.
 */
export function ProgramTypeRows({
  rows,
  guide,
  visuals,
}: Readonly<{ rows: readonly ProgramRow[]; guide: ChoosingGuide; visuals: Record<Key, ReactNode> }>) {
  return (
    <HoverRows
      items={rows}
      visuals={visuals}
      closer={
        <MarketLink
          market={guide.market}
          href={guide.href}
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white/60 px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-white lg:min-h-[72px] lg:tracking-[0.12em] lg:uppercase"
        >
          {guide.label}
          <ArrowRightIcon size={16} weight="bold" aria-hidden />
        </MarketLink>
      }
    />
  );
}
