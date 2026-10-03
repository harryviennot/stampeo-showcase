/**
 * The shared CTA taxonomy (extracted under STA-319 review, planned as STA-320).
 *
 * One module now feeds both vendors' event mappers, so these tests own the
 * SET-MEMBERSHIP questions — `gaEventForCTA`/`metaEventForCTA` keep their own
 * mapping tests, but which locations exist is decided exactly once, here.
 */

import { describe, expect, test } from "bun:test";
import {
  CONTACT_CTAS,
  SIGNUP_CTAS,
  isContactHref,
  isKnownCTALocation,
} from "./cta-taxonomy";

describe("the CTA sets", () => {
  test("the signup set names every link to /onboarding", () => {
    for (const location of [
      "hero",
      "pricing_starter",
      "pricing_growth",
      "pricing_pro",
      "faq",
      "final_cta",
      "loyalty_picker",
      "header",
      "header_mobile",
      "demo_stamps_claim",
      "demo_points_claim",
      "founder_program",
      "about",
      "feature_hero",
      "feature_cta",
      "card_style_gallery",
      "blog_cta",
      "pricing_final_cta",
    ]) {
      expect(SIGNUP_CTAS.has(location)).toBe(true);
    }
  });

  test("the contact set names every link to /contact", () => {
    expect([...CONTACT_CTAS].sort()).toEqual([
      "faq_contact",
      "final_cta_demo",
      "footer_contact",
      "hero_demo",
      "pricing_contact",
    ]);
  });

  test("the sets are disjoint", () => {
    // A location in both would make the event depend on evaluation order.
    for (const location of SIGNUP_CTAS) {
      expect(CONTACT_CTAS.has(location)).toBe(false);
    }
  });

  test("isKnownCTALocation is the union of the two sets", () => {
    expect(isKnownCTALocation("hero")).toBe(true);
    expect(isKnownCTALocation("hero_demo")).toBe(true);
    expect(isKnownCTALocation("newsletter_footer")).toBe(false);
    expect(isKnownCTALocation("")).toBe(false);
  });
});

describe("isContactHref", () => {
  test("the bare contact path matches", () => {
    expect(isContactHref("/contact")).toBe(true);
    expect(isContactHref("/contact/")).toBe(true);
    expect(isContactHref("/contact?ref=x")).toBe(true);
    expect(isContactHref("/contact#form")).toBe(true);
  });

  test("a locale-prefixed contact path matches", () => {
    expect(isContactHref("/en/contact")).toBe(true);
    expect(isContactHref("/es/contact")).toBe(true);
  });

  test("repeated two-letter prefixes match too", () => {
    // Defensive, currently unreachable: a market+locale path like
    // /en/us/contact would otherwise silently downgrade a Contact to a Lead
    // the day such routes exist.
    expect(isContactHref("/en/us/contact")).toBe(true);
    expect(isContactHref("/us/en/contact")).toBe(true);
  });

  test("lookalikes do not match", () => {
    expect(isContactHref("/contacts")).toBe(false);
    expect(isContactHref("/en/contacted")).toBe(false);
    expect(isContactHref("/onboarding")).toBe(false);
    expect(isContactHref("/abc/contact")).toBe(false);
  });
});
