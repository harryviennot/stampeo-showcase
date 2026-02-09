"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CustomerCreatePublic } from "@/lib/acquisition";

interface DataCollectionSettings {
  collect_name?: boolean;
  collect_email?: boolean;
  collect_phone?: boolean;
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

  // Default to collecting name and email if not specified
  const collectName = dataCollection?.collect_name ?? true;
  const collectEmail = dataCollection?.collect_email ?? true;
  const collectPhone = dataCollection?.collect_phone ?? false;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - allows various formats
    const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phone.length >= 6 && re.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (collectName && !name.trim()) {
      newErrors.name = t("nameRequired");
    }

    if (collectEmail && !email.trim()) {
      newErrors.email = t("emailRequired");
    } else if (collectEmail && !validateEmail(email)) {
      newErrors.email = t("emailInvalid");
    }

    if (collectPhone && !phone.trim()) {
      newErrors.phone = t("phoneRequired");
    } else if (collectPhone && phone.trim() && !validatePhone(phone)) {
      newErrors.phone = t("phoneInvalid");
    }

    // At least one identifier is required
    if (!collectEmail && !collectPhone) {
      // Business doesn't collect either - this shouldn't happen but handle gracefully
    } else if (!email.trim() && !phone.trim() && (collectEmail || collectPhone)) {
      if (collectEmail) {
        newErrors.email = t("emailOrPhoneRequired");
      }
      if (collectPhone) {
        newErrors.phone = t("emailOrPhoneRequired");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      name: collectName ? name.trim() : undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {collectName && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {t("name")}
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

      {collectEmail && (
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {t("email")}
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
        </div>
      )}

      {collectPhone && (
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[var(--primary)] mb-1.5"
          >
            {t("phone")}
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            placeholder={t("phonePlaceholder")}
            className={`
              w-full px-4 py-3 rounded-xl border bg-white
              text-[var(--primary)] placeholder:text-[var(--muted-foreground)]
              focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent
              transition-all
              ${errors.phone ? "border-red-500" : "border-[var(--border)]"}
            `}
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
