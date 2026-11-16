"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { ReducedMotion } from "@/components/ui/ReducedMotion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { createSender, deliveryOf, firstStage, shouldAutoPlay, type ComposerStage } from "@/lib/landing-pages/previews/broadcast-composer";
import { browserScheduler } from "@/lib/landing-pages/previews/scheduler";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/promotional-campaigns";
import { STAMPED_STAGE } from "../../platform/classes";
import { PhoneCrop } from "../../shared/PhoneCrop";
import { Chip } from "../../shared/PlanChip";
import { lpBanner } from "../../shared/banner";

const { card } = COPY.composer;
const DELIVERY = deliveryOf(COPY.delivery.metrics);

/** The dashboard's own label over the message. */
const MESSAGE_LABEL = "Message";

const LABEL = "text-[13px] font-semibold text-[var(--muted-foreground)]";

/** A choice in a radio group: at least 56px tall, ringed in ink when picked. A choice that needs Pro is shown but cannot be picked. */
function Option({
  checked,
  disabled = false,
  onSelect,
  children,
}: Readonly<{ checked: boolean; disabled?: boolean; onSelect?: () => void; children: ReactNode }>) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onSelect}
      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-[1.5px] bg-white px-4 text-left text-[15px] font-semibold transition-colors duration-200 ${
        checked ? "border-[var(--near-black)] text-[var(--foreground)]" : "border-[var(--border)] text-[var(--muted-foreground)]"
      } ${disabled ? "opacity-70" : ""}`}
    >
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
          checked ? "border-[var(--near-black)]" : "border-[var(--border)]"
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />}
      </span>
      <span className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">{children}</span>
    </button>
  );
}

function Group({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  const id = useId();

  return (
    <div className="mt-6">
      <p id={id} className={LABEL}>
        {title}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="mt-2 grid gap-2 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

/**
 * "Write it, pick who gets it, send": the dashboard's New broadcast screen on a stamped stage, and the
 * phone it sends to. Send now drops the banner on the lock screen and counts the cards it reached; it also
 * sends by itself, once, when the phone is half in view. A reader who asks for less motion finds it sent.
 */
export function BroadcastComposer() {
  const reducedMotion = usePrefersReducedMotion();
  const [pressed, setPressed] = useState<ComposerStage | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [filtered, setFiltered] = useState(false);
  const [joined, setJoined] = useState(false);
  const phone = useRef<HTMLDivElement>(null);

  const stage = pressed ?? firstStage(reducedMotion);
  const shown = count ?? (stage === "sent" ? DELIVERY.delivered : 0);

  const sender = useMemo(
    () =>
      createSender({
        reducedMotion,
        target: DELIVERY.delivered,
        scheduler: browserScheduler,
        onView: (view) => {
          setPressed(view.pressed);
          setCount(view.count);
        },
      }),
    [reducedMotion],
  );

  useEffect(() => {
    const element = phone.current;
    if (!element || reducedMotion) return;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (!shouldAutoPlay({ reducedMotion, played: sender.played, visibleRatio: entry.intersectionRatio })) return;
        sender.send("idle");
        watch.disconnect();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    watch.observe(element);
    return () => watch.disconnect();
  }, [reducedMotion, sender]);

  useEffect(() => sender.stop, [sender]);

  return (
    <div className="mx-auto grid max-w-[1040px] gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      <div className={`p-5 text-left sm:p-8 lg:col-span-7 ${STAMPED_STAGE}`}>
        <h3 className="text-[1.375rem] leading-tight font-bold tracking-[-0.015em] text-[var(--foreground)]">{card.title}</h3>

        <p className={`mt-5 ${LABEL}`}>{MESSAGE_LABEL}</p>
        <div
          role="textbox"
          aria-readonly="true"
          aria-multiline="true"
          aria-label={MESSAGE_LABEL}
          className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--blog-bg)]/60 px-4 py-3 text-base leading-7 text-[var(--foreground)]"
        >
          {card.message.body}
        </div>

        <Group title={card.audience.title}>
          <Option checked={!filtered} onSelect={() => setFiltered(false)}>
            {card.audience.all}
          </Option>
          <Option checked={filtered} onSelect={() => setFiltered(true)}>
            {card.audience.filtered}
          </Option>
        </Group>
        <div
          data-open={filtered}
          inert={!filtered}
          className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${filtered ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap gap-2 pt-3">
              <button
                type="button"
                aria-pressed={joined}
                onClick={() => setJoined((on) => !on)}
                className={`inline-flex h-11 items-center rounded-full border-[1.5px] bg-white px-4 text-[15px] font-semibold transition-colors duration-200 ${
                  joined ? "border-[var(--near-black)] text-[var(--foreground)]" : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                {card.audience.filters[0].label}
              </button>
              <button
                type="button"
                disabled
                className="inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] border-[var(--border)] bg-white px-4 text-[15px] font-semibold text-[var(--muted-foreground)] opacity-70"
              >
                {card.audience.filters[1].label}
                <Chip>{card.audience.filters[1].plan}</Chip>
              </button>
            </div>
          </div>
        </div>

        <Group title={card.schedule.title}>
          <Option checked>{card.schedule.now}</Option>
          <Option checked={false} disabled>
            {card.schedule.later}
            <Chip>{card.schedule.plan}</Chip>
          </Option>
        </Group>

        <button
          type="button"
          onClick={() => sender.send(stage)}
          className="keycap mt-7 mb-[3px] inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[var(--accent)] px-7 text-base font-semibold text-white hover:brightness-105 sm:w-auto"
        >
          {stage === "sent" ? card.sendAgain : card.send}
        </button>

        <p className="mt-4 text-[15px] text-[var(--muted-foreground)] tabular-nums">
          <span aria-hidden>
            {card.delivered} <span className="font-semibold text-[var(--foreground)]">{shown}</span> of {DELIVERY.total}
          </span>
          <span role="status" className="sr-only">
            {stage === "sent" ? `${card.delivered} ${DELIVERY.delivered} of ${DELIVERY.total}` : ""}
          </span>
        </p>
      </div>

      <div ref={phone} aria-hidden className="lg:col-span-5">
        <PhoneCrop height={440}>
          <ReducedMotion active={reducedMotion}>
            <NotificationPhoneDemo eager={false} notifications={[lpBanner(card.message)]} shown={stage === "sent"} />
          </ReducedMotion>
        </PhoneCrop>
      </div>
    </div>
  );
}
