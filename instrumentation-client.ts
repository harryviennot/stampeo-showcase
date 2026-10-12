import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";
import { carriesSessionToken, scrubPostHogEvent, scrubSentryEvent } from "./lib/privacy/credential-params";

// A page opened with a sign-in token in its URL (the reset link) gets no
// analytics: whatever PostHog sends outside `before_send` would carry it.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY && !carriesSessionToken(window.location.href)) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
    persistence: "memory",
    before_send: scrubPostHogEvent,
    // The flags request sends the landing URL and skips `before_send`; the showcase uses no flags.
    advanced_disable_feature_flags_on_first_load: true,
  });
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_GIT_SHA,
    tracesSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.1"
    ),
    sendDefaultPii: false,
    beforeSend: scrubSentryEvent,
    beforeSendTransaction: scrubSentryEvent,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
