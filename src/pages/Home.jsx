import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ServicesOverview from '../components/home/ServicesOverview';
import StatsSection from '../components/home/StatsSection';
import GlobalLanesSection from '../components/home/GlobalLanesSection';
import ClientsCarousel from '../components/home/ClientsCarousel';
import PartnersSection from '../components/home/PartnersSection';
import CTASection from '../components/home/CTASection';
import WhatsAppButton from '../components/shared/WhatsAppButton';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesOverview />
      <StatsSection />
      <GlobalLanesSection />
      <PartnersSection />
      <ClientsCarousel />
      <CTASection />
      <WhatsAppButton />
    </div>
  );
}