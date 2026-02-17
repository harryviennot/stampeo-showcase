"use client";

import { useTranslations } from "next-intl";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Link } from "@/i18n/navigation";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { ArrowRightIcon } from "../icons";

const sectorThemes = [
  { bg: "#3C2415", accent: "#D4A574", stamps: 10 },
  { bg: "#F5E6D3", accent: "#C8956D", stamps: 8 },
  { bg: "#F8E8F0", accent: "#D4688E", stamps: 6 },
  { bg: "#1A2332", accent: "#4A90D9", stamps: 10 },
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
            {t("title")}
          </h2>
          <p className="mt-6 text-lg text-[var(--muted-foreground)]">
            {t("subtitle")}
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
                            total_stamps: theme.stamps,
                            organization_name: sector.name,
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
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--accent)] font-bold">🎁</span>
                      <span className="text-[var(--foreground)]">{sector.reward}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--accent)] font-bold">⚡</span>
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
