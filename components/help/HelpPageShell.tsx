import type { ReactNode } from "react";
import { Header } from "@/components/sections/Header";
import { HelpFooter } from "./HelpFooter";

/** The site header, the page, and the slim footer, on the warm help background. */
export function HelpPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--blog-bg)]">
      <Header />
      <main className="flex-1 pb-16 pt-28 sm:pt-32">{children}</main>
      <HelpFooter />
    </div>
  );
}
