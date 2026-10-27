import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { PhoneScreenshot } from "../ui/PhoneScreenshot";

/**
 * The business's half of the product, right under the hero's cards: real
 * captures of the Analytics page (lib/landing/dashboard-shots.ts). Below
 * md only the phone shows; from md the desktop capture leads and the phone
 * overlaps its right edge, both standing on the same baseline. The heading and
 * caption sit under the picture; the DOM keeps the heading first.
 */
export async function VariantDashboardShot() {
  const t = await getTranslations("variant.dashboard");
  const locale = (await getLocale()) as Locale;
  const desktop = landingShot(locale, "desktop");
  const phone = landingShot(locale, "phone");

  return (
    <section className="pb-16 lg:pb-24">
      <Container>
        <div className="flex flex-col gap-10 md:gap-12 lg:gap-14 max-w-[1120px] mx-auto">
          <ScrollReveal className="order-2 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-4 max-w-xl lg:max-w-none mx-auto lg:mx-0 text-center lg:text-left">
            <h2 className="text-h2 text-balance">{t("title")}</h2>
            <div className="lg:pt-1.5">
              <p className="text-lead text-[var(--muted-foreground)]">{t("caption")}</p>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">{t("planLine")}</p>
            </div>
          </ScrollReveal>

          {/* The phone overhangs the capture by about half its width. Each
              breakpoint's scale keeps its top under the KPI row (a third of
              the way down the capture), so it never covers a number. */}
          <figure className="order-1 relative md:pr-16 lg:pr-20 xl:pr-24">
            {/* Not in a ScrollReveal: only its top shows above the fold at
                lg, too little for the reveal to fire. */}
            <div className="hidden md:block overflow-hidden rounded-2xl lg:rounded-[20px] bg-[var(--paper-hover)] ring-1 ring-[var(--border)] shadow-[0_2px_4px_rgba(25,18,16,0.04),0_32px_72px_-24px_rgba(25,18,16,0.22)]">
              <Image
                src={desktop.src}
                width={desktop.width}
                height={desktop.height}
                alt={t("alt.desktop")}
                sizes="(min-width: 1280px) 1024px, (min-width: 1024px) 880px, 660px"
                className="block w-full h-auto"
              />
            </div>

            {/* The bezel's PNG leaves 7 pt under the device: the small negative
                offsets put the device itself on the capture's bottom edge. */}
            <ScrollReveal
              delay={150}
              className="flex justify-center md:block md:absolute md:right-0 md:-bottom-[2px] lg:-bottom-[3px]"
            >
              <div className="md:origin-bottom-right md:scale-[0.45] lg:scale-[0.6] xl:scale-[0.7]">
                <PhoneScreenshot src={phone.src} alt={t("alt.phone")} />
              </div>
            </ScrollReveal>
          </figure>
        </div>
      </Container>
    </section>
  );
}
