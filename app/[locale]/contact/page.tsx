"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold mb-4">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t("hero.headline")}
            </h1>
            <p className="text-lg text-[var(--muted-foreground)]">
              {t("hero.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-[var(--cream)] rounded-2xl p-8 md:p-10 border border-white/50">
              <form
                className="space-y-5"
                action={`mailto:hello@stampeo.app`}
                method="POST"
                encType="text/plain"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    {t("form.name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder={t("form.namePlaceholder")}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--accent)]/10 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    {t("form.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder={t("form.emailPlaceholder")}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--accent)]/10 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    {t("form.subject")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    placeholder={t("form.subjectPlaceholder")}
                    className="w-full h-11 px-4 rounded-xl border border-[var(--accent)]/10 bg-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    {t("form.message")}
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder={t("form.messagePlaceholder")}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--accent)]/10 bg-white/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all"
                >
                  {t("form.send")}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="bg-[var(--cream)] rounded-2xl p-8 md:p-10 border border-white/50 space-y-8 h-fit">
              <h2 className="text-xl font-bold">{t("info.title")}</h2>

              <div className="space-y-6">
                {(["email", "support", "location"] as const).map((key) => (
                  <div key={key} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                      {key === "email" && <MailIcon />}
                      {key === "support" && <SupportIcon />}
                      {key === "location" && <LocationIcon />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{t(`info.${key}.title`)}</h3>
                      <p className="text-[var(--accent)] text-sm font-medium">
                        {t(`info.${key}.value`)}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {t(`info.${key}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-semibold mb-2">{t("social.title")}</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  {t("social.description")}
                </p>
                <div className="flex gap-3">
                  <SocialLink
                    href="https://x.com/stampeo_app"
                    label="X (Twitter)"
                  >
                    <svg
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                  </SocialLink>
                  <SocialLink
                    href="https://linkedin.com/company/stampeo"
                    label="LinkedIn"
                  >
                    <svg
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </SocialLink>
                  <SocialLink
                    href="https://instagram.com/stampeo.app"
                    label="Instagram"
                  >
                    <svg
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </SocialLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="w-10 h-10 rounded-lg bg-[var(--accent)]/5 flex items-center justify-center hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] transition-all text-[var(--muted-foreground)]"
    >
      {children}
    </Link>
  );
}

function MailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}
