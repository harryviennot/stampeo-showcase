import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Link } from "@/i18n/navigation";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { ArrowRightIcon } from "../icons";
import type { StampIconType } from "@/components/onboarding/StampIconPicker";
import type { PassField } from "@/lib/types/design";

type Theme = {
  cardBg: string;
  cardText: string;
  cardMuted: string;
  accentPill: string;
  walletBg: string;
  walletAccent: string;
  walletIcon: string;
  walletStamps: number;
  walletStampIcon: StampIconType;
  walletOrgName: string;
  walletSecondaryFields: PassField[];
};

// Order matches FR sectors[] in messages/fr/landing.json:
// [0] Café · [1] Boulangerie · [2] Salon de coiffure · [3] Restaurant
const themes: Theme[] = [
  // [0] Café — moody, specialty coffee bar
  {
    cardBg: "#12100E",
    cardText: "#F5F5F4",
    cardMuted: "rgba(245,245,244,0.6)",
    accentPill: "rgba(217,119,6,0.22)",
    walletBg: "#1F1B18",
    walletAccent: "#D97706",
    walletIcon: "#FFF7ED",
    walletStamps: 9,
    walletStampIcon: "coffee",
    walletOrgName: "Atelier Nocturne",
    walletSecondaryFields: [
      { key: "reward", label: "RÉCOMPENSE", value: "Café offert au 10ème" },
    ],
  },
  // [1] Boulangerie — rustic artisan bakery
  {
    cardBg: "#F2E3C6",
    cardText: "#2F2419",
    cardMuted: "rgba(47,36,25,0.6)",
    accentPill: "rgba(180,83,9,0.18)",
    walletBg: "#E7D3A8",
    walletAccent: "#B45309",
    walletIcon: "#FFFDF7",
    walletStamps: 7,
    walletStampIcon: "bread",
    walletOrgName: "Le Four d’Antan",
    walletSecondaryFields: [
      { key: "reward", label: "RÉCOMPENSE", value: "Pain au chocolat au 7ème" },
    ],
  },
  // [2] Salon de coiffure — TODO: theme below was authored as a tea-house
  // ("Maison Verveine" + leaf icon). Mismatched with the FR sector copy
  // (Salon de coiffure). Either swap to a salon-friendly wallet design
  // (scissors icon, salon-style name) or rename the JSON sector to
  // "Salon de thé" / something matching the visual intent.
  {
    cardBg: "#EEF3EC",
    cardText: "#243326",
    cardMuted: "rgba(36,51,38,0.6)",
    accentPill: "rgba(134,154,120,0.2)",
    walletBg: "#DDE6DA",
    walletAccent: "#869A78",
    walletIcon: "#FFFFFF",
    walletStamps: 6,
    walletStampIcon: "leaf",
    walletOrgName: "Maison Verveine",
    walletSecondaryFields: [
      { key: "reward", label: "RÉCOMPENSE", value: "-20% au 6ème achat" },
    ],
  },
  // [3] Restaurant — modern, slightly upscale bistro
  {
    cardBg: "#111827",
    cardText: "#F9FAFB",
    cardMuted: "rgba(249,250,251,0.6)",
    accentPill: "rgba(192,132,252,0.18)",
    walletBg: "#1F2937",
    walletAccent: "#C084FC",
    walletIcon: "#FFFFFF",
    walletStamps: 12,
    walletStampIcon: "food",
    walletOrgName: "L’Atelier 17",
    walletSecondaryFields: [
      { key: "reward", label: "RÉCOMPENSE", value: "Dessert offert au 12ème" },
    ],
  },
];

export async function VariantSectorCards() {
  const t = await getTranslations("landing.sectorCards");

  const sectors = t.raw("sectors") as Array<{
    name: string;
    quote: string;
    reward: string;
    advantage: string;
    link: string;
    linkLabel: string;
  }>;

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {sectors.map((sector, index) => {
            const theme = themes[index];
            return (
              <ScrollReveal key={sector.name} delay={index * 80}>
                <Link
                  href={sector.link as "/blog/carte-fidelite-cafe"}
                  className="group relative flex flex-col h-full rounded-3xl overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                  style={{ backgroundColor: theme.cardBg, color: theme.cardText }}
                >
                  <div
                    className="flex items-center justify-center pt-6 pb-4 px-3 lg:pt-8 lg:pb-6 lg:px-4"
                    style={{
                      background:
                        `radial-gradient(circle at 50% 0%, ${theme.walletBg} 0%, transparent 70%)`,
                    }}
                  >
                    <div
                      className="transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105"
                      style={{ transform: "rotate(-4deg)" }}
                    >
                      <ScaledCardWrapper targetWidth={140}>
                        <WalletCard
                          design={{
                            background_color: theme.walletBg,
                            stamp_filled_color: theme.walletAccent,
                            icon_color: theme.walletIcon,
                            stamp_icon: theme.walletStampIcon,
                            total_stamps: theme.walletStamps,
                            organization_name: theme.walletOrgName,
                            secondary_fields: theme.walletSecondaryFields,
                          }}
                          stamps={Math.floor(theme.walletStamps * 0.6)}
                          showQR={false}
                        />
                      </ScaledCardWrapper>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 px-5 pb-5 pt-2 flex-1 lg:gap-3 lg:px-6 lg:pb-6">
                    <h3 className="text-2xl font-extrabold tracking-tight">
                      {sector.name}
                    </h3>
                    <span
                      className="inline-flex self-start items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                      style={{ backgroundColor: theme.accentPill, color: theme.cardText }}
                    >
                      {sector.reward}
                    </span>
                    <p
                      className="text-sm leading-relaxed italic line-clamp-4"
                      style={{ color: theme.cardMuted }}
                    >
                      « {sector.quote} »
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-bold mt-auto group-hover:gap-2.5 transition-all"
                      style={{ color: theme.cardText }}
                    >
                      {sector.linkLabel}
                      <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
