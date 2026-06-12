"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  StampIconSvg,
  type StampIconType,
} from "@/components/onboarding/StampIconPicker";

/** A diverse, cross-trade curation from the full catalog — enough to read as
 *  "there's one for every business" without dumping the whole registry. */
const SHOWCASE_ICONS: StampIconType[] = [
  "coffee", "tea", "bread", "food", "hamburger", "pizza",
  "ice-cream", "beer-stein", "martini", "cookie", "scissors", "flower",
  "leaf", "paw", "cat", "dog", "bone", "shopping",
  "tag", "dress", "t-shirt", "sneaker", "sunglasses", "book",
  "guitar", "headphones", "game-controller", "bicycle", "gift", "trophy",
  "crown", "diamond", "star", "heart", "sparkle", "percent",
];

/** Icons paired with the trade labels in i18n (same order, same length). */
const TRADE_ICONS: StampIconType[] = ["coffee", "food", "scissors", "flower", "paw"];

export function IconLibrarySection() {
  const t = useTranslations("features.design-de-carte.custom.iconLibrary");
  const trades = t.raw("trades") as string[];

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

        {/* Catalog */}
        <ScrollReveal className="max-w-2xl mx-auto">
          <motion.div
            className="flex flex-wrap justify-center gap-2.5 sm:gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ staggerChildren: 0.015 }}
          >
            {SHOWCASE_ICONS.map((id) => (
              <motion.div
                key={id}
                variants={{
                  hidden: { opacity: 0, scale: 0.6 },
                  show: { opacity: 1, scale: 1 },
                }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-white border border-[var(--accent)]/10 shadow-sm"
              >
                <StampIconSvg
                  icon={id}
                  className="w-5 h-5 sm:w-[22px] sm:h-[22px]"
                  color="var(--accent)"
                />
              </motion.div>
            ))}
          </motion.div>
        </ScrollReveal>

        {/* Trade examples */}
        <ScrollReveal className="max-w-2xl mx-auto mt-10" delay={100}>
          <div className="flex flex-wrap justify-center gap-2.5">
            {trades.map((label, i) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-[var(--accent)]/10 px-3.5 py-1.5 text-sm font-medium text-[var(--foreground)]"
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <StampIconSvg
                    icon={TRADE_ICONS[i % TRADE_ICONS.length]}
                    className="w-3.5 h-3.5"
                    color="#ffffff"
                  />
                </span>
                {label}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
