"use client";

import { useState } from "react";
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
      newErrors.name = "Name is required";
    }

    if (collectEmail && !email.trim()) {
      newErrors.email = "Email is required";
    } else if (collectEmail && !validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (collectPhone && !phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (collectPhone && phone.trim() && !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // At least one identifier is required
    if (!collectEmail && !collectPhone) {
      // Business doesn't collect either - this shouldn't happen but handle gracefully
    } else if (!email.trim() && !phone.trim() && (collectEmail || collectPhone)) {
      if (collectEmail) {
        newErrors.email = "Email or phone is required";
      }
      if (collectPhone) {
        newErrors.phone = "Email or phone is required";
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
            Your name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder="Enter your name"
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
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            placeholder="you@example.com"
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
            Phone number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            placeholder="+1 (555) 123-4567"
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
        Get my card
      </button>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        Your information is only shared with {" "}
        <span className="font-medium">this business</span> for their loyalty
        program.
      </p>
    </form>
  );
}
