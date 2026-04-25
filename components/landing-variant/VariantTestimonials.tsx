import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { StarIcon } from "../icons";

/**
 * Testimonials are placeholders. Replace with real merchant quotes
 * (full name + business + city + photo + concrete before/after)
 * in messages/fr/landing.json → variant.testimonials.items.
 */
export async function VariantTestimonials() {
  const t = await getTranslations("variant.testimonials");
  const items = t.raw("items") as Array<{
    quote: string;
    name: string;
    role: string;
    business: string;
    city: string;
  }>;

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal className="flex flex-col items-center text-center mb-16 gap-4">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight max-w-3xl">
            {t("title")}
          </h2>
          <p className="text-[var(--muted-foreground)] text-lg max-w-2xl">
            {t("subtitle")}
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs italic text-amber-600 mt-1">
              ⚠️ {t("placeholderNote")}
            </p>
          )}
        </ScrollReveal>

        <ScrollReveal delay={200} className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col gap-5 p-7 md:p-8 bg-white rounded-2xl blog-card-3d"
            >
              <div className="flex gap-1 text-[var(--accent)]">
                {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                  <StarIcon key={k} weight="fill" className="w-4 h-4" />
                ))}
              </div>
              <blockquote className="text-[var(--foreground)] text-base md:text-lg leading-relaxed font-medium">
                « {item.quote} »
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                <div
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-base font-bold"
                >
                  {item.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[var(--foreground)] truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] truncate">
                    {item.role}, {item.city}
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
