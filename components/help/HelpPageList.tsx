import type { ReactNode } from "react";
import { CaretRightIcon } from "@/components/icons";

export interface HelpPageListItem {
  href: string;
  title: ReactNode;
  description?: ReactNode;
  /** A small line above the title, such as the page's category. */
  eyebrow?: ReactNode;
  /** The row the keyboard is on in a search. */
  active?: boolean;
  id?: string;
}

/**
 * Every set of help pages is this one list: a paper surface, divided rows,
 * a title with an optional description, and a caret. Related pages, popular
 * pages, a topic's pages and search results look the same, so it is learned
 * once.
 */
export function HelpPageList({
  items,
  size = "default",
  className = "",
  id,
}: {
  items: readonly HelpPageListItem[];
  /** `result` rows are taller and keep the description to one line. */
  size?: "default" | "result";
  className?: string;
  id?: string;
}) {
  const result = size === "result";

  return (
    <ul
      id={id}
      className={`divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--paper)] ${className}`}
    >
      {items.map((item) => (
        <li key={item.href}>
          {/* A plain anchor: a localized Link would render /en/help and cost a redirect. */}
          <a
            id={item.id}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 text-[var(--near-black)] transition-colors hover:bg-[var(--paper-hover)] ${
              result ? "min-h-14" : "min-h-12"
            } ${item.active ? "bg-[var(--paper-hover)]" : ""}`}
          >
            <span className="min-w-0 flex-1">
              {item.eyebrow && (
                <span className="block text-xs font-medium text-[var(--muted-foreground)]">{item.eyebrow}</span>
              )}
              <span className={`block ${item.description ? "font-semibold" : "font-medium"}`}>{item.title}</span>
              {item.description && (
                // No `block`: line-clamp sets its own display.
                <span className={`text-sm text-[var(--muted-foreground)] ${result ? "line-clamp-1" : "line-clamp-2"}`}>
                  {item.description}
                </span>
              )}
            </span>
            <CaretRightIcon aria-hidden className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          </a>
        </li>
      ))}
    </ul>
  );
}
