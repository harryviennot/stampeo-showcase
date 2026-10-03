/**
 * What one CTA click sends, per vendor.
 *
 * Every tracked link on the marketing site goes through `useCtaTracking`,
 * which sends exactly the three events `ctaClickEvents` names: PostHog's
 * product event, GA4's and Meta's ad events. The location travels with each
 * of them as a parameter. Whether a vendor actually receives its event is
 * the gate's job (consent, route) and is tested in the vendors' own files.
 */

import { describe, expect, test } from "bun:test";
import { ctaClickEvents } from "./events";

const SIGNUP = {
  posthog: "landing_cta_clicked",
  ga: "sign_up_cta_click",
  meta: "Lead",
};

const CONTACT = {
  posthog: "landing_demo_cta_clicked",
  ga: "contact_cta_click",
  meta: "Contact",
};

describe("ctaClickEvents — each link's three events", () => {
  test.each([
    ["header", "/onboarding", SIGNUP],
    ["header_mobile", "/onboarding", SIGNUP],
    ["demo_stamps_claim", "/onboarding", SIGNUP],
    ["demo_points_claim", "/onboarding", SIGNUP],
    ["founder_program", "/onboarding", SIGNUP],
    ["about", "/onboarding", SIGNUP],
    ["feature_hero", "/onboarding", SIGNUP],
    ["feature_cta", "/onboarding", SIGNUP],
    ["card_style_gallery", "/onboarding", SIGNUP],
    ["blog_cta", "/onboarding", SIGNUP],
    ["pricing_starter", "/onboarding", SIGNUP],
    ["pricing_final_cta", "/onboarding", SIGNUP],
    ["footer_contact", "/contact", CONTACT],
    ["faq_contact", "/contact", CONTACT],
    ["pricing_contact", "/contact", CONTACT],
    ["final_cta_demo", "/contact?type=demo", CONTACT],
  ])("%s → %s", (ctaLocation, href, expected) => {
    expect(ctaClickEvents({ ctaLocation, href })).toEqual(expected);
  });
});
