"use client";

import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '../UserProfile';
import { NotificationBell } from '../NotificationBell';

const Navbar: React.FC = () => {

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className="fixed top-5 left-1/2 -translate-x-1/2 bg-background/30 backdrop-blur-xl border border-border/30 rounded-full py-2 px-4 md:px-6 z-[1000] shadow-2xl animate-slide-down-navbar"
      style={{'--animation-delay': '0s'} as React.CSSProperties}
    >
      <div className="container mx-auto flex items-center justify-between max-w-6xl px-0">
        <Link href="/" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-primary-foreground">
            <Zap size={20} />
          </div>
          <span className="text-xl font-headline font-bold">CodeSage</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="link" className="hidden sm:inline-flex text-foreground/80 hover:text-foreground px-1" onClick={() => scrollToSection('features')}>
            Features
          </Button>
           <Button variant="link" className="hidden sm:inline-flex text-foreground/80 hover:text-foreground px-1" onClick={() => scrollToSection('stats')}>
            Stats
          </Button>
          <NotificationBell />
          <UserProfile />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
