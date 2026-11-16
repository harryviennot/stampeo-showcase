"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { RowCopy } from "@/lib/landing-pages/copy/types";
import { EYEBROW } from "../shared/LpSection";
import { PlanChip } from "../shared/PlanChip";

/** How long a mouse rests on a row before the row opens. */
export const HOVER_INTENT_MS = 90;

/** The width a row's picture is drawn at on a phone, in the column beside the words. */
const THUMB_WIDTH = 128;

/** The row's grid beside the words on a phone, and under them when the rows stack. */
const GRID = {
  beside: "grid grid-cols-[128px_1fr] items-center gap-5 py-4 lg:grid-cols-[1fr_240px] lg:gap-12 lg:py-10 lg:pr-24 lg:pl-12",
  stacked: "grid grid-cols-1 items-center gap-5 py-5 lg:grid-cols-[1fr_240px] lg:gap-12 lg:py-10 lg:pr-24 lg:pl-12",
} as const;

/** A row's picture: in the right-hand column from `lg`, and zoomed up under the words on a stacked phone row. */
const PICTURE = {
  beside: "flex justify-center lg:order-2",
  stacked: "order-2 flex justify-center max-lg:[zoom:var(--stack-zoom)]",
} as const;

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
 * Titles over their pictures as stacked rows. The server renders every row
 * open, and a phone or a reader who asks for less motion keeps it that way. On
 * a wide screen that allows motion one row is open at a time: the one a mouse
 * rests on, the one in keyboard focus, or the one tapped. A closed row keeps
 * its title, set a little in, and its picture, so no row changes height. A
 * row's `plan` is a chip under its text; `closer` goes under the list. On a
 * phone a picture sits in a 128px column beside the words; `stackOnPhone` puts
 * it under them instead, zoomed from that thumbnail up to the width given (px),
 * for pictures with labels too small to read at 128.
 */
export function HoverRows<Key extends string>({
  items,
  visuals,
  closer,
  stackOnPhone,
}: Readonly<{
  items: ReadonlyArray<Pick<RowCopy<Key>, "key" | "eyebrow" | "title" | "body" | "plan">>;
  visuals: Record<Key, ReactNode>;
  closer?: ReactNode;
  stackOnPhone?: number;
}>) {
  const layout = stackOnPhone === undefined ? "beside" : "stacked";
  const zoom = stackOnPhone === undefined ? undefined : ({ "--stack-zoom": stackOnPhone / THUMB_WIDTH } as CSSProperties);
  const [wide, setWide] = useState(false);
  const calm = usePrefersReducedMotion();
  const allOpen = allRowsOpen({ wide, calm });
  const [active, setActive] = useState<Key | undefined>(items[0]?.key);
  const hover = useMemo(() => hoverIntent<Key>(setActive), []);

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
        {items.map((item) => {
          const open = allOpen || active === item.key;

          return (
            <li
              key={item.key}
              data-key={item.key}
              data-open={open}
              onPointerEnter={(event) => event.pointerType === "mouse" && hover.enter(item.key)}
              onPointerLeave={hover.leave}
              className="relative border-t border-[var(--border)]"
            >
              <div className={GRID[layout]}>
                <div className={PICTURE[layout]} style={zoom}>
                  {visuals[item.key]}
                </div>
                <div
                  className={`min-w-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    open ? "" : "lg:translate-x-8"
                  }`}
                >
                  <Collapsible open={open}>
                    <p className={`pb-2 ${EYEBROW} text-[var(--accent-hover)]`}>
                      {item.eyebrow}
                    </p>
                  </Collapsible>
                  <h3 className="text-h2 lg:text-h1">
                    <button
                      type="button"
                      aria-expanded={open}
                      onFocus={() => setActive(item.key)}
                      onClick={() => setActive(item.key)}
                      className="text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--accent)]"
                    >
                      {item.title}
                    </button>
                  </h3>
                  <Collapsible open={open}>
                    <p className="mt-3 max-w-md text-pretty text-base text-[var(--muted-foreground)] lg:text-lg">
                      {item.body}
                    </p>
                    {item.plan && <PlanChip plan={item.plan} className="mt-3" />}
                  </Collapsible>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {closer}
    </div>
  );
}
