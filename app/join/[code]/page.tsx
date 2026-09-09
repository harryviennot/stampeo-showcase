import { cookies } from "next/headers";
import type { Metadata } from "next";
import { OpenInApp } from "./open-in-app";

/**
 * Landing page for an emailed scanner join code.
 *
 * This URL does double duty. With the app installed the OS never renders this:
 * the Universal Link / App Link opens the scanner app straight at the join
 * screen. Without it, this is what the employee sees, so it has to carry the
 * code and the store links on its own.
 *
 * Deliberately outside [locale]: the path is claimed verbatim in the AASA file,
 * and a locale redirect would leave the fallback pointing at a URL that does
 * not exist. Copy is picked from the NEXT_LOCALE cookie instead, the same way
 * /go/app stays non-localized.
 */

const APP_STORE_URL = "https://apps.apple.com/app/id6761758382";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.hryvnt.stampeo";

const ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

type Locale = "en" | "fr" | "es" | "pl";

const COPY: Record<Locale, Record<string, string>> = {
  en: {
    eyebrow: "Join your team",
    title: "Your team code",
    body: "Open the Stampeo scanner app and enter this code. It works once.",
    open: "Open the app",
    noApp: "Don't have the app yet?",
    invalid: "That link doesn't look right",
    invalidBody: "Check the code in your email, or ask your manager for a new one.",
  },
  fr: {
    eyebrow: "Rejoignez votre équipe",
    title: "Votre code d'équipe",
    body: "Ouvrez l'application de scan Stampeo et saisissez ce code. Il fonctionne une seule fois.",
    open: "Ouvrir l'application",
    noApp: "Vous n'avez pas encore l'application ?",
    invalid: "Ce lien semble incorrect",
    invalidBody: "Vérifiez le code dans votre email, ou demandez-en un nouveau à votre responsable.",
  },
  es: {
    eyebrow: "Únete a tu equipo",
    title: "Tu código de equipo",
    body: "Abre la aplicación de escaneo de Stampeo e introduce este código. Solo funciona una vez.",
    open: "Abrir la aplicación",
    noApp: "¿Aún no tienes la aplicación?",
    invalid: "Este enlace no parece correcto",
    invalidBody: "Comprueba el código de tu email, o pídele uno nuevo a tu responsable.",
  },
  pl: {
    eyebrow: "Dołącz do zespołu",
    title: "Twój kod zespołu",
    body: "Otwórz aplikację Stampeo do skanowania i wpisz ten kod. Działa tylko raz.",
    open: "Otwórz aplikację",
    noApp: "Nie masz jeszcze aplikacji?",
    invalid: "Ten link wygląda na nieprawidłowy",
    invalidBody: "Sprawdź kod w wiadomości e-mail lub poproś przełożonego o nowy.",
  },
};

function normalize(raw: string): string {
  return decodeURIComponent(raw)
    .toUpperCase()
    .split("")
    .filter((c) => ALPHABET.includes(c))
    .join("");
}

function isValid(code: string): boolean {
  return code.length === 6;
}

export const metadata: Metadata = {
  title: "Join your team | Stampeo",
  // Nothing here should ever reach a search index: the path carries a
  // single-use credential.
  robots: { index: false, follow: false },
};

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: raw } = await params;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = (["en", "fr", "es", "pl"] as const).includes(
    cookieLocale as Locale
  )
    ? (cookieLocale as Locale)
    : "fr";
  const t = COPY[locale];

  const code = normalize(raw);
  const valid = isValid(code);
  const display = valid ? `${code.slice(0, 3)}-${code.slice(3)}` : "";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f0efe9",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#f97316",
            margin: "0 0 12px",
          }}
        >
          {t.eyebrow}
        </p>

        {valid ? (
          <>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#2d3436",
                margin: "0 0 10px",
              }}
            >
              {t.title}
            </h1>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "#6b7280",
                margin: "0 0 24px",
              }}
            >
              {t.body}
            </p>

            <div
              style={{
                background: "#fff",
                border: "2px solid #f97316",
                borderRadius: 14,
                padding: "26px 16px",
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 36,
                  fontWeight: 700,
                  letterSpacing: "6px",
                  color: "#2d3436",
                }}
              >
                {display}
              </span>
            </div>

            <OpenInApp code={code} label={t.open} />
          </>
        ) : (
          <>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#2d3436",
                margin: "0 0 10px",
              }}
            >
              {t.invalid}
            </h1>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "#6b7280",
                margin: "0 0 24px",
              }}
            >
              {t.invalidBody}
            </p>
          </>
        )}

        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
            margin: "28px 0 10px",
          }}
        >
          {t.noApp}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href={APP_STORE_URL}
            style={{ color: "#f97316", fontWeight: 600, fontSize: 15 }}
          >
            App Store
          </a>
          <span style={{ color: "#c9c3b6" }}>&middot;</span>
          <a
            href={PLAY_STORE_URL}
            style={{ color: "#f97316", fontWeight: 600, fontSize: 15 }}
          >
            Google Play
          </a>
        </div>
      </div>
    </main>
  );
}
