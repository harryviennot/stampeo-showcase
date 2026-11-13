"use client";

import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { PROGRAM_TYPES } from "@/lib/landing-pages/copy/program-types";
import type { ProgramType } from "@/lib/landing-pages/copy/types";
import { HoverRows } from "./HoverRows";

type Key = ProgramType["key"];

/** The guide that helps an owner choose between stamps and points. */
const CHOOSING_GUIDE = "/loyalty-programs";

/** The program types as rows: their label, title and text, and no plan chip. */
const ROWS = PROGRAM_TYPES.map(({ key, eyebrow, title, body }) => ({ key, eyebrow, title, body }));

/**
 * The program types as stacked rows with their cards, closing on a full-width
 * link to the guide that helps an owner choose.
 */
export function ProgramTypeRows({ visuals }: Readonly<{ visuals: Record<Key, ReactNode> }>) {
  return (
    <HoverRows
      items={ROWS}
      visuals={visuals}
      closer={
        <Link
          href={CHOOSING_GUIDE}
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white/60 px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-white lg:min-h-[72px] lg:tracking-[0.12em] lg:uppercase"
        >
          {PLATFORM.programTypes.closer}
          <ArrowRightIcon size={16} weight="bold" aria-hidden />
        </Link>
      }
    />
  );
}
