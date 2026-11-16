"use client";

import { useEffect, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { SAMPLE_BUSINESS } from "@/lib/landing-pages/copy/shared";
import {
  SAMPLE_VALUES,
  TYPING_MS,
  parseWording,
  typedSteps,
  wordingSteps,
  wordingView,
  type WordingMode,
  type WordingPart,
} from "@/lib/landing-pages/wording-editor";
import { STAMPED_STAGE } from "../../platform/classes";
import { PlanChip } from "../../shared/PlanChip";
import { LockScreenSlice } from "./LockScreenSlice";

const LABEL = "text-[13px] font-semibold text-[var(--muted-foreground)]";

/** The notification's height is held at its longest wording, so typing never moves what is under it. */
const LONGEST = [COPY.editor.ready.text, COPY.editor.own.preview].reduce((longest, text) => (text.length > longest.length ? text : longest));

const OWN_STEPS = wordingSteps(parseWording(COPY.editor.own.text));

function Variable({ name }: Readonly<{ name: string }>) {
  return (
    <span className="inline-block rounded-md bg-[var(--muted)] px-1.5 py-0.5 align-baseline text-[13px] leading-none font-medium text-[var(--muted-foreground)]">{`{${name}}`}</span>
  );
}

function Field({ parts, typing }: Readonly<{ parts: WordingPart[]; typing: boolean }>) {
  return (
    <div
      role="textbox"
      aria-readonly="true"
      aria-multiline="true"
      aria-label={COPY.editor.messageLabel}
      className="mt-2 min-h-[92px] rounded-xl border border-[var(--border)] bg-[var(--blog-bg)]/60 px-4 py-3 text-base leading-7 text-[var(--foreground)]"
    >
      {parts.map((part, index) =>
        part.kind === "text" ? <span key={index}>{part.text}</span> : <Variable key={index} name={part.name} />,
      )}
      {typing && <span aria-hidden className="ml-px inline-block h-[1.15em] w-0.5 translate-y-[3px] animate-pulse bg-[var(--foreground)]" />}
    </div>
  );
}

function Switch({ label, on, onToggle }: Readonly<{ label: string; on: boolean; onToggle: () => void }>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex min-h-14 w-full items-center justify-between gap-4 px-4 text-left text-base font-semibold text-[var(--foreground)]"
    >
      <span>{label}</span>
      <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`}>
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none ${on ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
}

/**
 * "Use our wording, or write your own": the dashboard's message editor on a stamped stage. Ready-made is
 * the default stamp message; Your words types a message with variables in, 30ms a keystroke, and the lock
 * screen beside it follows. Three message switches flip on their own.
 */
export function WordingEditor() {
  const { toggle, previewLabel, messageLabel, ready, own, switches } = COPY.editor;
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<WordingMode>("ready");
  const [steps, setSteps] = useState(0);
  const [on, setOn] = useState<boolean[]>(() => switches.map(() => true));

  useEffect(() => {
    if (mode !== "own" || reducedMotion) return;
    const startedAt = performance.now();
    const timer = setInterval(() => {
      const typed = typedSteps(performance.now() - startedAt, OWN_STEPS);
      setSteps(typed);
      if (typed >= OWN_STEPS) clearInterval(timer);
    }, TYPING_MS);
    return () => clearInterval(timer);
  }, [mode, reducedMotion]);

  const choose = (next: WordingMode) => {
    if (next === mode) return;
    setMode(next);
    setSteps(next === "own" ? typedSteps(0, OWN_STEPS, reducedMotion) : 0);
  };

  const view = wordingView({ mode, steps, ready: ready.text, own: own.text, values: SAMPLE_VALUES });

  return (
    <div className={`mx-auto max-w-[1040px] p-5 text-left sm:p-8 lg:p-10 ${STAMPED_STAGE}`}>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8">
        <div className="lg:col-span-7">
          <div className="flex min-h-7 items-center justify-between gap-3">
            <p className={LABEL}>{toggle.label}</p>
            {view.planChip && <PlanChip plan={toggle.plan} />}
          </div>
          <Segmented
            size="lg"
            ariaLabel={toggle.label}
            className="mt-2 sm:max-w-[340px]"
            options={[
              { value: "ready", label: toggle.ready },
              { value: "own", label: toggle.own },
            ]}
            value={mode}
            onChange={choose}
          />
          <p className={`mt-6 ${LABEL}`}>{messageLabel}</p>
          <Field parts={view.parts} typing={view.typing} />
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col">
          <p className={LABEL}>{previewLabel}</p>
          <LockScreenSlice
            banner={{ sender: SAMPLE_BUSINESS, body: view.banner }}
            label={mode === "own" ? own.preview : ready.text}
            reserve={LONGEST}
            className="mt-2 lg:flex-1"
          />
        </div>

        <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] lg:col-span-7">
          {switches.map((label, index) => (
            <li key={label}>
              <Switch
                label={label}
                on={on[index]}
                onToggle={() => setOn((current) => current.map((value, at) => (at === index ? !value : value)))}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
