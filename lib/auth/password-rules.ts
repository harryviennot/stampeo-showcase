/** The one password rule on sign-up and on choosing a new password: length only. */
export const MIN_PASSWORD_LENGTH = 8;

export function isPasswordAcceptable(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}
