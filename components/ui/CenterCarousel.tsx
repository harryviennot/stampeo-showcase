"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CaretLeftIcon, CaretRightIcon } from "../icons";

export interface CarouselItem {
  key: string;
  /** Accessible name for the slide and its dot. */
  label: string;
  node: ReactNode;
}

interface CenterCarouselProps {
  items: CarouselItem[];
  /** Width classes for one slide (e.g. "w-[86%] lg:w-[940px]"). */
  slideClassName: string;
  prevLabel: string;
  nextLabel: string;
  /** Auto-advance interval in ms; 0 disables. The countdown restarts from
      zero on every user-driven card change (swipe, arrow, dot), and holds
      while dragging, off-screen, in hidden tabs, or under
      prefers-reduced-motion. */
  autoPlayMs?: number;
  /** Clones per side. Must cover every slide visible beside the center one,
      or the track's hard edges show and the loop stops looking infinite.
      Big one-per-view slides: 2. Small multi-per-view slides: raise it.
      Clamped to the item count. */
  clones?: number;
  /** Distance, in slide widths, at which a slide reaches full edge treatment
      (min scale + darkest). 1 suits one-slide-per-view; raise it when many
      slides are visible so the falloff grades across the row. */
  falloffSlides?: number;
  /** Extra classes for the scrolling track — e.g. horizontal padding to give
      full-width mobile slides page margins (`px-5 md:px-0`). */
  trackClassName?: string;
  className?: string;
}

// Off-center slides shrink and darken toward these values.
const EDGE_SCALE = 0.88;
const EDGE_BRIGHTNESS = 0.6;
// Within this fraction of the falloff distance a slide counts as centered:
// scroll-snap overshoots by a few px when it settles, and without a deadzone
// that reads as the card shrinking and growing back on arrival.
const CENTER_DEADZONE = 0.06;
// How long a programmatic smooth scroll is assumed to last: scroll events
// inside this window don't reset the autoplay countdown.
const PROGRAMMATIC_MS = 900;

/**
 * Center-focused, infinitely looping carousel. Native scroll-snap does the
 * swiping (real momentum on touch); cloned slides on both sides plus an
 * invisible jump once scrolling has fully settled make the loop seamless.
 * `scroll-snap-stop: always` caps a fling at one slide, so a resting position
 * can never be deeper than the first clone ring.
 */
