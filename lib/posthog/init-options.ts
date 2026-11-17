import type { PostHogConfig } from "posthog-js";
import { posthogBeforeSend } from "./hygiene";

/** PostHog's init options for the site: heatmaps and recordings pinned off, the visitor in memory only, every event through `posthogBeforeSend`, no flags request on load. */
export const POSTHOG_INIT_OPTIONS = {
  defaults: "2026-01-30",
  persistence: "memory",
  capture_heatmaps: false,
  disable_session_recording: true,
  before_send: posthogBeforeSend,
  advanced_disable_feature_flags_on_first_load: true,
} satisfies Partial<PostHogConfig>;
