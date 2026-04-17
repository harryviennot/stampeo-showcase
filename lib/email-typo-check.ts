const DOMAIN_TYPOS: Record<string, string> = {
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmsil.com": "gmail.com",
  "hotmal.com": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "iclould.com": "icloud.com",
  "icoud.com": "icloud.com",
  "icluod.com": "icloud.com",
  "icloud.con": "icloud.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outlook.con": "outlook.com",
  "orange.fe": "orange.fr",
  "oragne.fr": "orange.fr",
};

/**
 * Returns a suggested corrected email address if the domain looks like
 * a common typo, otherwise null. Pure string match — no TLD guessing.
 */
export function suggestCorrectedEmail(email: string): string | null {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1 || atIndex === email.length - 1) return null;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1).toLowerCase().trim();
  if (!domain) return null;

  const corrected = DOMAIN_TYPOS[domain];
  if (!corrected || corrected === domain) return null;

  return `${local}@${corrected}`;
}
