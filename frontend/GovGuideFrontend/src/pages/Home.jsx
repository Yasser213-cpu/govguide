import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/Features";
import StatsSection from "../components/landing/Stats";
import HowItWorks from "../components/landing/HowItWorks";
import DashboardShowcase from "../components/landing/DashboardShowcase";
import Comparison from "../components/landing/Comparison";
import FAQ from "../components/landing/FAQ";
import CTASection from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <FeaturesSection />
        <DashboardShowcase />
        <Comparison />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
