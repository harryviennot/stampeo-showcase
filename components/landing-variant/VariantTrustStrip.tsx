import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { ShieldCheckIcon, TranslateIcon } from "../icons";

export async function VariantTrustStrip() {
  const t = await getTranslations("variant.trustStrip");

  const items = [
    { label: t("madeInFrance"), icon: <span aria-hidden className="text-lg">🇫🇷</span> },
    { label: t("rgpd"), icon: <ShieldCheckIcon className="w-5 h-5 text-[var(--accent)]" /> },
    { label: t("supportFr"), icon: <TranslateIcon className="w-5 h-5 text-[var(--accent)]" /> },
  ];

  return (
    <section className="relative py-10 border-y border-[var(--border)] bg-[var(--cream)]/40">
      <div className="max-w-[1100px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-[var(--muted-foreground)]">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-sm font-semibold">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
