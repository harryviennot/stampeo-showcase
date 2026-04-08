"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { CustomerCreatePublic } from "@/lib/acquisition";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { isValidPhone, detectDefaultCountry } from "@/lib/phone-utils";
import type { CountryCode } from "libphonenumber-js";

type FieldCollectionMode = "off" | "required" | "optional";

interface DataCollectionSettings {
  collect_name?: FieldCollectionMode | boolean;
  collect_email?: FieldCollectionMode | boolean;
  collect_phone?: FieldCollectionMode | boolean;
}

/** Normalize legacy boolean values to the new tri-state */
function normalizeFieldMode(value: FieldCollectionMode | boolean | undefined, fallback: FieldCollectionMode): FieldCollectionMode {
  if (value === true) return "required";
  if (value === false) return "off";
  if (value === undefined) return fallback;
  return value;
}

interface AcquisitionFormProps {
  dataCollection?: DataCollectionSettings;
  onSubmit: (data: CustomerCreatePublic) => void;
}

export function AcquisitionForm({
  dataCollection,
  onSubmit,
}: AcquisitionFormProps) {
  const t = useTranslations("acquisition.form");
  const ta = useTranslations("acquisition");

  // Normalize settings (handles legacy booleans)
  const nameMode = normalizeFieldMode(dataCollection?.collect_name, "required");
  const emailMode = normalizeFieldMode(dataCollection?.collect_email, "required");
  const phoneMode = normalizeFieldMode(dataCollection?.collect_phone, "off");

  const showName = nameMode !== "off";
  const showEmail = emailMode !== "off";
  const showPhone = phoneMode !== "off";
  const nameRequired = nameMode === "required";
  const emailRequired = emailMode === "required";
  const phoneRequired = phoneMode === "required";

  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry] = useState<CountryCode>(() => detectDefaultCountry(locale));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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
      return;
    }

    setErrors({});
    onSubmit({
      name: showName ? name.trim() : undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  const isAnonymous = !showName && !showEmail && !showPhone;

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
        <p className="text-xs text-center text-[var(--muted-foreground)]">
          {ta.rich("privacyNote", {
            bold: (chunks) => <span className="font-medium">{chunks}</span>,
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showName && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {t("name")} {!nameRequired && <span className="text-[var(--muted-foreground)] font-normal">{t("optional")}</span>}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder={t("namePlaceholder")}
            className={`
              w-full px-4 py-3 rounded-xl border bg-white
              text-[var(--primary)] placeholder:text-[var(--muted-foreground)]
              focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
              transition-all
              ${errors.name ? "border-red-500" : "border-[var(--border)]"}
            `}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
      )}

      {showEmail && (
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {t("email")} {!emailRequired && <span className="text-[var(--muted-foreground)] font-normal">{t("optional")}</span>}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            placeholder={t("emailPlaceholder")}
            className={`
              w-full px-4 py-3 rounded-xl border bg-white
              text-[var(--primary)] placeholder:text-[var(--muted-foreground)]
              focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
              transition-all
              ${errors.email ? "border-red-500" : "border-[var(--border)]"}
            `}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
          {!emailRequired && !errors.email && (
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t("emailOptionalHint")}</p>
          )}
        </div>
      )}

      {showPhone && (
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {t("phone")} {!phoneRequired && <span className="text-[var(--muted-foreground)] font-normal">{t("optional")}</span>}
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
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full btn-primary py-3.5 text-base font-semibold mt-2"
      >
        {ta("getMyCard")}
      </button>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        {ta.rich("privacyNote", {
          bold: (chunks) => <span className="font-medium">{chunks}</span>,
        })}
      </p>
    </form>
  );
}
