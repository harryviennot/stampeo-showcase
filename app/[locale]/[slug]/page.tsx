import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getBusinessBySlug, getActiveCardDesign } from "@/lib/acquisition";
import { AcquisitionFlow } from "@/components/acquisition/AcquisitionFlow";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("metadata.acquisition");
  const { data: business } = await getBusinessBySlug(slug);

  if (!business) {
    return {
      title: t("notFound"),
      description: t("notFoundDesc"),
    };
  }

  const description =
    business.settings?.description ||
    t("defaultDesc", { businessName: business.name });

  return {
    title: t("title", { businessName: business.name }),
    description,
    openGraph: {
      title: t("cardTitle", { businessName: business.name }),
      description,
      type: "website",
    },
  };
}

export default async function AcquisitionPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch business by slug (server-side)
  const { data: business, error: businessError } = await getBusinessBySlug(slug);

  if (!business || businessError) {
    notFound();
  }

  // Fetch active card design for preview
  const { data: cardDesign } = await getActiveCardDesign(business.id);

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AcquisitionFlow business={business} cardDesign={cardDesign} />
    </main>
  );
}
