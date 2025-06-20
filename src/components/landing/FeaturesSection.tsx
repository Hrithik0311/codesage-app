"use client";
import React from 'react';
import FeatureCard from './FeatureCard';
import { Brain, Search, Rocket } from 'lucide-react';

interface FeaturesSectionProps {
  onFeatureClick: (feature: string) => void;
}

const featuresData = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Master Java development with intelligent tutorials, real-time feedback, and personalized learning paths tailored to your skill level.",
    buttonText: "Start Learning",
    featureKey: "learning",
    delay: "0.2s"
  },
  {
    icon: Search,
    title: "Code Intelligence",
    description: "Advanced static analysis, performance optimization suggestions, and automated refactoring tools for enterprise-grade code quality.",
    buttonText: "Analyze Code",
    featureKey: "analysis",
    delay: "0.4s"
  },
  {
    icon: Rocket,
    title: "Team Collaboration",
    description: "Integrated development environment with real-time collaboration, version control, and seamless deployment pipeline management.",
    buttonText: "Join Team",
    featureKey: "collaboration",
    delay: "0.6s"
  }
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onFeatureClick }) => {
  return (
    <section id="features" className="py-24 px-4 md:px-10">
      <div className="container mx-auto">
        <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-16 md:mb-20 gradient-text bg-gradient-to-r from-foreground to-foreground/70">
          Advanced Development Suite
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              buttonText={feature.buttonText}
              onClick={() => onFeatureClick(feature.featureKey)}
              animationDelay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
