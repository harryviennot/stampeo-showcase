import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBusinessBySlug, getActiveCardDesign } from "@/lib/acquisition";
import { AcquisitionFlow } from "@/components/acquisition/AcquisitionFlow";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: business } = await getBusinessBySlug(slug);

  if (!business) {
    return {
      title: "Business Not Found | Stampeo",
      description: "This business could not be found.",
    };
  }

  const description =
    business.settings?.description ||
    `Join ${business.name}'s loyalty program and earn rewards with every visit.`;

  return {
    title: `Get your ${business.name} loyalty card | Stampeo`,
    description,
    openGraph: {
      title: `${business.name} Loyalty Card`,
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
