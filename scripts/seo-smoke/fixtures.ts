/** HTML fixtures shaped like `next start` output, shared by the smoke tests. */

/** A page shaped like `next start` output: head metadata, body, RSC flight payload. */
export function page({ head = "", body = "" }: { head?: string; body?: string }): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charSet="utf-8"/>${head}</head><body>${body}<script>self.__next_f.push([1,"[\\"$\\",\\"script\\",null,{\\"type\\":\\"application/ld+json\\",\\"dangerouslySetInnerHTML\\":{\\"__html\\":\\"$11\\"}}]"])</script></body></html>`;
}

export const PRICING_HEAD = [
  "<title>Tarifs &amp; plans | Stampeo</title>",
  '<meta name="description" content="Des cartes que vos clients n&#x27;oublient pas."/>',
  '<link rel="canonical" href="https://stampeo.app/pricing"/>',
  '<link rel="alternate" hrefLang="x-default" href="https://stampeo.app/en/pricing"/>',
  '<link rel="alternate" hrefLang="fr" href="https://stampeo.app/pricing"/>',
  '<link rel="alternate" href="https://stampeo.app/us/pricing" hrefLang="en-US"/>',
  '<link rel="alternate" type="application/rss+xml" href="https://stampeo.app/feed-fr.xml"/>',
].join("");
