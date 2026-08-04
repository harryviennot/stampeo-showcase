import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Container } from "../ui/Container";

/**
 * Hard numbers instead of quotes. These are maintained by hand in
 * messages/{locale}/landing.json → variant.metrics; every value must be one we
 * can actually stand behind, so bump them when the real figures move.
 */
export async function VariantMetricStrip() {
  const t = await getTranslations("variant.metrics");
  const items = t.raw("items") as Array<{ value: string; label: string }>;

  return (
    <section className="py-16 lg:py-24 border-y border-[var(--border)] bg-[var(--cream)]/40">
      <Container>
        <ScrollReveal className="flex flex-col items-center text-center gap-3 mb-12">
          <h2 className="text-h2">{t("title")}</h2>
          <p className="text-lead text-[var(--muted-foreground)] max-w-2xl">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal
          delay={150}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6"
        >
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-1">
              <dl>
                <dd className="text-h1 tabular-nums text-[var(--foreground)]">
                  {item.value}
                </dd>
                <dt className="text-sm text-[var(--muted-foreground)]">
                  {item.label}
                </dt>
              </dl>
            </div>
          ))}
        </ScrollReveal>
      </Container>
    </section>
  );
}
