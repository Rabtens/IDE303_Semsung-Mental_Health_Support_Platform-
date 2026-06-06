import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Resources from '../components/Resources';
import CTA from '../components/CTA';

function LandingPage() {
  return (
    <div>
      <Hero />
      <Features />
      <About />
      <Testimonials />
      <Resources />
      <CTA />
    </div>
  );
}

export default LandingPage;
