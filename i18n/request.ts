import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: {
      ...(await import(`../messages/${locale}/common.json`)).default,
      ...(await import(`../messages/${locale}/landing.json`)).default,
      ...(await import(`../messages/${locale}/pricing.json`)).default,
      ...(await import(`../messages/${locale}/onboarding.json`)).default,
      ...(await import(`../messages/${locale}/acquisition.json`)).default,
      ...(await import(`../messages/${locale}/auth.json`)).default,
      ...(await import(`../messages/${locale}/errors.json`)).default,
      ...(await import(`../messages/${locale}/metadata.json`)).default,
      ...(await import(`../messages/${locale}/about.json`)).default,
      ...(await import(`../messages/${locale}/contact.json`)).default,
      ...(await import(`../messages/${locale}/blog.json`)).default,
    },
  };
});
