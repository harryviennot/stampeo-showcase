import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/**
 * The grid every article and topic page sits on: a breadcrumb row, a reading
 * column about 72 characters wide, and a rail on the right for the page's
 * section list (or the other topics). The rail's track stays when it is empty,
 * so the column does not move between pages. The grid is centred, so wide
 * screens don't leave the right side empty.
 */
export function HelpGrid({ top, rail, children }: { top: ReactNode; rail?: ReactNode; children: ReactNode }) {
  return (
    <Container>
      <div className="lg:mx-auto lg:grid lg:max-w-[61rem] lg:grid-cols-[minmax(0,42rem)_15rem] lg:gap-x-16">
        <div className="lg:col-span-2">{top}</div>
        <div className="min-w-0">{children}</div>
        <aside className="hidden lg:block lg:pt-4">{rail}</aside>
      </div>
    </Container>
  );
}
