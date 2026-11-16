import type { ReactNode } from "react";

/**
 * The picture of a moment: a soft tray of one fixed height, read out as `alt`. What is drawn in it is
 * a still copy of the real screen, out of the way of a reader and of Tab.
 */
export function MomentPicture({ alt, children }: Readonly<{ alt: string; children: ReactNode }>) {
  return (
    <div role="img" aria-label={alt} className="relative h-[360px] overflow-hidden rounded-[20px] bg-[var(--background-subtle)]">
      <div aria-hidden inert className="h-full w-full">
        {children}
      </div>
    </div>
  );
}
