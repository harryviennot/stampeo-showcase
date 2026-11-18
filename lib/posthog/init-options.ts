import type { PostHogConfig } from "posthog-js";
import { posthogBeforeSend } from "./hygiene";

/** The base init options: heatmaps and recordings pinned off, the visitor in memory (`postHogInitOptions` adds the cookie for a remembered visitor), every event through `posthogBeforeSend`, no flags request at all. */
export const POSTHOG_INIT_OPTIONS = {
  defaults: "2026-01-30",
  persistence: "memory",
  capture_heatmaps: false,
  disable_session_recording: true,
  before_send: posthogBeforeSend,
  advanced_disable_feature_flags_on_first_load: true,
  advanced_disable_feature_flags: true,
} satisfies Partial<PostHogConfig>;

/** What remembering a visitor changes: the id lives in a cookie for stampeo.app alone, for as long as their choice is kept. */
export const rememberedConfig = (cookieDays: number) =>
  ({ persistence: "cookie", cross_subdomain_cookie: false, cookie_expiration: cookieDays }) satisfies Partial<PostHogConfig>;

/** What a recorded visitor gets: every input masked, no console, headers, bodies or network timing, heatmaps on. */
export const RECORDING_CONFIG = {
  session_recording: { maskAllInputs: true, recordHeaders: false, recordBody: false },
  enable_recording_console_log: false,
  capture_performance: { network_timing: false },
  capture_heatmaps: true,
} satisfies Partial<PostHogConfig>;

/** The options PostHog starts with: a remembered visitor's cookie already holds their id, so it must be the store PostHog reads as it starts. */
export function postHogInitOptions(remember: boolean, cookieDays: number): Partial<PostHogConfig> {
  return remember ? { ...POSTHOG_INIT_OPTIONS, ...rememberedConfig(cookieDays) } : POSTHOG_INIT_OPTIONS;
}
