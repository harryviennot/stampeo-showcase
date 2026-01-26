import { Header } from "./components/sections/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { SocialProofBar } from "./components/sections/SocialProofBar";
import { ProblemSection } from "./components/sections/ProblemSection";
import { HowItWorks } from "./components/sections/HowItWorks";
import { BenefitsSection } from "./components/sections/BenefitsSection";
import { DashboardPreview } from "./components/sections/DashboardPreview";
import { PricingSection } from "./components/sections/PricingSection";
import { FAQSection } from "./components/sections/FAQSection";
import { FinalCTASection } from "./components/sections/FinalCTASection";
import { Footer } from "./components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden relative">
      {/* Global decorative orbs layer - flows across all sections */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Hero area orbs */}
        <div className="blur-orb w-[600px] h-[600px] bg-amber-300/25 -top-40 -right-40" />
        <div className="blur-orb w-[500px] h-[500px] bg-orange-300/20 top-[400px] -left-60" />

        {/* Mid-page orbs */}
        <div className="blur-orb w-[450px] h-[450px] bg-red-300/15 top-[900px] left-[5%]" />
        <div className="blur-orb w-[550px] h-[550px] bg-amber-300/20 top-[1500px] -right-60" />
        <div className="blur-orb w-[400px] h-[400px] bg-violet-300/20 top-[2100px] right-[10%]" />

        {/* Lower page orbs */}
        <div className="blur-orb w-[500px] h-[500px] bg-emerald-300/20 top-[2700px] -left-40" />
        <div className="blur-orb w-[500px] h-[500px] bg-amber-300/20 top-[3300px] left-[15%]" />
        <div className="blur-orb w-[450px] h-[450px] bg-orange-300/20 top-[3900px] -right-40" />
        <div className="blur-orb w-[400px] h-[400px] bg-blue-300/20 top-[4500px] -left-40" />
      </div>

      <Header />
      <main className="relative">
        <div className="snap-section">
          <HeroSection />
        </div>
        <div className="snap-section">
          <SocialProofBar />
          <ProblemSection />
        </div>
        <div className="snap-section">
          <HowItWorks />
        </div>
        <div className="snap-section">
          <BenefitsSection />
        </div>
        <div className="snap-section">
          <DashboardPreview />
        </div>
        <div className="snap-section">
          <PricingSection />
        </div>
        <div className="snap-section">
          <FAQSection />
        </div>
        <div className="snap-section">
          <FinalCTASection />
        </div>
      </main>
      <div className="snap-section">
        <Footer />
      </div>
    </div>
  );
}
