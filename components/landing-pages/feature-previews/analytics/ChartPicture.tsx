import type { ReactNode } from "react";

/** A chart as one picture: the accessible name says what it shows, and what is drawn inside is for the eye. */
export function ChartPicture({ label, className = "", children }: Readonly<{ label: string; className?: string; children: ReactNode }>) {
  return (
    <div role="img" aria-label={label} className={className}>
      <div aria-hidden>{children}</div>
    </div>
  );
}
