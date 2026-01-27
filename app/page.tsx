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
