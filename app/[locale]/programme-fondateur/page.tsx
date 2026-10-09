import { redirectToPricing } from "@/lib/routing/founding-redirect";

export default function ProgrammeFondateurPage({ params }: { params: Promise<{ locale: string }> }) {
  return redirectToPricing(params);
}
