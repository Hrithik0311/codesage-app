'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import StatsSection from './StatsSection';
import Footer from './Footer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const HomePageClient: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleCtaClick = () => scrollToSection('features');

  const handleFeatureClick = (feature: string) => {
    if (loading) return; // Do nothing while auth state is loading

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access this feature.',
      });
      router.push('/auth');
      return;
    }

    if (feature === 'learning') router.push('/learning');
    else if (feature === 'analysis') router.push('/code-intelligence');
    else if (feature === 'collaboration') router.push('/collaboration');
  };

  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 100); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-opacity duration-500 ease-in-out ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar />
      <HeroSection onCtaClick={handleCtaClick} />
      <FeaturesSection onFeatureClick={handleFeatureClick} />
      <StatsSection />
      <Footer />
    </div>
  );
};

export default HomePageClient;
