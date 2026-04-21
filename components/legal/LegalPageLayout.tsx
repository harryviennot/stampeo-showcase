import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { TableOfContents } from "@/components/blog/TableOfContents";
import type { ReactNode } from "react";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--blog-bg)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--near-black)] mb-3">
              {title}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {lastUpdated}
            </p>
          </header>

          <div className="flex gap-12">
            <aside className="hidden lg:block w-64 shrink-0">
              <TableOfContents />
            </aside>

            <div className="flex-1 min-w-0">
              <article className="prose prose-lg leading-[1.6] max-w-none blog-prose legal-prose">
                {children}
              </article>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
