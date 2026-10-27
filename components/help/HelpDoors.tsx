import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { PaperPlaneIcon, QRCodeIcon, WalletIcon } from "@/components/icons";
import type { Door, DoorKey } from "@/lib/help/home/topics";

const ICONS: Record<DoorKey, ComponentType<{ className?: string }>> = {
  setup: WalletIcon,
  counter: QRCodeIcon,
  customers: PaperPlaneIcon,
};

const COLUMNS: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" };

/** The "I'm…" entry points under the search: three doors, the only 3D cards in the help center. */
export function HelpDoors({ doors }: { doors: readonly Door[] }) {
  const t = useTranslations("help.home.doors");

  if (doors.length === 0) return null;

  return (
    <ul className={`grid gap-3 md:gap-4 ${COLUMNS[doors.length]}`}>
      {doors.map((door) => {
        const Icon = ICONS[door.key];
        return (
          <li key={door.key}>
            <a
              href={`/help/topics/${door.category}`}
              className="blog-card-3d flex min-h-[4.75rem] items-center gap-4 rounded-2xl bg-white p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <Icon aria-hidden className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="text-h3 block text-[var(--near-black)]">{t(`${door.key}.title`)}</span>
                <span className="block text-sm text-[var(--muted-foreground)]">{t(`${door.key}.line`)}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
