import TurndownService from "turndown";

const service = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "_",
  linkStyle: "inlined",
});

service.addRule("stripSkipMarked", {
  filter: (node) =>
    node.nodeType === 1 &&
    (node as Element).getAttribute?.("data-markdown") === "skip",
  replacement: () => "",
});

service.addRule("stripScriptStyle", {
  filter: ["script", "style", "noscript"],
  replacement: () => "",
});

service.addRule("stripHeaderFooterNav", {
  filter: ["header", "footer", "nav", "aside"],
  replacement: () => "",
});

service.addRule("stripSvg", {
  filter: (node) => node.nodeName === "SVG" || node.nodeName === "svg",
  replacement: () => "",
});

service.remove(["iframe", "canvas", "video", "audio"]);

function extractBody(html: string): string {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) return bodyMatch[1];
  return html;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim().replace(/\s+/g, " ") : null;
}

function extractMetaDescription(html: string): string | null {
  const m = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
  );
  return m ? m[1].trim() : null;
}

function collapseBlankLines(md: string): string {
  return md.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export interface MarkdownResult {
  markdown: string;
  tokens: number;
}

export function htmlToMarkdown(html: string): MarkdownResult {
  const title = extractTitle(html);
  const description = extractMetaDescription(html);
  const body = extractBody(html);

  const bodyMd = service.turndown(body);

  const parts: string[] = [];
  if (title) parts.push(`# ${title}`);
  if (description) parts.push(`> ${description}`);
  parts.push(bodyMd);

  const markdown = collapseBlankLines(parts.join("\n\n"));
  const tokens = Math.ceil(markdown.length / 4);

  return { markdown, tokens };
}
