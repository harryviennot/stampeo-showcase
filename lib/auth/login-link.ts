/** The sign-in page, with `email` prefilled when there is one. */
export function loginHrefWithEmail(email: string): string {
  const trimmed = email.trim();
  return trimmed ? `/login?${new URLSearchParams({ email: trimmed })}` : "/login";
}
