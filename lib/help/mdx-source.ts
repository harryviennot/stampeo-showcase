/** Helpers that read a page's raw MDX body. */

/** The body with fenced code blocks removed, so sample Markdown inside one is not mistaken for the page's own. */
export function stripCodeFences(source: string): string {
  let inFence = false;
  const kept: string[] = [];
  for (const line of source.split("\n")) {
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) kept.push(line);
  }
  return kept.join("\n");
}
