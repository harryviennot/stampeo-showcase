/** The dashed line that joins a timeline's steps: down the side on a phone, across from `lg`. `className` places it. */
export function DashedRail({ className }: Readonly<{ className: string }>) {
  return (
    <span
      aria-hidden
      className={`absolute border-l-[1.5px] border-dashed border-[var(--near-black)]/25 lg:h-0 lg:border-l-0 lg:border-t-[1.5px] ${className}`}
    />
  );
}
