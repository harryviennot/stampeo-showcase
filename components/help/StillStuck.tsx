import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { EnvelopeIcon, PhoneIcon, WhatsappLogoIcon } from "@/components/icons";
import { ContactLink } from "@/components/ui/ContactLink";
import { SUPPORT_EMAIL, SUPPORT_MAILTO, SUPPORT_PHONE, SUPPORT_TEL, SUPPORT_WHATSAPP } from "@/lib/help/contact";

type Channel = "email" | "whatsapp" | "phone";

interface Row {
  key: Channel;
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

const COLUMNS: Record<number, string> = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" };

/**
 * Three ways to reach a person, as rows on a phone and columns from `sm` up.
 * A search with no result offers only the two that suit a message.
 */
export function StillStuck({
  channels = ["email", "whatsapp", "phone"],
  className = "",
}: {
  channels?: readonly Channel[];
  className?: string;
}) {
  const t = useTranslations("help.stillStuck");
  const rows = ROWS.filter((row) => channels.includes(row.key));

  return (
    <section
      aria-labelledby="help-still-stuck"
      className={`rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-5 sm:p-6 ${className}`}
    >
      <h2 id="help-still-stuck" className="text-h3 text-[var(--near-black)]">
        {t("title")}
      </h2>
      <p className="mt-1 text-[var(--muted-foreground)]">{t("intro")}</p>
      <ul className={`mt-3 divide-y divide-[var(--border)] sm:mt-4 sm:grid sm:gap-4 sm:divide-y-0 ${COLUMNS[rows.length]}`}>
        {rows.map(({ key, href, value, Icon, newTab }) => (
          <li key={key}>
            <ContactLink
              href={href}
              {...(newTab ? { target: "_blank", rel: "noopener" } : {})}
              className="flex min-h-14 items-center gap-4 py-2 transition-colors hover:text-[var(--accent)] sm:flex-col sm:items-start sm:gap-3 sm:py-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Icon aria-hidden className="h-5 w-5" />
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
