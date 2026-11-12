"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Link } from "@/i18n/navigation";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { PROGRAM_TYPES } from "@/lib/landing-pages/copy/program-types";
import type { ProgramType } from "@/lib/landing-pages/copy/types";
import { EYEBROW } from "../shared/LpSection";

type Key = ProgramType["key"];

/** The guide that helps an owner choose between stamps and points. */
const CHOOSING_GUIDE = "/loyalty-programs";

/** How long a mouse rests on a row before the row opens. */
export const HOVER_INTENT_MS = 90;

/** Every row shows its words on the server, on a phone, and for a reader who asks for less motion. */
export function allRowsOpen({ wide, calm }: Readonly<{ wide: boolean; calm: boolean }>): boolean {
  return !wide || calm;
}

/** Opens the row a mouse rests on, and none that it only crosses on its way elsewhere. */
export function hoverIntent<K>(open: (key: K) => void) {
  let pending: ReturnType<typeof setTimeout> | undefined;

  return {
    enter(key: K) {
      clearTimeout(pending);
      pending = setTimeout(() => open(key), HOVER_INTENT_MS);
    },
    leave() {
      clearTimeout(pending);
    },
  };
}

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
 * way. On a wide screen that allows motion one row is open at a time: the one
 * a mouse rests on, the one in keyboard focus, or the one tapped. A closed
 * row keeps its title, set a little in, and its card, so no row changes height.
 */
export function ProgramTypeRows({ visuals }: Readonly<{ visuals: Record<Key, ReactNode> }>) {
  const [wide, setWide] = useState(false);
  const calm = usePrefersReducedMotion();
  const allOpen = allRowsOpen({ wide, calm });
  const [active, setActive] = useState<Key>(PROGRAM_TYPES[0].key);
  const hover = useMemo(() => hoverIntent(setActive), []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => hover.leave, [hover]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <ol className="border-b border-[var(--border)]">
        {PROGRAM_TYPES.map((type) => {
          const open = allOpen || active === type.key;

          return (
            <li
              key={type.key}
              data-key={type.key}
              data-open={open}
              onPointerEnter={(event) => event.pointerType === "mouse" && hover.enter(type.key)}
              onPointerLeave={hover.leave}
              className="relative border-t border-[var(--border)]"
            >
              <div className="grid grid-cols-[128px_1fr] items-center gap-5 py-4 lg:grid-cols-[1fr_240px] lg:gap-12 lg:py-10 lg:pr-24 lg:pl-12">
                <div className="flex justify-center lg:order-2">{visuals[type.key]}</div>
                <div
                  className={`min-w-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    open ? "" : "lg:translate-x-8"
                  }`}
                >
                  <Collapsible open={open}>
                    <p className={`pb-2 ${EYEBROW} text-[var(--accent-hover)]`}>
                      {type.eyebrow}
                    </p>
                  </Collapsible>
                  <h3 className="text-h2 lg:text-h1">
                    <button
                      type="button"
                      aria-expanded={open}
                      onFocus={() => setActive(type.key)}
                      onClick={() => setActive(type.key)}
                      className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--accent)]"
                    >
                      {type.title}
                    </button>
                  </h3>
                  <Collapsible open={open}>
                    <p className="mt-3 max-w-md text-pretty text-base text-[var(--muted-foreground)] lg:text-lg">
                      {type.body}
                    </p>
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
