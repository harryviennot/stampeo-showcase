import { cookies } from "next/headers";
import { joinLocale } from "@/lib/join-locale";

/**
 * Root layout for /join, which lives outside [locale] (see the page), so it
 * provides its own <html>/<body>. The page styles itself inline and loads no
 * site CSS.
 */
export default async function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = joinLocale((await cookies()).get("NEXT_LOCALE")?.value);

  return (
    <html lang={locale}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
