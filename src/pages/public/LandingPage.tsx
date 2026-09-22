import React, { useState } from 'react';
import { LandingNavbar } from '../../components/landing/LandingNavbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { InteractiveDemo } from '../../components/landing/InteractiveDemo';
import { MethodologySection } from '../../components/landing/MethodologySection';
import { PricingSection } from '../../components/landing/PricingSection';
import { TestimonialsSection } from '../../components/landing/TestimonialsSection';
import { FaqSection } from '../../components/landing/FaqSection';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { CheckoutModal, PlanItem } from '../../components/landing/CheckoutModal';

export const LandingPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectPlan = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-slate-900 dark:text-white transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Sticky Blur Navbar */}
      <LandingNavbar />

      {/* Main Page Flow */}
      <main>
        {/* 1. Hero Section with Interactive Mockup */}
        <HeroSection />

        {/* 2. Technological Core Features */}
        <FeaturesSection />

        {/* 3. Live Exercise Demo Player */}
        <InteractiveDemo />

        {/* 4. Rafaela's Biomechanical Methodology */}
        <MethodologySection />

        {/* 5. Complete Pricing: 3 Workout Plans + 2 Nutrition Combo Plans */}
        <PricingSection onSelectPlan={handleSelectPlan} />

        {/* 6. Real Student Testimonials & Results */}
        <TestimonialsSection />

        {/* 7. Interactive Accordion FAQ */}
        <FaqSection />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Lead & Checkout Modal */}
      <CheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
};
