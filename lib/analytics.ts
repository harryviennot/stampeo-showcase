import posthog from "posthog-js";

export type CTALocation =
  | "hero"
  | "pricing_starter"
  | "pricing_growth"
  | "faq"
  | "final_cta";

type BaseProps = {
  locale: string;
  variant?: string;
};

export function trackLandingViewed(props: BaseProps) {
  posthog.capture("landing_viewed", props);
}

export function trackLandingCTAClicked(
  props: BaseProps & { cta_location: CTALocation; href: string }
) {
  posthog.capture("landing_cta_clicked", props);
}

export function trackLandingSectionViewed(
  props: BaseProps & { section: string }
) {
  posthog.capture("landing_section_viewed", props);
}
