"use client";

import { useCallback, useMemo, useState } from "react";
import { queryTokens, searchHelp } from "@/lib/help/search/score";
import type { SearchEntry, SearchHit, SearchIndex } from "@/lib/help/search/types";

/** The static index, served under /help so it carries the same noindex header as every help page. */
const INDEX_URL = "/help/search-index";

let loaded: SearchIndex | null = null;
let pending: Promise<SearchIndex> | null = null;

/** Fetches the index once for the whole visit; a failed fetch can be retried. */
export function loadSearchIndex(): Promise<SearchIndex> {
  pending ??= fetch(INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`search index: ${response.status}`);
      return response.json() as Promise<SearchIndex>;
    })
    .then((index) => (loaded = index))
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}

export type SearchStatus = "loading" | "ready" | "error";

export interface HelpSearch {
  status: SearchStatus;
  /** What the reader is looking for; empty until they type. */
  query: string;
  tokens: string[];
  hits: SearchHit[];
  /** The popular pages, for an empty query. */
  popular: SearchEntry[];
  /** Starts downloading the index, if it is not already. */
  load: () => void;
}

export function useHelpSearch(query: string): HelpSearch {
  const [index, setIndex] = useState<SearchIndex | null>(loaded);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    loadSearchIndex().then(
      (value) => {
        setIndex(value);
        setFailed(false);
      },
      () => setFailed(true)
    );
  }, []);

  const hits = useMemo(() => (index ? searchHelp(index.entries, query) : []), [index, query]);
  const popular = useMemo(() => {
    if (!index) return [];
    const bySlug = new Map(index.entries.map((entry) => [entry.slug, entry]));
    return index.popular.flatMap((slug) => bySlug.get(slug) ?? []);
  }, [index]);

  return {
    status: index ? "ready" : failed ? "error" : "loading",
    query,
    tokens: queryTokens(query),
    hits,
    popular,
    load,
  };
}
