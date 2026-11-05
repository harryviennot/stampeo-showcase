import { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  AcquisitionPageView,
  buildAcquisitionMetadata,
} from "@/components/acquisition/AcquisitionPageView";
import { isReservedTopSegment } from "@/lib/locale-negotiation";
import { NOINDEX } from "@/lib/seo/page-robots";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

// A section of the site (/comparatif) is never a shop, whatever the lookup would say.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedTopSegment(slug)) return { robots: NOINDEX };
  return buildAcquisitionMetadata(slug);
}

export default async function AcquisitionPage({ params }: PageProps) {
  const { slug } = await params;
  if (isReservedTopSegment(slug)) notFound();
  return <AcquisitionPageView slug={slug} />;
}
