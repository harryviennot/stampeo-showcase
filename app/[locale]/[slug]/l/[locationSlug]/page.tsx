import { Metadata } from "next";

import {
  AcquisitionPageView,
  buildAcquisitionMetadata,
} from "@/components/acquisition/AcquisitionPageView";

interface PageProps {
  params: Promise<{ slug: string; locale: string; locationSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildAcquisitionMetadata(slug);
}

export default async function LocationAcquisitionPage({ params }: PageProps) {
  const { slug, locationSlug } = await params;
  return <AcquisitionPageView slug={slug} locationSlug={locationSlug} />;
}
