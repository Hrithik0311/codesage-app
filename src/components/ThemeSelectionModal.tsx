
"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Modal from '@/components/Modal';
import { themeSections } from '@/data/themes';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';

const ThemeSelectionModal = ({ isOpen, onClose, onOpenCustomTheme }: { isOpen: boolean; onClose: () => void; onOpenCustomTheme: (theme: 'custom' | 'liquid-glass') => void; }) => {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleSetTheme = (newTheme: string) => {
    if (newTheme === 'custom' || newTheme === 'liquid-glass') {
        onOpenCustomTheme(newTheme);
        return;
    }
    // When a standard theme is selected, remove any inline styles
    // that the custom theme modal might have set.
    document.documentElement.style.removeProperty('--custom-primary');
    document.documentElement.style.removeProperty('--custom-accent');
    document.documentElement.style.removeProperty('--custom-background');
    document.documentElement.style.removeProperty('--custom-foreground');
    document.documentElement.style.removeProperty('--custom-primary-foreground');
    setTheme(newTheme);
  }

  if (!isClient) return null;

  const renderThemeButton = (item: {name: string, value: string}, isSpecial: boolean = false) => {
    const isActive = theme === item.value;
    return (
        <div key={item.value} className="flex flex-col items-center gap-2">
            <Button
                variant="outline"
                className={cn(
                  'w-full h-20 border-2 flex items-center justify-center relative',
                  isActive && 'border-primary ring-2 ring-primary'
                )}
                onClick={() => handleSetTheme(item.value)}
                style={isSpecial ? {} : {
                  '--primary-preview': `hsl(var(--${item.value}-primary, 0 0% 0%))`,
                  '--background-preview': `hsl(var(--${item.value}-background, 0 0% 100%))`,
                  '--border-preview': `hsl(var(--${item.value}-border, 0 0% 80%))`,
                  '--primary-foreground-preview': `hsl(var(--${item.value}-primary-foreground, 0 0% 100%))`,
                  backgroundColor: `var(--background-preview)`,
                  borderColor: `var(--border-preview)`,
                } as React.CSSProperties}
            >
                {isSpecial ? (
                     <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground">
                        <Palette className="h-6 w-6" />
                    </div>
                ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `var(--primary-preview)`,
                        color: `var(--primary-foreground-preview)`,
                      }}
                    >
                       {isActive && <Check className="h-6 w-6" />}
                    </div>
                )}
            </Button>
            <p className="text-sm font-medium text-center">{item.name}</p>
        </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Theme"
      className="max-w-4xl"
    >
      <ScrollArea className="max-h-[60vh] h-[60vh] pr-6">
        <div className="space-y-8">
            <div className="space-y-4">
                 <h3 className="font-headline text-xl font-semibold text-foreground">Customizable Themes</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {renderThemeButton({name: "Custom", value: "custom"}, true)}
                     {renderThemeButton({name: "Liquid Glass", value: "liquid-glass"}, true)}
                 </div>
            </div>

            {themeSections.filter(s => s.title !== 'Special').map((section) => (
                <div key={section.title} className="space-y-4">
                    <h3 className="font-headline text-xl font-semibold text-foreground">{section.title}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {section.themes.map((item) => renderThemeButton(item))}
                    </div>
                </div>
            ))}
        </div>
      </ScrollArea>
    </Modal>
  );
};

export default ThemeSelectionModal;
