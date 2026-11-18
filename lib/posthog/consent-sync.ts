import type { PostHogConfig } from "posthog-js";
import { CONSENT_CHANGED_EVENT, detectGpc, readStoredConsent } from "../consent";
import { detectPolicyRow } from "../privacy/region";
import { RECORDING_CONFIG, rememberedConfig } from "./init-options";
import { posthogMode, type PostHogMode } from "./mode";
import { purgePostHogStorage } from "./storage";

/**
 * Keeps PostHog in step with what the visitor allows. PostHog starts in memory, or on its cookie for a visitor it
 * may remember (`start.ts`); this moves to the cookie on a grant, starts recording when `posthogMode` says so, and
 * takes both back, on a consent change, a page change, and when the tab is shown or focused again (another tab's
 * choice, Global Privacy Control).
 *
 * Remembering keeps the id the visitor already has: switching the storage to the cookie writes the current id
 * into it. Withdrawing stops recording, returns the storage to memory before the reset so the new id has nowhere
 * on the device to go, and deletes every `ph_*` cookie and storage key. The page reload that follows is the
 * caller's (`lib/privacy/stale-tags.ts`, or the banner): a library already running cannot be unloaded.
 */

/** The part of posthog-js this module drives. The browser never calls `identify`: the backend joins the visitor to the account. */
export interface PostHogClient {
  get_distinct_id(): string;
  set_config(config: Partial<PostHogConfig>): void;
  reset(): void;
  register(properties: Record<string, unknown>): void;
  startSessionRecording(): void;
  stopSessionRecording(): void;
}

/** Tells PostHog's servers not to derive a location from the IP address. */
const GEOIP_OFF = { $geoip_disable: true };

const CANONICAL_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

interface Session {
  remembering: boolean;
  recording: boolean;
  /** Remembered at any time in this page's life: its storage was used, so only a reload clears it. */
  everRemembered: boolean;
}

let active: { client: PostHogClient; session: Session } | null = null;

/** The mode for the visitor and page as they are right now. */
export function livePostHogMode(pathname: string = window.location.pathname): PostHogMode {
  const { record, prior } = readStoredConsent();
  return posthogMode({ row: detectPolicyRow(), record, prior, gpc: detectGpc(), pathname });
}

function startRecording(client: PostHogClient, session: Session): void {
  client.set_config(RECORDING_CONFIG);
  client.startSessionRecording();
  session.recording = true;
}

function stopRecording(client: PostHogClient, session: Session): void {
  session.recording = false;
  client.stopSessionRecording();
  client.set_config({ capture_heatmaps: false });
}

function withdraw(client: PostHogClient, session: Session): void {
  session.remembering = false;
  try {
    if (session.recording) stopRecording(client, session);
    client.set_config({ persistence: "memory" });
    client.reset();
    client.register(GEOIP_OFF);
  } finally {
    purgePostHogStorage();
  }
}

/** Bring PostHog to `mode`, doing only what changed. */
function apply(mode: PostHogMode): void {
  if (!active) return;
  const { client, session } = active;

  if (!mode.remember) {
    if (session.remembering) withdraw(client, session);
    return;
  }
  if (!session.remembering) {
    client.set_config(rememberedConfig(detectPolicyRow().grant_ttl_days));
    session.remembering = true;
    session.everRemembered = true;
  }
  if (mode.record && !session.recording) startRecording(client, session);
  else if (!mode.record && session.recording) stopRecording(client, session);
}

/** Apply the live mode. Never throws: it runs inside event listeners and navigations. */
function syncNow(pathname?: string): void {
  try {
    apply(livePostHogMode(pathname));
  } catch {
    // Losing a measurement is acceptable; breaking a click or a navigation is not.
  }
}

/**
 * Start following the visitor's choice for a client already started with the options for `initial`.
 * Returns the function that stops following.
 */
export function startPostHogConsent(client: PostHogClient, initial: PostHogMode): () => void {
  const session: Session = { remembering: initial.remember, recording: false, everRemembered: initial.remember };
  active = { client, session };

  try {
    client.register(GEOIP_OFF);
    // A visitor who may not be remembered has nothing of PostHog's on the device, whatever an earlier visit left.
    if (!initial.remember) purgePostHogStorage();
    apply(initial);
  } catch {
    // PostHog failing to start must not break the page.
  }

  const onChange = () => syncNow();
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
    active = null;
  };
}

/** The visitor is going to `url`: recording starts or stops for that page before it renders. */
export function syncPostHogForUrl(url: string): void {
  if (!active) return;
  let pathname: string | undefined;
  try {
    pathname = new URL(url, window.location.href).pathname;
  } catch {
    // An address we cannot read leaves the page as it is.
  }
  syncNow(pathname);
}

/** Has this page stored anything for PostHog on the device, even if the choice has since been withdrawn? */
export function isPostHogRemembering(): boolean {
  return active?.session.everRemembered ?? false;
}

/** The PostHog id to send with the account sign-up: the browser's id while PostHog remembers it, else none. */
export function rememberedPostHogId(): string | null {
  if (!active) return null;
  syncNow();
  if (!active?.session.remembering) return null;
  try {
    const id = active.client.get_distinct_id();
    return CANONICAL_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}
