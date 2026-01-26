import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { ArrowRightIcon } from "../icons";

export function FinalCTASection() {
  return (
    <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600" />

      {/* Decorative orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-400/30 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <Container className="relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
            Your customers are ready to come back.
          </h2>
          <p className="mt-8 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            Create your first digital loyalty card in minutes — free, no credit
            card required.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="#"
              size="lg"
              className="!bg-white !text-amber-600 hover:!bg-white/90 !shadow-xl !shadow-black/10"
            >
              Get started free
              <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </div>

          <p className="mt-6 text-sm text-white/70 font-medium">
            No credit card required • Free forever for up to 100 customers
          </p>
        </div>
      </Container>
    </section>
  );
}
