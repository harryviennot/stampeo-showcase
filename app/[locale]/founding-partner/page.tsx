import { redirectToPricing } from "@/lib/routing/founding-redirect";

export default function FoundingPartnerPage({ params }: { params: Promise<{ locale: string }> }) {
  return redirectToPricing(params);
}
