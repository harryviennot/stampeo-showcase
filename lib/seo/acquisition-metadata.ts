import type { Metadata } from "next";
import { NOINDEX_FOLLOW } from "./page-robots";

/**
 * Metadata for a merchant enrolment page, the URL its counter QR code opens.
 *
 * The canonical is the unprefixed URL the merchant printed: the proxy serves it
 * in the visitor's language, so no locale-prefixed copy is the real one.
 */

interface AcquisitionPage {
  slug: string;
  locationSlug?: string | null;
  title: string;
  description: string;
  cardTitle: string;
}

export function acquisitionMetadata({
  slug,
  locationSlug,
  title,
  description,
  cardTitle,
}: AcquisitionPage): Metadata {
  return {
    title,
    description,
    robots: NOINDEX_FOLLOW,
    alternates: {
      canonical: locationSlug ? `/${slug}/l/${locationSlug}` : `/${slug}`,
    },
    openGraph: { title: cardTitle, description, type: "website" },
  };
}

/** A slug no shop owns: no canonical to claim, and nothing to index. */
export function acquisitionNotFoundMetadata({
  title,
  description,
}: Pick<AcquisitionPage, "title" | "description">): Metadata {
  return { title, description, robots: NOINDEX_FOLLOW };
}
