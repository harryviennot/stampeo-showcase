import type { PostHogConfig } from "posthog-js";
import { livePostHogCookieDays, livePostHogMode, startPostHogConsent, type PostHogClient } from "./consent-sync";
import { postHogInitOptions } from "./init-options";

/** posthog-js as the site starts it. */
export interface PostHogInstance extends PostHogClient {
  init(token: string, config?: Partial<PostHogConfig>): unknown;
}

/**
 * Start PostHog for the visitor opening this page, and keep it in step with their choice. A visitor PostHog may
 * remember starts with the cookie store, so PostHog reads the id it holds from their last visit. Returns the
 * function that stops following the choice.
 */
export function startPostHog(posthog: PostHogInstance, token: string, apiHost: string | undefined): () => void {
  const mode = livePostHogMode();
  posthog.init(token, { api_host: apiHost, ...postHogInitOptions(mode.remember, livePostHogCookieDays()) });
  return startPostHogConsent(posthog, mode);
}
