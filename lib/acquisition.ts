/**
 * API functions for customer loyalty card acquisition flow.
 * These endpoints are public (no authentication required).
 */

import { mapSubmissionError, type SubmissionFieldError } from "@/lib/signup-validation";
import type {
  CardType,
  CustomStampConfig,
  PointsRewardIcons,
  PointsStripStyle,
  RewardTier,
  StampIconMode,
} from "@/lib/types/design";

const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
} else {
  console.log(`[API] API_BASE_URL: ${API_URL}`);
}

// ============================================
// Caching
// ============================================

/**
 * Public acquisition pages are identical for every visitor and only change when
 * a merchant edits their business or card design. Without caching, each page view
 * triggers two sequential backend round-trips (~470-640ms of serialized DB work)
 * on the hot enrollment path. We cache these GET responses in Next's Data Cache so
 * the route still renders per request (cheap — it's almost entirely a client
 * component) but reads the business + design from cache instead of the backend.
 *
 * Tags let us purge a single business on demand (revalidateTag) once the dashboard
 * wires a webhook on design activation / business update — until then, content is
 * at most `ACQUISITION_REVALIDATE_SECONDS` stale.
 */
export const ACQUISITION_REVALIDATE_SECONDS = 300;

/** Cache tag for a business's public record, keyed by slug. */
export const businessSlugTag = (slug: string) => `business-slug:${slug}`;

/** Cache tag for a business's active card design, keyed by business id. */
export const businessDesignTag = (businessId: string) => `business-design:${businessId}`;

// ============================================
// Types
// ============================================

export interface BusinessPublicResponse {
  id: string;
  name: string;
  url_slug: string;
  subscription_tier: string;
  /** The language the merchant authors their own wording in. Everything else
   *  is either translated by them or falls back to our localized defaults. */
  primary_locale?: "fr" | "en" | "es";
  logo_url?: string | null;
  settings: {
    category?: string;
    description?: string;
    accentColor?: string;
    backgroundColor?: string;
    customer_data_collection?: {
      collect_name: "off" | "required" | "optional" | boolean;
      collect_email: "off" | "required" | "optional" | boolean;
      collect_phone: "off" | "required" | "optional" | boolean;
      /** Absent on every business predating the feature: treat as "off". */
      collect_birthday?: "off" | "required" | "optional" | boolean;
      /** Merchant wording overrides for the built-in fields. Blank means
       *  "keep the translated default". */
      predefined?: Partial<Record<PredefinedFieldKey, FieldWording>>;
      /** Fields the business defined itself. Always required at sign-up. */
      custom_fields?: CustomFieldDefinition[];
    };
  };
  created_at: string;
  updated_at: string;
}

export interface CardDesignPublicResponse {
  id: string;
  name: string;
  is_active: boolean;
  organization_name: string;
  description: string;
  logo_text?: string | null;
  foreground_color: string;
  background_color: string;
  label_color: string;
  total_stamps: number;
  stamp_filled_color: string;
  stamp_empty_color: string;
  stamp_border_color: string;
  // Program-derived context for rendering {{variables}} in the preview.
  reward_name?: string | null;
  initial_stamps?: number;
  stamp_icon?: string | null;
  reward_icon?: string | null;
  icon_color?: string | null;
  stamp_icon_mode?: StampIconMode;
  custom_stamp_config?: CustomStampConfig | null;
  // Points-program design (migration 123). card_type drives which card the
  // preview renders; the rest configure the points strip.
  card_type?: CardType;
  points_strip_style?: PointsStripStyle;
  progress_accent_color?: string | null;
  points_reward_icons?: PointsRewardIcons;
  points_rewards?: RewardTier[];
  logo_url?: string | null;
  custom_filled_stamp_url?: string | null;
  custom_empty_stamp_url?: string | null;
  strip_background_url?: string | null;
  strip_background_color?: string | null;
  strip_background_opacity?: number;
  secondary_fields: { key: string; label: string; value: string }[];
  auxiliary_fields: { key: string; label: string; value: string }[];
  back_fields: { key: string; label: string; value: string }[];
}

export interface CustomerCreatePublic {
  name?: string;
  email?: string;
  phone?: string;
  /** Birthday, day + month only. Sent together or not at all. */
  birth_day?: number;
  birth_month?: number;
  /** Answers to the fields the business defined itself, keyed by variable name. */
  custom_fields?: Record<string, string>;
  /** Ask the backend to also email the card (used on desktop, where the visitor
   *  can't add it to a phone wallet from here). Only sends when an email is given. */
  send_email?: boolean;
}

export type CustomFieldType = "text" | "number" | "choice";
export type PredefinedFieldKey = "name" | "email" | "phone" | "birthday";

/** Merchant wording for one field in ONE language. */
export interface FieldWordingText {
  label?: string;
  placeholder?: string;
  helper_text?: string;
  /** `choice` only: canonical option value → display text in this language. */
  option_labels?: Record<string, string>;
}

/**
 * Wording plus its translations. Top-level values are the business's PRIMARY
 * locale; `translations[locale]` overrides them per language.
 *
 * The two field kinds fall back differently. A built-in field with no
 * translation shows OUR localized default, so a Spanish visitor reads Spanish
 * rather than the merchant's French. A custom field has no default to reach
 * for, so it keeps the primary-locale text.
 */
