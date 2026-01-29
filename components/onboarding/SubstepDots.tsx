"use client";

interface SubstepDotsProps {
  current: number;
  total: number;
}

export function SubstepDots({ current, total }: SubstepDotsProps) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`
            h-2 rounded-full transition-all duration-300
            ${i + 1 === current
              ? "bg-[var(--accent)] w-6"
              : "bg-[var(--muted)] w-2"
            }
          `}
        />
      ))}
    </div>
  );
}
