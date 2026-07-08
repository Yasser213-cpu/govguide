import { Navbar } from "../components/landing/sections/Navbar";
import { HeroSection } from "../components/landing/sections/HeroSection";
import { StatsSection } from "../components/landing/sections/StatsSection";
import { FeaturesSection } from "../components/landing/sections/FeaturesSection";
import { HowItWorks } from "../components/landing/sections/HowItWorks";
import { DashboardShowcase } from "../components/landing/sections/DashboardShowcase";
import { Comparison } from "../components/landing/sections/Comparison";
import { Testimonials } from "../components/landing/sections/Testimonials";
import { FAQ } from "../components/landing/sections/FAQ";
import { CTASection } from "../components/landing/sections/CTASection";
import { Footer } from "../components/landing/sections/Footer";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <HowItWorks />
          <DashboardShowcase />
          <Comparison />
          <Testimonials />
          <FAQ />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
