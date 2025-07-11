
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Modal from '@/components/Modal';
import { themes } from '@/data/themes';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

function hexToHsl(hex: string): string {
    if (!hex) return '0 0% 0%';
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}


const ThemeSelectionModal = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  const [customPrimary, setCustomPrimary] = useLocalStorage('--custom-primary', '#7c3aed');
  const [customAccent, setCustomAccent] = useLocalStorage('--custom-accent', '#a855f7');
  const [customBackground, setCustomBackground] = useLocalStorage('--custom-background', '#0a0a0a');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (theme === 'custom') {
      document.documentElement.style.setProperty('--primary', hexToHsl(customPrimary));
      document.documentElement.style.setProperty('--accent', hexToHsl(customAccent));
      document.documentElement.style.setProperty('--background', hexToHsl(customBackground));
    } else {
        // When switching to a pre-defined theme, remove the custom overrides
        document.documentElement.style.removeProperty('--primary');
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--background');
    }
  }, [theme, customPrimary, customAccent, customBackground]);

  const handleSetTheme = (newTheme: string) => {
    if (newTheme === 'custom') {
      document.documentElement.style.setProperty('--primary', hexToHsl(customPrimary));
      document.documentElement.style.setProperty('--accent', hexToHsl(customAccent));
      document.documentElement.style.setProperty('--background', hexToHsl(customBackground));
    }
    setTheme(newTheme);
  }

  const CustomThemeSelector = () => (
     <div className="flex flex-col items-center gap-2">
      <div className={cn('w-full border-2 rounded-lg p-2 flex flex-col items-center gap-3', theme === 'custom' ? 'border-primary ring-2 ring-primary' : 'border-border')}>
          <div
            className={cn('w-full h-20 border-2 flex items-center justify-center relative rounded-md', theme === 'custom' && 'border-primary')}
            onClick={() => handleSetTheme('custom')}
            style={{ 
              backgroundColor: customBackground,
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: customPrimary, color: 'white' }}
            >
               {theme === 'custom' && <Check className="h-6 w-6" />}
            </div>
          </div>
          <div className="w-full flex justify-around gap-2">
            <div className="flex flex-col items-center gap-1">
                <label htmlFor="primary-color" className="text-xs font-medium">Primary</label>
                <input id="primary-color" type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-10 h-6 border-none cursor-pointer bg-transparent" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <label htmlFor="accent-color" className="text-xs font-medium">Accent</label>
                <input id="accent-color" type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-10 h-6 border-none cursor-pointer bg-transparent" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <label htmlFor="bg-color" className="text-xs font-medium">BG</label>
                <input id="bg-color" type="color" value={customBackground} onChange={(e) => setCustomBackground(e.target.value)} className="w-10 h-6 border-none cursor-pointer bg-transparent" />
            </div>
          </div>
      </div>
       <p className="text-sm font-medium text-center">Custom</p>
    </div>
  )

  if (!isClient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Theme"
      className="max-w-4xl"
    >
      <ScrollArea className="max-h-[60vh] h-[60vh] pr-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <CustomThemeSelector />
          {themes.map((item) => (
            <div key={item.value} className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                className={cn(
                  'w-full h-20 border-2 flex items-center justify-center relative',
                  theme === item.value && 'border-primary ring-2 ring-primary'
                )}
                onClick={() => handleSetTheme(item.value)}
                style={{
                  '--primary': `var(--${item.value}-primary, hsl(var(--primary)))`,
                  '--background': `var(--${item.value}-background, hsl(var(--background)))`,
                  '--border': `var(--${item.value}-border, hsl(var(--border)))`,
                  '--primary-foreground': `var(--${item.value}-primary-foreground, hsl(var(--primary-foreground)))`,
                  backgroundColor: `var(--background)`,
                  borderColor: `var(--border)`,
                } as React.CSSProperties}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `var(--primary)`,
                    color: `var(--primary-foreground)`,
                  }}
                >
                   {theme === item.value && <Check className="h-6 w-6" />}
                </div>
              </Button>
              <p className="text-sm font-medium text-center">{item.name}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Modal>
  );
};

export default ThemeSelectionModal;
