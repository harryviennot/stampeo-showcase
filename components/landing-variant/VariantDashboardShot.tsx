import Image from "next/image";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { landingShot } from "@/lib/landing-shots";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { InkArrow, InkNote } from "../ui/InkAnnotation";
import { PhoneMockup } from "../ui/PhoneMockup";
import { CheckIcon } from "../icons";

/** Neutral window chrome: the screenshot already brings the dashboard's colours. */
function BrowserFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="bg-white card-stamp rounded-2xl overflow-hidden">
      <div className="relative flex items-center px-5 py-3.5 bg-[var(--muted)] border-b border-[var(--border)]">
        <div className="flex gap-2 absolute left-5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <div key={dot} className="w-3 h-3 rounded-full bg-[var(--border)]" />
          ))}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-[var(--background)] rounded-lg px-4 py-1.5 text-xs text-[var(--muted-foreground)] border border-[var(--border)]">
            app.stampeo.app
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * The business's half of the product, right under the hero's cards: real
 * captures of the Growth Analytics page (lib/landing-shots.ts). Below md only
 * the phone shows; from md a browser frame carries the desktop capture and the
 * phone overlaps its lower-right corner. From lg the picture leads and the copy
 * sits under it; the DOM order stays heading, picture, points.
 */
export async function VariantDashboardShot() {
  const t = await getTranslations("variant.dashboard");
  const locale = (await getLocale()) as Locale;
  const desktop = landingShot(locale, "desktop");
  const phone = landingShot(locale, "phone");
  const points = t.raw("points") as string[];

  return (
    <section className="pb-16 lg:pb-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10 lg:gap-y-14">
          <ScrollReveal className="lg:order-2 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <h2 className="text-h2 text-balance">{t("title")}</h2>
            <p className="mt-4 text-lead text-[var(--muted-foreground)]">{t("caption")}</p>
          </ScrollReveal>

          <figure className="lg:order-1 lg:col-span-2 w-full lg:max-w-[1120px] mx-auto">
            {/* The phone hangs past the frame's lower-right corner. Each breakpoint's
                padding and scale keep its top below the KPI row (about a third
                of the way down the capture), so it never covers a number. */}
            <div className="relative md:pr-14 md:pb-28 lg:pr-20 lg:pb-20 xl:pr-24">
              {/* Not in a ScrollReveal: only its top shows above the fold at
                  lg, too little for the reveal to fire, and the peek would
                  stay an empty gap. */}
              <div className="hidden md:block">
                <BrowserFrame>
                  <Image
                    src={desktop.src}
                    width={desktop.width}
                    height={desktop.height}
                    alt={t("alt.desktop")}
                    sizes="(min-width: 1024px) 1040px, 650px"
                    className="block w-full h-auto bg-[var(--muted)]"
                  />
                </BrowserFrame>
              </div>

              <ScrollReveal
                delay={150}
                className="flex justify-center md:absolute md:right-0 md:bottom-0 md:block"
              >
                <div className="md:origin-bottom-right md:scale-[0.55] lg:scale-[0.68] xl:scale-[0.78]">
                  <PhoneMockup>
                    <div className="relative w-full h-full bg-[var(--muted)]">
                      <Image
                        src={phone.src}
                        fill
                        alt={t("alt.phone")}
                        sizes="260px"
                        className="object-cover object-top"
                      />
                    </div>
                  </PhoneMockup>
                </div>
              </ScrollReveal>

              {/* Points at the phone, which a visitor could take for a
                  separate app. */}
              <div className="hidden md:flex absolute bottom-8 lg:bottom-5 right-[168px] lg:right-[206px] xl:right-[236px] items-center gap-1.5">
                <InkNote rotate={-2}>{t("annotation")}</InkNote>
                <InkArrow variant="right" className="w-9" delay={0.5} />
              </div>
            </div>

            <figcaption className="mt-6 md:mt-4 text-sm text-center text-[var(--muted-foreground)]">
              {t("planLine")}
            </figcaption>
          </figure>

          <ScrollReveal delay={100} className="lg:order-3 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0 lg:pt-2">
            <ul className="space-y-4">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckIcon
                    className="w-5 h-5 mt-0.5 shrink-0 text-[var(--muted-foreground)]"
                    weight="bold"
                  />
                  <span className="text-[var(--foreground)]">{point}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
