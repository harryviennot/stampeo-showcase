"use client";

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * A compact segmented control (pill toggle). Controlled: pass `value` and
 * `onChange`. Shared by the hero demo, the loyalty picker, and the card-design
 * playground so the toggle looks the same everywhere.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = "",
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex w-full rounded-xl bg-[var(--muted)] p-1 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className="flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
            style={
              active
                ? {
                    backgroundColor: "white",
                    color: "var(--foreground)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }
                : { color: "var(--muted-foreground)" }
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
