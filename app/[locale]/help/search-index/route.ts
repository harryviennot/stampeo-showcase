import { HELP_LOCALES, isHelpLocale } from "@/lib/help/config";
import { getAllHelpPages } from "@/lib/help/index";
import { buildSearchIndex } from "@/lib/help/search/build";

// English only. Built with the site, so the file is static; the `/help/*`
// header rule gives it the same noindex as every help page.
export const dynamicParams = false;

export function generateStaticParams() {
  return HELP_LOCALES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isHelpLocale(locale)) return new Response(null, { status: 404 });

  return Response.json(buildSearchIndex(getAllHelpPages()));
}
