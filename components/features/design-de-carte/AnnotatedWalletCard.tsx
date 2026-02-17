"use client";

import { useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import type { CardDesign } from "@/lib/types/design";

interface Annotation {
  label: string;
  // Position on the card as % from top-left
  cardX: number;
  cardY: number;
  // Label offset direction
  side: "left" | "right";
}

const CARD_DESIGN: Partial<CardDesign> = {
  organization_name: "Mon Café Parisien",
  background_color: "#1c1c1e",
  stamp_filled_color: "#f97316",
  icon_color: "#ffffff",
  stamp_icon: "coffee",
  reward_icon: "gift",
  total_stamps: 8,
  secondary_fields: [
    { key: "reward", label: "Récompense", value: "8ᵉ café offert" },
    { key: "member", label: "Membre", value: "Sophie Martin" },
  ],
};

const ANNOTATIONS: Annotation[] = [
  { label: "logo", cardX: 12, cardY: 8, side: "left" },
  { label: "orgName", cardX: 88, cardY: 8, side: "right" },
  { label: "stampGrid", cardX: 50, cardY: 40, side: "right" },
  { label: "reward", cardX: 15, cardY: 65, side: "left" },
  { label: "qrCode", cardX: 50, cardY: 85, side: "right" },
];

function DesktopAnnotations({ labels }: { labels: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) return null;

  return (
    <div ref={ref} className="hidden lg:block absolute inset-0 pointer-events-none">
      {ANNOTATIONS.map((ann, i) => {
        const isLeft = ann.side === "left";
        // Calculate label position with offset
        const labelX = isLeft ? ann.cardX - 32 : ann.cardX + 32;
        const labelY = ann.cardY;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${labelX}%`,
              top: `${labelY}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, x: isLeft ? -15 : 15 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
          >
            <div className="flex items-center gap-2">
              {!isLeft && (
                <div
                  className="h-px flex-shrink-0"
                  style={{
                    width: 30,
                    background: "linear-gradient(to right, var(--accent), transparent)",
                  }}
                />
              )}
              <span
                className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)",
                }}
              >
                {labels[i]}
              </span>
              {isLeft && (
                <div
                  className="h-px flex-shrink-0"
                  style={{
                    width: 30,
                    background: "linear-gradient(to left, var(--accent), transparent)",
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MobileLegend({ labels }: { labels: string[] }) {
  return (
    <div className="lg:hidden mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {labels.map((label, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-[var(--accent)]/10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {i + 1}
          </span>
          <span className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function AnnotatedWalletCard() {
  const t = useTranslations("features.design-de-carte.custom.anatomy");
  const labels = t.raw("labels") as string[];

  return (
    <section className="py-16 sm:py-24 bg-[var(--blog-bg)]">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("description")}
          </p>
        </ScrollReveal>

        <ScrollReveal className="max-w-lg mx-auto">
          <div className="relative">
            {/* The card */}
            <div className="relative z-10 mx-auto max-w-[300px]">
              <ScaledCardWrapper baseWidth={300}>
                <WalletCard
                  design={CARD_DESIGN}
                  stamps={5}
                  showQR={true}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </div>

            {/* Desktop floating labels */}
            <DesktopAnnotations labels={labels} />
          </div>

          {/* Mobile legend */}
          <MobileLegend labels={labels} />
        </ScrollReveal>
      </Container>
    </section>
  );
}
