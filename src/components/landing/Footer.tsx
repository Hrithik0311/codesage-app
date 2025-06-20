import React from 'react';
import { Zap } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-16 px-4 md:px-10 text-center bg-background/50">
      <div className="container mx-auto max-w-xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Zap className="text-accent" size={28} />
          <span className="text-2xl font-headline font-bold text-foreground">CodeSage</span>
        </div>
        <p className="text-base text-foreground/60 leading-relaxed">
          Empowering the next generation of robotics engineers with 
          cutting-edge development tools and AI-driven insights.
        </p>
        <p className="text-sm text-foreground/40 mt-8">
          &copy; {new Date().getFullYear()} CodeSage. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
