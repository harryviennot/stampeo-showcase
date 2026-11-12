import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadCatalog } from "./catalogs";

const MESSAGES = loadCatalog("en");

/** Server-renders `node` under the English catalogs, as a page does; a missing message throws. */
export function renderEn(node: ReactNode): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={MESSAGES}
      onError={(error) => {
        throw error;
      }}
    >
      {node}
    </NextIntlClientProvider>,
  );
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&#x27;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">" };

/** The text of rendered markup: tags become a bar, so adjacent elements never fuse into one word, and entities are read back. */
export const textOf = (html: string) =>
  html
    .replace(/<[^>]*>/g, "|")
    .replace(/\|+/g, "|")
    .replace(/&(?:amp|#x27|quot|lt|gt);/g, (entity) => ENTITIES[entity]);
