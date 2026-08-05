import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { ShieldCheckIcon, PhoneIcon } from "../icons";

const SUPPORT_PHONE_TEL = "+33649370470";

export async function VariantTrustStrip() {
  const t = await getTranslations("variant.trustStrip");
  // The phone line is a French support number, so it only shows where we have
  // a locale-appropriate support line (FR). EN/ES omit the `phone` key.
  const hasPhone = t.has("phone");

  return (
    <section className="relative py-10 border-y border-[var(--border)] bg-[var(--cream)]/40">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <span aria-hidden className="text-lg">{t("flag")}</span>
              <span>{t("madeInFrance")}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <ShieldCheckIcon className="w-5 h-5 text-[var(--accent)]" />
              <span>{t("rgpd")}</span>
            </div>
            {hasPhone && (
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="flex items-center gap-2.5 text-sm font-semibold hover:text-[var(--foreground)] transition-colors"
              >
                <PhoneIcon weight="fill" className="w-5 h-5 text-[var(--accent)]" />
                <span>{t("phone")}</span>
              </a>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
