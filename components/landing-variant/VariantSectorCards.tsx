import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SectorCarousel, type SectorTheme } from "./SectorCarousel";

// Real, hand-designed cards for three sample businesses — logos, colors and
// strip artwork all match how the owner would actually set them up. Order MUST
// match sectors[] in every messages/{locale}/landing.json:
// [0] Barbershop (stamps) · [1] Café (stamps, custom cup icons) ·
// [2] Restaurant (points) · [3] Beauty salon (points).
// The card fields (reward, cardholder name, next milestone…) come from the
// sector's `fields` in landing.json so they stay localized.
const themes: SectorTheme[] = [
  // [0] Les Garçons Barbiers — classic barbershop. Crisp white card, near-black
  // scissor stamps, a gift on the final reward slot. Framed in warm charcoal
  // and brass so the white card pops.
  {
    engine: "stamp",
    cardBg: "#14110E",
    cardText: "#F4EFE9",
    cardMuted: "rgba(244,239,233,0.6)",
    accent: "#C9A15B",
    accentPill: "rgba(201,161,91,0.16)",
    walletBg: "#FFFFFF",
    walletAccent: "#040404",
    walletIcon: "#FFFFFF",
    walletText: "#343434",
    walletLabel: "#040404",
    walletLogoUrl: "/themes/barber/logo.avif",
    walletStamps: 6,
    walletFilled: 6, // reward slot filled → the gift shows
    walletStampIcon: "scissors",
    walletRewardIcon: "gift",
  },
  // [1] Aurevo — specialty café on stamps, using the brand's own to-go cup as a
  // custom uploaded icon. Coffee-brown card with the white wordmark; 8 cups
  // staggered across two rows, empty slots in greyscale. Framed in oat cream
  // and caramel to match the brown card.
  {
    engine: "stamp",
    cardBg: "#F4ECE0",
    cardText: "#2A2018",
    cardMuted: "rgba(42,32,24,0.62)",
    accent: "#A9743E",
    accentPill: "rgba(169,116,62,0.16)",
    walletBg: "#4b2e2b",
    walletAccent: "#3A2416",
    walletIcon: "#FFFFFF",
    walletLogoUrl: "/themes/cafe/logo.png",
    walletStamps: 8,
    customStampConfig: {
      icons: [
        {
          id: "aurevo-cup",
          original_url: "/themes/cafe/cup.png",
          processed_url: "/themes/cafe/cup.png",
          greyscale_url: "/themes/cafe/cup-grey.png",
          outline_url: "/themes/cafe/cup-grey.png",
          bg_removed: true,
        },
      ],
      reward_icon: null,
      empty_icon: null,
      empty_mode: "greyscale",
      arrangement: "overlap",
      empty_opacity: 80,
    },
  },
  // [2] Xeniká — Greek restaurant on points. White card, blue wordmark + blue
  // fields, and a full-bleed food photo as the strip (image_only, no overlay).
  // Framed in deep Aegean blue.
  {
    engine: "points",
    cardBg: "#0A2C4D",
    cardText: "#EAF3FB",
    cardMuted: "rgba(234,243,251,0.62)",
    accent: "#4BA3E0",
    accentPill: "rgba(75,163,224,0.18)",
    walletBg: "#FFFFFF",
    walletAccent: "#0C64A4",
    walletIcon: "#FFFFFF",
    walletText: "#0C64A4",
    walletLabel: "#0C64A4",
    walletLogoUrl: "/themes/restaurant/logo.png",
    pointsStripStyle: "image_only",
    pointsBalance: 75,
    pointsRewards: [{ id: "r1", name: "", threshold: 100 }],
    stripBgColor: "#FFFFFF",
    stripImageUrl: "/themes/restaurant/strip.jpg",
    stripImageOpacity: 100,
  },
  // [3] Vanity — beauty/nail salon on points. Soft blush card carries the
  // cerise wordmark; a white strip holds a circle-progress ring in the brand
  // magenta. Framed in deep berry so the blush card reads.
  {
    engine: "points",
    cardBg: "#2B0A1E",
    cardText: "#F9E9F1",
    cardMuted: "rgba(249,233,241,0.62)",
    accent: "#F08BB2",
    accentPill: "rgba(240,139,178,0.16)",
    walletBg: "#FADCE7",
    walletAccent: "#D6006E",
    walletIcon: "#FFFFFF",
    walletText: "#8A1150",
    walletLabel: "#B24A7B",
    walletLogoUrl: "/themes/salon/logo.png",
    pointsStripStyle: "circle_progress",
    pointsBalance: 65,
    pointsRewards: [
      { id: "r1", name: "", threshold: 80 },
      { id: "r2", name: "", threshold: 150 },
      { id: "r3", name: "", threshold: 300 },
    ],
    stripBgColor: "#FFFFFF",
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
    fields?: Array<{ label: string; value: string }>;
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
