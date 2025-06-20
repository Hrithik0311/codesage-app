"use client";

import React, { useEffect, useRef } from 'react';

const AnimatedBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (backgroundRef.current) {
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = (e.clientY / window.innerHeight) * 2 - 1; // Not used in original CSS for bg, but keeping for consistency
        
        const rate = parseFloat(backgroundRef.current.style.getPropertyValue('--scroll-offset') || '0') * -0.3;
        const mouseRate = 20;
        backgroundRef.current.style.transform = `translateY(${rate}px) translateX(${mouseX * mouseRate}px)`;

        particlesRef.current.forEach((particle, index) => {
          if (particle) {
            const speed = (index + 1) * 0.1;
            const x = mouseX * mouseRate * speed;
            const y = parseFloat(particle.style.getPropertyValue('--particle-scroll-offset') || '0');
            const currentTranslateX = parseFloat(particle.style.getPropertyValue('--particle-translateX') || '100');
            particle.style.transform = `translateY(${y}px) translateX(${x + currentTranslateX}px) rotate(${particle.style.getPropertyValue('--particle-rotate') || '0deg'})`;
          }
        });
      }
    };

    const handleScroll = () => {
      if (backgroundRef.current) {
        const scrolled = window.pageYOffset;
        backgroundRef.current.style.setProperty('--scroll-offset', scrolled.toString());
        
        const rate = scrolled * -0.3;
        const mouseX = parseFloat(backgroundRef.current.style.getPropertyValue('--mouse-x') || '0'); // Assuming mouseX is stored if needed
        const mouseRate = 20;
        backgroundRef.current.style.transform = `translateY(${rate}px) translateX(${mouseX * mouseRate}px)`;

        particlesRef.current.forEach((particle, index) => {
          if (particle) {
            const speed = (index + 1) * 0.1;
            const y = scrolled * -speed;
            particle.style.setProperty('--particle-scroll-offset', y.toString());
            const currentTranslateX = parseFloat(particle.style.getPropertyValue('--particle-translateX') || '100');
            const currentRotate = particle.style.getPropertyValue('--particle-rotate') || '0deg';
            particle.style.transform = `translateY(${y}px) translateX(${currentTranslateX}px) rotate(${currentRotate})`;
          }
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    // Initialize particle random translateX for animation
    particlesRef.current.forEach(p => {
      if (p) {
        const randomX = Math.random() * 200 - 100; // Random value between -100 and 100
        p.style.setProperty('--particle-translateX', `${randomX}px`);
      }
    });


    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="bg-animation-container" aria-hidden="true">
      <div ref={backgroundRef} className="bg-animation"></div>
      <div className="particles">
        {Array.from({ length: 9 }).map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            ref={el => particlesRef.current[i] = el}
            style={
              { 
                left: `${(i + 1) * 10}%`, 
                animationDelay: `${(-(i * 2 + Math.random() * 5)).toFixed(1)}s`, 
                animationDuration: `${(15 + Math.random() * 10).toFixed(1)}s`,
                '--particle-translateX': `${Math.random()*100 + 50}px` 
              } as React.CSSProperties
            }
            ></div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
