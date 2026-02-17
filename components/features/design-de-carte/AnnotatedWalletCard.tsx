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
  cardX: number;
  cardY: number;
  side: "left" | "right";
}

const ANNOTATIONS: Annotation[] = [
  { label: "logo", cardX: 15, cardY: 1, side: "left" },
  { label: "orgName", cardX: 85, cardY: 3, side: "right" },
  { label: "stampGrid", cardX: 15, cardY: 33, side: "left" },
  { label: "customFields", cardX: 85, cardY: 50, side: "right" },
  { label: "reward", cardX: 15, cardY: 53, side: "left" },
  { label: "qrCode", cardX: 85, cardY: 75, side: "right" },
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

  // Card is 300px centered inside a max-w-3xl (~768px) container.
  // Card left edge ≈ 30.5%, right edge ≈ 69.5%.
  // Left labels: anchored by `right` so their right edge (line tip) aligns to card left edge.
  // Right labels: anchored by `left` so their left edge (line tip) starts at card right edge.
  const CARD_LEFT_EDGE = 28; // % — a few px gap before the card
  const CARD_RIGHT_EDGE = 72; // % — a few px gap after the card

  return (
    <div ref={ref} className="hidden lg:block absolute inset-0 pointer-events-none">
      {ANNOTATIONS.map((ann, i) => {
        const isLeft = ann.side === "left";

        return (
          <motion.div
            key={i}
            className="absolute"
            style={
              isLeft
                ? {
                    // Anchor right edge near card left edge — content right-aligns naturally
                    right: `${100 - CARD_LEFT_EDGE}%`,
                    top: `${ann.cardY}%`,
                    transform: "translateY(-50%)",
                  }
                : {
                    left: `${CARD_RIGHT_EDGE}%`,
                    top: `${ann.cardY}%`,
                    transform: "translateY(-50%)",
                  }
            }
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

function MobileAnnotations() {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) return null;

  return (
    <div className="lg:hidden absolute inset-0 pointer-events-none z-20">
      {ANNOTATIONS.map((ann, i) => {
        const isLeft = ann.side === "left";
        return (
          <motion.span
            key={i}
            className="absolute w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: "var(--accent)",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(249, 115, 22, 0.4)",
              top: `${ann.cardY}%`,
              left: isLeft ? "-10px" : undefined,
              right: isLeft ? undefined : "-10px",
              transform: "translateY(-50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
          >
            {i + 1}
          </motion.span>
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

  const cardDesign: Partial<CardDesign> = {
    organization_name: t("card.orgName"),
    background_color: "#2C1810",
    stamp_filled_color: "#D4A574",
    icon_color: "#ffffff",
    stamp_icon: "coffee",
    reward_icon: "gift",
    total_stamps: 8,
    secondary_fields: [
      { key: "reward", label: t("card.rewardLabel"), value: t("card.rewardValue") },
      { key: "points", label: "Points", value: "5/8" },
    ],
  };

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

        <ScrollReveal className="max-w-3xl mx-auto">
          <div className="relative">
            {/* The card */}
            <div className="relative z-10 mx-auto max-w-[300px]">
              <MobileAnnotations />
              <ScaledCardWrapper baseWidth={300}>
                <WalletCard
                  design={cardDesign}
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
