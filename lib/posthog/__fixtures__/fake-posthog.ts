/**
 * A PostHog client for tests: it records what it was told, in order, and mints a new id when reset (once: a second reset keeps it). It has none of
 * the library's network or storage, so a test sees only what the site asked of PostHog.
 */

export const FIRST_ID = "0198c3a4-7b1e-7c52-9a3d-5f0e2b6a41c8";
export const NEXT_ID = "0198c3a9-1d2f-7e04-8b6c-3a9d7e5f2c10";

export type Call = [name: string, arg?: Record<string, unknown>];

export function fakePostHog(firstId = FIRST_ID) {
  const calls: Call[] = [];
  let id = firstId;
  return {
    calls,
    init: (key: string, config: Record<string, unknown>) => void calls.push(["init", { key, ...config }]),
    get_distinct_id: () => id,
    set_config: (config: Record<string, unknown>) => void calls.push(["set_config", config]),
    reset: (resetDeviceId?: boolean) => {
      calls.push(resetDeviceId ? ["reset", { resetDeviceId }] : ["reset"]);
      id = NEXT_ID;
    },
    register: (props: Record<string, unknown>) => void calls.push(["register", props]),
    startSessionRecording: () => void calls.push(["startSessionRecording"]),
    stopSessionRecording: () => void calls.push(["stopSessionRecording"]),
  };
}
