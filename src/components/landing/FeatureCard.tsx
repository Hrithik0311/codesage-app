"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  animationDelay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, buttonText, onClick, animationDelay = "0s" }) => {
  return (
    <Card 
      className="bg-background/20 backdrop-blur-lg border-border/50 text-center p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-accent/20 transition-all duration-500 ease-in-out transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden group animate-slide-in-up-feature"
      style={{ animationDelay }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
      <CardHeader className="items-center p-0 mb-6">
        <div className="w-20 h-20 mb-6 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-primary-foreground group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Icon size={40} strokeWidth={1.5} />
        </div>
        <CardTitle className="font-headline text-2xl font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <CardDescription className="text-foreground/70 text-base mb-8 leading-relaxed">
          {description}
        </CardDescription>
        <Button
          variant="outline"
          className="bg-foreground/5 hover:bg-foreground/10 border-border text-foreground backdrop-blur-sm px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
