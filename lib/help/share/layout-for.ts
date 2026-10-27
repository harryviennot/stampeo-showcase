import type { HelpPageType } from "../types";

export type HelpLayoutKind = "article" | "share";

/** A page an owner sends to someone else reads on a light layout; every other page is an article. */
export function layoutFor(type: HelpPageType): HelpLayoutKind {
  return type === "share" ? "share" : "article";
}
