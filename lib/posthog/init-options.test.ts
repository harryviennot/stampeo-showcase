/**
 * How PostHog is started. The project has heatmaps on, and recordings are off only by the project's toggle, so the
 * code pins both off for every visitor; the visitor is not remembered between page loads; the flags request, which
 * would carry the landing URL past `before_send`, is not made. `instrumentation-client.ts` starts PostHog with
 * exactly these options.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { posthogBeforeSend } from "./hygiene";
import { POSTHOG_INIT_OPTIONS } from "./init-options";

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
    expect(POSTHOG_INIT_OPTIONS.defaults).toBe("2026-01-30");
  });

  test("the browser entry starts PostHog with them, and only when the page may be measured", () => {
    const entry = readFileSync(join(import.meta.dir, "..", "..", "instrumentation-client.ts"), "utf8");

    expect(entry).toMatch(/posthog\.init\([^)]*\.\.\.POSTHOG_INIT_OPTIONS/s);
    expect(entry).toMatch(/posthogEnabledFor\(window\.location\.href\)/);
  });
});
