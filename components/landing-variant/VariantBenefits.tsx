import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { UserGroupIcon, ChartPieSliceIcon, BellIcon } from "../icons";

const icons = [UserGroupIcon, ChartPieSliceIcon, BellIcon];

export async function VariantBenefits() {
  const t = await getTranslations("variant.benefits");
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <section className="relative py-16 lg:py-24">
      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col items-center text-center mb-12 gap-4">
          <h2 className="text-h2 max-w-3xl">
            {t("title")}
          </h2>
          <p className="text-lead text-[var(--muted-foreground)] max-w-2xl">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((item, index) => {
            const Icon = icons[index] ?? icons[0];
            return (
              <div
                key={item.title}
                className="group relative flex flex-col gap-5 p-7 md:p-9 bg-white rounded-2xl card-stamp card-stamp-lift"
              >
                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-h3">
                    {item.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
