import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { LoyaltyProgramsPreviewPage } from "@/components/landing-pages/pages/LoyaltyProgramsPreviewPage";
import { routing } from "@/i18n/routing";
import { loyaltyPath } from "@/lib/loyalty-routes";
import { breadcrumbJsonLd } from "@/lib/structured-data";

/** The loyalty programs page of a language: the page itself, under its breadcrumb. */
export async function LoyaltyLivePage({ locale }: Readonly<{ locale: string }>) {
  const t = await getTranslations({ locale, namespace: "loyalty" });
  const homeUrl = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Stampeo", url: homeUrl },
          { name: t("hero.badge"), url: loyaltyPath(locale) },
        ])}
      />
      <LoyaltyProgramsPreviewPage market="int" />
    </>
  );
}
