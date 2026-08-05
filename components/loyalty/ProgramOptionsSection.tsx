import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SparklesIcon, Gift, TargetIcon, ArrowsClockwiseIcon } from "../icons";

const ITEM_ICONS = [SparklesIcon, Gift, TargetIcon, ArrowsClockwiseIcon];

/**
 * Light tour of the program settings that actually move the needle
 * (pre-stamping, banked rewards, reward rhythm, switching later), each with
 * one line of advice. Deliberately shallow: the goal is "these dials exist
 * and we'll guide you", not a configuration manual.
 */
export async function ProgramOptionsSection() {
  const t = await getTranslations("loyalty.options");
  const items = t.raw("items") as Array<{
    name: string;
    description: string;
    tip: string;
  }>;

  return (
    <section className="py-20 sm:py-28 bg-[var(--blog-bg)]">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-h2 text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-5 text-lead text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {items.map((item, i) => {
            const Icon = ITEM_ICONS[i % ITEM_ICONS.length];
            return (
              <ScrollReveal key={item.name} delay={i * 80} className="h-full">
                {/* paper-card matches the EngineCard idiom used above on this page */}
                <div className="paper-card flex h-full flex-col gap-4 rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                      <Icon className="w-5 h-5" />
                    </span>
                    <h3 className="text-lg font-bold text-[var(--foreground)]">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[var(--foreground)] leading-relaxed">
                    {item.description}
                  </p>
                  <p className="mt-auto rounded-xl bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground)] border border-[var(--card-border)]">
                    <span className="font-bold text-[var(--accent)]">
                      {t("tipLabel")}
                    </span>{" "}
                    {item.tip}
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