export interface FieldWording extends FieldWordingText {
  translations?: Partial<Record<"en" | "fr" | "es", FieldWordingText>>;
}

/**
 * A field the business added to its own sign-up form. `key` is the
 * `{{variable}}` name it renders under on the card; `helper_text` is the
 * customer-facing reason it's being asked, and is mandatory.
 */
export interface CustomFieldDefinition extends FieldWording {
  key: string;
  label: string;
  helper_text: string;
  type: CustomFieldType;
  /** Absent means "required" (fields created before modes existed). "off"
   *  fields aren't on the form at all. */
  mode?: "off" | "optional" | "required";
  /** Canonical option values, in the primary locale. These are what get
   *  submitted and stored; `option_labels` only changes what is displayed. */
  options?: string[];
  max_length?: number | null;
  min?: number | null;
  max?: number | null;
}

export interface CustomerPublicResponse {
  status: "created" | "exists_email_sent";
  customer_id?: string;
  pass_url?: string;
  google_wallet_url?: string;
  message: string;
  /** True when the backend emailed the card as part of this signup. */
  emailed?: boolean;
}

// ============================================
// API Functions
// ============================================

/**
 * Get a business by its URL slug.
 * This is a public endpoint - no authentication required.
 */
export async function getBusinessBySlug(
  slug: string,
  opts?: { fresh?: boolean }
): Promise<{ data: BusinessPublicResponse | null; error: string | null }> {
  try {
    // `fresh` bypasses the Data Cache — used to self-heal a stale "still in
    // setup" snapshot (see getActiveCardDesign / AcquisitionPageView).
    const response = await fetch(`${API_URL}/businesses/slug/${slug}`, {
      cache: opts?.fresh ? "no-store" : undefined,
      next: opts?.fresh
        ? undefined
        : {
            revalidate: ACQUISITION_REVALIDATE_SECONDS,
            tags: [businessSlugTag(slug)],
          },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, error: "Business not found" };
      }
      return { data: null, error: `Failed to fetch business (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch business",
    };
  }
}

/**
 * Get the active card design for a business.
 * This is a public endpoint - no authentication required.
 */
export async function getActiveCardDesign(
  businessId: string,
  opts?: { fresh?: boolean }
): Promise<{ data: CardDesignPublicResponse | null; error: string | null }> {
  try {
    // A cached null/inactive design is almost always a stale snapshot taken
    // while the business was still setting up (the Data Cache holds it for
    // ACQUISITION_REVALIDATE_SECONDS with no activation webhook). `fresh`
    // re-reads uncached so the page recovers the moment the design goes live.
    const response = await fetch(`${API_URL}/designs/${businessId}/active`, {
      cache: opts?.fresh ? "no-store" : undefined,
      next: opts?.fresh
        ? undefined
        : {
            revalidate: ACQUISITION_REVALIDATE_SECONDS,
            tags: [businessDesignTag(businessId)],
          },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { data: null, error: "No active card design found" };
      }
      return { data: null, error: `Failed to fetch card design (${response.status})` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to fetch card design",
    };
  }
}

/**
 * Register a new customer for a business.
 * This is a public endpoint - no authentication required.
 *
 * If the customer already exists (by email), returns status "exists_email_sent"
 * and sends them their pass via email for security.
 *
 * `locationSlug` comes from a per-store enrollment URL (`/{biz_slug}/l/{location_slug}`)
 * and tags where the customer signed up. The backend resolves it for Pro businesses and
 * silently ignores unknown/typo'd slugs (falls back to parent-org attribution).
 */
export async function createPublicCustomer(
  businessId: string,
  data: CustomerCreatePublic,
  locationSlug?: string | null
): Promise<{
  data: CustomerPublicResponse | null;
  error: string | null;
  code?: string;
  fieldError?: SubmissionFieldError | null;
}> {
  try {
    // `location_slug` is URL-derived (per-store enrollment link), not form input.
    // Only include it when present so plain `/{slug}` enrollment sends an unchanged body.
    const body = locationSlug ? { ...data, location_slug: locationSlug } : data;

    const response = await fetch(`${API_URL}/public/customers/${businessId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `Failed to register (${response.status})`;
      let code: string | undefined;
      let fieldError: SubmissionFieldError | null = null;

      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        errorMessage = errorData.detail[0]?.msg || errorMessage;
      } else if (errorData.detail && typeof errorData.detail === "object") {
        // Standardized structured error, e.g. the card-upfront checkout gate
        // ({ code: "CHECKOUT_REQUIRED", ... }) — surface the code so the flow
        // can show a friendly "not open yet" state instead of a retry error.
        code = errorData.detail.code as string | undefined;
        errorMessage = (errorData.detail.message as string) || errorMessage;
        // A per-field rejection ({ field, reason }) belongs on the input, not
        // in a full-page error that would throw away everything typed.
        fieldError = mapSubmissionError(errorData.detail);
      }

      return { data: null, error: errorMessage, code, fieldError };
    }

    const responseData = await response.json();
    return { data: responseData, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Failed to register",
    };
  }
}
