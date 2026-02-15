import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ServicesOverview from '../components/home/ServicesOverview';
import GlobalLanesSection from '../components/home/GlobalLanesSection';
import ClientsCarousel from '../components/home/ClientsCarousel';
import PartnersSection from '../components/home/PartnersSection';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesOverview />
      <GlobalLanesSection />
      <PartnersSection />
      <ClientsCarousel />
      <CTASection />
    </div>
  );
}