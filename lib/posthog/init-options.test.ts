/**
 * How PostHog is started. The project has heatmaps on, and recordings are off only by the project's toggle, so the
 * code pins both off for every visitor; the visitor is not remembered between page loads; the flags request, which
 * would carry the landing URL past `before_send`, is not made on load.
 */

import { describe, expect, test } from "bun:test";
import { posthogBeforeSend } from "./hygiene";
import { POSTHOG_INIT_OPTIONS, postHogInitOptions } from "./init-options";

describe("the options PostHog starts with", () => {
  test("heatmaps and session recording are off whatever the project's settings say", () => {
    expect(POSTHOG_INIT_OPTIONS.capture_heatmaps).toBe(false);
    expect(POSTHOG_INIT_OPTIONS.disable_session_recording).toBe(true);
  });

  test("nothing is stored on the visitor's device, and nothing leaves without the scrub", () => {
    expect(POSTHOG_INIT_OPTIONS.persistence).toBe("memory");
    expect(POSTHOG_INIT_OPTIONS.before_send).toBe(posthogBeforeSend);
  });

  test("the flags request that skips the scrub is not made on load, and the SDK's defaults are the 2026-01-30 ones", () => {
    expect(POSTHOG_INIT_OPTIONS.advanced_disable_feature_flags_on_first_load).toBe(true);
    // The site uses no flags, and the flags request carries person properties past `before_send`.
    expect(POSTHOG_INIT_OPTIONS.advanced_disable_feature_flags).toBe(true);
    expect(POSTHOG_INIT_OPTIONS.defaults).toBe("2026-01-30");
  });
});

describe("the options for the visitor who is opening the page", () => {
  test("a visitor who is not remembered starts with exactly the pinned options", () => {
    expect(postHogInitOptions(false, 182)).toEqual(POSTHOG_INIT_OPTIONS);
  });

  test("a remembered visitor's id lives in a host-only cookie for the length of their choice, and nothing else is loosened", () => {
    expect(postHogInitOptions(true, 182)).toEqual({
      ...POSTHOG_INIT_OPTIONS,
      persistence: "cookie",
      cross_subdomain_cookie: false,
      cookie_expiration: 182,
    });
  });
});
