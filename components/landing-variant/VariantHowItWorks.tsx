import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { NumberStamp } from "../stamps/StampIcons";
import { DoodleCard, DoodlePhoneScan, DoodleChart } from "../ui/InkDoodles";

// One ink for all three steps. The previous orange/pink/violet trio implied a
// meaning the steps do not have, and none of those hues are in the palette.
const stepColors = ["var(--accent)", "var(--accent)", "var(--accent)"];

/* One hand-sketched doodle per step; it draws itself in as the step reveals. */
const stepDoodles = [DoodleCard, DoodlePhoneScan, DoodleChart];

export async function VariantHowItWorks() {
  const t = await getTranslations("variant.howItWorks");
  const steps = (t.raw("steps") as Array<{ title: string; description: string }>).map(
    (step, index) => ({
      step: index + 1,
      title: step.title,
      description: step.description,
      color: stepColors[index],
    })
  );

  return (
    <section id="how-it-works" className="py-16 lg:py-24 relative bg-[var(--blog-bg-alt)]">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium mb-6">
            {t("badge")}
          </div>
          <h2 className="text-h2 text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-6 text-lead text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <div className="max-w-4xl mx-auto">
          {steps.map((item, index) => {
            const Doodle = stepDoodles[index];
            return (
              <ScrollReveal key={item.step} delay={index * 100} className="relative">
                <div className="flex gap-6 sm:gap-8 pb-12 last:pb-0">
                  <div className="flex flex-col items-center">
                    <NumberStamp color={item.color} size={48} number={item.step} />
                    {index < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-[var(--border)]" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between gap-4 sm:gap-10">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                          {item.title}
                        </h3>
                        <p className="text-[var(--muted-foreground)] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      {Doodle && <Doodle className="w-16 sm:w-28 shrink-0 -mt-2" />}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
