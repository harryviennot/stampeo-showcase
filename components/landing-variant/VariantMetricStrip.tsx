import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Container } from "../ui/Container";

/**
 * Hard numbers instead of quotes. These are maintained by hand in
 * messages/{locale}/landing.json → variant.metrics; every value must be one we
 * can actually stand behind, so bump them when the real figures move.
 *
 * Two rules for choosing what goes here, both learned the hard way:
 *
 *   Round down, never up. A rounded-down number stays true for months without
 *   anyone remembering to edit it, which is the only way a hand-maintained
 *   strip survives contact with a busy week.
 *
 *   No two values that divide into an unflattering ratio. Cards and scans
 *   together invite the reader to work out scans-per-card; scans and merchants
 *   say the same thing about the same business and read far better. The grid
 *   takes any number of items, so drop one rather than pad the row.
 */
export async function VariantMetricStrip() {
  const t = await getTranslations("variant.metrics");
  const items = t.raw("items") as Array<{ value: string; label: string }>;

  return (
    <section className="py-16 lg:py-24 border-y border-[var(--border)] bg-[var(--cream)]/40">
      <Container>
        {/* No subtitle. The title says what the section is and three
            handwritten figures need no introduction; every line we tried here
            described the numbers rather than saying anything. */}
        <ScrollReveal className="flex flex-col items-center text-center mb-12">
          <h2 className="text-h2">{t("title")}</h2>
        </ScrollReveal>

        <ScrollReveal
          delay={150}
          className="grid grid-cols-3 gap-4 sm:gap-6"
        >
          {items.map((item, i) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-1">
              <dl>
                {/* Written in the same ink as the margin notes: these are
                    numbers a person counted, and they should look it. The
                    tilt alternates so three figures in a row do not line up
                    like type. */}
                <dd
                  className="ink-figure mb-2"
                  style={{ transform: `rotate(${[-2, 1.5, -1][i % 3]}deg)` }}
                >
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
