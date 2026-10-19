import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

/** What step 1 of the wizard stashed before the Google or Apple round trip. */
export interface OAuthSignupStash {
  name?: string;
  phone?: string;
}

/** The Supabase `user_metadata` written on the OAuth return. */
export interface OAuthSignupMetadata {
  locale: Locale;
  name?: string;
  phone?: string;
}

/**
 * The metadata for a Google or Apple account: the language it already has, else
 * the page's language, plus the stashed name and phone when they are not blank.
 * A language the site does not serve becomes the default one.
 */
export function buildOAuthSignupMetadata(
  stash: OAuthSignupStash | null | undefined,
  locale: string,
  existingLocale?: string | null
): OAuthSignupMetadata {
  const name = stash?.name?.trim();
  const phone = stash?.phone?.trim();
  const chosen = existingLocale && hasLocale(routing.locales, existingLocale) ? existingLocale : locale;
  return {
    locale: hasLocale(routing.locales, chosen) ? chosen : routing.defaultLocale,
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
  };
}

export interface OAuthSignupSync {
  stash: OAuthSignupStash | null | undefined;
  /** The language of the page the visitor returned to. */
  locale: string;
  /** The language already in the account's metadata, kept for a returning account. */
  existingLocale?: string | null;
  updateUserMetadata(data: OAuthSignupMetadata): Promise<unknown>;
  /** Writes the phone to the profile so the backend stores its canonical format. */
  updateProfilePhone(phone: string): Promise<unknown>;
}

/**
 * Writes the metadata (always, the language is never blank), then the phone to
 * the profile. Best-effort: a failed write is logged and never stops the visitor
 * from reaching the app.
 */
export async function syncOAuthSignupProfile(sync: OAuthSignupSync): Promise<void> {
  const metadata = buildOAuthSignupMetadata(sync.stash, sync.locale, sync.existingLocale);
  try {
    await sync.updateUserMetadata(metadata);
    if (metadata.phone) await sync.updateProfilePhone(metadata.phone);
  } catch (error) {
    console.warn("OAuth sign-up profile sync failed", error);
  }
}
