"use client";

import { useEffect, useRef, useState, type ElementType, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, CheckIcon, Gift, Lightning, StarIcon } from "@/components/icons";
import { IPhone } from "@/components/ui/IPhone";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { iphoneLayout } from "@/lib/devices/iphone";
import { AUTO_ADVANCE_MS, COUNTER_KEYS, autoplays, counterKeyTarget, crossfadeMs, stepCounter, type CounterKey } from "@/lib/landing-pages/previews/scanner-counter";
import { APP } from "./appColors";

/** One button of the counter and what it shows: the Scanner's screen, the customer's wallet card and what the scan did to it. */
export interface CounterPane {
  key: CounterKey;
  title: string;
  line: string;
  screenLabel: string;
  screen: ReactNode;
  cardLabel: string;
  card: ReactNode;
  result: string;
}

/** The phone is drawn 280px wide, shown 270 wide on a phone and 300 from `lg`, cut where its screen's content ends. */
const PHONE = { drawn: 280, narrowTo: 270, to: 300 } as const;

const PHONE_CUT =
  "-mx-8 -mt-6 flex max-h-[460px] w-[calc(100%+4rem)] justify-center overflow-hidden px-8 pt-6 [mask-image:linear-gradient(to_bottom,#000_88%,transparent)] lg:max-h-[520px]";

/** The glyph on each button's tile, from `lg`. */
const ICONS: Record<CounterKey, ElementType> = { stamps: CheckIcon, points: Lightning, rewards: Gift, levels: StarIcon };

/** A pane that is not the selected one is out of reach of Tab and of a screen reader, and invisible. */
const hidden = (active: boolean) => ({ inert: !active, "aria-hidden": active ? undefined : true }) as const;

/**
 * Four buttons, and the phone and wallet card that follow them. All four screens and cards stay in the page, stacked, so
 * a choice is a cross-fade and nothing moves; it turns its own pages while on screen until the visitor takes over.
 */
export function CounterPlayground({ label, panes, fact }: Readonly<{ label: string; panes: readonly CounterPane[]; fact: string }>) {
  const reducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState<CounterKey>(COUNTER_KEYS[0]);
  const [touched, setTouched] = useState(false);
  const [inView, setInView] = useState(false);
  // The cards that are not shown are drawn only once the counter has been near the screen: three fewer to hydrate on load.
  const [armed, setArmed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef(new Map<CounterKey, HTMLButtonElement>());
  const turning = autoplays({ reducedMotion, inView, touched });

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && setArmed(true), { rootMargin: "300px" });

    observer.observe(element);
    near.observe(element);
    return () => {
      observer.disconnect();
      near.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!turning) return;
    const timer = setInterval(() => setSelected((key) => stepCounter(key, 1)), AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [turning]);

  const pick = (key: CounterKey) => {
    setTouched(true);
    setSelected(key);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const next = counterKeyTarget(selected, event.key);
    if (!next) return;

    event.preventDefault();
    pick(next);
    tabs.current.get(next)?.focus();
  };

  const fade = crossfadeMs(reducedMotion) > 0 ? "transition-opacity duration-[250ms]" : "";
  const layoutHeight = iphoneLayout(PHONE.drawn).height;

  return (
    <div ref={root} className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:gap-y-6">
      <div className="contents lg:relative lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6 lg:rounded-[28px] lg:bg-[var(--blog-bg)] lg:px-8 lg:py-10 lg:ring-1 lg:ring-black/[0.05]">
        <div className="order-1 flex justify-center lg:order-none">
          <div className={PHONE_CUT}>
            <ScaledBox width={PHONE.drawn} height={layoutHeight} to={PHONE.to} narrowTo={PHONE.narrowTo}>
              <IPhone width={PHONE.drawn} statusBar="light" screenBackground={APP.surface}>
                {panes.map((pane) => {
                  const active = pane.key === selected;

                  return (
                    <div
                      key={pane.key}
                      id={`counter-screen-${pane.key}`}
                      data-screen={pane.key}
                      role="img"
                      aria-label={pane.screenLabel}
                      {...hidden(active)}
                      className={`absolute inset-0 px-4 ${fade} ${active ? "opacity-100" : "opacity-0"}`}
                      style={{ paddingTop: "calc(var(--iphone-safe-top) + 14px)" }}
                    >
                      <div aria-hidden>{pane.screen}</div>
                    </div>
                  );
                })}
              </IPhone>
            </ScaledBox>
          </div>
        </div>

        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--accent)] ring-1 ring-black/10 lg:flex"
        >
          <ArrowRightIcon size={18} weight="bold" />
        </span>

        <div className="order-3 flex flex-col items-center gap-3 lg:order-none">
          <div className="grid">
            {panes.map((pane) => {
              const active = pane.key === selected;

              return (
                <div
                  key={pane.key}
                  data-card={pane.key}
                  role="img"
                  aria-label={pane.cardLabel}
                  {...hidden(active)}
                  className={`col-start-1 row-start-1 ${fade} ${active ? "opacity-100" : "opacity-0"}`}
                >
                  <div aria-hidden>{(active || armed) && pane.card}</div>
                </div>
              );
            })}
          </div>
          <div className="grid text-center">
            {panes.map((pane) => (
              <p
                key={pane.key}
                {...hidden(pane.key === selected)}
                className={`col-start-1 row-start-1 flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)] ${fade} ${pane.key === selected ? "opacity-100" : "opacity-0"}`}
              >
                {pane.result}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="order-2 grid grid-cols-2 gap-3 lg:order-none lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:grid-cols-1 lg:gap-4"
      >
        {panes.map((pane) => {
          const active = pane.key === selected;
          const Icon = ICONS[pane.key];

          return (
            <button
              key={pane.key}
              ref={(button) => {
                if (button) tabs.current.set(pane.key, button);
              }}
              type="button"
              role="tab"
              id={`counter-tab-${pane.key}`}
              aria-selected={active}
              aria-controls={`counter-screen-${pane.key}`}
              tabIndex={active ? 0 : -1}
              onClick={() => pick(pane.key)}
              className={`relative flex min-h-14 items-start gap-4 overflow-hidden rounded-[20px] px-4 py-3 text-left shadow-[0_1px_2px_rgba(25,18,16,0.05),0_12px_28px_-18px_rgba(25,18,16,0.2)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:min-h-[88px] lg:items-center lg:px-5 ${
                active ? "bg-[var(--accent)]/[0.07] ring-2 ring-[var(--accent)]/70" : "bg-white ring-1 ring-black/[0.06] hover:ring-black/15 active:bg-[var(--accent)]/5"
              }`}
            >
              <span
                aria-hidden
                className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl lg:flex ${active ? "bg-[var(--accent)] text-white" : "bg-[var(--accent)]/10 text-[var(--accent)]"}`}
              >
                <Icon size={22} weight="bold" />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] leading-tight font-bold text-[var(--foreground)] lg:text-xl">{pane.title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-[var(--muted-foreground)] lg:text-[15px]">{pane.line}</span>
              </span>
              {active && turning && (
                <motion.span
                  key={selected}
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-[var(--accent)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="order-4 text-center text-base text-pretty text-[var(--muted-foreground)] lg:order-none lg:col-span-7 lg:col-start-6 lg:row-start-2">{fact}</p>
    </div>
  );
}
