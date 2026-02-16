import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
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
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-12">
            {lastUpdated}
          </p>
          <article className="prose prose-lg leading-[1.6] max-w-none blog-prose">
            {children}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
