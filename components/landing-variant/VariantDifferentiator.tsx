import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CheckIcon } from "../icons";

export async function VariantDifferentiator() {
  const t = await getTranslations("variant.differentiator");
  const items = t.raw("items") as Array<{ title: string; description: string }>;

  return (
    <section className="relative py-24 lg:py-32 bg-[var(--blog-bg-alt)]">
      <div className="max-w-[1100px] mx-auto px-6">
        <ScrollReveal className="flex flex-col items-center text-center mb-16 gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl">
            {t("title")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 md:gap-5 p-6 md:p-8 bg-white rounded-2xl blog-card-3d"
            >
              <div className="flex shrink-0 h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                <CheckIcon weight="bold" className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg md:text-xl font-bold leading-tight">
                  {item.title}
                </h3>
                <p className="text-[var(--muted-foreground)] text-sm md:text-base font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
