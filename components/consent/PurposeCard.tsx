"use client";

import { SWITCH_ROW } from "@/lib/privacy/choices-ui";

/** What sits opposite a purpose's title: a switch, or a short fixed state. */
export type PurposeControl =
  | { kind: "switch"; id: string; checked: boolean; onChange: (checked: boolean) => void }
  | { kind: "state"; label: string };

/**
 * One purpose in the preferences dialog: a title, a control, and what it does.
 *
 * A `state` control is the same pattern for "Always on" (strictly necessary)
 * and for a purpose locked off by Global Privacy Control: a label where the
 * switch would be, so nothing looks changeable that is not.
 */
export function PurposeCard({
  title,
  body,
  control,
}: Readonly<{ title: string; body: string; control: PurposeControl }>) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      {control.kind === "switch" ? (
        // The whole top band of the card toggles, at least 44px tall: padding
        // out to the card's edges, cancelled by equal negative margins.
        <label
          htmlFor={control.id}
          className={`-mx-4 -mb-1 -mt-4 flex cursor-pointer items-center justify-between gap-4 px-4 ${SWITCH_ROW.padding}`}
        >
          <span className="text-sm font-semibold">{title}</span>
          {/* A real checkbox, visually hidden, with the switch drawn by
              two spans BESIDE it. The knob is not a `::before` on the
              input: pseudo-elements on replaced elements are undefined
              behaviour and Firefox drops them, which would leave the
              switch looking identical on and off. Track and knob are both
              siblings of the input because Tailwind's `peer-checked:`
              compiles to `~`, which reaches siblings and not their
              children. `sr-only peer` keeps the native keyboard and
              screen-reader behaviour instead of rebuilding it by hand. */}
          <span className={`relative inline-flex ${SWITCH_ROW.track} w-11 shrink-0 items-center`}>
            <input
              id={control.id}
              type="checkbox"
              role="switch"
              checked={control.checked}
              onChange={(event) => control.onChange(event.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[var(--border)] transition-colors peer-checked:bg-[var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] peer-focus-visible:ring-offset-2"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
            />
          </span>
        </label>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold">{title}</span>
          <span className="shrink-0 text-xs font-semibold text-[var(--muted-foreground)]">
            {control.label}
          </span>
        </div>
      )}
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{body}</p>
    </div>
  );
}
