"use client";

import React, { useEffect, useState } from 'react';

interface StatItemProps {
  target: number;
  label: string;
  suffix?: string;
  isVisible: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ target, label, suffix = "", isVisible }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const incrementTime = 16; // roughly 60fps
    const totalIncrements = duration / incrementTime;
    const incrementValue = target / totalIncrements;

    const timer = setInterval(() => {
      start += incrementValue;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return (
    <div>
      <span className="block font-headline text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 gradient-text stat-number-gradient">
        {count}{suffix}
      </span>
      <div className="text-base md:text-lg text-foreground/80 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};

export default StatItem;
