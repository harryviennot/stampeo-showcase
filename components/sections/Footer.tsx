"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

function StampeoLogo() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("common.footer");
  const locale = useLocale();

  return (
    <footer className="relative w-full bg-[var(--foreground)] text-white pt-20 pb-10 overflow-hidden">
      {/* Subtle Geometric Background Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-[10%] w-16 h-16 rounded-full bg-[var(--accent)]/5" />
        <div className="absolute bottom-20 left-[25%] w-24 h-24 rounded-full bg-[var(--stamp-sage)]/5" />
        <div className="absolute top-20 right-[15%] w-20 h-20 rounded-lg bg-[var(--accent)]/5 rotate-12" />
        <div className="absolute -bottom-10 right-[5%] w-32 h-32 rounded-full border-2 border-[var(--stamp-sage)]/5" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Top Section: Four Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-[var(--accent)]">
                <StampeoLogo />
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Stampeo</h2>
            </Link>
            <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-[240px]">
              {t("description")}
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white text-base font-bold">{t("product")}</h3>
            <nav className="flex flex-col gap-4">
              <Link href="/#features" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                {t("features")}
              </Link>
              <Link href="/#pricing" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                {t("pricing")}
              </Link>
              <Link href="/#faq" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                {t("howItWorks")}
              </Link>
              {locale === "fr" && (
                <Link href="/blog" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                  {t("blog")}
                </Link>
              )}
            </nav>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white text-base font-bold">{t("company")}</h3>
            <nav className="flex flex-col gap-4">
              <Link href="/about" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                {t("about")}
              </Link>
              <Link href="/contact" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                {t("contact")}
              </Link>
            </nav>
          </div>

          {/* Column 4: Legal & Social */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-white text-base font-bold mb-6">{t("legal")}</h3>
              <nav className="flex flex-col gap-4">
                <Link href="/privacy" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                  {t("privacyPolicy")}
                </Link>
                <Link href="/terms" className="text-[#a1a1aa] hover:text-[var(--accent)] transition-colors text-sm font-medium">
                  {t("termsOfService")}
                </Link>
              </nav>
            </div>

            {/* Social Icons */}
            <div className="mt-4 flex gap-4">
              <a
                href="https://x.com/stampeo_app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] transition-all text-[#a1a1aa]"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/stampeo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] transition-all text-[#a1a1aa]"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/stampeo.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] transition-all text-[#a1a1aa]"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#a1a1aa] text-xs font-normal">
            {t("allRightsReserved", { year: new Date().getFullYear() })}
          </p>
          <p className="text-[#a1a1aa] text-xs font-medium">
            {t("builtForLocal")}
          </p>
        </div>
      </div>
    </footer>
  );
}
