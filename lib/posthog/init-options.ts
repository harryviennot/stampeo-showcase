import type { PostHogConfig } from "posthog-js";
import { posthogBeforeSend } from "./hygiene";

/**
 * How PostHog starts on the site, apart from its key and host. Heatmaps and
 * session recording are pinned off in code (the project has heatmaps on, and
 * recordings are off only by the project's toggle); the visitor is kept in
 * memory only; every event goes through `posthogBeforeSend`; the feature-flags
 * request, which sends the landing URL past `before_send`, is not made on load.
 */
export const POSTHOG_INIT_OPTIONS = {
  defaults: "2026-01-30",
  persistence: "memory",
  capture_heatmaps: false,
  disable_session_recording: true,
  before_send: posthogBeforeSend,
  advanced_disable_feature_flags_on_first_load: true,
} satisfies Partial<PostHogConfig>;
