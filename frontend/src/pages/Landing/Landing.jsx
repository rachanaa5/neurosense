import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import TechnologySection from './components/TechnologySection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechnologySection />
      <CTASection />
      <Footer />
    </div>
  );
}