import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "./lib/privacy/credential-params";
import { posthogEnabledFor } from "./lib/posthog/hygiene";
import { POSTHOG_INIT_OPTIONS } from "./lib/posthog/init-options";

// A page opened with a sign-in token in its URL (the reset link), or as a
// business's enrollment page, gets no analytics: whatever PostHog sends outside
// `before_send` would carry what is in the URL.
if (process.env.NEXT_PUBLIC_POSTHOG_KEY && posthogEnabledFor(window.location.href)) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    ...POSTHOG_INIT_OPTIONS,
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
