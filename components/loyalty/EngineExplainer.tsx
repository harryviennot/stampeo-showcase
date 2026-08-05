import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { STAMP_SAMPLES, POINTS_SAMPLES } from "@/lib/loyalty-samples";

function EngineCard({
  badge,
  tagline,
  how,
  bestFor,
  accent,
  labels,
  children,
}: {
  badge: string;
  tagline: string;
  how: string;
  bestFor: string;
  accent: string;
  labels: { how: string; bestFor: string };
  children: React.ReactNode;
}) {
  return (
    <div className="paper-card h-full rounded-3xl bg-white p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex items-center justify-center pt-2 pb-4">
        <div className="w-[240px]">{children}</div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white"
          style={{ backgroundColor: accent }}
        >
          {badge}
        </span>
        <span className="text-[var(--muted-foreground)] font-medium">{tagline}</span>
      </div>
      <div className="flex flex-col gap-4 text-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {labels.how}
          </p>
          <p className="text-[var(--foreground)] leading-relaxed">{how}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            {labels.bestFor}
          </p>
          <p className="text-[var(--foreground)] leading-relaxed">{bestFor}</p>
        </div>
      </div>
    </div>
  );
}

export async function EngineExplainer() {
  const t = await getTranslations("loyalty");
  // Aurevo (café) is the most relatable "stamps" example — coffee loyalty is the
  // canonical stamp card. Select by id so the gallery order (and its
  // index-zipped captions) stays untouched.
  const stamp = STAMP_SAMPLES.find((s) => s.id === "aurevo") ?? STAMP_SAMPLES[0];
  const points = POINTS_SAMPLES[0];
  const rows = t.raw("comparison.rows") as Array<{
    criteria: string;
    stamps: string;
    points: string;
  }>;

  return (
    // overflow-x-clip: the left/right reveal variants translate off-canvas
    // before entering the viewport and would widen the page on phones.
    <section className="py-20 sm:py-28 bg-[var(--blog-bg-alt)] overflow-x-clip">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-h2 text-[var(--foreground)]">
            {t("engines.heading")}
          </h2>
          <p className="mt-5 text-lead text-[var(--muted-foreground)]">
            {t("engines.subheading")}
          </p>
        </ScrollReveal>

        {/* items-stretch + h-full so both cards share the taller card's height */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch max-w-4xl mx-auto">
          <ScrollReveal variant="left" className="h-full">
            <EngineCard
              badge={t("engines.stamps.name")}
              tagline={t("engines.stamps.tagline")}
              how={t("engines.stamps.how")}
              bestFor={t("engines.stamps.bestFor")}
              accent="#f97316"
              labels={{ how: t("engines.labelHow"), bestFor: t("engines.labelBestFor") }}
            >
              <ScaledCardWrapper size="md">
                <WalletCard design={stamp.design} stamps={stamp.stamps} showQR={false} interactive3D />
              </ScaledCardWrapper>
            </EngineCard>
          </ScrollReveal>
          <ScrollReveal variant="right" delay={120} className="h-full">
            <EngineCard
              badge={t("engines.points.name")}
              tagline={t("engines.points.tagline")}
              how={t("engines.points.how")}
              bestFor={t("engines.points.bestFor")}
              accent="#8b5cf6"
              labels={{ how: t("engines.labelHow"), bestFor: t("engines.labelBestFor") }}
            >
              <ScaledCardWrapper size="md">
                <WalletCard
                  design={points.design}
                  pointsBalance={points.pointsBalance}
                  pointsRewards={points.pointsRewards}
                  showQR={false}
                  interactive3D
                />
              </ScaledCardWrapper>
            </EngineCard>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="scale" className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-center text-h2 tracking-tight text-[var(--foreground)]">
            {t("comparison.title")}
          </h3>
          <p className="text-center text-[var(--muted-foreground)] mt-2 mb-8">
            {t("comparison.subtitle")}
          </p>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-4 text-left font-semibold text-[var(--muted-foreground)]"></th>
                  <th className="p-4 text-left font-bold text-[var(--foreground)]">
                    {t("comparison.stampsLabel")}
                  </th>
                  <th className="p-4 text-left font-bold text-[var(--foreground)]">
                    {t("comparison.pointsLabel")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="p-4 font-semibold text-[var(--foreground)] whitespace-nowrap">
                      {row.criteria}
                    </td>
                    <td className="p-4 text-[var(--muted-foreground)]">{row.stamps}</td>
                    <td className="p-4 text-[var(--muted-foreground)]">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
