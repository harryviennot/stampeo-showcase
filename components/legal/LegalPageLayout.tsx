import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

interface LegalSection {
  title: string;
  content: string;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  sections,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-12">
            {lastUpdated}
          </p>
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                <div className="text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
                  {section.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="mb-3">
                      {renderMarkdownBold(paragraph)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function renderMarkdownBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-[var(--foreground)] font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  );
}
