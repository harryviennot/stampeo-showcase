import { OG_WIDTH, OG_HEIGHT } from "@/lib/og/shared";
import { loyaltyOgImage } from "@/lib/og/loyalty";

export const alt = "Stampeo loyalty programs";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return loyaltyOgImage(locale);
}
