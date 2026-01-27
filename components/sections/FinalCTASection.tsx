import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRightIcon } from "../icons";
import { StampPattern } from "../stamps/StampPattern";

export function FinalCTASection() {
  return (
    <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden bg-[var(--muted)]">
      {/* Decorative stamps */}
      <StampPattern density="sparse" />

      <Container className="relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-tight">
            Ready to turn visitors into regulars?
          </h2>
          <p className="mt-8 text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required, setup
            takes under 10 minutes.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/onboarding" size="lg">
              Start your free trial
              <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </div>

          <p className="mt-6 text-sm text-[var(--muted-foreground)] font-medium">
            No credit card required • Cancel anytime
          </p>
        </div>
      </Container>
    </section>
  );
}
