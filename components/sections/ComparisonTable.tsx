"use client";

import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Check, X, Minus } from "@phosphor-icons/react";

function ValueIcon({ icon }: { icon: string }) {
  if (icon === "check") return <Check className="w-4 h-4 text-green-500" weight="bold" />;
  if (icon === "x") return <X className="w-4 h-4 text-red-400" weight="bold" />;
  return <Minus className="w-4 h-4 text-amber-400" weight="bold" />;
}

export function ComparisonTable() {
  const t = useTranslations("landing.comparisonTable");

  const columns = t.raw("columns") as string[];
  const rows = t.raw("rows") as Array<{
    criteria: string;
    values: string[];
    icons: string[];
  }>;

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative bg-[var(--blog-bg)]">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            {t.rich("subtitle", {
              mbr: () => <br className="md:hidden" />,
            })}
          </p>
        </ScrollReveal>

        {/* Desktop Table */}
        <ScrollReveal delay={200} className="hidden md:block">
          <div className="bg-white blog-card-3d rounded-3xl overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="text-left p-6 text-sm font-medium text-[var(--muted-foreground)] w-[28%]" />
                  {columns.map((col, i) => (
                    <th
                      scope="col"
                      key={i}
                      className={`p-6 text-center text-sm font-bold w-[24%] ${i === 2
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--foreground)]"
                        }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 0 ? "bg-[var(--muted)]/30" : ""}
                  >
                    <th scope="row" className="p-6 text-left text-sm font-semibold text-[var(--foreground)]">
                      {row.criteria}
                    </th>
                    {row.values.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className={`p-6 text-center text-sm leading-relaxed ${colIndex === 2
                            ? "bg-[var(--accent)]/5 font-semibold text-[var(--foreground)]"
                            : "text-[var(--muted-foreground)]"
                          }`}
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <ValueIcon icon={row.icons[colIndex]} />
                          {value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {rows.map((row, rowIndex) => (
            <ScrollReveal key={rowIndex} delay={rowIndex * 80}>
              <div className="bg-white blog-card-3d rounded-2xl p-5">
                <p className="text-sm font-bold text-[var(--foreground)] mb-3">
                  {row.criteria}
                </p>
                <div className="space-y-2">
                  {columns.map((col, colIndex) => (
                    <div
                      key={colIndex}
                      className={`flex items-start justify-between gap-3 text-sm ${colIndex === 2 ? "font-semibold text-[var(--accent)]" : "text-[var(--muted-foreground)]"
                        }`}
                    >
                      <span className="text-[var(--muted-foreground)] text-xs flex-shrink-0">
                        {col}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-right">
                        <ValueIcon icon={row.icons[colIndex]} />
                        {row.values[colIndex]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400} className="mt-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)] max-w-2xl mx-auto">
            {t("footnote")}
          </p>
        </ScrollReveal>
      </Container>
    </section>
  );
}
