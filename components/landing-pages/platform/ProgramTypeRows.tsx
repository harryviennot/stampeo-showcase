"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Link } from "@/i18n/navigation";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { PROGRAM_TYPES } from "@/lib/landing-pages/copy/program-types";
import type { ProgramType } from "@/lib/landing-pages/copy/types";
import { EYEBROW } from "../shared/LpSection";
import { PlanChip } from "../shared/PlanChip";

type Key = ProgramType["key"];

/** The guide that helps an owner choose between stamps and points. */
const CHOOSING_GUIDE = "/loyalty-programs";

/** A row opens when it crosses the band across the middle of the viewport. */
const MIDDLE_BAND = "-45% 0px -45% 0px";

/** Open rows show their label and text; the closed ones keep their title and card. */
function Collapsible({ open, children }: Readonly<{ open: boolean; children: ReactNode }>) {
  return (
    <div
      inert={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

/**
 * The program types as stacked rows with their cards. The server renders every
 * row open, and a phone or a reader who asks for less motion keeps it that
 * way. On a wide screen that allows motion the row nearest the middle of the
 * viewport opens and the others show their title and card; a tap opens a row.
 */
export function ProgramTypeRows({ visuals }: Readonly<{ visuals: Record<Key, ReactNode> }>) {
  const [wide, setWide] = useState(false);
  const calm = usePrefersReducedMotion();
  const follows = wide && !calm;
  const [active, setActive] = useState<Key>(PROGRAM_TYPES[0].key);
  const rows = useRef(new Map<Key, HTMLLIElement>());

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!follows) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.getAttribute("data-key") as Key);
        }
      },
      { rootMargin: MIDDLE_BAND },
    );
    rows.current.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [follows]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <ol className="border-b border-[var(--border)]">
        {PROGRAM_TYPES.map((type) => {
          const open = !follows || active === type.key;

          return (
            <li
              key={type.key}
              ref={(row) => {
                if (row) rows.current.set(type.key, row);
                else rows.current.delete(type.key);
              }}
              data-key={type.key}
              data-open={open}
              className="relative border-t border-[var(--border)]"
            >
              <div className="grid grid-cols-[128px_1fr] items-center gap-5 py-4 lg:grid-cols-[1fr_240px] lg:gap-12 lg:px-12 lg:py-10">
                <div className="flex justify-center lg:order-2">{visuals[type.key]}</div>
                <div className="min-w-0">
                  <Collapsible open={open}>
                    <p className={`pb-2 ${EYEBROW} text-[var(--accent-hover)]`}>
                      {type.eyebrow}
                    </p>
                  </Collapsible>
                  <h3 className="text-h2 lg:text-h1">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setActive(type.key)}
                      className="text-left after:absolute after:inset-0 after:content-['']"
                    >
                      {type.title}
                    </button>
                  </h3>
                  <Collapsible open={open}>
                    <p className="mt-3 max-w-md text-pretty text-base text-[var(--muted-foreground)] lg:text-lg">
                      {type.body}
                    </p>
                    <PlanChip plan={type.plan} className="mt-4" />
                  </Collapsible>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        href={CHOOSING_GUIDE}
        className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white/60 px-4 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-white lg:min-h-[72px] lg:tracking-[0.12em] lg:uppercase"
      >
        {PLATFORM.programTypes.closer}
        <ArrowRightIcon size={16} weight="bold" aria-hidden />
      </Link>
    </div>
  );
}
