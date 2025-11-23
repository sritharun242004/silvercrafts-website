'use client'

import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedProducts from '../components/FeaturedProducts';
import StandardsBanner from '../components/StandardsBanner';
import ProductCategories from '../components/ProductCategories';
import BestDiamonds from '../components/BestDiamonds';
import AntwerpCraftsmanship from '../components/AntwerpCraftsmanship';
import PremiumTestimonials from '../components/PremiumTestimonials';
import BespokeServices from '../components/BespokeServices';
import Testimonial from '../components/Testimonial';
import FinalCTA from '../components/FinalCTA';

interface LandingPageProps {
  onNavigate: (page: 'home' | 'quote' | 'order') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <main>
      <HeroSection />
      <FeaturedProducts />
      <StandardsBanner />
      <ProductCategories />
      <BestDiamonds />
      <AntwerpCraftsmanship />
      <PremiumTestimonials />
      <BespokeServices />
      <Testimonial />
      <FinalCTA />
    </main>
  );
}

