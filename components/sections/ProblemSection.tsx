import { Container } from "../ui/Container";

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 lg:py-36 relative">
      <Container>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
            Paper cards disappear.
            <br />
            <span className="text-[var(--muted-foreground)]">
              Apps never get downloaded.
            </span>
          </h2>

          <p className="mt-8 text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto">
            Your customers want to support you — but they forget punch cards at
            home, lose them in a drawer, or won&apos;t install another app for
            one coffee shop.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problem card 1 */}
            <div className="clean-card rounded-3xl p-8 text-left">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                Lost paper cards
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                87% of paper loyalty cards are lost or forgotten within 2 weeks.
                That&apos;s a lot of missed return visits.
              </p>
            </div>

            {/* Problem card 2 */}
            <div className="clean-card rounded-3xl p-8 text-left">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                App fatigue
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Only 5% of customers will download yet another loyalty app.
                They&apos;re already drowning in apps they don&apos;t use.
              </p>
            </div>
          </div>

          {/* Solution callout */}
          <div className="mt-12 relative">
            <div className="clean-card rounded-3xl p-8 border-2 border-[var(--accent)]/20">
              <p className="text-lg sm:text-xl font-medium text-[var(--foreground)]">
                Stampeo solves this by putting your loyalty card exactly where
                they already look:{" "}
                <span className="text-[var(--accent)] font-bold">
                  their phone wallet.
                </span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
