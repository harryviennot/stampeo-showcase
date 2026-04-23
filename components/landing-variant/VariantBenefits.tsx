import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { UserGroupIcon, SparklesIcon, BellIcon } from "../icons";

const icons = [UserGroupIcon, SparklesIcon, BellIcon];

export async function VariantBenefits() {
  const t = await getTranslations("variant.benefits");
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <section className="relative py-24 lg:py-32">
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <ScrollReveal className="flex flex-col items-center text-center mb-16 gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl">
            {t("title")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((item, index) => {
            const Icon = icons[index] ?? icons[0];
            return (
              <div
                key={item.title}
                className="group relative flex flex-col gap-5 p-7 md:p-9 bg-white rounded-2xl blog-card-3d transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] text-sm md:text-base font-medium leading-relaxed">
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
