"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onCtaClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
  return (
    <section className="min-h-screen flex items-center justify-center text-center py-28 px-4 md:px-10 relative overflow-hidden">
      <div className="max-w-3xl z-10 animate-fade-in-up-hero">
        <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-8 gradient-text hero-title-gradient animate-text-glow">
          CodeSage
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-12 font-body max-w-2xl mx-auto">
          Professional-grade development platform for FTC robotics teams.
          Build, analyze, and deploy with confidence.
        </p>
        <Button
          size="lg"
          className="font-headline text-lg font-semibold px-10 py-7 rounded-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:shadow-accent/30 relative overflow-hidden group"
          onClick={onCtaClick}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
          Launch Platform
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
