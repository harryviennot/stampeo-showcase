"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { STAMP_SAMPLES, POINTS_SAMPLES } from "@/lib/loyalty-samples";
import type { CardDesign } from "@/lib/types/design";

/** Color overrides applied on top of a sample design — one full card theme.
 *  Hand-tuned per brand, mirroring what the real editor generates from an
 *  uploaded logo's palette. Backgrounds stay in the same lightness family so
 *  the brand's wordmark logo remains legible in every variant. */
type ThemeVariant = Partial<CardDesign>;

interface LogoBrand {
  id: string;
  logoUrl: string;
  kind: "stamp" | "points";
  /** Wordmark is light-on-dark: render its picker chip on the card color. */
  darkLogo?: boolean;
  variants: ThemeVariant[];
}

const BRANDS: LogoBrand[] = [
  // NOTE: only brands whose stamps are preset icons or points strips — those
  // recolor fully from the design colors. Custom-icon brands (pulp, lustre)
  // ship pre-colored SVGs, so a theme swap would only change the background.
  {
    id: "patoune",
    logoUrl: "/themes/patoune/logo.svg",
    kind: "stamp",
    darkLogo: true,
    variants: [
      { background_color: "#0F766E", stamp_filled_color: "#FFF7ED", icon_color: "#0F766E" },
      { background_color: "#312E81", stamp_filled_color: "#E0E7FF", icon_color: "#312E81" },
      { background_color: "#7C2D12", stamp_filled_color: "#FFEDD5", icon_color: "#7C2D12" },
    ],
  },
  {
    id: "marginalia",
    logoUrl: "/themes/marginalia/logo.svg",
    kind: "points",
    darkLogo: true,
    variants: [
      {
        background_color: "#14432E",
        foreground_color: "#F3E9D6",
        label_color: "#E4C67A",
        progress_accent_color: "#E4C67A",
      },
      {
        background_color: "#1E293B",
        foreground_color: "#E2E8F0",
        label_color: "#7DD3FC",
        progress_accent_color: "#7DD3FC",
      },
      {
        background_color: "#3B0764",
        foreground_color: "#F3E8FF",
        label_color: "#C084FC",
        progress_accent_color: "#C084FC",
      },
    ],
  },
  {
    id: "forme",
    logoUrl: "/themes/forme/logo.svg",
    kind: "points",
    darkLogo: true,
    variants: [
      {
        background_color: "#0D0D0F",
        foreground_color: "#FFFFFF",
        label_color: "#C6F24E",
        progress_accent_color: "#C6F24E",
      },
      {
        background_color: "#0B1622",
        foreground_color: "#FFFFFF",
        label_color: "#38BDF8",
        progress_accent_color: "#38BDF8",
      },
      {
        background_color: "#170F0B",
        foreground_color: "#FFF7ED",
        label_color: "#FB923C",
        progress_accent_color: "#FB923C",
      },
    ],
  },
  {
    id: "salon",
    logoUrl: "/themes/salon/logo.png",
    kind: "points",
    variants: [
      {
        background_color: "#FADCE7",
        foreground_color: "#8A1150",
        label_color: "#B24A7B",
        progress_accent_color: "#D6006E",
      },
      {
        background_color: "#FFE9D9",
        foreground_color: "#7C2D12",
        label_color: "#B45309",
        progress_accent_color: "#EA580C",
      },
      {
        background_color: "#EFE7FA",
        foreground_color: "#4C1D95",
        label_color: "#7C3AED",
        progress_accent_color: "#7C3AED",
      },
    ],
  },
];

function variantSwatch(v: ThemeVariant): [string, string] {
  return [
    v.background_color ?? "#ffffff",
    v.stamp_filled_color ?? v.progress_accent_color ?? "#000000",
  ];
}

export function LogoThemesSection() {
  const t = useTranslations("features.design-de-carte.logoThemes");
  const [brandIndex, setBrandIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);

  const brand = BRANDS[brandIndex];
  const variant = brand.variants[variantIndex] ?? brand.variants[0];

  const sample =
    brand.kind === "stamp"
      ? STAMP_SAMPLES.find((s) => s.id === brand.id)
      : POINTS_SAMPLES.find((p) => p.id === brand.id);
  if (!sample) return null;

  const design = { ...sample.design, ...variant };

  return (
    <section className="py-16 sm:py-24 bg-[var(--blog-bg-alt)]">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t("description")}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Controls */}
          <ScrollReveal className="order-2 lg:order-1">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">
                  {t("brandLabel")}
                </p>
                <div className="flex flex-wrap gap-3">
                  {BRANDS.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBrandIndex(i);
                        setVariantIndex(0);
                      }}
                      aria-pressed={i === brandIndex}
                      className={`flex h-14 w-24 items-center justify-center rounded-xl border bg-white p-2.5 shadow-sm transition-all ${
                        i === brandIndex
                          ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/25"
                          : "border-[var(--border)] hover:border-[var(--accent)]/50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.logoUrl}
                        alt={b.id}
                        className="max-h-full max-w-full object-contain"
                        style={
                          b.darkLogo
                            ? {
                                backgroundColor: b.variants[0].background_color,
                                borderRadius: 6,
                                padding: 3,
                              }
                            : undefined
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[var(--muted-foreground)] mb-3">
                  {t("paletteLabel")}
                </p>
                <div className="flex gap-3">
                  {brand.variants.map((v, i) => {
                    const [bg, accent] = variantSwatch(v);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setVariantIndex(i)}
                        aria-pressed={i === variantIndex}
                        aria-label={`${t("paletteLabel")} ${i + 1}`}
                        className={`flex items-center gap-1.5 rounded-full border bg-white px-3 py-2 shadow-sm transition-all ${
                          i === variantIndex
                            ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/25"
                            : "border-[var(--border)] hover:border-[var(--accent)]/50"
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-black/10"
                          style={{ backgroundColor: bg }}
                        />
                        <span
                          className="h-5 w-5 rounded-full border border-black/10"
                          style={{ backgroundColor: accent }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-[var(--muted-foreground)]">{t("hint")}</p>
            </div>
          </ScrollReveal>

          {/* Live card */}
          <ScrollReveal variant="right" className="order-1 lg:order-2 flex justify-center">
            <motion.div
              key={`${brand.id}-${variantIndex}`}
              className="w-full max-w-[300px]"
              initial={{ opacity: 0.6, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <ScaledCardWrapper baseWidth={300}>
                {brand.kind === "stamp" ? (
                  <WalletCard
                    design={design}
                    stamps={(sample as (typeof STAMP_SAMPLES)[number]).stamps}
                    showQR={false}
                  />
                ) : (
                  <WalletCard
                    design={design}
                    pointsBalance={(sample as (typeof POINTS_SAMPLES)[number]).pointsBalance}
                    pointsRewards={(sample as (typeof POINTS_SAMPLES)[number]).pointsRewards}
                    showQR={false}
                  />
                )}
              </ScaledCardWrapper>
            </motion.div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
