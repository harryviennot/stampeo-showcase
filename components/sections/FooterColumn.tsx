import type { ReactNode } from "react";

/** One column of footer links under its title, the same for every column. */
export function FooterColumn({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-white text-sm font-bold">{title}</p>
      <nav aria-label={title} className="flex flex-col gap-3">
        {children}
      </nav>
    </div>
  );
}

/**
 * The grid holding the footer's link columns. Four sit two by two on a phone
 * and in one row from the tablet up. Five wrap two by two, then three across,
 * and from 1280px line up in one row, each column as wide as its longest link
 * at least 32px apart with the spare space spread between them, so no link wraps.
 */
export function footerLinkGrid(columns: 4 | 5): string {
  const across = columns === 5 ? "sm:grid-cols-3 xl:flex xl:justify-between xl:gap-x-8" : "md:grid-cols-4";
  return `grid grid-cols-2 gap-x-10 gap-y-10 ${across} flex-1`;
}
