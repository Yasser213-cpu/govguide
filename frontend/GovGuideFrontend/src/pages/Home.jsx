import { useEffect } from "react";
import { useTranslation } from "react-i18next";

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
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Home() {
  useDocumentTitle("Your Gateway to Egyptian Government Services");

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
