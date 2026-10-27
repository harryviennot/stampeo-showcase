/** What the Share button needs from the browser; a test passes fakes. */
export interface ShareEnvironment {
  /** `navigator.share`, where the browser has it. */
  share?: (data: { title: string; url: string }) => Promise<void>;
  /** `navigator.clipboard.writeText`. */
  copy: (text: string) => Promise<void>;
}

export type ShareOutcome = "shared" | "cancelled" | "copied" | "failed";

/**
 * Sends a page's link: through the phone's share sheet where there is one,
 * otherwise (or when the sheet fails) by copying it. Closing the sheet without
 * choosing anyone is a "cancelled", not an error, and copies nothing.
 */
export async function shareLink(
  page: { title: string; url: string },
  env: ShareEnvironment
): Promise<ShareOutcome> {
  if (env.share) {
    try {
      await env.share({ title: page.title, url: page.url });
      return "shared";
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") return "cancelled";
    }
  }

  try {
    await env.copy(page.url);
    return "copied";
  } catch {
    return "failed";
  }
}
