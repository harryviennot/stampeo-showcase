"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  CustomerCreatePublic,
  CustomFieldDefinition,
  FieldWording,
  FieldWordingText,
  PredefinedFieldKey,
} from "@/lib/acquisition";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { isValidPhone, detectDefaultCountry } from "@/lib/phone-utils";
import { isValidBirthday, type SubmissionFieldError } from "@/lib/signup-validation";
import type { CountryCode } from "libphonenumber-js";

type FieldCollectionMode = "off" | "required" | "optional";

interface DataCollectionSettings {
  collect_name?: FieldCollectionMode | boolean;
  collect_email?: FieldCollectionMode | boolean;
  collect_phone?: FieldCollectionMode | boolean;
  collect_birthday?: FieldCollectionMode | boolean;
  predefined?: Partial<Record<PredefinedFieldKey, FieldWording>>;
  custom_fields?: CustomFieldDefinition[];
}

/** Normalize legacy boolean values to the new tri-state */
function normalizeFieldMode(value: FieldCollectionMode | boolean | undefined, fallback: FieldCollectionMode): FieldCollectionMode {
  if (value === true) return "required";
  if (value === false) return "off";
  if (value === undefined) return fallback;
  return value;
}

const INPUT_CLASS = `
  w-full px-4 py-3 rounded-xl border bg-white
  text-[var(--primary)] placeholder:text-[var(--muted-foreground)]
  focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
  transition-all
`;

/**
 * Resolve a field's wording for the language this visitor is reading in.
 * Mirrors `normalize_definitions` in
 * backend/app/services/customer_fields.py — see `isCustom` for the two
 * fallback rules.
 */
function resolveWording(
  wording: FieldWording | undefined,
  locale: string,
  primaryLocale: string,
  isCustom: boolean
): FieldWordingText {
  if (!wording) return {};
  const isPrimary = locale === primaryLocale;
  const translated = isPrimary
    ? undefined
    : wording.translations?.[locale as Locale];

  const pick = (attr: "label" | "placeholder" | "helper_text") => {
    const localized = translated?.[attr]?.trim();
    if (localized) return localized;
    // A built-in field falls through to our own translated string; a custom
    // one has none, so the merchant's primary wording is the best we have.
    if (isPrimary || isCustom) return wording[attr]?.trim() || undefined;
    return undefined;
  };

  return {
    label: pick("label"),
    placeholder: pick("placeholder"),
    helper_text: pick("helper_text"),
    option_labels: translated?.option_labels,
  };
}

interface AcquisitionFormProps {
  dataCollection?: DataCollectionSettings;
  businessName: string;
  /** The language the merchant authored their wording in. */
  primaryLocale?: string;
  onSubmit: (data: CustomerCreatePublic) => void;
  /** A rejection the server pinned to one field, so it shows on that input
   *  rather than throwing the visitor back to a blank form. */
  serverFieldError?: SubmissionFieldError | null;
}

