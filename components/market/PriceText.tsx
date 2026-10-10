import type { ReactNode } from "react";

/**
 * Text that holds a price or trial length. Node and the browser can format the
 * same amount differently (fr narrow spaces, es/pl grouping), so the element
 * skips React's hydration text check instead of remounting the page.
 */
export function PriceText({
  as: Tag = "span",
  className,
  children,
}: Readonly<{ as?: "span" | "p"; className?: string; children: ReactNode }>) {
  return (
    <Tag suppressHydrationWarning className={className}>
      {children}
    </Tag>
  );
}
