/**
 * A merchant's enrolment page is what its counter QR code opens. It stays out
 * of search results (it is the shop's page, not ours to rank), its links are
 * still followed, and it names its own printed URL as canonical, never the
 * Stampeo homepage.
 */

import { describe, expect, test } from "bun:test";
import { acquisitionMetadata, acquisitionNotFoundMetadata } from "./acquisition-metadata";

const COPY = {
  title: "Join Golden Hour Coffee",
  description: "Collect stamps at Golden Hour Coffee.",
  cardTitle: "Golden Hour Coffee loyalty card",
};

describe("a merchant enrolment page", () => {
  test.each([
    [null, "/golden-hour-coffee"],
    ["rue-de-rivoli", "/golden-hour-coffee/l/rue-de-rivoli"],
  ])("with location %p is noindex, follow and canonical to %s", (locationSlug, canonical) => {
    const metadata = acquisitionMetadata({ slug: "golden-hour-coffee", locationSlug, ...COPY });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toEqual({ canonical });
    expect(metadata.title).toBe(COPY.title);
    expect(metadata.description).toBe(COPY.description);
    expect(metadata.openGraph).toEqual({
      title: COPY.cardTitle,
      description: COPY.description,
      type: "website",
    });
  });

  test("for a slug no shop owns is noindex and declares no canonical", () => {
    const metadata = acquisitionNotFoundMetadata({ title: "Not found", description: "No such shop." });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toBeUndefined();
  });
});
