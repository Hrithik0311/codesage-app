
"use client";

import React, { useEffect, useRef, useState } from 'react';

const AnimatedBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial mount
    setIsClient(true);
  }, []);

  useEffect(() => {
    // This effect handles mousemove and scroll, and depends on isClient
    // to ensure refs are populated and window/document are available.
    if (!isClient || !backgroundRef.current) return;

    const bgDataset = backgroundRef.current.dataset;
    bgDataset.currentScrollY = '0';
    bgDataset.currentMouseX = '0';

    // Initialize dataset properties for particles for JS-controlled transforms
    // This reads the --particle-translateX set by the style prop during client-side render.
    particlesRef.current.forEach(particle => {
        if (particle) {
            // getComputedStyle will access the value set in the style prop (including the random one if client)
            const cssTranslateX = getComputedStyle(particle).getPropertyValue('--particle-translateX').trim().replace('px', '');
            particle.dataset.baseTranslateX = cssTranslateX || '0';
            particle.dataset.scrollOffsetY = '0'; // Initial Y offset for JS transform
        }
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current) return;
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const currentScrollY = parseFloat(bgDataset.currentScrollY || '0');
      const bgScrollEffectRate = -0.3;
      const mouseRate = 20;
      
      backgroundRef.current.style.transform = `translateY(${currentScrollY * bgScrollEffectRate}px) translateX(${mouseX * mouseRate}px)`;
      bgDataset.currentMouseX = String(mouseX);

      particlesRef.current.forEach((particle, index) => {
        if (particle) {
          const particleSpeed = (index + 1) * 0.1;
          const particleBaseTranslateX = parseFloat(particle.dataset.baseTranslateX || '0');
          const particleScrollOffsetY = parseFloat(particle.dataset.scrollOffsetY || '0'); // Updated by scroll handler
          
          const particleMouseEffectX = mouseX * mouseRate * particleSpeed;
          // JS sets transform. This will override the transform part of CSS animation if names clash.
          // The CSS animation 'particleFloat' uses transform.
          // For this interaction to work as intended, ensure CSS animation and JS transform don't conflict
          // or are designed to be additive (e.g. JS transforms a wrapper, CSS animates child).
          // For now, JS transform takes precedence for mouse/scroll effects.
          particle.style.transform = `translateY(${particleScrollOffsetY}px) translateX(${particleBaseTranslateX + particleMouseEffectX}px)`;
        }
      });
    };

    const handleScroll = () => {
      if (!backgroundRef.current) return;
      const scrolled = window.pageYOffset;
      bgDataset.currentScrollY = String(scrolled);
      const currentMouseX = parseFloat(bgDataset.currentMouseX || '0');
      const bgScrollEffectRate = -0.3;
      const mouseRate = 20;

      backgroundRef.current.style.transform = `translateY(${scrolled * bgScrollEffectRate}px) translateX(${currentMouseX * mouseRate}px)`;

      particlesRef.current.forEach((particle, index) => {
        if (particle) {
          const particleSpeed = (index + 1) * 0.1;
          const particleBaseTranslateX = parseFloat(particle.dataset.baseTranslateX || '0');
          
          const particleScrollOffsetY = scrolled * -particleSpeed;
          particle.dataset.scrollOffsetY = String(particleScrollOffsetY); // Update for mousemove
          
          const particleMouseEffectX = currentMouseX * mouseRate * particleSpeed;
          particle.style.transform = `translateY(${particleScrollOffsetY}px) translateX(${particleBaseTranslateX + particleMouseEffectX}px)`;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    // Call scroll once to set initial positions based on current scroll (usually 0 on load)
    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient]); // This effect containing listeners runs when isClient becomes true.

  return (
    <div className="bg-animation-container" aria-hidden="true">
      <div ref={backgroundRef} className="bg-animation"></div>
      <div className="particles">
        {Array.from({ length: 9 }).map((_, i) => {
          // Static styles are always applied
          const staticParticleStyle: React.CSSProperties = {
            left: `${(i + 1) * 10}%`,
          };

          // Dynamic styles (using Math.random) are only applied on the client after mount
          const dynamicParticleStyle: React.CSSProperties = isClient ? {
            animationDelay: `${(-(i * 2 + Math.random() * 5)).toFixed(1)}s`,
            animationDuration: `${(15 + Math.random() * 10).toFixed(1)}s`,
            // --particle-translateX is used by the CSS animation 'particleFloat'
            '--particle-translateX': `${(Math.random() * 100 + 50).toFixed(1)}px`,
          } : {
            // Fallback, non-random styles for SSR and initial client render
            // These ensure server and client initial HTML match.
            // The exact values can be any consistent default.
            animationDelay: `${-(i * 2 + 2.5)}s`,
            animationDuration: `${20}s`,
            '--particle-translateX': `75px`,
          };

          return (
            <div
              key={i}
              className="particle"
              ref={el => { particlesRef.current[i] = el; }}
              style={{ ...staticParticleStyle, ...dynamicParticleStyle }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedBackground;
