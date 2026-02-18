"use client";

import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Link } from "@/i18n/navigation";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { ArrowRightIcon } from "../icons";
import { Gift, Lightning } from "@phosphor-icons/react";
import type { StampIconType } from "@/components/onboarding/StampIconPicker";

const sectorThemes: {
  bg: string;
  accent: string;
  icon: string;
  stamps: number;
  stampIcon: StampIconType;
  orgName: string;
}[] = [
  { bg: "#1c1c1e", accent: "#f97316", icon: "#ffffff", stamps: 10, stampIcon: "coffee", orgName: "Mon Café" },
  { bg: "#F5E6D3", accent: "#8B4513", icon: "#ffffff", stamps: 8, stampIcon: "heart", orgName: "Boulangerie Marie" },
  { bg: "#F8E8F0", accent: "#D4688E", icon: "#ffffff", stamps: 6, stampIcon: "flower", orgName: "Fleur de Thé" },
  { bg: "#1A2332", accent: "#60A5FA", icon: "#ffffff", stamps: 10, stampIcon: "star", orgName: "Le Comptoir Bleu" },
];

export function SectorCards() {
  const t = useTranslations("landing.sectorCards");

  const sectors = t.raw("sectors") as Array<{
    name: string;
    quote: string;
    reward: string;
    advantage: string;
    link: string;
    linkLabel: string;
  }>;

  return (
    <section className="py-20 sm:py-28 lg:py-36 relative">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t.rich("title", {
              br: () => <br className="hidden md:block" />,
              mbr: () => <br className="md:hidden" />,
            })}
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            {t.rich("subtitle", {
              br: () => <br className="hidden md:block" />,
            })}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sectors.map((sector, index) => {
            const theme = sectorThemes[index];
            return (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-white blog-card-3d rounded-2xl p-6 flex flex-col gap-5">
                  {/* Mini wallet card */}
                  <div className="flex items-start gap-5">
                    <div className="w-[140px] flex-shrink-0">
                      <ScaledCardWrapper baseWidth={280} targetWidth={140}>
                        <WalletCard
                          design={{
                            background_color: theme.bg,
                            stamp_filled_color: theme.accent,
                            icon_color: theme.icon,
                            stamp_icon: theme.stampIcon,
                            total_stamps: theme.stamps,
                            organization_name: theme.orgName,
                          }}
                          stamps={Math.floor(theme.stamps * 0.6)}
                          showQR={false}
                          showSecondaryFields={false}
                          interactive3D
                        />
                      </ScaledCardWrapper>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                        {sector.name}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed italic">
                        &ldquo;{sector.quote}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-3.5 h-3.5 text-[var(--accent)]" weight="fill" />
                      </div>
                      <span className="text-[var(--foreground)]">{sector.reward}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        <Lightning className="w-3.5 h-3.5 text-[var(--accent)]" weight="fill" />
                      </div>
                      <span className="text-[var(--muted-foreground)]">{sector.advantage}</span>
                    </div>
                  </div>

                  {/* Blog link */}
                  <Link
                    href={sector.link as "/blog/carte-fidelite-cafe"}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline mt-auto"
                  >
                    {sector.linkLabel}
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
