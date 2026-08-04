import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { AppleIcon, GoogleIcon, PaletteIcon } from "@/components/icons";

/**
 * Two short reassurances before the final CTA: the card works in both wallets
 * (with a live Apple/Google preview in the editor), and merchants can keep
 * several saved styles and switch the active one anytime.
 */
export async function WalletParitySection() {
  const t = await getTranslations("features.design-de-carte.parity");

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-h2 text-[var(--foreground)]">
            {t("title")}
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <ScrollReveal className="h-full">
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--accent)]/10 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--foreground)] text-white">
                  <AppleIcon className="w-5 h-5" />
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[var(--border)]">
                  <GoogleIcon className="w-5 h-5" />
                </span>
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                {t("wallets.title")}
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("wallets.description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100} className="h-full">
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--accent)]/10 bg-white p-8 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <PaletteIcon className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                {t("styles.title")}
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {t("styles.description")}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
