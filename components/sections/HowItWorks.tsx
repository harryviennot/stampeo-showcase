"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { NumberStamp } from "../stamps/StampIcons";

const stepColors = [
  "#f97316", // coral
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#22c55e", // green
];

interface HowItWorksProps {
  translationKey?: string;
  aside?: ReactNode;
  sectionClassName?: string;
  id?: string;
}

export function HowItWorks({
  translationKey = "landing.howItWorks",
  aside,
  sectionClassName,
  id = "how-it-works",
}: HowItWorksProps) {
  const t = useTranslations(translationKey);

  const steps = (t.raw("steps") as { title: string; description: string }[]).map(
    (step, index) => ({
      step: index + 1,
      title: step.title,
      description: step.description,
      color: stepColors[index],
    })
  );

  return (
    <section
      id={id}
      className={sectionClassName ?? "py-20 sm:py-28 lg:py-36 relative bg-[var(--blog-bg-alt)]"}
    >
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
            {t("badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          {t("subtitle") && (
            <p className="mt-6 text-lg text-[var(--muted-foreground)]">
              {t("subtitle")}
            </p>
          )}
        </ScrollReveal>

        {aside ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
            <div>
              {steps.map((item, index) => (
                <ScrollReveal
                  key={item.step}
                  delay={index * 100}
                  className="relative"
                >
                  <div className="flex gap-6 sm:gap-8 pb-12 last:pb-0">
                    <div className="flex flex-col items-center">
                      <NumberStamp
                        color={item.color}
                        size={48}
                        number={item.step}
                      />
                      {index < steps.length - 1 && (
                        <div className="w-0.5 flex-1 bg-[var(--border)]" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-[var(--muted-foreground)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <div className="hidden lg:block sticky top-32">
              {aside}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {steps.map((item, index) => (
              <ScrollReveal
                key={item.step}
                delay={index * 100}
                className="relative"
              >
                <div className="flex gap-6 sm:gap-8 pb-12 last:pb-0">
                  <div className="flex flex-col items-center">
                    <NumberStamp
                      color={item.color}
                      size={48}
                      number={item.step}
                    />
                    {index < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[var(--border)]" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
