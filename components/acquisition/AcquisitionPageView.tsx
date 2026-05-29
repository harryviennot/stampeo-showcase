import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getBusinessBySlug, getActiveCardDesign } from "@/lib/acquisition";
import { AcquisitionFlow } from "@/components/acquisition/AcquisitionFlow";

/**
 * Shared acquisition page logic used by both the plain enrollment route
 * (`/[locale]/[slug]`) and the per-store route (`/[locale]/[slug]/l/[locationSlug]`).
 *
 * The business is always identified by its slug; `locationSlug` (when present) is
 * threaded down to tag where the customer signed up.
 */

/** Metadata is driven by the business, so it's identical across both routes. */
export async function buildAcquisitionMetadata(slug: string): Promise<Metadata> {
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

interface AcquisitionPageViewProps {
  slug: string;
  locationSlug?: string | null;
}

export async function AcquisitionPageView({ slug, locationSlug }: AcquisitionPageViewProps) {
  // Fetch business by slug (server-side)
  const { data: business, error: businessError } = await getBusinessBySlug(slug);

  if (!business || businessError) {
    notFound();
  }

  // Fetch active card design for preview
  const { data: cardDesign } = await getActiveCardDesign(business.id);

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <AcquisitionFlow business={business} cardDesign={cardDesign} locationSlug={locationSlug} />
    </main>
  );
}
