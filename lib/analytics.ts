import posthog from "posthog-js";

export type CTALocation =
  | "hero"
  | "hero_demo"
  | "pricing_starter"
  | "pricing_growth"
  | "faq"
  | "final_cta"
  | "final_cta_demo";

type BaseProps = {
  locale: string;
};

export function trackLandingViewed(props: BaseProps) {
  posthog.capture("landing_viewed", props);
}

export function trackLandingCTAClicked(
  props: BaseProps & { cta_location: CTALocation; href: string }
) {
  posthog.capture("landing_cta_clicked", props);
}

export function trackLandingDemoCTAClicked(
  props: BaseProps & { cta_location: CTALocation; href: string }
) {
  posthog.capture("landing_demo_cta_clicked", props);
}

export function trackLandingSectionViewed(
  props: BaseProps & { section: string }
) {
  posthog.capture("landing_section_viewed", props);
}

/**
 * Attach `landing_variant` as a PostHog super-property so every subsequent
 * event from this session carries it automatically. Call on landing page mount.
 */
export function registerLandingVariant(variant: string) {
  posthog.register({ landing_variant: variant });
}

/**
 * Remove the super-property when the user leaves the landing page so
 * events from other pages don't inherit it.
 */
export function unregisterLandingVariant() {
  posthog.unregister("landing_variant");
}
