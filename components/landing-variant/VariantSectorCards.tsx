import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { customConfigFor } from "@/lib/custom-stamp-presets";
import { SectorCarousel, type SectorTheme } from "./SectorCarousel";

// Order MUST match sectors[] in every messages/{locale}/landing.json:
// [0] Café (stamps) · [1] Restaurant (points) · [2] Salon (stamps) ·
// [3] Boulangerie (stamps, custom icons) · [4] Boutique/Retail (points).
// The info shown on each wallet card (member name, next reward, banked
// rewards…) comes from the sector's `field` in landing.json so it rotates
// per slide and stays localized.
const themes: SectorTheme[] = [
  // [0] Café — moody specialty coffee bar (stamps: fixed-price repeat visits)
  {
    engine: "stamp",
    cardBg: "#12100E",
    cardText: "#F5F5F4",
    cardMuted: "rgba(245,245,244,0.6)",
    accentPill: "rgba(217,119,6,0.22)",
    walletBg: "#1F1B18",
    walletAccent: "#D97706",
    walletIcon: "#FFF7ED",
    walletOrgName: "Atelier Nocturne",
    walletStamps: 10,
    walletStampIcon: "coffee",
  },
  // [1] Restaurant — upscale bistro (points: variable ticket size)
  {
    engine: "points",
    cardBg: "#111827",
    cardText: "#F9FAFB",
    cardMuted: "rgba(249,250,251,0.6)",
    accentPill: "rgba(192,132,252,0.18)",
    walletBg: "#1F2937",
    walletAccent: "#C084FC",
    walletIcon: "#FFFFFF",
    walletOrgName: "L’Atelier 17",
    pointsStripStyle: "big_point",
    pointsRewards: [
      { id: "r1", name: "a", threshold: 80 },
      { id: "r2", name: "b", threshold: 150 },
      { id: "r3", name: "c", threshold: 300 },
    ],
    pointsBalance: 95,
  },
  // [2] Salon de coiffure — soft boutique-salon palette (stamps: per-visit)
  {
    engine: "stamp",
    cardBg: "#F5ECE4",
    cardText: "#2A1F1A",
    cardMuted: "rgba(42,31,26,0.6)",
    accentPill: "rgba(193,108,80,0.18)",
    walletBg: "#EADBD0",
    walletAccent: "#C16C50",
    walletIcon: "#FFFFFF",
    walletOrgName: "Studio Mireille",
    walletStamps: 6,
    walletStampIcon: "scissors",
  },
  // [3] Boulangerie — CUSTOM uploaded croissant icons (stamps: daily visit)
  {
    engine: "stamp",
    cardBg: "#F2E3C6",
    cardText: "#2F2419",
    cardMuted: "rgba(47,36,25,0.6)",
    accentPill: "rgba(180,83,9,0.18)",
    walletBg: "#E7D3A8",
    walletAccent: "#B45309",
    walletIcon: "#FFFDF7",
    walletOrgName: "Le Four d’Antan",
    walletStamps: 8,
    customStampConfig: customConfigFor(["croissant"], {
      arrangement: "straight",
      empty_mode: "greyscale",
    }),
  },
  // [4] Boutique / retail — variable basket (points: reward spend, not visits)
  {
    engine: "points",
    cardBg: "#141B2E",
    cardText: "#EEF2FF",
    cardMuted: "rgba(238,242,255,0.6)",
    accentPill: "rgba(96,165,250,0.20)",
    walletBg: "#1E293B",
    walletAccent: "#60A5FA",
    walletIcon: "#FFFFFF",
    walletOrgName: "Maison Lila",
    pointsStripStyle: "circle_progress",
    pointsRewards: [
      { id: "r1", name: "a", threshold: 100 },
      { id: "r2", name: "b", threshold: 200 },
      { id: "r3", name: "c", threshold: 400 },
    ],
    pointsBalance: 130,
  },
];

export async function VariantSectorCards() {
  const t = await getTranslations("landing.sectorCards");
  const tc = await getTranslations("common");

  const sectors = t.raw("sectors") as Array<{
    name: string;
    quote: string;
    reward: string;
    advantage: string;
    field?: { label: string; value: string };
    link: string;
    linkLabel: string;
  }>;

  const slides = sectors.flatMap((sector, index) => {
    const theme = themes[index];
    return theme ? [{ ...sector, theme }] : [];
  });

  return (
    <section className="py-20 sm:py-28 lg:py-32 relative">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t.rich("title", {
              br: () => <br className="hidden md:block" />,
              mbr: () => <br className="md:hidden" />,
            })}
          </h2>
          <p className="mt-5 text-lg text-[var(--muted-foreground)]">
            {t.rich("subtitle", {
              br: () => <br className="hidden md:block" />,
            })}
          </p>
        </ScrollReveal>
      </Container>

      {/* Carousel sits outside the Container: edge-to-edge, side slides peek in */}
      <ScrollReveal delay={150}>
        <SectorCarousel
          slides={slides}
          engineLabels={{ stamp: tc("stamps"), points: tc("points") }}
          controls={{ prev: t("carousel.prev"), next: t("carousel.next") }}
        />
      </ScrollReveal>
    </section>
  );
}
