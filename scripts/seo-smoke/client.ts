/** The HTTP side of the smoke test: requests against one running server, and page fetches shared between checks. */

const REQUEST_TIMEOUT_MS = 30_000;

export interface FetchedPage {
  status: number;
  html: string;
  headers: Headers;
}

export function createClient(baseUrl: string) {
  /** One request, redirects not followed. */
  const request = (path: string, headers: Record<string, string> = {}) =>
    fetch(new URL(path, baseUrl), { redirect: "manual", headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

  const fetchPage = async (path: string): Promise<FetchedPage> => {
    const res = await request(path);
    return { status: res.status, html: await res.text(), headers: res.headers };
  };

  const pages = new Map<string, Promise<FetchedPage>>();
  /** A page fetched once and shared by every check that reads it. */
  const page = (path: string) => {
    if (!pages.has(path)) pages.set(path, fetchPage(path));
    return pages.get(path)!;
  };

  /** Runs `check` on a page that must answer 200 without redirecting. */
  const onPage =
    (path: string, check: (html: string) => string[] | Promise<string[]>) => async () => {
      const { status, html } = await page(path);
      return status === 200 ? check(html) : [`HTTP ${status}, expected 200`];
    };

  /** Runs `check` on a page that must answer 200 without redirecting, with the headers it came with. */
  const onResponse =
    (path: string, check: (fetched: FetchedPage) => string[]) => async () => {
      const fetched = await page(path);
      return fetched.status === 200 ? check(fetched) : [`HTTP ${fetched.status}, expected 200`];
    };

  /** The status and content type of a URL, with the body left unread. */
  const probe = async (path: string) => {
    const res = await request(path);
    await res.body?.cancel();
    return { status: res.status, contentType: res.headers.get("content-type") };
  };

  return { request, fetchPage, page, onPage, onResponse, probe };
}

/** The path and query of an absolute URL, to request it from the server under test whatever host the page names. */
export function onBase(url: string): string {
  const { pathname, search } = new URL(url, "https://stampeo.app");
  return `${pathname}${search}`;
}

/** Runs `task` over `items` a few at a time, keeping the results in order. */
export async function inBatches<T, R>(items: T[], size: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let start = 0; start < items.length; start += size) {
    results.push(...(await Promise.all(items.slice(start, start + size).map(task))));
  }
  return results;
}
