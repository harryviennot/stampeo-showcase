"use client";

import { Check } from "@phosphor-icons/react";
import { isPasswordAcceptable } from "@/lib/auth/password-rules";

/** The single password requirement line: muted until the password meets it, then green with a tick. */
export function PasswordRequirement({ password, label }: { password: string; label: string }) {
  const met = isPasswordAcceptable(password);
  return (
    <p
      className={`flex items-center gap-1.5 text-xs mt-2 transition-colors ${
        met ? "text-green-600 dark:text-green-400" : "text-[var(--muted-foreground)]"
      }`}
    >
      <Check size={12} weight={met ? "bold" : "regular"} />
      {label}
    </p>
  );
}
