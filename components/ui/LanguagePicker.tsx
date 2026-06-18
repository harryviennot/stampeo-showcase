"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/utils";

export type PickerDirection = "up" | "down" | "left" | "right";

export interface LanguageOption {
  value: string;
  label: string;
}

interface LanguagePickerProps {
  /** Current / active value — always rendered at the base position (pos 0). */
  value: string;
  options: LanguageOption[];
  /** Called once the exit animation lands the chosen value at pos 0. */
  onSelect: (value: string) => void;
  /** Direction the picker grows when opened. Default "up". */
  direction?: PickerDirection;
  /** "hover" opens on pointer hover / keyboard focus; "click" opens on tap. Tap always opens too. Default "hover". */
  trigger?: "hover" | "click";
  tileWidth?: number;
  tileHeight?: number;
  /** Positioning wrapper (e.g. `fixed bottom-6 right-6`). */
  className?: string;
  /** The visible pill surface (bg / border / rounding / shadow). */
  surfaceClassName?: string;
  tileClassName?: string;
  /** Styling for the current value at pos 0. */
  activeTileClassName?: string;
  /** Styling for the other selectable values. */
  inactiveTileClassName?: string;
  ariaLabel?: string;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 400;

type Phase =
  | { kind: "collapsed" }
  | { kind: "open" }
  | { kind: "exiting"; index: number; value: string };

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

/**
 * A language switcher that lives as a single tile showing the current language.
 * On hover (or tap) it grows in `direction`, revealing the other languages
 * stacked behind it. Picking one collapses the surface back to a single tile
 * while sliding the chosen tile down to the base position — a "slot machine"
 * settle — then fires `onSelect`. The current language always sits at pos 0,
 * so the end of the exit animation already matches the next collapsed state
 * and there is no flash when the locale actually changes.
 */
export function LanguagePicker({
  value,
  options,
  onSelect,
  direction = "up",
  trigger = "hover",
  tileWidth = 46,
  tileHeight = 34,
  className,
  surfaceClassName,
  tileClassName,
  activeTileClassName = "bg-[var(--accent)] text-white",
  inactiveTileClassName = "text-[var(--foreground)] hover:bg-black/5",
  ariaLabel = "Change language",
}: LanguagePickerProps) {
  const [phase, setPhase] = useState<Phase>({ kind: "collapsed" });
  const surfaceRef = useRef<HTMLDivElement>(null);
  const committedRef = useRef(false);
  const reduce = usePrefersReducedMotion();

  // pos 0 is always the current value, then the rest in their declared order.
  const current = options.find((o) => o.value === value);
  const ordered = current
    ? [current, ...options.filter((o) => o.value !== value)]
    : options;

  // When the locale actually changes, snap back to the collapsed base state.
  // During an exit we deliberately stay frozen on the end-state until this
  // happens, so the chosen tile (already at pos 0) hands off seamlessly with
  // no flash. Done during render (not an effect) per the React "reset state on
  // prop change" pattern — `committedRef` is reset on the next pick instead.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setPhase({ kind: "collapsed" });
  }

  // Close when clicking outside while open.
  useEffect(() => {
    if (phase.kind !== "open") return;
    const onDocPointer = (e: PointerEvent) => {
      if (surfaceRef.current && !surfaceRef.current.contains(e.target as Node)) {
        setPhase({ kind: "collapsed" });
      }
    };
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [phase.kind]);

  const isVertical = direction === "up" || direction === "down";
  const expanded = phase.kind === "open";
  const n = ordered.length;
  const fullCross = isVertical ? n * tileHeight : n * tileWidth;
  const oneCross = isVertical ? tileHeight : tileWidth;

  // Exit translate: slide the chosen tile (index i) down to the base edge.
  let tx = 0;
  let ty = 0;
  if (phase.kind === "exiting") {
    const i = phase.index;
    if (direction === "up") ty = i * tileHeight;
    else if (direction === "down") ty = -i * tileHeight;
    else if (direction === "right") tx = -i * tileWidth;
    else tx = i * tileWidth; // left
  }

  const surfaceStyle: CSSProperties = {
    ...(isVertical
      ? { width: tileWidth, height: expanded ? fullCross : oneCross }
      : { height: tileHeight, width: expanded ? fullCross : oneCross }),
    transition: reduce
      ? undefined
      : `width ${DURATION}ms ${EASE}, height ${DURATION}ms ${EASE}`,
  };

  const stackStyle: CSSProperties = {
    transform: `translate(${tx}px, ${ty}px)`,
    transition: reduce ? undefined : `transform ${DURATION}ms ${EASE}`,
  };

  const surfaceAnchor = {
    up: "bottom-0 left-0",
    down: "top-0 left-0",
    right: "left-0 top-0",
    left: "right-0 top-0",
  }[direction];

  const stackAnchor = {
    up: "bottom-0 left-0 flex flex-col-reverse",
    down: "top-0 left-0 flex flex-col",
    right: "left-0 top-0 flex flex-row",
    left: "right-0 top-0 flex flex-row-reverse",
  }[direction];

  const open = () => {
    if (phase.kind === "collapsed") setPhase({ kind: "open" });
  };
  const collapse = () => {
    if (phase.kind === "open") setPhase({ kind: "collapsed" });
  };

  const handleTileClick = (opt: LanguageOption) => {
    if (phase.kind === "exiting") return;
    if (phase.kind === "collapsed") {
      // Only the base tile is reachable while collapsed — tap to open.
      setPhase({ kind: "open" });
      return;
    }
    if (opt.value === value) {
      setPhase({ kind: "collapsed" });
      return;
    }
    const index = ordered.findIndex((o) => o.value === opt.value);
    committedRef.current = false;
    setPhase({ kind: "exiting", index, value: opt.value });
  };

  const handleTransitionEnd = () => {
    if (phase.kind !== "exiting" || committedRef.current) return;
    committedRef.current = true;
    onSelect(phase.value);
  };

  return (
    <div
      className={cn("relative", className)}
      style={{ width: tileWidth, height: tileHeight }}
    >
      <div
        ref={surfaceRef}
        role="group"
        aria-label={ariaLabel}
        className={cn("absolute overflow-hidden z-40", surfaceAnchor, surfaceClassName)}
        style={surfaceStyle}
        onMouseEnter={trigger === "hover" ? open : undefined}
        onMouseLeave={trigger === "hover" ? collapse : undefined}
        onFocus={open}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) collapse();
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={cn("absolute", stackAnchor)} style={stackStyle}>
          {ordered.map((opt) => {
            const isCurrent = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleTileClick(opt)}
                aria-current={isCurrent || undefined}
                aria-label={isCurrent ? `Current language: ${opt.label}` : `Switch to ${opt.label}`}
                style={{ width: tileWidth, height: tileHeight }}
                className={cn(
                  "flex shrink-0 items-center justify-center text-xs font-bold uppercase tracking-wide select-none transition-colors",
                  isCurrent ? activeTileClassName : inactiveTileClassName,
                  tileClassName
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
