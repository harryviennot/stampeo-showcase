import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Changelog graphics (dev)",
  robots: { index: false },
};

/**
 * Root layout for the dev-only /internal segment. It lives outside [locale]
 * (excluded from the next-intl middleware matcher), so it provides its own
 * <html>/<body>. The intl provider lives in Studio, which switches locale
 * per export; the page supplies the per-locale messages.
 *
 * NODE_ENV is "production" during `next build`, so the prod prerender of this
 * whole segment is a 404 page: nothing here ever ships to visitors.
 */
export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
