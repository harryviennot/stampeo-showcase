import { hasLocale } from "next-intl";
import { permanentRedirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/hreflang";

/**
 * The founding programme is closed: its pages send every visitor to the
 * pricing page of their locale. A locale the site does not serve falls back
 * to the default one, so the target is always a path on this site.
 */
export async function redirectToPricing(params: Promise<{ locale: string }>): Promise<never> {
  const { locale } = await params;
  const target = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return permanentRedirect(localePath(target, "/pricing"));
}