export function CenterCarousel({
  items,
  slideClassName,
  prevLabel,
  nextLabel,
  autoPlayMs = 0,
  clones = 2,
  falloffSlides = 1,
  trackClassName = "",
  className = "",
}: CenterCarouselProps) {
  const n = items.length;
  const looping = n > 1;
  const c = Math.max(1, Math.min(clones, n));
  const domItems = useMemo(() => {
    if (!looping) return items;
    const before = Array.from(
      { length: c },
      (_, k) => items[(((n - c + k) % n) + n) % n]
    );
    const after = Array.from({ length: c }, (_, k) => items[k % n]);
    return [...before, ...items, ...after];
  }, [items, n, c, looping]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nearestDomRef = useRef(looping ? c : 0);
  const draggingRef = useRef(false);
  const settleTimer = useRef<number | null>(null);
  const rafRef = useRef(0);
  const inViewRef = useRef(false);
  const autoplayTimer = useRef<number | null>(null);
  const programmaticUntilRef = useRef(0);
  const [active, setActive] = useState(0);

  const markProgrammatic = useCallback(() => {
    programmaticUntilRef.current = Date.now() + PROGRAMMATIC_MS;
  }, []);

  const scrollToDom = useCallback((domIndex: number, behavior: ScrollBehavior) => {
    const track = trackRef.current;
    const el = slideRefs.current[domIndex];
    if (!track || !el) return;
    track.scrollTo({
      left: el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2,
      behavior,
    });
  }, []);

  /** Scale + darken each slide by its distance from the viewport center and
      track the nearest slide. Runs at most once per animation frame; styles
      are written imperatively (no CSS transition) so the treatment tracks the
      finger exactly instead of lagging behind and settling late. */
  const paint = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let nearest = nearestDomRef.current;
    let best = Infinity;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      const raw = dist / (el.offsetWidth * falloffSlides);
      const a = Math.min(
        Math.max((raw - CENTER_DEADZONE) / (1 - CENTER_DEADZONE), 0),
        1
      );
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) {
        inner.style.transform = `scale(${1 - (1 - EDGE_SCALE) * a})`;
        inner.style.filter = `brightness(${1 - (1 - EDGE_BRIGHTNESS) * a})`;
      }
      if (dist < best) {
        best = dist;
        nearest = i;
      }
    });
    nearestDomRef.current = nearest;
    const real = looping ? (((nearest - c) % n) + n) % n : nearest;
    setActive((prev) => (prev === real ? prev : real));
  }, [n, c, looping, falloffSlides]);

  // The settle handler re-arms itself and is also called from a scrollend
  // listener, so the current version lives in a ref.
  const jumpRef = useRef<() => void>(() => {});

  const armSettle = useCallback(() => {
    if (settleTimer.current) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => jumpRef.current(), 120);
  }, []);

  /** If we've come fully to rest on a clone, teleport to its real twin. Never
      fires mid-gesture (drag guard) or mid-momentum (the scroll position must
      sit exactly on the clone's snap point) — jumping any earlier makes the
      loop seam visible. */
  const jumpIfSettledOnClone = useCallback(() => {
    if (!looping || draggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const i = nearestDomRef.current;
    const isClone = i < c || i >= n + c;
    if (!isClone) return;
    const el = slideRefs.current[i];
    if (!el) return;
    const target = el.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2;
    if (Math.abs(track.scrollLeft - target) > 2) {
      // Still moving or snapping — check again shortly.
      armSettle();
      return;
    }
    markProgrammatic();
    scrollToDom(i < c ? i + n : i - n, "auto");
  }, [looping, n, c, scrollToDom, armSettle, markProgrammatic]);

  useEffect(() => {
    jumpRef.current = jumpIfSettledOnClone;
  }, [jumpIfSettledOnClone]);

  const step = useCallback(
    (dir: 1 | -1) => {
      markProgrammatic();
      scrollToDom(nearestDomRef.current + dir, "smooth");
    },
    [scrollToDom, markProgrammatic]
  );

  // ---- Autoplay: a resettable countdown, not a fixed interval. -------------
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const autoplayEnabled = autoPlayMs > 0 && looping;

  /** (Re)start the countdown from zero — called on mount and after every
      user-driven card change so the user always gets the full interval. */
  const scheduleAutoplay = useCallback(() => {
    if (!autoplayEnabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (autoplayTimer.current) window.clearTimeout(autoplayTimer.current);
    const tick = () => {
      if (document.hidden || !inViewRef.current || draggingRef.current) {
        // Not a moment to advance — poll again without advancing.
        autoplayTimer.current = window.setTimeout(tick, 1000);
        return;
      }
      stepRef.current(1);
      autoplayTimer.current = window.setTimeout(tick, autoPlayMs);
    };
    autoplayTimer.current = window.setTimeout(tick, autoPlayMs);
  }, [autoplayEnabled, autoPlayMs]);

  useEffect(() => {
    if (!autoplayEnabled) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.35 }
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    scheduleAutoplay();
    return () => {
      io.disconnect();
      if (autoplayTimer.current) window.clearTimeout(autoplayTimer.current);
    };
  }, [autoplayEnabled, scheduleAutoplay]);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(paint);
    armSettle();
    // Scroll not caused by us = the user moving the carousel → restart the
    // autoplay countdown so the card they chose gets the full interval.
    if (Date.now() > programmaticUntilRef.current) scheduleAutoplay();
  }, [paint, armSettle, scheduleAutoplay]);

  // Start centered on the first real slide; keep the current slide centered
  // through resizes. Where the browser supports scrollend, use it to run the
  // loop jump the moment scrolling (momentum + snap included) finishes.
  useEffect(() => {
    markProgrammatic();
    scrollToDom(looping ? c : 0, "auto");
    // First paint via rAF: layout is settled and setState stays out of the
    // effect body (react-hooks/set-state-in-effect).
    rafRef.current = requestAnimationFrame(paint);
    const onResize = () => {
      markProgrammatic();
      scrollToDom(nearestDomRef.current, "auto");
    };
    window.addEventListener("resize", onResize);
    const track = trackRef.current;
    const onScrollEnd = () => jumpRef.current();
    const hasScrollEnd = track && "onscrollend" in track;
    if (hasScrollEnd) track.addEventListener("scrollend", onScrollEnd);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      if (hasScrollEnd) track.removeEventListener("scrollend", onScrollEnd);
    };
  }, [scrollToDom, paint, looping, c, markProgrammatic]);

  const arrowClass =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-lg border border-[var(--border)] transition-all hover:scale-105 hover:shadow-xl active:scale-95";

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={() => {
          draggingRef.current = true;
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        className={`flex items-stretch gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [&::-webkit-scrollbar]:hidden ${trackClassName}`}
        style={{ scrollbarWidth: "none" }}
      >
        {domItems.map((item, domIndex) => {
          const isClone = looping && (domIndex < c || domIndex >= n + c);
          return (
            <div
              key={`${item.key}-${domIndex}`}
              ref={(el) => {
                slideRefs.current[domIndex] = el;
              }}
              className={`shrink-0 snap-center [scroll-snap-stop:always] ${slideClassName}`}
              role="group"
              aria-roledescription="slide"
              aria-label={item.label}
              inert={isClone || undefined}
              onClickCapture={(e) => {
                // A tap on a side slide re-centers it instead of following
                // its link.
                if (domIndex !== nearestDomRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                  markProgrammatic();
                  scrollToDom(domIndex, "smooth");
                  scheduleAutoplay();
                }
              }}
            >
              <div className="h-full will-change-transform">{item.node}</div>
            </div>
          );
        })}
      </div>

      {looping && (
        <>
          <button
            type="button"
            onClick={() => {
              step(-1);
              scheduleAutoplay();
            }}
            aria-label={prevLabel}
            className={`${arrowClass} left-3 lg:left-6`}
          >
            <CaretLeftIcon className="w-5 h-5" weight="bold" />
          </button>
          <button
            type="button"
            onClick={() => {
              step(1);
              scheduleAutoplay();
            }}
            aria-label={nextLabel}
            className={`${arrowClass} right-3 lg:right-6`}
          >
            <CaretRightIcon className="w-5 h-5" weight="bold" />
          </button>

          <div className="mt-7 flex justify-center gap-2">
            {items.map((item, index) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  markProgrammatic();
                  scrollToDom(index + c, "smooth");
                  scheduleAutoplay();
                }}
                aria-label={item.label}
                aria-current={active === index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active === index
                    ? "w-7 bg-[var(--accent)]"
                    : "w-2 bg-[var(--border)] hover:bg-[var(--muted-foreground)]/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
