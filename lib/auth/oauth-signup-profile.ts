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
 * The metadata for a new Google or Apple account: always the page's language,
 * plus the stashed name and phone when they are not blank. A language the site
 * does not serve becomes the default one.
 */
export function buildOAuthSignupMetadata(
  stash: OAuthSignupStash | null | undefined,
  locale: string
): OAuthSignupMetadata {
  const name = stash?.name?.trim();
  const phone = stash?.phone?.trim();
  return {
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    ...(name ? { name } : {}),
    ...(phone ? { phone } : {}),
  };
}

export interface OAuthSignupSync {
  stash: OAuthSignupStash | null | undefined;
  /** The language of the page the visitor returned to. */
  locale: string;
  updateUserMetadata(data: OAuthSignupMetadata): Promise<unknown>;
  /** Writes the phone to the profile so the backend stores its canonical format. */
  updateProfilePhone(phone: string): Promise<unknown>;
}

/** Writes the metadata (always, the language is never blank), then the phone to the profile. */
export async function syncOAuthSignupProfile(sync: OAuthSignupSync): Promise<void> {
  const metadata = buildOAuthSignupMetadata(sync.stash, sync.locale);
  await sync.updateUserMetadata(metadata);
  if (metadata.phone) await sync.updateProfilePhone(metadata.phone);
}
