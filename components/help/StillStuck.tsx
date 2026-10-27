import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { EnvelopeIcon, PhoneIcon, WhatsappLogoIcon } from "@/components/icons";
import { ContactLink } from "@/components/ui/ContactLink";
import { SUPPORT_EMAIL, SUPPORT_MAILTO, SUPPORT_PHONE, SUPPORT_TEL, SUPPORT_WHATSAPP } from "@/lib/help/contact";

interface Row {
  key: "email" | "whatsapp" | "phone";
  href: string;
  value: string;
  Icon: ComponentType<{ className?: string; size?: number }>;
  newTab?: boolean;
}

const ROWS: readonly Row[] = [
  { key: "email", href: SUPPORT_MAILTO, value: SUPPORT_EMAIL, Icon: EnvelopeIcon },
  { key: "whatsapp", href: SUPPORT_WHATSAPP, value: SUPPORT_PHONE, Icon: WhatsappLogoIcon, newTab: true },
  { key: "phone", href: SUPPORT_TEL, value: SUPPORT_PHONE, Icon: PhoneIcon },
];

/** The last block of every help page: three ways to reach a person. */
export function StillStuck() {
  const t = useTranslations("help.stillStuck");

  return (
    <section
      aria-labelledby="help-still-stuck"
      className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-5 sm:p-6"
    >
      <h2 id="help-still-stuck" className="text-h3 text-[var(--near-black)]">
        {t("title")}
      </h2>
      <p className="mt-1 text-[var(--muted-foreground)]">{t("intro")}</p>
      <ul className="mt-3 divide-y divide-[var(--border)]">
        {ROWS.map(({ key, href, value, Icon, newTab }) => (
          <li key={key}>
            <ContactLink
              href={href}
              {...(newTab ? { target: "_blank", rel: "noopener" } : {})}
              className="flex min-h-14 items-center gap-4 py-2 transition-colors hover:text-[var(--accent)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Icon aria-hidden className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-semibold text-[var(--near-black)]">{t(key)}</span>
                <span className="block text-sm text-[var(--muted-foreground)]">{value}</span>
              </span>
            </ContactLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