export function AcquisitionForm({
  dataCollection,
  businessName,
  primaryLocale = "fr",
  onSubmit,
  serverFieldError = null,
}: AcquisitionFormProps) {
  const t = useTranslations("acquisition.form");
  const ta = useTranslations("acquisition");
  const locale = useLocale();

  // Normalize settings (handles legacy booleans)
  const nameMode = normalizeFieldMode(dataCollection?.collect_name, "required");
  const emailMode = normalizeFieldMode(dataCollection?.collect_email, "required");
  const phoneMode = normalizeFieldMode(dataCollection?.collect_phone, "off");
  const birthdayMode = normalizeFieldMode(dataCollection?.collect_birthday, "off");

  const showName = nameMode !== "off";
  const showEmail = emailMode !== "off";
  const showPhone = phoneMode !== "off";
  const showBirthday = birthdayMode !== "off";
  const nameRequired = nameMode === "required";
  const emailRequired = emailMode === "required";
  const phoneRequired = phoneMode === "required";
  const birthdayRequired = birthdayMode === "required";

  // Fields the business defined itself. A retired ("off") field leaves the form
  // even though its stored answers keep rendering on existing cards.
  const customFields = useMemo(
    () => (dataCollection?.custom_fields ?? []).filter((f) => (f.mode ?? "required") !== "off"),
    [dataCollection?.custom_fields]
  );

  /**
   * The wording for a built-in field, in the visitor's language: the merchant's
   * own if they wrote one for this language, otherwise our translated default.
   */
  const wording = (field: PredefinedFieldKey) =>
    resolveWording(dataCollection?.predefined?.[field], locale, primaryLocale, false);
  const labelFor = (field: PredefinedFieldKey, fallback: string) =>
    wording(field).label || fallback;
  const placeholderFor = (field: PredefinedFieldKey, fallback: string) =>
    wording(field).placeholder || fallback;
  const helperFor = (field: PredefinedFieldKey) => wording(field).helper_text || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [phoneCountry] = useState<CountryCode>(() => detectDefaultCountry(locale));
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Set whenever new errors land, cleared once we've moved focus to the first
  // one, so re-renders don't keep yanking the page around.
  const [focusErrors, setFocusErrors] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  /** Server-side rejections localized per field, with the backend's reason
   *  slug picking the sentence. */
  const serverErrorText = (reason: string) => {
    switch (reason) {
      case "required":
        return t("fieldRequired");
      case "not_an_option":
        return t("optionInvalid");
      case "not_a_number":
        return t("numberInvalid");
      case "below_min":
      case "above_max":
        return t("numberOutOfRange");
      case "too_long":
        return t("valueTooLong");
      case "incomplete":
        return t("birthdayIncomplete");
      case "invalid":
        return t("birthdayInvalid");
      default:
        return t("fieldRejected");
    }
  };

  useEffect(() => {
    if (!serverFieldError) return;
    setErrors((prev) => ({
      ...prev,
      [serverFieldError.field]: serverErrorText(serverFieldError.reason),
    }));
    setFocusErrors(true);
    // serverErrorText closes over `t`, which is stable for a given locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverFieldError]);

  useEffect(() => {
    if (!focusErrors) return;
    setFocusErrors(false);
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!first) return;
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    first.focus({ preventScroll: true });
  }, [focusErrors]);

  const months = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
    return Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: formatter.format(new Date(Date.UTC(2024, i, 1))),
    }));
  }, [locale]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const setCustom = (key: string, value: string) => {
    setCustomValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors({ ...errors, [key]: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (nameRequired && !name.trim()) {
      newErrors.name = t("nameRequired");
    }

    if (emailRequired && !email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (showEmail && email.trim() && !validateEmail(email)) {
      newErrors.email = t("emailInvalid");
    }

    if (phoneRequired && !phone.trim()) {
      newErrors.phone = t("phoneRequired");
    } else if (showPhone && phone.trim() && !isValidPhone(phone, phoneCountry)) {
      newErrors.phone = t("phoneInvalid");
    }

    // A birthday is both parts or neither: half of one can't be stored.
    if (showBirthday) {
      const hasOne = !!birthDay || !!birthMonth;
      const hasBoth = !!birthDay && !!birthMonth;
      if ((birthdayRequired && !hasBoth) || (hasOne && !hasBoth)) {
        newErrors.birthday = t("birthdayIncomplete");
      } else if (hasBoth && !isValidBirthday(Number(birthDay), Number(birthMonth))) {
        // Every month offers 1-31, so "31 February" has to be caught here.
        newErrors.birthday = t("birthdayInvalid");
      }
    }

    for (const field of customFields) {
      const value = (customValues[field.key] ?? "").trim();
      if (!value) {
        if ((field.mode ?? "required") === "required") {
          newErrors[field.key] = t("fieldRequired");
        }
        continue;
      }
      if (field.type === "number") {
        const parsed = Number(value.replace(",", "."));
        if (Number.isNaN(parsed)) {
          newErrors[field.key] = t("numberInvalid");
        } else if (
          (field.min != null && parsed < field.min) ||
          (field.max != null && parsed > field.max)
        ) {
          newErrors[field.key] = t("numberOutOfRange");
        }
      }
    }

    // At least one identifier is required (only if business requires them)
    if (emailRequired || phoneRequired) {
      if (!email.trim() && !phone.trim()) {
        if (emailRequired) {
          newErrors.email = t("emailOrPhoneRequired");
        }
        if (phoneRequired) {
          newErrors.phone = t("emailOrPhoneRequired");
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // On a long form the first bad field can be well above the fold, and a
      // button that "does nothing" reads as broken.
      setFocusErrors(true);
      return;
    }

    setErrors({});
    onSubmit({
      name: showName ? name.trim() : undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      ...(birthDay && birthMonth
        ? { birth_day: Number(birthDay), birth_month: Number(birthMonth) }
        : {}),
      ...(customFields.length > 0
        ? {
            custom_fields: Object.fromEntries(
              customFields.map((f) => [f.key, (customValues[f.key] ?? "").trim()])
            ),
          }
        : {}),
    });
  };

  const isAnonymous =
    !showName && !showEmail && !showPhone && !showBirthday && customFields.length === 0;

  const privacyNote = (
    <p className="text-xs text-center text-[var(--muted-foreground)]">
      {ta.rich("privacyNote", {
        businessName,
        bold: (chunks) => <span className="font-medium">{chunks}</span>,
        privacy: (chunks) => (
          <Link href="/privacy" className="underline hover:text-[var(--foreground)]">
            {chunks}
          </Link>
        ),
      })}
    </p>
  );

  // Anonymous mode: no form fields, just a single button
  if (isAnonymous) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onSubmit({})}
          className="w-full btn-primary py-3.5 text-base font-semibold"
        >
          {ta("getMyCard")}
        </button>
        {privacyNote}
      </div>
    );
  }

  const optionalTag = (
    <span className="text-[var(--muted-foreground)] font-normal">{t("optional")}</span>
  );

  return (
    // noValidate: the browser's own bubbles fire before handleSubmit and
    // speak the BROWSER's language, not the visitor's chosen one.
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      {showName && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {labelFor("name", t("name"))} {!nameRequired && optionalTag}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder={placeholderFor("name", t("namePlaceholder"))}
            aria-invalid={!!errors.name}
            className={`${INPUT_CLASS} ${errors.name ? "border-red-500" : "border-[var(--border)]"}`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          {!errors.name && helperFor("name") && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{helperFor("name")}</p>
          )}
        </div>
      )}

      {showEmail && (
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {labelFor("email", t("email"))} {!emailRequired && optionalTag}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            placeholder={placeholderFor("email", t("emailPlaceholder"))}
            aria-invalid={!!errors.email}
            className={`${INPUT_CLASS} ${errors.email ? "border-red-500" : "border-[var(--border)]"}`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          {!errors.email && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {helperFor("email") || (!emailRequired ? t("emailOptionalHint") : "")}
            </p>
          )}
        </div>
      )}

      {showPhone && (
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {labelFor("phone", t("phone"))} {!phoneRequired && optionalTag}
          </label>
          <PhoneInput
            id="phone"
            value={phone}
            onChange={(val) => {
              setPhone(val);
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            defaultCountry={phoneCountry}
            error={!!errors.phone}
            required={phoneRequired}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          {!errors.phone && helperFor("phone") && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{helperFor("phone")}</p>
          )}
        </div>
      )}

      {/* Day + month, never a year: enough to send a birthday treat, and it
          keeps this out of date-of-birth territory. */}
      {showBirthday && (
        <div>
          <label className="block text-sm font-medium text-[var(--primary)] mb-1.5">
            {labelFor("birthday", t("birthday"))} {!birthdayRequired && optionalTag}
          </label>
          <div className="flex gap-2">
            <select
              aria-label={t("birthdayDay")}
              value={birthDay}
              onChange={(e) => {
                setBirthDay(e.target.value);
                if (errors.birthday) setErrors({ ...errors, birthday: "" });
              }}
              aria-invalid={!!errors.birthday}
              className={`${INPUT_CLASS} flex-1 ${errors.birthday ? "border-red-500" : "border-[var(--border)]"}`}
            >
              <option value="">{t("birthdayDay")}</option>
              {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              aria-label={t("birthdayMonth")}
              value={birthMonth}
              onChange={(e) => {
                setBirthMonth(e.target.value);
                if (errors.birthday) setErrors({ ...errors, birthday: "" });
              }}
              aria-invalid={!!errors.birthday}
              className={`${INPUT_CLASS} flex-[1.5] ${errors.birthday ? "border-red-500" : "border-[var(--border)]"}`}
            >
              <option value="">{t("birthdayMonth")}</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          {errors.birthday && <p className="mt-1 text-sm text-red-500">{errors.birthday}</p>}
          {!errors.birthday && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {helperFor("birthday") || t("birthdayHint")}
            </p>
          )}
        </div>
      )}

      {/* The business's own questions. `helper_text` is mandatory when the
          field is created, so every one of these carries a stated reason. */}
      {customFields.map((field) => {
        const value = customValues[field.key] ?? "";
        const error = errors[field.key];
        const borderClass = error ? "border-red-500" : "border-[var(--border)]";
        const text = resolveWording(field, locale, primaryLocale, true);
        return (
          <div key={field.key}>
            <label
              htmlFor={`custom-${field.key}`}
              className="block text-sm font-medium text-[var(--primary)] mb-1.5"
            >
              {text.label || field.label}{" "}
              {(field.mode ?? "required") !== "required" && optionalTag}
            </label>
            {field.type === "choice" ? (
              <select
                id={`custom-${field.key}`}
                value={value}
                onChange={(e) => setCustom(field.key, e.target.value)}
                aria-invalid={!!error}
                className={`${INPUT_CLASS} ${borderClass}`}
              >
                <option value="">
                  {text.placeholder || field.placeholder || t("choosePlaceholder")}
                </option>
                {/* The VALUE stays the canonical (primary-locale) option so the
                    answer we store never depends on the visitor's language;
                    only the label is translated. */}
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {text.option_labels?.[option]?.trim() || option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`custom-${field.key}`}
                type={field.type === "number" ? "number" : "text"}
                inputMode={field.type === "number" ? "numeric" : undefined}
                min={field.type === "number" ? field.min ?? undefined : undefined}
                max={field.type === "number" ? field.max ?? undefined : undefined}
                maxLength={field.type === "text" ? field.max_length ?? undefined : undefined}
                value={value}
                onChange={(e) => setCustom(field.key, e.target.value)}
                placeholder={text.placeholder || field.placeholder}
                aria-invalid={!!error}
                className={`${INPUT_CLASS} ${borderClass}`}
              />
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {!error && (text.helper_text || field.helper_text) && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {text.helper_text || field.helper_text}
              </p>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        className="w-full btn-primary py-3.5 text-base font-semibold mt-2"
      >
        {ta("getMyCard")}
      </button>

      {privacyNote}
    </form>
  );
}
