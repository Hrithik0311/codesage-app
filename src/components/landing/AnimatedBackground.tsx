
"use client";

import React, { useEffect, useRef, useState } from 'react';

const AnimatedBackground: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial mount, to enable client-side-only styles.
    setIsClient(true);
  }, []);

  // The complex useEffect that handled mouse and scroll interactions has been removed
  // as it was the likely source of the silent server crash. The background will
  // remain animated via CSS, but will no longer be interactive.

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
            '--particle-translateX': `${(Math.random() * 100 + 50).toFixed(1)}px`,
          } : {
            // Fallback, non-random styles for SSR and initial client render to prevent hydration errors.
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
