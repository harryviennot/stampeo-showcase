"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function BlindSpotCards() {
  const t = useTranslations("features.analytiques");
  const questions = t.raw("custom.blindSpotCards.questions") as string[];
  const noAnswer = t("custom.blindSpotCards.noAnswer");
  const [flipped, setFlipped] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  const toggle = (index: number) => {
    setFlipped((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("problem.title")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("problem.description")}
          </p>
        </ScrollReveal>

        <ScrollReveal variant="stagger">
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
            style={{ perspective: 1000 }}
          >
            {questions.map((question, index) => (
              <div
                key={index}
                className="relative cursor-pointer"
                style={{ perspective: 1000 }}
                onClick={() => toggle(index)}
                onMouseEnter={() => {
                  if (window.innerWidth >= 768) {
                    setFlipped((prev) => {
                      const next = [...prev];
                      next[index] = true;
                      return next;
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (window.innerWidth >= 768) {
                    setFlipped((prev) => {
                      const next = [...prev];
                      next[index] = false;
                      return next;
                    });
                  }
                }}
              >
                <motion.div
                  className="relative w-full"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: flipped[index] ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {/* Front */}
                  <div
                    className="blog-card-3d rounded-2xl bg-white p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[180px]"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="text-4xl sm:text-5xl font-bold text-[var(--muted-foreground)]/20 mb-3">
                      ?
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-[var(--foreground)] leading-snug">
                      {question}
                    </p>
                  </div>

                  {/* Back */}
                  <div
                    className="blog-card-3d rounded-2xl bg-[var(--blog-bg-alt)] p-6 sm:p-8 flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[180px] absolute inset-0"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <span className="text-3xl mb-2">🤷</span>
                    <p className="text-xl font-bold text-[var(--muted-foreground)]">
                      {noAnswer}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
