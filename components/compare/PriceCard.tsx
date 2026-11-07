import type { ReactNode } from "react";
import { withoutTrailingColon } from "@/lib/compare/page/format";
import { SideCard, type Side } from "./SideCard";

/** One product's prices in a soft card: its name above, one price per line. */
export function PriceCard({ side, name, title, children }: { side: Side; name: string; title?: string; children: ReactNode }) {
  return (
    <SideCard side={side} tone="soft" data-price-card={side}>
      <p className={`text-xs font-semibold ${side === "stampeo" ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"}`}>
        {title ? withoutTrailingColon(title) : name}
      </p>
      <div className="mt-3 text-base leading-relaxed text-[var(--near-black)]/80 [&_li]:py-1 [&_li]:text-lg [&_li]:leading-snug [&_li]:font-semibold [&_li]:text-[var(--near-black)] [&_p+p]:mt-3 [&_ul]:list-none [&_ul]:p-0">
        {children}
      </div>
    </SideCard>
  );
}

/** The two price cards side by side from the desktop up and stacked on a phone. */
export function PriceCardPair({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid gap-4 lg:grid-cols-2 lg:gap-6">{children}</div>;
}
