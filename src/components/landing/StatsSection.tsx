"use client";

import React, { useEffect, useRef } from 'react';
import StatItem from './StatItem';

const statsData = [
  { target: 2500, label: "Active Teams", suffix: "+" },
  { target: 50000, label: "Code Reviews", suffix: "+" },
  { target: 99, label: "Uptime", suffix: "%" },
  { target: 24, label: "Support Hours", suffix: "/7" }
];

const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="stats" ref={sectionRef} className="py-20 md:py-24 px-4 md:px-10 bg-background/30 border-y border-border/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto text-center">
          {statsData.map((stat, index) => (
            <div 
              key={index} 
              className="animate-scale-in-stat opacity-0"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <StatItem 
                target={stat.target} 
                label={stat.label} 
                suffix={stat.suffix}
                isVisible={isVisible} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
