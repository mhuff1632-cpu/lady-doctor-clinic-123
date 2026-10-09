import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { TrustHighlightsSection } from '../components/home/TrustHighlightsSection';
import { ServicesPreviewSection } from '../components/home/ServicesPreviewSection';
import { DoctorsPreviewSection } from '../components/home/DoctorsPreviewSection';
import { ClinicPostersSection } from '../components/posters/ClinicPostersSection';
import { WhyChooseUsSection } from '../components/home/WhyChooseUsSection';
import { AppointmentCTASection } from '../components/home/AppointmentCTASection';
import { TestimonialsPreviewSection } from '../components/home/TestimonialsPreviewSection';
import { FAQPreviewSection } from '../components/home/FAQPreviewSection';
import { ContactPreviewSection } from '../components/home/ContactPreviewSection';

export const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      <TrustHighlightsSection />
      <ServicesPreviewSection />
      <DoctorsPreviewSection />
      <ClinicPostersSection limit={3} />
      <WhyChooseUsSection />
      <AppointmentCTASection />
      <TestimonialsPreviewSection />
      <FAQPreviewSection />
      <ContactPreviewSection />
    </div>
  );
};
