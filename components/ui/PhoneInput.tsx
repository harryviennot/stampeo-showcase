"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import type { CountryCode } from "libphonenumber-js";
import { getCountryCallingCode } from "libphonenumber-js";
import {
  getCountryList,
  detectDefaultCountry,
  formatToE164,
  formatAsYouType,
  getExamplePhoneNumber,
  type CountryEntry,
} from "@/lib/phone-utils";

interface PhoneInputProps {
  value: string;
  onChange: (e164Value: string) => void;
  defaultCountry?: CountryCode;
  error?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function PhoneInput({
  value,
  onChange,
  defaultCountry,
  error,
  required,
  placeholder,
  className,
  id,
}: PhoneInputProps) {
  const locale = useLocale();
  const [country, setCountry] = useState<CountryCode>(
    defaultCountry || detectDefaultCountry(locale)
  );
  const countries = useMemo(() => getCountryList(locale), [locale]);

  const [nationalInput, setNationalInput] = useState(() => {
    if (!value) return "";
    const dialCode = `+${getCountryCallingCode(country)}`;
    if (value.startsWith(dialCode)) {
      return formatAsYouType(value.slice(dialCode.length), country);
    }
    return value;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setSearch("");
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [dropdownOpen]);

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countries, search]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatAsYouType(raw, country);
      setNationalInput(formatted);

      // Try to parse as E.164
      const e164 = formatToE164(raw, country);
      onChange(e164 || raw);
    },
    [country, onChange]
  );

  const handleCountrySelect = useCallback(
    (entry: CountryEntry) => {
      setCountry(entry.code);
      setDropdownOpen(false);
      setSearch("");

      // Re-parse existing input with new country
      if (nationalInput) {
        const e164 = formatToE164(nationalInput, entry.code);
        onChange(e164 || nationalInput);
        setNationalInput(formatAsYouType(nationalInput, entry.code));
      }

      // Focus the phone input after selection
      inputRef.current?.focus();
    },
    [nationalInput, onChange]
  );

  const selectedCountry = countries.find((c) => c.code === country);
  const exampleNumber = getExamplePhoneNumber(country);

  return (
    <div className={`relative ${className || ""}`}>
      <div
        className={`
          flex items-stretch rounded-xl border overflow-hidden
          bg-white/50 dark:bg-white/5
          transition-all duration-200
          focus-within:ring-2 focus-within:ring-[var(--accent)]/50 focus-within:border-[var(--accent)]
          ${error ? "border-red-500" : "border-[var(--border)]"}
        `}
      >
        {/* Country selector button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="
            flex items-center gap-1.5 px-3 shrink-0
            border-r border-[var(--border)]
            hover:bg-black/5 dark:hover:bg-white/10
            transition-colors duration-150
            text-sm text-[var(--foreground)]
          "
          aria-label="Select country"
          aria-expanded={dropdownOpen}
        >
          <span className="text-lg leading-none">{selectedCountry?.flag}</span>
          <span className="text-[var(--muted-foreground)]">
            {selectedCountry?.dialCode}
          </span>
          <svg
            className={`w-3 h-3 text-[var(--muted-foreground)] transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Phone number input */}
        <input
          ref={inputRef}
          id={id}
          type="tel"
          value={nationalInput}
          onChange={handleInputChange}
          placeholder={placeholder || exampleNumber}
          required={required}
          className="
            flex-1 px-4 py-3.5
            bg-transparent outline-none
            text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
            min-w-0
          "
          autoComplete="tel-national"
        />
      </div>

      {/* Country dropdown */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute z-50 left-0 mt-1 w-full
            bg-white dark:bg-gray-900
            border border-[var(--border)] rounded-xl
            shadow-lg shadow-black/10
            overflow-hidden
          "
        >
          {/* Search */}
          <div className="p-2 border-b border-[var(--border)]">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === "fr" ? "Rechercher un pays..." : "Search countries..."}
              className="
                w-full px-3 py-2 rounded-lg
                bg-gray-50 dark:bg-gray-800
                text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]
                border border-[var(--border)]
                outline-none focus:ring-1 focus:ring-[var(--accent)]/50
              "
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDropdownOpen(false);
                  setSearch("");
                }
              }}
            />
          </div>

          {/* Country list */}
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filteredCountries.map((entry, i) => {
              // Show separator after priority countries
              const isPriorityEnd =
                !search &&
                i > 0 &&
                i < countries.length &&
                countries[i - 1] !== undefined &&
                isPriorityCountry(countries[i - 1].code) &&
                !isPriorityCountry(entry.code);

              return (
                <div key={entry.code}>
                  {isPriorityEnd && (
                    <div className="border-t border-[var(--border)] my-1" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(entry)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      transition-colors duration-100
                      ${entry.code === country ? "bg-[var(--accent)]/5 font-medium" : ""}
                    `}
                  >
                    <span className="text-lg leading-none">{entry.flag}</span>
                    <span className="flex-1 text-[var(--foreground)] truncate">
                      {entry.name}
                    </span>
                    <span className="text-[var(--muted-foreground)] shrink-0">
                      {entry.dialCode}
                    </span>
                  </button>
                </div>
              );
            })}
            {filteredCountries.length === 0 && (
              <div className="px-3 py-4 text-sm text-center text-[var(--muted-foreground)]">
                {locale === "fr" ? "Aucun pays trouvé" : "No countries found"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Check if a country is in the priority list */
const PRIORITY_SET = new Set([
  "FR", "BE", "CH", "CA", "US", "GB", "DE", "ES", "IT", "PT", "NL",
  "MA", "TN", "DZ", "SN", "CI", "CM",
]);

function isPriorityCountry(code: CountryCode): boolean {
  return PRIORITY_SET.has(code);
}
