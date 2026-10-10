import { Metadata } from "next";

import {
  AcquisitionPageView,
  buildAcquisitionMetadata,
} from "@/components/acquisition/AcquisitionPageView";

interface PageProps {
  params: Promise<{ slug: string; locale: string; locationSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locationSlug } = await params;
  return buildAcquisitionMetadata(slug, locationSlug);
}

export default async function LocationAcquisitionPage({ params }: PageProps) {
  const { slug, locationSlug } = await params;
  return <AcquisitionPageView slug={slug} locationSlug={locationSlug} />;
}
