
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Modal from '@/components/Modal';
import { themes } from '@/data/themes';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';

const ThemeSelectionModal = ({ isOpen, onClose, onOpenCustomTheme }) => {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
  }

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
          <div className="flex flex-col items-center gap-2">
            <Button
                variant="outline"
                className={cn(
                  'w-full h-20 border-2 flex items-center justify-center relative',
                   theme === 'custom' && 'border-primary ring-2 ring-primary'
                )}
                onClick={onOpenCustomTheme}
            >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
                    <Palette className="h-6 w-6" />
                </div>
            </Button>
            <p className="text-sm font-medium text-center">Custom</p>
          </div>
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
