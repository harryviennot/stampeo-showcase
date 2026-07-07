import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { BUSINESS_ENGINE_MAP } from "@/lib/loyalty-picker";

export async function BusinessTypeMap() {
  const t = await getTranslations("loyalty.businessMap");
  const tc = await getTranslations("common");

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-5 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {BUSINESS_ENGINE_MAP.map(({ key, engine }, i) => {
            const isPoints = engine === "points";
            const accent = isPoints ? "#8b5cf6" : "#f97316";
            return (
              <ScrollReveal key={key} delay={i * 40} className="h-full">
                <div className="h-full rounded-2xl border border-[var(--border)] bg-white p-5 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[var(--foreground)] leading-tight">
                      {t(`items.${key}.label`)}
                    </h3>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {isPoints ? tc("points") : tc("stamps")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t(`items.${key}.rationale`)}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
