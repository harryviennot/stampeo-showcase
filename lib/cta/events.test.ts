/**
 * What one CTA click sends.
 *
 * Every tracked link on the marketing site goes through `useCtaTracking`,
 * which sends what `ctaClick` decides: PostHog's product event, GA4's and
 * Meta's ad events, each carrying the link's location, and whether the page
 * may report to the ad platforms at all. This file holds the one table of
 * every CTA location; the vendor files test the mapping rules, and whether a
 * vendor actually receives its event is the gate's job (consent, route).
 */

import { describe, expect, test } from "bun:test";
import { ctaClick, trackThen } from "./events";
import { CONTACT_CTAS, SIGNUP_CTAS } from "./taxonomy";

// Meta hears a signup click as the custom SignupCTA, never as a Lead (the Lead
// is the server's, sent once the account is confirmed). A click that only
// navigates to the contact page is silent there: a Contact is a form that was
// sent, or an email, phone or WhatsApp link that was followed.
const SIGNUP = {
  posthog: "landing_cta_clicked",
  ga: "sign_up_cta_click",
  meta: "SignupCTA",
};

const CONTACT = {
  posthog: "landing_demo_cta_clicked",
  ga: "contact_cta_click",
  meta: null,
};

/** Every CTA location, the page it links to, and what its click sends. */
const LOCATIONS: Record<string, [href: string, sends: typeof SIGNUP]> = {
  hero: ["/onboarding", SIGNUP],
  pricing_starter: ["/onboarding", SIGNUP],
  pricing_growth: ["/onboarding", SIGNUP],
  pricing_pro: ["/onboarding", SIGNUP],
  faq: ["/onboarding", SIGNUP],
  final_cta: ["/onboarding", SIGNUP],
  loyalty_picker: ["/onboarding", SIGNUP],
  header: ["/onboarding", SIGNUP],
  header_mobile: ["/onboarding", SIGNUP],
  demo_stamps_claim: ["/onboarding", SIGNUP],
  demo_points_claim: ["/onboarding", SIGNUP],
  founder_program: ["/onboarding", SIGNUP],
  about: ["/onboarding", SIGNUP],
  feature_hero: ["/onboarding", SIGNUP],
  feature_cta: ["/onboarding", SIGNUP],
  card_style_gallery: ["/onboarding", SIGNUP],
  blog_cta: ["/onboarding", SIGNUP],
  pricing_final_cta: ["/onboarding", SIGNUP],
  // A markdown link in a blog post keeps the locale it was written with.
  blog_link: ["/en/onboarding", SIGNUP],
  hero_demo: ["/contact?type=demo", CONTACT],
  final_cta_demo: ["/contact?type=demo", CONTACT],
  footer_contact: ["/contact", CONTACT],
  faq_contact: ["/contact", CONTACT],
  pricing_contact: ["/contact", CONTACT],
  blog_contact: ["/en/contact", CONTACT],
};

describe("every CTA location", () => {
  test("the table covers exactly the mapped locations", () => {
    expect(Object.keys(LOCATIONS).sort()).toEqual([...SIGNUP_CTAS, ...CONTACT_CTAS].sort());
  });

  test.each(Object.entries(LOCATIONS))("%s", (ctaLocation, [href, sends]) => {
    const click = ctaClick({ ctaLocation, href, pathname: "/", locale: "fr" });

    expect({
      posthog: click.posthog.event,
      ga: click.ga?.event ?? null,
      meta: click.meta?.event ?? null,
    }).toEqual(sends);
  });
});

describe("ctaClick", () => {
  test("each vendor receives the link's location, the page locale and the href", () => {
    const click = ctaClick({
      ctaLocation: "pricing_growth",
      href: "/onboarding",
      pathname: "/en/pricing",
      locale: "en",
    });

    const context = { locale: "en", cta_location: "pricing_growth", href: "/onboarding" };
    expect(click.posthog).toEqual({ event: "landing_cta_clicked", props: context });
    expect(click.ga).toEqual({ event: "sign_up_cta_click", params: context });
    expect(click.meta).toEqual({ event: "SignupCTA", params: context });
    expect(click.trackable).toBe(true);
  });

  test.each(["/", "/en/pricing", "/us/pricing", "/blog/points-ou-tampons"])(
    "a click on the marketing page %s may reach the ad platforms",
    (pathname) => {
      expect(
        ctaClick({ ctaLocation: "header", href: "/onboarding", pathname, locale: "fr" }).trackable,
      ).toBe(true);
    },
  );

  test.each(["/en/onboarding", "/onboarding", "/login", "/en/login", "/mon-cafe"])(
    "a click on %s reaches neither ad platform",
    (pathname) => {
      // AC3. PostHog still records the click: it stores nothing on the device
      // and runs outside the consent gate.
      const click = ctaClick({ ctaLocation: "header", href: "/onboarding", pathname, locale: "en" });

      expect(click.trackable).toBe(false);
      expect(click.posthog.event).toBe("landing_cta_clicked");
    },
  );
});

describe("trackThen — a tracked link's click handler", () => {
  test("tracks, then runs the caller's own handler with the event", () => {
    // The mobile header closes its menu in its own onClick.
    const calls: unknown[] = [];
    const handler = trackThen(
      () => calls.push("track"),
      (event: string) => calls.push(["closeMenu", event]),
    );

    handler("click");

    expect(calls).toEqual(["track", ["closeMenu", "click"]]);
  });

  test("a link without its own handler only tracks", () => {
    let tracked = 0;
    trackThen(() => tracked++)("click");
    expect(tracked).toBe(1);
  });

  test("a tracking failure neither throws nor skips the caller's handler", () => {
    let closed = false;
    const handler = trackThen(
      () => {
        throw new Error("blocked by extension");
      },
      () => {
        closed = true;
      },
    );

    expect(() => handler("click")).not.toThrow();
    expect(closed).toBe(true);
  });
});
